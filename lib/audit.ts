import { db } from './db';

export interface AuditLogOptions {
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Record a security or system audit event
 */
export async function createAuditLog(options: AuditLogOptions) {
  try {
    await db.auditLog.create({
      data: {
        actorId: options.actorId || null,
        action: options.action,
        resourceType: options.resourceType,
        resourceId: options.resourceId || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
