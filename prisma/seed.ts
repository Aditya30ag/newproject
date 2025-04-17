import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create a test university
  const university = await prisma.university.upsert({
    where: { id: "test-university-1" },
    update: {},
    create: {
      id: "test-university-1",
      name: "Test University",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      contactEmail: "contact@testuniversity.edu",
      contactPhone: "+91 9876543210",
      website: "https://testuniversity.edu",
    },
  });

  console.log(`Created university: ${university.name}`);

  // Create departments
  const departments = [
    { name: "Computer Science", code: "CSE" },
    { name: "Electronics", code: "ECE" },
    { name: "Mechanical", code: "ME" },
    { name: "Civil", code: "CE" },
    { name: "Information Technology", code: "IT" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: {
        universityId_name: {
          universityId: university.id,
          name: dept.name,
        },
      },
      update: {},
      create: {
        name: dept.name,
        code: dept.code,
        universityId: university.id,
      },
    });
  }

  console.log(`Created departments`);

  // Create Super Admin
  const superAdminPassword = await hashPassword("superadmin123");
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      name: "Super Admin",
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`Created super admin: ${superAdmin.email}`);

  // Create University Admin
  const universityAdminPassword = await hashPassword("universityadmin123");
  const universityAdmin = await prisma.user.upsert({
    where: { email: "universityadmin@example.com" },
    update: {},
    create: {
      email: "universityadmin@example.com",
      name: "University Admin",
      password: universityAdminPassword,
      role: Role.UNIVERSITY_ADMIN,
      universityId: university.id,
    },
  });

  console.log(`Created university admin: ${universityAdmin.email}`);

  // Create Sub User
  const subUserPassword = await hashPassword("subuser123");
  const subUser = await prisma.user.upsert({
    where: { email: "subuser@example.com" },
    update: {},
    create: {
      email: "subuser@example.com",
      name: "Sub User",
      password: subUserPassword,
      role: Role.SUB_USER,
      universityId: university.id,
    },
  });

  console.log(`Created sub user: ${subUser.email}`);

  // Create a test company
  const company = await prisma.company.upsert({
    where: { id: "test-company-1" },
    update: {},
    create: {
      id: "test-company-1",
      name: "Test Company",
      industry: "Technology",
      description: "A test company for demo purposes",
      website: "https://testcompany.com",
    },
  });

  console.log(`Created company: ${company.name}`);

  // Associate company with university
  await prisma.companyUniversity.upsert({
    where: {
      companyId_universityId: {
        companyId: company.id,
        universityId: university.id,
      },
    },
    update: {},
    create: {
      companyId: company.id,
      universityId: university.id,
    },
  });

  // Create company contacts
  const contact1 = await prisma.companyContact.upsert({
    where: { id: "test-contact-1" },
    update: {},
    create: {
      id: "test-contact-1",
      name: "John Doe",
      email: "john.doe@testcompany.com",
      phone: "+91 9876543210",
      designation: "HR Manager",
      isPrimary: true,
      companyId: company.id,
    },
  });

  const contact2 = await prisma.companyContact.upsert({
    where: { id: "test-contact-2" },
    update: {},
    create: {
      id: "test-contact-2",
      name: "Jane Smith",
      email: "jane.smith@testcompany.com",
      phone: "+91 9876543211",
      designation: "Technical Recruiter",
      isPrimary: false,
      companyId: company.id,
    },
  });

  console.log(`Created company contacts`);

  // Create a test job
  const job = await prisma.job.upsert({
    where: { id: "test-job-1" },
    update: {},
    create: {
      id: "test-job-1",
      title: "Software Engineer",
      description: "We are looking for a talented software engineer to join our team.",
      jobType: "FULL_TIME",
      locationType: "ONSITE",
      location: "Bangalore",
      ctcRangeMin: 15,
      ctcRangeMax: 20,
      expectedHires: 5,
      applyBy: new Date("2023-12-31"),
      status: "OPEN",
      requirements: "- Bachelor's degree in Computer Science\n- Strong programming skills\n- Good communication skills",
      responsibilities: "- Develop new features\n- Fix bugs\n- Work with cross-functional teams",
      companyId: company.id,
      universityId: university.id,
      createdById: universityAdmin.id,
      updatedById: universityAdmin.id,
    },
  });

  console.log(`Created job: ${job.title}`);

  // Create interview rounds for the job
  const rounds = [
    {
      name: "Technical Screening",
      description: "Initial technical assessment with coding questions",
      sequence: 1,
    },
    {
      name: "Technical Interview",
      description: "Deep dive into technical skills and problem-solving abilities",
      sequence: 2,
    },
    {
      name: "System Design Round",
      description: "Evaluation of system design and architecture knowledge",
      sequence: 3,
    },
    {
      name: "HR Interview",
      description: "Final round to discuss company culture, expectations, and offer details",
      sequence: 4,
    },
  ];

  for (const round of rounds) {
    await prisma.interviewRound.upsert({
      where: {
        jobId_sequence: {
          jobId: job.id,
          sequence: round.sequence,
        },
      },
      update: {},
      create: {
        name: round.name,
        description: round.description,
        sequence: round.sequence,
        jobId: job.id,
      },
    });
  }

  console.log(`Created interview rounds`);

  // Assign job to sub-user
  await prisma.subUserJob.upsert({
    where: {
      userId_jobId: {
        userId: subUser.id,
        jobId: job.id,
      },
    },
    update: {},
    create: {
      userId: subUser.id,
      jobId: job.id,
      canEditJobDetails: false,
      canManageStudents: true,
      canScheduleInterviews: true,
    },
  });

  console.log(`Assigned job to sub-user`);

  // Add job POCs
  await prisma.jobPOC.upsert({
    where: {
      jobId_contactPersonId: {
        jobId: job.id,
        contactPersonId: contact1.id,
      },
    },
    update: {},
    create: {
      jobId: job.id,
      contactPersonId: contact1.id,
    },
  });

  await prisma.jobPOC.upsert({
    where: {
      jobId_contactPersonId: {
        jobId: job.id,
        contactPersonId: contact2.id,
      },
    },
    update: {},
    create: {
      jobId: job.id,
      contactPersonId: contact2.id,
    },
  });

  console.log(`Added job POCs`);

  // Create test students
  const departments_db = await prisma.department.findMany({
    where: { universityId: university.id },
  });

  const csDepartment = departments_db.find(d => d.name === "Computer Science");
  
  if (csDepartment) {
    const students = [
      {
        firstName: "Rahul",
        lastName: "Sharma",
        email: "rahul.sharma@student.testuniversity.edu",
        rollNumber: "CS2001",
        yearOfGraduation: 2024,
        cgpa: 8.5,
      },
      {
        firstName: "Priya",
        lastName: "Patel",
        email: "priya.patel@student.testuniversity.edu",
        rollNumber: "CS2005",
        yearOfGraduation: 2024,
        cgpa: 9.0,
      },
    ];

    for (const student of students) {
      await prisma.student.upsert({
        where: {
          universityId_email: {
            universityId: university.id,
            email: student.email,
          },
        },
        update: {},
        create: {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          rollNumber: student.rollNumber,
          departmentId: csDepartment.id,
          universityId: university.id,
          yearOfGraduation: student.yearOfGraduation,
          cgpa: student.cgpa,
        },
      });
    }

    console.log(`Created test students`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

