import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { feedbackSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students can submit feedback' }, { status: 403 });
    }

    const complaint = await db.complaint.findUnique({
      where: { id: params.id },
      include: { feedback: true },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    if (complaint.studentId !== session.userId) {
      return NextResponse.json({ error: 'You can only provide feedback on your own complaints' }, { status: 403 });
    }

    if (complaint.status !== 'RESOLVED') {
      return NextResponse.json({ error: 'Feedback can only be submitted for resolved complaints' }, { status: 400 });
    }

    if (complaint.feedback) {
      return NextResponse.json({ error: 'Feedback has already been submitted for this complaint' }, { status: 400 });
    }

    const body = await req.json();
    const validated = feedbackSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const { rating, comment } = validated.data;

    const feedback = await db.feedback.create({
      data: {
        complaintId: complaint.id,
        studentId: session.userId,
        rating,
        comment: comment || null,
      },
    });

    await createAuditLog({
      actorId: session.userId,
      action: 'SUBMIT_FEEDBACK',
      resourceType: 'FEEDBACK',
      resourceId: feedback.id,
      metadata: { complaintId: complaint.id, rating },
    });

    return NextResponse.json({
      message: 'Thank you! Your feedback has been recorded.',
      feedback,
    });
  } catch (err: any) {
    console.error('POST /api/complaints/[id]/feedback error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
