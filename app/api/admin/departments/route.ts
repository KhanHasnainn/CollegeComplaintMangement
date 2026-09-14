import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorizeRoles } from '@/lib/rbac';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const departments = await db.department.findMany({
      include: {
        categories: { select: { id: true, name: true } },
        _count: { select: { users: true, complaints: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ departments });
  } catch (err: any) {
    console.error('GET /api/admin/departments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    const authCheck = authorizeRoles(session, ['ADMIN']);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, description } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and name are required' }, { status: 400 });
    }

    const existing = await db.department.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Department code already exists' }, { status: 400 });
    }

    const department = await db.department.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
      },
    });

    await createAuditLog({
      actorId: session!.userId,
      action: 'CREATE_DEPARTMENT',
      resourceType: 'DEPARTMENT',
      resourceId: department.id,
    });

    return NextResponse.json({ message: 'Department created', department });
  } catch (err: any) {
    console.error('POST /api/admin/departments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
