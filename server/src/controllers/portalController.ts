import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateBonafidePDF, generateResultPDF } from '../utils/pdf';

export async function getTimetable(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    let courseIds: string[] = [];

    if (req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findFirst({
        where: { userId: req.user.userId },
        include: { registrations: true },
      });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });
      courseIds = student.registrations.map((r) => r.courseId);
    } else if (req.user.role === 'FACULTY') {
      const faculty = await prisma.facultyProfile.findFirst({
        where: { userId: req.user.userId },
        include: { courses: true },
      });
      if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });
      courseIds = faculty.courses.map((c) => c.id);
    } else {
      const slots = await prisma.timeTableSlot.findMany({
        include: {
          course: { include: { faculty: { include: { user: true } } } },
        },
        orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
      });
      return res.json({ slots });
    }

    const slots = await prisma.timeTableSlot.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { include: { faculty: { include: { user: true } } } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });

    return res.json({ slots });
  } catch (error) {
    console.error('Timetable error:', error);
    return res.status(500).json({ message: 'Error fetching timetable' });
  }
}

export async function getAnnouncements(_req: AuthenticatedRequest, res: Response) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ announcements });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching announcements' });
  }
}

export async function getEvents(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const events = await prisma.event.findMany({
      include: { registrations: true },
      orderBy: { date: 'asc' },
    });

    let registeredEventIds: string[] = [];
    if (req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findFirst({
        where: { userId: req.user.userId },
        include: { eventRegs: true },
      });
      if (student) {
        registeredEventIds = student.eventRegs.map((r) => r.eventId);
      }
    }

    return res.json({ events, registeredEventIds });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching events' });
  }
}

export async function registerEvent(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { eventId } = req.body;

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId, studentId: student.id },
    });
    if (existing) {
      return res.status(400).json({ message: 'Already registered for this event.' });
    }

    await prisma.eventRegistration.create({
      data: { eventId, studentId: student.id },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        title: 'Event Registration Confirmed',
        message: `You are registered for "${event.name}" on ${event.date}.`,
        type: 'SUCCESS',
      },
    });

    return res.json({ message: `Successfully registered for ${event.name}` });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register for event' });
  }
}

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({ notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching notifications' });
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId: req.user.userId, isRead: false },
        data: { isRead: true },
      });
      return res.json({ message: 'All notifications marked as read' });
    }

    await prisma.notification.updateMany({
      where: { id, userId: req.user.userId },
      data: { isRead: true },
    });

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update notification' });
  }
}

export async function submitFeedback(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { category, rating, comments, isAnonymous } = req.body;

    if (!category || !comments || !rating) {
      return res.status(400).json({ message: 'Category, rating, and comments are required.' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.userId,
        category,
        rating: Number(rating),
        comments,
        isAnonymous: Boolean(isAnonymous),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        role: req.user.role,
        action: 'FEEDBACK_SUBMITTED',
        details: `Feedback submitted in category: ${category}`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    return res.json({ message: 'Feedback submitted successfully!', feedback });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
}

export async function getDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        documentRequests: { orderBy: { requestedAt: 'desc' } },
        examRegistrations: { include: { exam: true } },
        payments: { orderBy: { paidAt: 'desc' }, take: 5 },
      },
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // Build virtual issued docs from existing records + document requests
    const issued: Array<{
      id: string;
      name: string;
      type: string;
      status: string;
      source: string;
    }> = [];

    for (const er of student.examRegistrations) {
      issued.push({
        id: er.hallTicketNo,
        name: `${er.exam.name} Hall Ticket`,
        type: 'Examination Pass',
        status: 'ISSUED & APPROVED',
        source: 'hall_ticket',
      });
    }

    for (const p of student.payments.filter((x) => x.status === 'SUCCESS')) {
      issued.push({
        id: p.transactionId,
        name: 'Fee Payment Receipt',
        type: 'Financial Receipt',
        status: 'VERIFIED & PAID',
        source: 'receipt',
      });
    }

    for (const d of student.documentRequests.filter((x) => x.status === 'APPROVED')) {
      issued.push({
        id: d.id,
        name: d.docType,
        type: 'Official Certificate',
        status: 'ISSUED & APPROVED',
        source: 'document',
      });
    }

    return res.json({
      documents: issued,
      requests: student.documentRequests,
    });
  } catch (error) {
    console.error('Documents error:', error);
    return res.status(500).json({ message: 'Error fetching documents' });
  }
}

