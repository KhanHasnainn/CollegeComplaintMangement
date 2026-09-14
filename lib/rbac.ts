import { UserSession } from './auth';

export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Enforce required roles for an endpoint or action
 */
export function authorizeRoles(session: UserSession | null, allowedRoles: Role[]): AuthorizationResult {
  if (!session) {
    return { allowed: false, reason: 'Authentication required' };
  }

  if (!allowedRoles.includes(session.role)) {
    return { allowed: false, reason: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` };
  }

  return { allowed: true };
}

/**
 * Verify complaint ownership or staff/admin access rights to prevent IDOR / BOLA vulnerabilities
 */
export function authorizeComplaintAccess(
  session: UserSession | null,
  complaint: {
    studentId: string;
    departmentId: string;
    assignedStaffId?: string | null;
  }
): AuthorizationResult {
  if (!session) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Admins can access all complaints
  if (session.role === 'ADMIN') {
    return { allowed: true };
  }

  // Students can only access their own complaints
  if (session.role === 'STUDENT') {
    if (complaint.studentId === session.userId) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Students can only view their own complaints' };
  }

  // Staff can access complaints assigned to them or their department
  if (session.role === 'STAFF') {
    if (
      complaint.assignedStaffId === session.userId ||
      (session.departmentId && complaint.departmentId === session.departmentId)
    ) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Staff can only access complaints within their assigned department' };
  }

  return { allowed: false, reason: 'Forbidden' };
}
