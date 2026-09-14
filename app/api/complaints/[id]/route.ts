import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorizeComplaintAccess } from '@/lib/rbac';
import { isValidStateTransition, ComplaintStatus } from '@/lib/state-machine';
import { updateComplaintSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const complaint = await db.complaint.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        department: true,
        student: { select: { id: true, name: true, email: true, studentRollNumber: true, phone: true } },
        assignedStaff: { select: { id: true, name: true, email: true } },
        feedback: true,
        updates: {
          orderBy: { createdAt: 'asc' },
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // IDOR Check
    const authCheck = authorizeComplaintAccess(session, complaint);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    // Filter out internal notes for students (STRICT SECURITY RULE)
    if (session.role === 'STUDENT') {
      complaint.updates = complaint.updates.filter((u) => u.isPublic === true);
    }

    return NextResponse.json({ complaint });
  } catch (err: any) {
    console.error('GET /api/complaints/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const complaint = await db.complaint.findUnique({
      where: { id: params.id },
      include: { department: true, student: true },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Authorization: Students CANNOT change complaint status or priority directly
    if (session.role === 'STUDENT') {
      return NextResponse.json({ error: 'Students cannot modify complaint status or assignment' }, { status: 403 });
    }

    // Staff check: must belong to department or assigned
    const authCheck = authorizeComplaintAccess(session, complaint);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const validated = updateComplaintSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status, priority, assignedStaffId, departmentId, resolutionMessage, rejectionReason } = validated.data;

    const dataToUpdate: any = {};
    const updatesToCreate: any[] = [];

    // 1. Status Transition Validation
    if (status && status !== complaint.status) {
      if (!isValidStateTransition(complaint.status as ComplaintStatus, status as ComplaintStatus)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${complaint.status} to ${status}` },
          { status: 400 }
        );
      }

      dataToUpdate.status = status;

      if (status === 'RESOLVED') {
        dataToUpdate.resolvedAt = new Date();
        if (resolutionMessage) dataToUpdate.resolutionMessage = resolutionMessage;
      }

      if (status === 'REJECTED') {
        dataToUpdate.rejectedAt = new Date();
        if (rejectionReason) dataToUpdate.rejectionReason = rejectionReason;
      }

      updatesToCreate.push({
        actorId: session.userId,
        updateType: 'STATUS_CHANGE',
        message:
          status === 'RESOLVED' && resolutionMessage
            ? `Status changed to RESOLVED: ${resolutionMessage}`
            : status === 'REJECTED' && rejectionReason
            ? `Status changed to REJECTED: ${rejectionReason}`
            : `Status changed from ${complaint.status} to ${status}`,
        previousStatus: complaint.status,
        newStatus: status,
        isPublic: true,
      });

      // Notify Student
      await db.notification.create({
        data: {
          userId: complaint.studentId,
          title: `Complaint Status: ${status}`,
          message: `Your complaint ${complaint.complaintNumber} status changed to ${status}.`,
          link: `/complaints/${complaint.id}`,
        },
      });
    }

    // 2. Priority Change
    if (priority && priority !== complaint.priority) {
      dataToUpdate.priority = priority;
      updatesToCreate.push({
        actorId: session.userId,
        updateType: 'PRIORITY_CHANGE',
        message: `Priority updated from ${complaint.priority} to ${priority}`,
        isPublic: true,
      });
    }

    // 3. Staff Assignment
    if (assignedStaffId !== undefined && assignedStaffId !== complaint.assignedStaffId) {
      dataToUpdate.assignedStaffId = assignedStaffId;
      updatesToCreate.push({
        actorId: session.userId,
        updateType: 'REASSIGNMENT',
        message: assignedStaffId ? 'Complaint assigned to staff member.' : 'Staff unassigned from complaint.',
        isPublic: true,
      });

      if (assignedStaffId) {
        await db.notification.create({
          data: {
            userId: assignedStaffId,
            title: 'New Complaint Assignment',
            message: `You have been assigned to complaint ${complaint.complaintNumber}.`,
            link: `/complaints/${complaint.id}`,
          },
        });
      }
    }

    // 4. Department Reassignment (Admin only)
    if (departmentId && departmentId !== complaint.departmentId) {
      if (session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only administrators can reassign complaint departments' }, { status: 403 });
      }
      dataToUpdate.departmentId = departmentId;
      dataToUpdate.assignedStaffId = null; // reset staff on department change
    }

    const updatedComplaint = await db.complaint.update({
      where: { id: params.id },
      data: {
        ...dataToUpdate,
        updates: {
          create: updatesToCreate,
        },
      },
      include: {
        category: true,
        department: true,
        assignedStaff: true,
      },
    });

    await createAuditLog({
      actorId: session.userId,
      action: 'UPDATE_COMPLAINT',
      resourceType: 'COMPLAINT',
      resourceId: complaint.id,
      metadata: { previousStatus: complaint.status, newStatus: status, priority },
    });

    return NextResponse.json({
      message: 'Complaint updated successfully',
      complaint: updatedComplaint,
    });
  } catch (err: any) {
    console.error('PATCH /api/complaints/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
