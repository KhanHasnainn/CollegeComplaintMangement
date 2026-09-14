import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { authorizeRoles } from '@/lib/rbac';
import { createUserSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const authCheck = authorizeRoles(session, ['ADMIN']);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const departmentId = searchParams.get('departmentId');
    const search = searchParams.get('search');

    const where: any = {};
    if (role) where.role = role;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { studentRollNumber: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: { select: { id: true, name: true, code: true } },
        studentRollNumber: true,
        phone: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('GET /api/admin/users error:', err);
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
    const validated = createUserSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: 'Validation failed', details: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, name, role, departmentId, studentRollNumber, phone } = validated.data;

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        departmentId: departmentId || null,
        studentRollNumber: studentRollNumber || null,
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      actorId: session!.userId,
      action: 'ADMIN_CREATE_USER',
      resourceType: 'USER',
      resourceId: user.id,
      metadata: { role, email: user.email },
    });

    return NextResponse.json({ message: 'User created successfully', user });
  } catch (err: any) {
    console.error('POST /api/admin/users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    const authCheck = authorizeRoles(session, ['ADMIN']);
    if (!authCheck.allowed) {
      return NextResponse.json({ error: authCheck.reason }, { status: 403 });
    }

    const body = await req.json();
    const { userId, isActive, role, departmentId, resetPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const dataToUpdate: any = {};

    if (typeof isActive === 'boolean') {
      dataToUpdate.isActive = isActive;
    }

    if (role) {
      dataToUpdate.role = role;
    }

    if (departmentId !== undefined) {
      dataToUpdate.departmentId = departmentId || null;
    }

    if (resetPassword) {
      dataToUpdate.passwordHash = await hashPassword(resetPassword);
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
      },
    });

    await createAuditLog({
      actorId: session!.userId,
      action: 'ADMIN_UPDATE_USER',
      resourceType: 'USER',
      resourceId: userId,
      metadata: dataToUpdate,
    });

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err: any) {
    console.error('PATCH /api/admin/users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
