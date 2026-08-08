import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  UNIVERSITY_ADMIN: 'UNIVERSITY_ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
} as const;

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.documentRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transportAllocation.deleteMany();
  await prisma.transportBus.deleteMany();
  await prisma.transportRoute.deleteMany();
  await prisma.hostelAllocation.deleteMany();
  await prisma.hostelRoom.deleteMany();
  await prisma.hostelBlock.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examRegistration.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.timeTableSlot.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.courseRegistration.deleteMany();
  await prisma.course.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  const hashedStudentPassword = await bcrypt.hash('Student@123', 10);
  const hashedFacultyPassword = await bcrypt.hash('Faculty@123', 10);
  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);

  // Departments
  const deptECE = await prisma.department.create({
    data: {
      code: 'ECE',
      name: 'Department of Electronics & Communication Engineering',
    },
  });

  const deptCSE = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Department of Computer Science & Engineering',
    },
  });

  // Programs
  const progBTechECE = await prisma.program.create({
    data: {
      code: 'BTECH-ECE',
      name: 'B.Tech Electronics and Communication Engineering',
      degree: 'B.Tech',
      departmentId: deptECE.id,
    },
  });

  // Create Users
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@university.edu',
      registerNo: 'AP2026001234',
      passwordHash: hashedStudentPassword,
      name: 'RAYAPUDI VENKATA PHANINDRA',
      role: Role.STUDENT,
    },
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@university.edu',
      registerNo: 'FAC2026001',
      passwordHash: hashedFacultyPassword,
      name: 'Dr. A. K. Sharma',
      role: Role.FACULTY,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@university.edu',
      registerNo: 'ADM2026001',
      passwordHash: hashedAdminPassword,
      name: 'Chief Administrator',
      role: Role.SUPER_ADMIN,
    },
  });

  // Profiles
  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      registerNo: 'AP2026001234',
      school: 'School of Engineering and Sciences',
      programId: progBTechECE.id,
      specialization: 'VLSI & Embedded Systems',
      semester: 'Semester IV',
      section: 'Sec-A',
      dob: '2004-05-15',
      gender: 'Male',
      phone: '+91 98765 43210',
      email: 'student@university.edu',
      fatherName: 'R. K. Rao',
      motherName: 'R. Lakshmi',
      academicYear: '2025-2026',
      admissionYear: '2023',
      bloodGroup: 'O+',
      address: 'Plot 45, University Enclave, Tech City, AP, India',
      cgpa: 8.85,
    },
  });

  const facultyProfile = await prisma.facultyProfile.create({
    data: {
      userId: facultyUser.id,
      employeeId: 'FAC2026001',
      departmentId: deptECE.id,
      designation: 'Professor & HOD',
      phone: '+91 91234 56789',
      officeRoom: 'Block B - 304',
    },
  });

  // Courses
  const c1 = await prisma.course.create({
    data: {
      code: 'ECE101',
      name: 'Digital Electronics',
      credits: 4,
      type: 'Core',
      semester: 'Semester IV',
      programId: progBTechECE.id,
      facultyId: facultyProfile.id,
      seatsTotal: 60,
      seatsTaken: 45,
      prerequisites: 'Basic Electrical Engg',
    },
  });

  const c2 = await prisma.course.create({
    data: {
      code: 'ECE102',
      name: 'Signals & Systems',
      credits: 4,
      type: 'Core',
      semester: 'Semester IV',
      programId: progBTechECE.id,
      facultyId: facultyProfile.id,
      seatsTotal: 60,
      seatsTaken: 42,
      prerequisites: 'Engineering Math II',
    },
  });

  const c3 = await prisma.course.create({
    data: {
      code: 'ECE103',
      name: 'Control Systems',
      credits: 3,
      type: 'Core',
      semester: 'Semester IV',
      programId: progBTechECE.id,
      facultyId: facultyProfile.id,
      seatsTotal: 60,
      seatsTaken: 38,
    },
  });

  const c4 = await prisma.course.create({
    data: {
      code: 'ECE104',
      name: 'Microprocessors & Microcontrollers',
      credits: 4,
      type: 'Lab Integrated',
      semester: 'Semester IV',
      programId: progBTechECE.id,
      facultyId: facultyProfile.id,
      seatsTotal: 60,
      seatsTaken: 50,
      prerequisites: 'Digital Electronics',
    },
  });

  const c5 = await prisma.course.create({
    data: {
      code: 'CSE101',
      name: 'Data Structures & Algorithms',
      credits: 4,
      type: 'Elective',
      semester: 'Semester IV',
      programId: progBTechECE.id,
      facultyId: facultyProfile.id,
      seatsTotal: 60,
      seatsTaken: 58,
    },
  });

  // Course Registrations
  for (const course of [c1, c2, c3, c4, c5]) {
    await prisma.courseRegistration.create({
      data: {
        studentId: studentProfile.id,
        courseId: course.id,
        status: 'REGISTERED',
      },
    });
  }

  // Attendance Records (~87% overall)
  const coursesList = [
    { c: c1, present: 18, total: 20 },
    { c: c2, present: 17, total: 20 },
    { c: c3, present: 18, total: 20 },
    { c: c4, present: 15, total: 20 }, // 75% edge
    { c: c5, present: 19, total: 20 },
  ];

  for (const item of coursesList) {
    for (let i = 1; i <= item.total; i++) {
      const isPresent = i <= item.present;
      const dayStr = i < 10 ? `0${i}` : `${i}`;
      await prisma.attendanceRecord.create({
        data: {
          studentId: studentProfile.id,
          courseId: item.c.id,
          date: `2026-07-${dayStr}`,
          status: isPresent ? 'PRESENT' : 'ABSENT',
        },
      });
    }
  }

  // Timetable
  const timetableData = [
    { day: 'Monday', startTime: '09:00', endTime: '10:00', courseId: c1.id, room: 'LH-101' },
    { day: 'Monday', startTime: '10:00', endTime: '11:00', courseId: c2.id, room: 'LH-101' },
    { day: 'Monday', startTime: '11:15', endTime: '12:15', courseId: c3.id, room: 'LH-102' },
    { day: 'Tuesday', startTime: '09:00', endTime: '11:00', courseId: c4.id, room: 'Micro Lab 2' },
    { day: 'Wednesday', startTime: '09:00', endTime: '10:00', courseId: c5.id, room: 'LH-201' },
    { day: 'Wednesday', startTime: '10:00', endTime: '11:00', courseId: c1.id, room: 'LH-101' },
    { day: 'Thursday', startTime: '11:15', endTime: '12:15', courseId: c2.id, room: 'LH-102' },
    { day: 'Friday', startTime: '14:00', endTime: '16:00', courseId: c4.id, room: 'Micro Lab 2' },
  ];

  for (const slot of timetableData) {
    await prisma.timeTableSlot.create({ data: slot });
  }

  // Exams & Results
  const ex1 = await prisma.exam.create({
    data: {
      code: 'EXAM-2026-MID',
      name: 'Mid-Semester Examinations 2026',
      type: 'INTERNAL',
      courseId: c1.id,
      date: '2026-08-20',
      time: '10:00 AM - 12:00 PM',
      venue: 'Hall A - Block 2',
      maxMarks: 50,
    },
  });

  const ex2 = await prisma.exam.create({
    data: {
      code: 'EXAM-2026-END',
      name: 'End-Semester Examinations 2026',
      type: 'END_SEM',
      courseId: c2.id,
      date: '2026-09-05',
      time: '09:30 AM - 12:30 PM',
      venue: 'Exam Centre Main',
      maxMarks: 100,
    },
  });

  await prisma.examRegistration.create({
    data: {
      examId: ex1.id,
      studentId: studentProfile.id,
      hallTicketNo: 'HT2026-88912',
      status: 'ISSUED',
    },
  });

  await prisma.examResult.create({
    data: {
      examId: ex1.id,
      studentId: studentProfile.id,
      marksObtained: 46,
      grade: 'A+',
      gradePoints: 10,
      result: 'PASS',
      semester: 'Semester III',
    },
  });

  await prisma.examResult.create({
    data: {
      examId: ex2.id,
      studentId: studentProfile.id,
      marksObtained: 88,
      grade: 'A',
      gradePoints: 9,
      result: 'PASS',
      semester: 'Semester III',
    },
  });

  // Fee Records & Payments
  const feeTuition = await prisma.feeRecord.create({
    data: {
      studentId: studentProfile.id,
      category: 'Tuition Fee',
      description: 'Semester IV Tuition & Academic Services',
      totalAmount: 75000,
      paidAmount: 75000,
      dueDate: '2026-07-15',
      status: 'PAID',
    },
  });

  const feeHostel = await prisma.feeRecord.create({
    data: {
      studentId: studentProfile.id,
      category: 'Hostel Fee',
      description: 'AC Room & Mess Services H-3',
      totalAmount: 35000,
      paidAmount: 20000,
      dueDate: '2026-08-30',
      status: 'PARTIAL',
    },
  });

  const feeExam = await prisma.feeRecord.create({
    data: {
      studentId: studentProfile.id,
      category: 'Examination Fee',
      description: 'End Sem Exam & Evaluation Charges',
      totalAmount: 2500,
      paidAmount: 0,
      dueDate: '2026-08-15',
      status: 'PENDING',
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      feeRecordId: feeTuition.id,
      studentId: studentProfile.id,
      transactionId: 'TXN202607159982',
      amount: 75000,
      paymentMethod: 'UPI / NetBanking',
      status: 'SUCCESS',
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      feeRecordId: feeHostel.id,
      studentId: studentProfile.id,
      transactionId: 'TXN202607204411',
      amount: 20000,
      paymentMethod: 'Credit Card',
      status: 'SUCCESS',
    },
  });

  // Hostel Setup
  const hostelBlock = await prisma.hostelBlock.create({
    data: {
      name: 'Block A - Boys Hostel',
      gender: 'Male',
    },
  });

  const hostelRoom = await prisma.hostelRoom.create({
    data: {
      blockId: hostelBlock.id,
      roomNo: 'A-304',
      capacity: 2,
      occupied: 1,
      roomType: 'AC Double Sharing',
      mess: 'Central Dining Hall 1',
      warden: 'Prof. R. S. Verma',
    },
  });

  await prisma.hostelAllocation.create({
    data: {
      studentId: studentProfile.id,
      roomId: hostelRoom.id,
      bedNo: 'A-304-B1',
      status: 'ALLOCATED',
    },
  });

  // Transport Setup
  const route = await prisma.transportRoute.create({
    data: {
      routeNo: 'R-12',
      routeName: 'City Center Express via Tech Highway',
      pickupPoints: 'Central Station, City Plaza, Tech Hub, Campus Gate 1',
      feeAmount: 12000,
    },
  });

  await prisma.transportBus.create({
    data: {
      busNo: 'AP-09-UB-1044',
      routeId: route.id,
      capacity: 40,
      driverName: 'S. Kumar',
      driverPhone: '+91 99887 76655',
    },
  });

  await prisma.transportAllocation.create({
    data: {
      studentId: studentProfile.id,
      routeId: route.id,
      pickupPoint: 'City Plaza',
      pickupTime: '07:30 AM',
      dropTime: '05:30 PM',
    },
  });

  // Assignments
  const asg1 = await prisma.assignment.create({
    data: {
      title: 'Design of 4-bit ALU Circuit',
      description: 'Implement logic diagram, truth tables, and Verilog code snippet for 4-bit Arithmetic Logic Unit.',
      courseId: c1.id,
      facultyId: facultyProfile.id,
      dueDate: '2026-08-18',
      maxMarks: 100,
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: asg1.id,
      studentId: studentProfile.id,
      fileUrl: '/uploads/alu_assignment_phanindra.pdf',
      marks: 92,
      feedback: 'Excellent work on the Verilog simulation code.',
      status: 'GRADED',
    },
  });

  // Additional students
  const extraStudents = [
    { name: 'Ananya Sharma', reg: 'AP2026001235', email: 'ananya@university.edu' },
    { name: 'Rohan Verma', reg: 'AP2026001236', email: 'rohan@university.edu' },
    { name: 'Priya Nair', reg: 'AP2026001237', email: 'priya@university.edu' },
    { name: 'Arjun Patel', reg: 'AP2026001238', email: 'arjun@university.edu' },
    { name: 'Sneha Reddy', reg: 'AP2026001239', email: 'sneha@university.edu' },
    { name: 'Vikram Singh', reg: 'AP2026001240', email: 'vikram@university.edu' },
    { name: 'Meera Iyer', reg: 'AP2026001241', email: 'meera@university.edu' },
    { name: 'Karan Malhotra', reg: 'AP2026001242', email: 'karan@university.edu' },
    { name: 'Divya Krishnan', reg: 'AP2026001243', email: 'divya@university.edu' },
  ];

  for (const s of extraStudents) {
    const u = await prisma.user.create({
      data: {
        email: s.email,
        registerNo: s.reg,
        passwordHash: hashedStudentPassword,
        name: s.name,
        role: Role.STUDENT,
      },
    });
    const sp = await prisma.studentProfile.create({
      data: {
        userId: u.id,
        registerNo: s.reg,
        school: 'School of Engineering and Sciences',
        programId: progBTechECE.id,
        specialization: 'Electronics',
        semester: 'Semester IV',
        section: 'Sec-A',
        dob: '2004-01-01',
        gender: 'Other',
        phone: '+91 90000 00000',
        email: s.email,
        fatherName: 'Parent',
        motherName: 'Parent',
        academicYear: '2025-2026',
        admissionYear: '2023',
        bloodGroup: 'B+',
        address: 'University Hostel, Tech City',
        cgpa: 8.0 + Math.random(),
      },
    });
    // Register a few courses for each extra student
    for (const course of [c1, c2, c3]) {
      await prisma.courseRegistration.create({
        data: { studentId: sp.id, courseId: course.id, status: 'REGISTERED' },
      });
    }
  }

  // Extra faculty
  const extraFaculty = [
    { name: 'Dr. Meena Rao', reg: 'FAC2026002', email: 'meena@university.edu', desig: 'Associate Professor' },
    { name: 'Prof. Suresh Menon', reg: 'FAC2026003', email: 'suresh@university.edu', desig: 'Assistant Professor' },
    { name: 'Dr. Kavitha Das', reg: 'FAC2026004', email: 'kavitha@university.edu', desig: 'Professor' },
    { name: 'Dr. Nikhil Bose', reg: 'FAC2026005', email: 'nikhil@university.edu', desig: 'Assistant Professor' },
  ];
  for (const f of extraFaculty) {
    const u = await prisma.user.create({
      data: {
        email: f.email,
        registerNo: f.reg,
        passwordHash: hashedFacultyPassword,
        name: f.name,
        role: Role.FACULTY,
      },
    });
    await prisma.facultyProfile.create({
      data: {
        userId: u.id,
        employeeId: f.reg,
        departmentId: deptECE.id,
        designation: f.desig,
        phone: '+91 91111 11111',
        officeRoom: 'Block B',
      },
    });
  }

  // University admin
  await prisma.user.create({
    data: {
      email: 'uniadmin@university.edu',
      registerNo: 'ADM2026002',
      passwordHash: hashedAdminPassword,
      name: 'University Administrator',
      role: Role.UNIVERSITY_ADMIN,
    },
  });

  // Events
  await prisma.event.create({
    data: {
      name: 'INNOVATE 2026 Tech Hackathon',
      description: 'Annual technology hackathon and project expo for all engineering students.',
      date: '2026-08-25',
      time: '09:00 AM',
      venue: 'Main Auditorium',
      organizer: 'CSE Student Association',
      category: 'Technical Expo',
    },
  });
  await prisma.event.create({
    data: {
      name: 'Annual Sports Meet & Athletics',
      description: 'Inter-department sports competition including track, field, and team sports.',
      date: '2026-09-10',
      time: '08:00 AM',
      venue: 'University Sports Ground',
      organizer: 'Sports Council',
      category: 'Sports',
    },
  });
  await prisma.event.create({
    data: {
      name: 'IEEE Guest Lecture on VLSI Design',
      description: 'Industry expert session on modern VLSI design flows and tools.',
      date: '2026-08-18',
      time: '02:00 PM',
      venue: 'Seminar Hall 3',
      organizer: 'IEEE Student Branch',
      category: 'Academic',
    },
  });

  // Document request seed
  await prisma.documentRequest.create({
    data: {
      studentId: studentProfile.id,
      docType: 'Bonafide Certificate',
      reason: 'Bank education loan',
      status: 'APPROVED',
    },
  });

  // Announcements
  await prisma.announcement.create({
    data: {
      title: 'Mid-Semester Examination Schedule Published',
      description: 'The timetable for Mid-Semester 2026 is published on the portal. Download Hall Tickets before August 15.',
      category: 'Exam',
      priority: 'HIGH',
      date: '2026-08-01',
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Annual Tech Fest "INNOVATE 2026" Registration Open',
      description: 'Join the annual technology hackathon and project expo. Register online through the Events tab.',
      category: 'Events',
      priority: 'MEDIUM',
      date: '2026-08-04',
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Hostel Fee Payment Deadline Extended',
      description: 'Hostel fee deadline extended to August 30, 2026. Pay online via Finance module.',
      category: 'Finance',
      priority: 'HIGH',
      date: '2026-08-05',
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Examination Fee Due Warning',
      message: 'Pending fee balance for Examination & Hostel. Please settle before August 30.',
      type: 'WARNING',
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Hall Ticket Issued',
      message: 'Your Mid-Semester Hall Ticket HT2026-88912 is available for download.',
      type: 'SUCCESS',
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Assignment Deadline Approaching',
      message: 'Design of 4-bit ALU Circuit is due on 2026-08-18.',
      type: 'INFO',
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      role: 'SUPER_ADMIN',
      action: 'SYSTEM_SEED',
      details: 'System database initialized with seed records.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Database seeding finished successfully!');
  console.log('');
  console.log('Demo accounts (password in parentheses):');
  console.log('  Student:  AP2026001234 or student@university.edu  (Student@123)');
  console.log('  Faculty:  FAC2026001 or faculty@university.edu    (Faculty@123)');
  console.log('  Admin:    ADM2026001 or admin@university.edu      (Admin@123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
