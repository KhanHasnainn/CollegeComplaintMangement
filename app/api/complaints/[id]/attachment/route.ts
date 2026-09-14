import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorizeComplaintAccess } from '@/lib/rbac';
import { getStoredFile } from '@/lib/storage';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const complaint = await db.complaint.findUnique({
      where: { id: params.id },
    });

    if (!complaint || !complaint.attachmentPath) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    const authCheck = authorizeComplaintAccess(session, complaint);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const fileBuffer = await getStoredFile(complaint.attachmentPath);
    if (!fileBuffer) {
      return NextResponse.json({ error: 'File content missing from storage' }, { status: 404 });
    }

    const mimeType = complaint.attachmentMimeType || 'application/octet-stream';
    const filename = complaint.attachmentOriginalName || 'attachment';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: any) {
    console.error('GET /api/complaints/[id]/attachment error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
