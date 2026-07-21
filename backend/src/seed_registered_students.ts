import prisma from './config/database.js';

async function seedStudents() {
  console.log('Seeding student registration profiles into database...');

  const students = await prisma.student.findMany({
    include: { user: true },
  });

  const courses = await prisma.course.findMany();
  let defaultCourseId = courses[0]?.id;

  if (!defaultCourseId) {
    // Create a default department & course if none exist
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: 'Computer Science & Engineering',
          description: 'Department of Computer Science',
        },
      });
    }
    const course = await prisma.course.create({
      data: {
        code: 'CS101',
        name: 'B.Tech Computer Science & Engineering',
        description: 'Undergraduate CSE Program',
        durationYears: 4,
        tuitionFee: 25000,
        requirements: 'Physics, Mathematics, Chemistry (Min 75%)',
        departmentId: dept.id,
      },
    });
    defaultCourseId = course.id;
  }

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const emailName = s.user?.name || s.user?.email?.split('@')[0] || `Student ${i + 1}`;

    console.log(`Updating DB registration profile for: ${emailName} (${s.id})`);

    // 1. Update Student Table with complete registration data
    await prisma.student.update({
      where: { id: s.id },
      data: {
        phone: s.phone || `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        dateOfBirth: s.dateOfBirth || new Date('2003-05-15'),
        gender: s.gender || (i % 2 === 0 ? 'Male' : 'Female'),
        address: s.address || `${101 + i}, University Heights, Knowledge Park III`,
        city: s.city || 'Greater Noida',
        state: s.state || 'Uttar Pradesh',
        pinCode: s.pinCode || '201306',
        nationality: s.nationality || 'Indian',
        academicLevel: s.academicLevel || 'Undergraduate',
        highSchoolName: s.highSchoolName || 'Delhi Public School',
        qualification: s.qualification || 'Class XII Senior Secondary',
        boardUniversity: s.boardUniversity || 'CBSE Board',
        passingYear: s.passingYear || 2024,
        percentage: s.percentage || 88.5 + (i % 5),
        gpa: s.gpa || 3.75 + (i % 3) * 0.1,
        backlogs: s.backlogs ?? 0,
        fatherName: s.fatherName || `Rajesh ${emailName.split(' ')[0]}`,
        motherName: s.motherName || `Sunita ${emailName.split(' ')[0]}`,
        guardianContact:
          s.guardianContact || `+91 94${Math.floor(10000000 + Math.random() * 90000000)}`,
        preferredCountry: s.preferredCountry || 'USA',
        preferredIntake: s.preferredIntake || 'Fall 2026',
        preferredCampus: s.preferredCampus || 'Main Academic Campus',
        testScores: s.testScores || {
          sat: 1420 + i * 20,
          ielts: 7.5,
          classX: '92.4%',
          classXII: '89.6%',
          entranceExam: 'JEE Main',
          rank: 12500 + i * 150,
          sop: `I am applying for the admission counseling process to pursue my degree in Computer Science. My goal is to gain deep knowledge in Artificial Intelligence and Software Architecture, and contribute to cutting-edge software engineering solutions.`,
          skills: {
            programmingLanguages: ['Python', 'TypeScript', 'Java', 'C++'],
            frameworks: ['React', 'Node.js', 'Express', 'TailwindCSS'],
            projects: ['AI Admission Counselor', 'Smart Health Monitor'],
            certifications: ['AWS Certified Cloud Practitioner', 'Google Data Analytics'],
          },
        },
      },
    });

    // 2. Add Documents if none exist for student
    const existingDocs = await prisma.document.findMany({
      where: { studentId: s.id },
    });

    if (existingDocs.length === 0) {
      await prisma.document.createMany({
        data: [
          {
            studentId: s.id,
            name: 'Class XII Marksheet.pdf',
            type: 'MARKSHEET',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            verificationStatus: 'VERIFIED',
          },
          {
            studentId: s.id,
            name: 'Identity Proof (Aadhaar/Passport).pdf',
            type: 'ID_PROOF',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            verificationStatus: 'VERIFIED',
          },
          {
            studentId: s.id,
            name: 'Statement of Purpose (SOP).pdf',
            type: 'SOP',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            verificationStatus: 'PENDING',
          },
        ],
      });
    }

    // 3. Add Admission Record if none exists
    const existingAdmissions = await prisma.admission.findMany({
      where: { studentId: s.id },
    });

    if (existingAdmissions.length === 0 && defaultCourseId) {
      await prisma.admission.create({
        data: {
          studentId: s.id,
          courseId: defaultCourseId,
          status: 'APPLIED',
          appliedIntake: 'Fall 2026',
          notes: 'Application registered and awaiting counselor review.',
        },
      });
    }
  }

  console.log('Finished updating student registration database records successfully!');
}

seedStudents()
  .catch((e) => console.error('Error seeding student DB records:', e))
  .finally(() => prisma.$disconnect());
