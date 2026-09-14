import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateUniqueComplaintId } from '@/lib/id-generator';
import { validateUpload, saveUploadedFile } from '@/lib/storage';
import { complaintSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');
    const departmentId = searchParams.get('departmentId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const skip = (page - 1) * limit;

    // Build role-scoped WHERE condition
    const where: any = {};

    if (session.role === 'STUDENT') {
      where.studentId = session.userId;
    } else if (session.role === 'STAFF') {
      if (session.departmentId) {
        where.departmentId = session.departmentId;
      } else {
        where.assignedStaffId = session.userId;
      }
    }

    // Apply optional search/filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (departmentId && session.role === 'ADMIN') where.departmentId = departmentId;

    if (search) {
      where.OR = [
        { complaintNumber: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true, code: true } },
          student: { select: { id: true, name: true, email: true, studentRollNumber: true } },
          assignedStaff: { select: { id: true, name: true, email: true } },
          feedback: { select: { rating: true, comment: true } },
        },
      }),
      db.complaint.count({ where }),
    ]);

    return NextResponse.json({
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('GET /api/complaints error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limit complaint creation (max 5 per 5 minutes per user)
    const rateCheck = checkRateLimit(`submit_complaint:${session.userId}`, 5, 5 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many complaint submissions. Please wait a few minutes.' }, { status: 429 });
    }

    let categoryId: string;
    let title: string;
    let description: string;
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    let fileUploadResult: { storedPath: string; originalName: string; mimeType: string } | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      categoryId = formData.get('categoryId') as string;
      title = formData.get('title') as string;
      description = formData.get('description') as string;
      if (formData.get('priority')) {
        priority = formData.get('priority') as any;
      }

      const file = formData.get('attachment') as File | null;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const val = validateUpload(buffer, file.name, file.type);
        if (!val.valid) {
          return NextResponse.json({ error: val.error }, { status: 400 });
        }
        fileUploadResult = await saveUploadedFile(buffer, file.name, file.type);
      }
    } else {
      const body = await req.json();
      const validated = complaintSchema.safeParse(body);
      if (!validated.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      categoryId = validated.data.categoryId;
      title = validated.data.title;
      description = validated.data.description;
      if (validated.data.priority) priority = validated.data.priority;
    }

    // Prevent non-admin users from forcing CRITICAL priority
    if (priority === 'CRITICAL' && session.role === 'STUDENT') {
      priority = 'HIGH';
    }

    // Lookup Category to get associated Department
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: { department: true },
    });

    if (!category || !category.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive category selected' }, { status: 400 });
    }

    const complaintNumber = await generateUniqueComplaintId();

    const complaint = await db.complaint.create({
      data: {
        complaintNumber,
        studentId: session.userId,
        categoryId: category.id,
        departmentId: category.departmentId,
        title,
        description,
        priority,
        status: 'PENDING',
        attachmentPath: fileUploadResult?.storedPath || null,
        attachmentOriginalName: fileUploadResult?.originalName || null,
        attachmentMimeType: fileUploadResult?.mimeType || null,
        updates: {
          create: {
            actorId: session.userId,
            updateType: 'STATUS_CHANGE',
            message: 'Complaint submitted by student.',
            previousStatus: null,
            newStatus: 'PENDING',
            isPublic: true,
          },
        },
      },
      include: {
        category: true,
        department: true,
      },
    });

    // Notify admins & department staff
    const adminAndStaffUsers = await db.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'STAFF', departmentId: category.departmentId },
        ],
      },
      select: { id: true },
    });

    if (adminAndStaffUsers.length > 0) {
      await db.notification.createMany({
        data: adminAndStaffUsers.map((u) => ({
          userId: u.id,
          title: 'New Complaint Submitted',
          message: `New complaint ${complaint.complaintNumber} submitted for ${category.department.name}.`,
          link: `/complaints/${complaint.id}`,
        })),
      });
    }

    await createAuditLog({
      actorId: session.userId,
      action: 'CREATE_COMPLAINT',
      resourceType: 'COMPLAINT',
      resourceId: complaint.id,
      metadata: { complaintNumber: complaint.complaintNumber, title: complaint.title },
    });

    return NextResponse.json({
      message: 'Complaint submitted successfully',
      complaint: {
        id: complaint.id,
        complaintNumber: complaint.complaintNumber,
        title: complaint.title,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
    });
  } catch (err: any) {
    console.error('POST /api/complaints error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
