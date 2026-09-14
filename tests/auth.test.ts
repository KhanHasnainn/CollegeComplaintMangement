import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../lib/auth';
import { isValidStateTransition } from '../lib/state-machine';

describe('Authentication & Security Unit Tests', () => {
  it('should securely hash and verify passwords using bcrypt', async () => {
    const rawPassword = 'Password123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toEqual(rawPassword);
    expect(hash.startsWith('$2')).toBe(true);

    const valid = await verifyPassword(rawPassword, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword('WrongPassword', hash);
    expect(invalid).toBe(false);
  });

  it('should issue and decode valid JWT session tokens', async () => {
    const userSession = {
      userId: 'test-user-uuid-123',
      email: 'student1@college.local',
      name: 'Alice Johnson',
      role: 'STUDENT' as const,
    };

    const token = await createSessionToken(userSession);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(userSession.userId);
    expect(decoded?.email).toBe(userSession.email);
    expect(decoded?.role).toBe('STUDENT');
  });

  it('should reject invalid or tampered JWT tokens', async () => {
    const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.signature';
    const decoded = await verifySessionToken(tamperedToken);
    expect(decoded).toBeNull();
  });
});
