import { NextResponse } from 'next/server';
import { clearAuthCookie, getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST() {
  const session = await getSession();
  if (session) {
    await createAuditLog({
      actorId: session.userId,
      action: 'USER_LOGOUT',
      resourceType: 'USER',
      resourceId: session.userId,
    });
  }
  await clearAuthCookie();
  return NextResponse.json({ message: 'Logged out successfully' });
}
