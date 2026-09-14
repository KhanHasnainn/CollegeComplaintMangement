import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorizeComplaintAccess } from '@/lib/rbac';
import { addUpdateMessageSchema } from '@/lib/validators';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const complaint = await db.complaint.findUnique({
      where: { id: params.id },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const authCheck = authorizeComplaintAccess(session, complaint);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const validated = addUpdateMessageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    let { message, updateType, isPublic, newStatus } = validated.data;

    // STRICT SECURITY RULE: Students MUST NEVER create internal notes
    if (session.role === 'STUDENT') {
      isPublic = true;
      if (updateType === 'INTERNAL_NOTE') {
        updateType = 'PUBLIC_UPDATE';
      }
    }

    const update = await db.complaintUpdate.create({
      data: {
        complaintId: complaint.id,
        actorId: session.userId,
        updateType,
        message,
        isPublic,
        previousStatus: complaint.status,
        newStatus: newStatus || null,
      },
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
    });

    // Notify student if update was added by staff/admin and is public
    if (session.role !== 'STUDENT' && isPublic) {
      await db.notification.create({
        data: {
          userId: complaint.studentId,
          title: 'New Update on Complaint',
          message: `Staff added an update to complaint ${complaint.complaintNumber}: ${message.substring(0, 80)}...`,
          link: `/complaints/${complaint.id}`,
        },
      });
    }

    // Notify assigned staff if student posted a reply
    if (session.role === 'STUDENT' && complaint.assignedStaffId) {
      await db.notification.create({
        data: {
          userId: complaint.assignedStaffId,
          title: 'Student Responded',
          message: `Student replied on complaint ${complaint.complaintNumber}.`,
          link: `/complaints/${complaint.id}`,
        },
      });
    }

    return NextResponse.json({
      message: 'Update added successfully',
      update,
    });
  } catch (err: any) {
    console.error('POST /api/complaints/[id]/updates error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
