import { db } from './db';

/**
 * Generates a unique, server-side human-readable Complaint ID.
 * Format: CMP-2026-000001
 */
export async function generateUniqueComplaintId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  // Count existing complaints for the current year to derive sequential seed safely
  const count = await db.complaint.count({
    where: {
      complaintNumber: {
        startsWith: prefix,
      },
    },
  });

  let nextSeq = count + 1;
  let candidateId = `${prefix}${String(nextSeq).padStart(6, '0')}`;

  // Ensure zero collision by looping if candidate already exists
  let exists = await db.complaint.findUnique({
    where: { complaintNumber: candidateId },
  });

  while (exists) {
    nextSeq += 1;
    candidateId = `${prefix}${String(nextSeq).padStart(6, '0')}`;
    exists = await db.complaint.findUnique({
      where: { complaintNumber: candidateId },
    });
  }

  return candidateId;
}
