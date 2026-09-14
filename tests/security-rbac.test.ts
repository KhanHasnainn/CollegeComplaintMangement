import { describe, it, expect } from 'vitest';
import { authorizeRoles, authorizeComplaintAccess } from '../lib/rbac';
import { validateUpload } from '../lib/storage';

describe('Security & RBAC Enforcement Tests', () => {
  const studentSession = {
    userId: 'student-111',
    email: 'student1@college.local',
    name: 'Student 1',
    role: 'STUDENT' as const,
  };

  const student2Session = {
    userId: 'student-222',
    email: 'student2@college.local',
    name: 'Student 2',
    role: 'STUDENT' as const,
  };

  const staffSession = {
    userId: 'staff-999',
    email: 'maint@college.local',
    name: 'Staff Maintenance',
    role: 'STAFF' as const,
    departmentId: 'dept-maint-id',
  };

  const adminSession = {
    userId: 'admin-000',
    email: 'admin@college.local',
    name: 'Admin',
    role: 'ADMIN' as const,
  };

  it('should prevent Student A from accessing Student B complaint (IDOR Protection)', () => {
    const studentBComplaint = {
      studentId: 'student-222',
      departmentId: 'dept-maint-id',
      assignedStaffId: 'staff-999',
    };

    const studentAAttempt = authorizeComplaintAccess(studentSession, studentBComplaint);
    expect(studentAAttempt.allowed).toBe(false);
    expect(studentAAttempt.reason).toContain('Students can only view their own complaints');

    const studentBOwnerAttempt = authorizeComplaintAccess(student2Session, studentBComplaint);
    expect(studentBOwnerAttempt.allowed).toBe(true);
  });

  it('should allow Admin to access any complaint', () => {
    const complaint = {
      studentId: 'student-222',
      departmentId: 'dept-maint-id',
    };
    const adminAttempt = authorizeComplaintAccess(adminSession, complaint);
    expect(adminAttempt.allowed).toBe(true);
  });

  it('should allow Staff to access complaints in their department only', () => {
    const maintComplaint = {
      studentId: 'student-111',
      departmentId: 'dept-maint-id',
    };
    const academicComplaint = {
      studentId: 'student-111',
      departmentId: 'dept-acad-id',
    };

    expect(authorizeComplaintAccess(staffSession, maintComplaint).allowed).toBe(true);
    expect(authorizeComplaintAccess(staffSession, academicComplaint).allowed).toBe(false);
  });

  it('should reject unallowed roles for restricted API actions', () => {
    const studentAdminCall = authorizeRoles(studentSession, ['ADMIN']);
    expect(studentAdminCall.allowed).toBe(false);

    const staffAdminCall = authorizeRoles(staffSession, ['ADMIN']);
    expect(staffAdminCall.allowed).toBe(false);

    const adminCall = authorizeRoles(adminSession, ['ADMIN']);
    expect(adminCall.allowed).toBe(true);
  });

  it('should validate uploaded file security restrictions', () => {
    const dummyPdf = Buffer.from('%PDF-1.4 test data');
    const validCheck = validateUpload(dummyPdf, 'doc.pdf', 'application/pdf');
    expect(validCheck.valid).toBe(true);

    const exeCheck = validateUpload(Buffer.from('mz binary'), 'malware.exe', 'application/x-msdownload');
    expect(exeCheck.valid).toBe(false);
    expect(exeCheck.error).toContain('Invalid file extension');
  });
});
