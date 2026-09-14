import { describe, it, expect } from 'vitest';
import { isValidStateTransition, getAllowedNextStatuses, ComplaintStatus } from '../lib/state-machine';

describe('Complaint Workflow & State Machine Tests', () => {
  it('should allow valid status transitions according to institutional workflow', () => {
    expect(isValidStateTransition('PENDING', 'UNDER_REVIEW')).toBe(true);
    expect(isValidStateTransition('UNDER_REVIEW', 'ASSIGNED')).toBe(true);
    expect(isValidStateTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true);
    expect(isValidStateTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(isValidStateTransition('RESOLVED', 'REOPENED')).toBe(true);
  });

  it('should block arbitrary invalid status transitions', () => {
    // PENDING cannot jump directly to RESOLVED without review/assignment
    expect(isValidStateTransition('PENDING', 'RESOLVED')).toBe(false);
    // REJECTED cannot jump directly to IN_PROGRESS without REOPENED or UNDER_REVIEW
    expect(isValidStateTransition('REJECTED', 'IN_PROGRESS')).toBe(false);
  });

  it('should return correct allowed next statuses', () => {
    const allowedFromPending = getAllowedNextStatuses('PENDING');
    expect(allowedFromPending).toContain('UNDER_REVIEW');
    expect(allowedFromPending).toContain('REJECTED');
    expect(allowedFromPending).not.toContain('RESOLVED');
  });
});
