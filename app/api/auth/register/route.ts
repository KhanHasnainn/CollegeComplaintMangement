import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name, studentRollNumber, phone } = validated.data;

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: 'STUDENT',
        studentRollNumber,
        phone,
      },
    });

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'STUDENT' | 'STAFF' | 'ADMIN',
      departmentId: user.departmentId,
    });

    await createAuditLog({
      actorId: user.id,
      action: 'USER_REGISTER',
      resourceType: 'USER',
      resourceId: user.id,
      ipAddress: ip,
    });

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentRollNumber: user.studentRollNumber,
      },
    });
  } catch (err: any) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