export async function requestDocument(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { docType, reason } = req.body;

    if (!docType) return res.status(400).json({ message: 'Document type is required.' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const doc = await prisma.documentRequest.create({
      data: {
        studentId: student.id,
        docType,
        reason: reason || 'Student request via portal',
        status: 'APPROVED', // auto-approve for demo
        documentUrl: `/api/documents/${docType}/download`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        title: 'Document Request Approved',
        message: `Your request for ${docType} has been approved and is ready for download.`,
        type: 'SUCCESS',
      },
    });

    return res.json({ message: `Request for ${docType} submitted and approved.`, document: doc });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to request document' });
  }
}

export async function downloadDocument(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { type } = req.params;

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        user: true,
        program: true,
        examResults: { include: { exam: { include: { course: true } } } },
      },
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    let pdfBuffer: Buffer;
    let filename: string;

    if (type === 'bonafide' || type === 'Bonafide Certificate') {
      pdfBuffer = await generateBonafidePDF(student);
      filename = `Bonafide_${student.registerNo}.pdf`;
    } else if (type === 'result' || type === 'Semester Result') {
      pdfBuffer = await generateResultPDF(student);
      filename = `Result_${student.registerNo}.pdf`;
    } else {
      pdfBuffer = await generateBonafidePDF(student, type);
      filename = `${type.replace(/\s+/g, '_')}_${student.registerNo}.pdf`;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Download document error:', error);
    return res.status(500).json({ message: 'Failed to generate document PDF' });
  }
}

export async function globalSearch(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ courses: [], announcements: [], events: [], students: [] });
    }

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { code: { contains: q } },
          { name: { contains: q } },
        ],
      },
      take: 10,
      include: { faculty: { include: { user: true } } },
    });

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 10,
    });

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 10,
    });

    let students: unknown[] = [];
    if (['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'FACULTY'].includes(req.user.role)) {
      students = await prisma.studentProfile.findMany({
        where: {
          OR: [
            { registerNo: { contains: q } },
            { user: { name: { contains: q } } },
          ],
        },
        take: 10,
        include: { user: true, program: true },
      });
    }

    return res.json({ courses, announcements, events, students });
  } catch (error) {
    return res.status(500).json({ message: 'Search failed' });
  }
}

export async function getFacultyDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const faculty = await prisma.facultyProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        user: true,
        department: true,
        courses: {
          include: {
            registrations: {
              include: { student: { include: { user: true } } },
            },
            assignments: true,
          },
        },
        assignments: {
          include: {
            course: true,
            submissions: { include: { student: { include: { user: true } } } },
          },
        },
      },
    });

    if (!faculty) {
      // Allow admins to view all courses for demo
      if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'UNIVERSITY_ADMIN') {
        const courses = await prisma.course.findMany({
          include: {
            registrations: {
              include: { student: { include: { user: true } } },
            },
            faculty: { include: { user: true } },
          },
        });
        return res.json({
          faculty: { user: { name: req.user.name }, designation: 'Administrator', courses },
          courses,
          assignments: [],
        });
      }
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    return res.json({
      faculty: {
        id: faculty.id,
        name: faculty.user.name,
        employeeId: faculty.employeeId,
        designation: faculty.designation,
        department: faculty.department?.name,
        phone: faculty.phone,
        officeRoom: faculty.officeRoom,
      },
      courses: faculty.courses,
      assignments: faculty.assignments,
    });
  } catch (error) {
    console.error('Faculty dashboard error:', error);
    return res.status(500).json({ message: 'Error loading faculty dashboard' });
  }
}

export async function getCourseStudents(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.params;

    const registrations = await prisma.courseRegistration.findMany({
      where: { courseId, status: 'REGISTERED' },
      include: {
        student: { include: { user: true } },
      },
    });

    const students = registrations.map((r) => ({
      id: r.student.id,
      name: r.student.user.name,
      registerNo: r.student.registerNo,
      section: r.student.section,
    }));

    return res.json({ students });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching course students' });
  }
}

export async function createAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'FACULTY' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ message: 'Only faculty can create assignments' });
    }

    const { title, description, courseId, dueDate, maxMarks } = req.body;
    if (!title || !courseId || !dueDate) {
      return res.status(400).json({ message: 'Title, course, and due date are required.' });
    }

    const faculty = await prisma.facultyProfile.findFirst({
      where: { userId: req.user.userId },
    });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const facultyId = faculty?.id || course.facultyId;
    if (!facultyId) return res.status(400).json({ message: 'No faculty linked to course' });

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || '',
        courseId,
        facultyId,
        dueDate,
        maxMarks: maxMarks || 100,
      },
    });

    return res.json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create assignment' });
  }
}

export async function gradeSubmission(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'FACULTY' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ message: 'Only faculty can grade submissions' });
    }

    const { submissionId, marks, feedback } = req.body;
    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks: Number(marks),
        feedback: feedback || '',
        status: 'GRADED',
      },
    });

    return res.json({ message: 'Submission graded', submission });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to grade submission' });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          role: req.user.role,
          action: 'USER_LOGOUT',
          details: `Logout for user ${req.user.registerNo}`,
          ipAddress: req.ip || '127.0.0.1',
        },
      });
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.json({ message: 'Logged out successfully' });
  }
}
