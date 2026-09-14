export type ComplaintStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_STUDENT'
  | 'RESOLVED'
  | 'REOPENED'
  | 'REJECTED';

// Define valid next states for each status
const VALID_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  PENDING: ['UNDER_REVIEW', 'ASSIGNED', 'REJECTED'],
  UNDER_REVIEW: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'WAITING_FOR_STUDENT', 'UNDER_REVIEW', 'REJECTED'],
  IN_PROGRESS: ['WAITING_FOR_STUDENT', 'RESOLVED', 'UNDER_REVIEW', 'ASSIGNED', 'REJECTED'],
  WAITING_FOR_STUDENT: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  RESOLVED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'UNDER_REVIEW', 'ASSIGNED', 'RESOLVED'],
  REJECTED: ['REOPENED', 'UNDER_REVIEW'],
};

/**
 * Validates whether a state transition from `currentStatus` to `newStatus` is permissible.
 */
export function isValidStateTransition(currentStatus: ComplaintStatus, newStatus: ComplaintStatus): boolean {
  if (currentStatus === newStatus) return true; // No status change is trivial
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

/**
 * Returns allowed next statuses for a given status.
 */
export function getAllowedNextStatuses(currentStatus: ComplaintStatus): ComplaintStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}
