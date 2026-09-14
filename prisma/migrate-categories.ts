import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Step 1: Loading departments');
  const departments = await prisma.department.findMany();
  const deptMap = new Map(departments.map((d) => [d.code, d.id]));

  console.log(`Found ${departments.length} departments.`);

  const deptDefs = [
    { code: 'MAINT', name: 'Maintenance & Facilities', description: 'Physical campus maintenance, electrical, plumbing, and cleanliness.' },
    { code: 'ACAD', name: 'Academic Affairs', description: 'Lectures, examinations, course materials, and grade issues.' },
    { code: 'HOSTEL', name: 'Hostel Management', description: 'Hostel room allocation, mess food quality, and boarding complaints.' },
    { code: 'IT', name: 'IT & Labs', description: 'Campus Wi-Fi, computer labs, student portal errors, and printing.' },
    { code: 'ADMIN', name: 'General Administration', description: 'Fees, documentation, security, and general administrative services.' },
  ];

  for (const def of deptDefs) {
    const d = await prisma.department.upsert({
      where: { code: def.code },
      update: { name: def.name, description: def.description },
      create: def,
    });
    deptMap.set(d.code, d.id);
  }

  console.log('Step 2: Deduplicating existing categories');
  const allCategories = await prisma.category.findMany({
    include: { complaints: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const groups = new Map<string, typeof allCategories>();
  for (const cat of allCategories) {
    const key = `${cat.departmentId}::${cat.name.trim().toLowerCase()}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(cat);
  }

  for (const [key, catList] of groups.entries()) {
    if (catList.length > 1) {
      console.log(`Found ${catList.length} copies of category "${catList[0].name}"`);
      catList.sort((a, b) => b.complaints.length - a.complaints.length);
      const primary = catList[0];
      const duplicates = catList.slice(1);

      for (const dup of duplicates) {
        if (dup.complaints.length > 0) {
          console.log(`Reassigning ${dup.complaints.length} complaints from ${dup.id} to ${primary.id}`);
          await prisma.complaint.updateMany({
            where: { categoryId: dup.id },
            data: { categoryId: primary.id },
          });
        }
        console.log(`Deleting duplicate category ${dup.id} (${dup.name})`);
        await prisma.category.delete({
          where: { id: dup.id },
        });
      }
    }
  }

  console.log('Step 3: Upserting full catalog of categories');
  const categoriesToSeed = [
    {
      name: 'Academic & Schedule',
      departmentCode: 'ACAD',
      description: 'Class scheduling, lecture timings, faculty availability, and timetable conflicts',
    },
    {
      name: 'Course Registration & Electives',
      departmentCode: 'ACAD',
      description: 'Elective course selection, credits, add/drop subjects, and syllabus queries',
    },
    {
      name: 'Examination & Grading',
      departmentCode: 'ACAD',
      description: 'Exam hall seating, hall tickets, mark sheet discrepancies, and re-evaluations',
    },
    {
      name: 'Faculty & Lecture Concerns',
      departmentCode: 'ACAD',
      description: 'Lecture cancellations, attendance tracking issues, and academic guidance',
    },
    {
      name: 'Library & Study Resources',
      departmentCode: 'ACAD',
      description: 'Book lending, digital journal subscriptions, quiet study zones, and library cards',
    },
    {
      name: 'Electrical Issues',
      departmentCode: 'MAINT',
      description: 'Power outages, broken lights, fans, faulty switches, and power sockets',
    },
    {
      name: 'Plumbing & Water',
      departmentCode: 'MAINT',
      description: 'Pipe leaks, washroom sanitation, drinking water coolers, and low water pressure',
    },
    {
      name: 'Air Conditioning & HVAC',
      departmentCode: 'MAINT',
      description: 'Classroom and lab AC malfunction, temperature control, and ventilation issues',
    },
    {
      name: 'Furniture & Infrastructure',
      departmentCode: 'MAINT',
      description: 'Broken desks, chairs, whiteboards, podiums, and classroom doors/windows',
    },
    {
      name: 'Cleanliness & Housekeeping',
      departmentCode: 'MAINT',
      description: 'Waste disposal, corridor cleanliness, restroom hygiene, and pest control',
    },
    {
      name: 'Elevators & Building Accessibility',
      departmentCode: 'MAINT',
      description: 'Lift breakdowns, ramps, railings, and stairwell safety',
    },
    {
      name: 'Hostel & Mess',
      departmentCode: 'HOSTEL',
      description: 'General hostel accommodation, room maintenance, and mess dining facilities',
    },
    {
      name: 'Mess & Food Hygiene',
      departmentCode: 'HOSTEL',
      description: 'Meal quality, dietary nutrition, kitchen hygiene, and dining hall cleanliness',
    },
    {
      name: 'Hostel Water & Geyser',
      departmentCode: 'HOSTEL',
      description: 'Hot water availability, geyser repairs, and hostel washroom plumbing',
    },
    {
      name: 'Hostel Security & Access',
      departmentCode: 'HOSTEL',
      description: 'Gate curfew passes, biometric hostel entry, security personnel, and safety',
    },
    {
      name: 'Hostel Amenities & Laundry',
      departmentCode: 'HOSTEL',
      description: 'Washing machines, laundry service, common room TV, and indoor recreation',
    },
    {
      name: 'Wi-Fi & Lab Hardware',
      departmentCode: 'IT',
      description: 'Campus Wi-Fi outages, network speed drops, and computer hardware issues',
    },
    {
      name: 'Lab Computers & Software',
      departmentCode: 'IT',
      description: 'Faulty lab PCs, operating system errors, software licenses, and peripherals',
    },
    {
      name: 'Student ERP & Portal',
      departmentCode: 'IT',
      description: 'Password reset, student portal login failures, LMS errors, and online forms',
    },
    {
      name: 'Printing & ID Biometrics',
      departmentCode: 'IT',
      description: 'Student printing kiosks, smart ID card scanners, and biometric attendance units',
    },
    {
      name: 'Auditorium & AV Equipment',
      departmentCode: 'IT',
      description: 'Projectors, microphones, PA speakers, and smart classroom display setups',
    },
    {
      name: 'Fees, Accounts & Scholarships',
      departmentCode: 'ADMIN',
      description: 'Fee payment receipts, refund status, scholarship disbursement, and fines',
    },
    {
      name: 'Certificates & Documentation',
      departmentCode: 'ADMIN',
      description: 'Bonafide certificates, official transcripts, transfer certificates, and ID card replacement',
    },
    {
      name: 'Bus & Transportation',
      departmentCode: 'ADMIN',
      description: 'College bus routes, arrival timings, transport pass verification, and bus safety',
    },
    {
      name: 'Campus Parking & Security',
      departmentCode: 'ADMIN',
      description: 'Student vehicle parking allocations, campus traffic regulations, and vehicle security',
    },
    {
      name: 'Lost & Found Property',
      departmentCode: 'ADMIN',
      description: 'Report lost personal belongings, student cards, bags, or claim found articles',
    },
    {
      name: 'Sports & Gymnasium',
      departmentCode: 'ADMIN',
      description: 'Gym equipment condition, outdoor sports grounds, lighting, and sports gear access',
    },
  ];

  for (const item of categoriesToSeed) {
    const deptId = deptMap.get(item.departmentCode);
    if (!deptId) {
      console.warn(`Department ${item.departmentCode} not found!`);
      continue;
    }

    const existing = await prisma.category.findFirst({
      where: {
        departmentId: deptId,
        name: item.name,
      },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          isActive: true,
        },
      });
      console.log(`Updated existing category: ${item.name} (${item.departmentCode})`);
    } else {
      await prisma.category.create({
        data: {
          name: item.name,
          description: item.description,
          departmentId: deptId,
          isActive: true,
        },
      });
      console.log(`Created new category: ${item.name} (${item.departmentCode})`);
    }
  }

  const finalCategories = await prisma.category.findMany({
    include: { department: true },
    orderBy: [{ department: { name: 'asc' } }, { name: 'asc' }],
  });

  console.log(`\nCleanup and seed complete. Total unique categories in database: ${finalCategories.length}`);
  for (const c of finalCategories) {
    console.log(`[${c.department?.name}] ${c.name}`);
  }
}

main()
  .catch((err) => {
    console.error('Error during cleanup:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
