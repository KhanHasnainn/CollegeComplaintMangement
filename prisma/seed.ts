import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding College Complaint Management System database...');

  const defaultPassword = process.env.DEFAULT_SEED_PASSWORD || process.env.ADMIN_PASSWORD || 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@college.local';
  const maintEmail = process.env.MAINTENANCE_STAFF_EMAIL || 'maintenance@college.local';
  const acadEmail = process.env.ACADEMIC_STAFF_EMAIL || 'academic@college.local';
  const hostelEmail = process.env.HOSTEL_STAFF_EMAIL || 'hostel@college.local';
  const student1Email = process.env.STUDENT1_EMAIL || 'student1@college.local';
  const student2Email = process.env.STUDENT2_EMAIL || 'student2@college.local';

  // 2. Create Departments
  const maintenanceDept = await prisma.department.upsert({
    where: { code: 'MAINT' },
    update: {},
    create: {
      code: 'MAINT',
      name: 'Maintenance & Facilities',
      description: 'Physical campus maintenance, electrical, plumbing, and cleanliness.',
    },
  });

  const academicDept = await prisma.department.upsert({
    where: { code: 'ACAD' },
    update: {},
    create: {
      code: 'ACAD',
      name: 'Academic Affairs',
      description: 'Lectures, examinations, course materials, and grade issues.',
    },
  });

  const hostelDept = await prisma.department.upsert({
    where: { code: 'HOSTEL' },
    update: {},
    create: {
      code: 'HOSTEL',
      name: 'Hostel Management',
      description: 'Hostel room allocation, mess food quality, and boarding complaints.',
    },
  });

  const itDept = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: {
      code: 'IT',
      name: 'IT & Labs',
      description: 'Campus Wi-Fi, computer labs, student portal errors, and printing.',
    },
  });

  const adminDept = await prisma.department.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'General Administration',
      description: 'Fees, documentation, security, and general administrative services.',
    },
  });

  // 3. Create Categories (Deduplication-safe across all departments)
  const upsertCategory = async (name: string, description: string, departmentId: string) => {
    const existing = await prisma.category.findFirst({
      where: { name, departmentId },
    });
    if (existing) {
      return await prisma.category.update({
        where: { id: existing.id },
        data: { description, isActive: true },
      });
    }
    return await prisma.category.create({
      data: { name, description, departmentId, isActive: true },
    });
  };

  // Academic Affairs
  const catAcademics = await upsertCategory(
    'Academic & Schedule',
    'Class scheduling, lecture timings, faculty availability, and timetable conflicts',
    academicDept.id
  );
  await upsertCategory(
    'Course Registration & Electives',
    'Elective course selection, credits, add/drop subjects, and syllabus queries',
    academicDept.id
  );
  await upsertCategory(
    'Examination & Grading',
    'Exam hall seating, hall tickets, mark sheet discrepancies, and re-evaluations',
    academicDept.id
  );
  await upsertCategory(
    'Faculty & Lecture Concerns',
    'Lecture cancellations, attendance tracking issues, and academic guidance',
    academicDept.id
  );
  await upsertCategory(
    'Library & Study Resources',
    'Book lending, digital journal subscriptions, quiet study zones, and library cards',
    academicDept.id
  );

  // Maintenance & Facilities
  const catElectrical = await upsertCategory(
    'Electrical Issues',
    'Power outages, broken lights, fans, faulty switches, and power sockets',
    maintenanceDept.id
  );
  const catPlumbing = await upsertCategory(
    'Plumbing & Water',
    'Pipe leaks, washroom sanitation, drinking water coolers, and low water pressure',
    maintenanceDept.id
  );
  await upsertCategory(
    'Air Conditioning & HVAC',
    'Classroom and lab AC malfunction, temperature control, and ventilation issues',
    maintenanceDept.id
  );
  await upsertCategory(
    'Furniture & Infrastructure',
    'Broken desks, chairs, whiteboards, podiums, and classroom doors/windows',
    maintenanceDept.id
  );
  await upsertCategory(
    'Cleanliness & Housekeeping',
    'Waste disposal, corridor cleanliness, restroom hygiene, and pest control',
    maintenanceDept.id
  );
  await upsertCategory(
    'Elevators & Building Accessibility',
    'Lift breakdowns, ramps, railings, and stairwell safety',
    maintenanceDept.id
  );

  // Hostel Management
  const catHostel = await upsertCategory(
    'Hostel & Mess',
    'General hostel accommodation, room maintenance, and mess dining facilities',
    hostelDept.id
  );
  await upsertCategory(
    'Mess & Food Hygiene',
    'Meal quality, dietary nutrition, kitchen hygiene, and dining hall cleanliness',
    hostelDept.id
  );
  await upsertCategory(
    'Hostel Water & Geyser',
    'Hot water availability, geyser repairs, and hostel washroom plumbing',
    hostelDept.id
  );
  await upsertCategory(
    'Hostel Security & Access',
    'Gate curfew passes, biometric hostel entry, security personnel, and safety',
    hostelDept.id
  );
  await upsertCategory(
    'Hostel Amenities & Laundry',
    'Washing machines, laundry service, common room TV, and indoor recreation',
    hostelDept.id
  );

  // IT & Labs
  const catIT = await upsertCategory(
    'Wi-Fi & Lab Hardware',
    'Campus Wi-Fi outages, network speed drops, and computer hardware issues',
    itDept.id
  );
  await upsertCategory(
    'Lab Computers & Software',
    'Faulty lab PCs, operating system errors, software licenses, and peripherals',
    itDept.id
  );
  await upsertCategory(
    'Student ERP & Portal',
    'Password reset, student portal login failures, LMS errors, and online forms',
    itDept.id
  );
  await upsertCategory(
    'Printing & ID Biometrics',
    'Student printing kiosks, smart ID card scanners, and biometric attendance units',
    itDept.id
  );
  await upsertCategory(
    'Auditorium & AV Equipment',
    'Projectors, microphones, PA speakers, and smart classroom display setups',
    itDept.id
  );

  // General Administration
  await upsertCategory(
    'Fees, Accounts & Scholarships',
    'Fee payment receipts, refund status, scholarship disbursement, and fines',
    adminDept.id
  );
  await upsertCategory(
    'Certificates & Documentation',
    'Bonafide certificates, official transcripts, transfer certificates, and ID card replacement',
    adminDept.id
  );
  await upsertCategory(
    'Bus & Transportation',
    'College bus routes, arrival timings, transport pass verification, and bus safety',
    adminDept.id
  );
  await upsertCategory(
    'Campus Parking & Security',
    'Student vehicle parking allocations, campus traffic regulations, and vehicle security',
    adminDept.id
  );
  await upsertCategory(
    'Lost & Found Property',
    'Report lost personal belongings, student cards, bags, or claim found articles',
    adminDept.id
  );
  await upsertCategory(
    'Sports & Gymnasium',
    'Gym equipment condition, outdoor sports grounds, lighting, and sports gear access',
    adminDept.id
  );

  // 4. Create Users
  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
      departmentId: adminDept.id,
      phone: '+1-555-0100',
    },
  });

  // Staff Users
  const maintenanceStaff = await prisma.user.upsert({
    where: { email: maintEmail },
    update: {},
    create: {
      email: maintEmail,
      passwordHash,
      name: 'John Maintenance',
      role: 'STAFF',
      departmentId: maintenanceDept.id,
      phone: '+1-555-0101',
    },
  });

  const academicStaff = await prisma.user.upsert({
    where: { email: acadEmail },
    update: {},
    create: {
      email: acadEmail,
      passwordHash,
      name: 'Prof. Sarah Vance',
      role: 'STAFF',
      departmentId: academicDept.id,
      phone: '+1-555-0102',
    },
  });

  const hostelStaff = await prisma.user.upsert({
    where: { email: hostelEmail },
    update: {},
    create: {
      email: hostelEmail,
      passwordHash,
      name: 'David Hostel Warden',
      role: 'STAFF',
      departmentId: hostelDept.id,
      phone: '+1-555-0103',
    },
  });

  // Student Users
  const student1 = await prisma.user.upsert({
    where: { email: student1Email },
    update: {},
    create: {
      email: student1Email,
      passwordHash,
      name: 'Alice Johnson',
      role: 'STUDENT',
      studentRollNumber: 'CS-2024-042',
      phone: '+1-555-0201',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: student2Email },
    update: {},
    create: {
      email: student2Email,
      passwordHash,
      name: 'Bob Smith',
      role: 'STUDENT',
      studentRollNumber: 'EE-2024-118',
      phone: '+1-555-0202',
    },
  });

  // 5. Create Sample Complaints & Updates (Idempotent upsert)
  const complaint1 = await prisma.complaint.upsert({
    where: { complaintNumber: 'CMP-2026-000001' },
    update: {},
    create: {
      complaintNumber: 'CMP-2026-000001',
      studentId: student1.id,
      categoryId: catElectrical.id,
      departmentId: maintenanceDept.id,
      assignedStaffId: maintenanceStaff.id,
      title: 'Ceiling Fan Not Working in Room B-302',
      description: 'The ceiling fan in hostel block B room 302 stopped spinning yesterday evening. It makes a humming sound.',
      priority: 'HIGH',
      status: 'RESOLVED',
      resolvedAt: new Date(),
      updates: {
        create: [
          {
            actorId: student1.id,
            updateType: 'STATUS_CHANGE',
            message: 'Complaint submitted by student.',
            previousStatus: null,
            newStatus: 'PENDING',
            isPublic: true,
          },
          {
            actorId: adminUser.id,
            updateType: 'REASSIGNMENT',
            message: 'Assigned to Maintenance & Facilities department staff.',
            previousStatus: 'PENDING',
            newStatus: 'ASSIGNED',
            isPublic: true,
          },
          {
            actorId: maintenanceStaff.id,
            updateType: 'INTERNAL_NOTE',
            message: 'Electrician dispatched with spare capacitor.',
            isPublic: false,
          },
          {
            actorId: maintenanceStaff.id,
            updateType: 'PUBLIC_UPDATE',
            message: 'Replaced fan regulator and capacitor. Fan tested and operational.',
            previousStatus: 'ASSIGNED',
            newStatus: 'RESOLVED',
            isPublic: true,
          },
        ],
      },
      feedback: {
        create: {
          studentId: student1.id,
          rating: 5,
          comment: 'Quick response and fixed within 24 hours. Great job!',
        },
      },
    },
  });

  const complaint2 = await prisma.complaint.upsert({
    where: { complaintNumber: 'CMP-2026-000002' },
    update: {},
    create: {
      complaintNumber: 'CMP-2026-000002',
      studentId: student2.id,
      categoryId: catIT.id,
      departmentId: itDept.id,
      title: 'Wi-Fi disconnects frequently in Library 2nd Floor',
      description: 'Every 15 minutes the Wi-Fi connection drops in the quiet study zone on the second floor of the library.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      updates: {
        create: [
          {
            actorId: student2.id,
            updateType: 'STATUS_CHANGE',
            message: 'Complaint submitted by student.',
            previousStatus: null,
            newStatus: 'PENDING',
            isPublic: true,
          },
          {
            actorId: adminUser.id,
            updateType: 'STATUS_CHANGE',
            message: 'Under review by IT network administrators.',
            previousStatus: 'PENDING',
            newStatus: 'IN_PROGRESS',
            isPublic: true,
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully!');
  console.log('Dev Accounts:');
  console.log('  Admin:       admin@college.local / Password123!');
  console.log('  Maintenance: maintenance@college.local / Password123!');
  console.log('  Academic:    academic@college.local / Password123!');
  console.log('  Hostel:      hostel@college.local / Password123!');
  console.log('  Student 1:   student1@college.local / Password123!');
  console.log('  Student 2:   student2@college.local / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
