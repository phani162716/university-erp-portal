import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getStudentDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        user: true,
        program: true,
        registrations: {
          include: { course: true },
        },
        attendanceRecords: {
          include: { course: true },
        },
        feeRecords: true,
        examRegistrations: {
          include: { exam: { include: { course: true } } },
        },
        submissions: {
          include: { assignment: true },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Attendance calculation
    const totalAttendanceCount = student.attendanceRecords.length;
    const presentCount = student.attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const overallAttendance = totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 100;

    // Credits calculation
    const registeredCredits = student.registrations.reduce((acc, r) => acc + (r.course?.credits || 0), 0);

    // Pending fees calculation
    const pendingFeesAmount = student.feeRecords.reduce(
      (acc, f) => acc + (f.totalAmount - f.paidAmount),
      0
    );

    // Subject breakdown
    const subjectAttendanceMap: { [key: string]: { name: string; code: string; present: number; total: number } } = {};
    for (const record of student.attendanceRecords) {
      const cId = record.courseId;
      if (!subjectAttendanceMap[cId]) {
        subjectAttendanceMap[cId] = {
          name: record.course.name,
          code: record.course.code,
          present: 0,
          total: 0,
        };
      }
      subjectAttendanceMap[cId].total += 1;
      if (record.status === 'PRESENT') {
        subjectAttendanceMap[cId].present += 1;
      }
    }

    const subjectBreakdown = Object.values(subjectAttendanceMap).map((item) => ({
      code: item.code,
      name: item.name,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
      present: item.present,
      total: item.total,
    }));

    // Today's classes
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const courseIds = student.registrations.map((r) => r.courseId);
    const todaysClasses = await prisma.timeTableSlot.findMany({
      where: {
        courseId: { in: courseIds },
        day: today,
      },
      include: {
        course: {
          include: {
            faculty: { include: { user: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Upcoming Exams
    const upcomingExams = student.examRegistrations.map((er) => ({
      examName: er.exam.name,
      subject: er.exam.course.name,
      code: er.exam.course.code,
      date: er.exam.date,
      time: er.exam.time,
      venue: er.exam.venue,
    }));

    // Pending Assignments
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: true },
    });

    const pendingAssignments = assignments.map((a) => {
      const sub = student.submissions.find((s) => s.assignmentId === a.id);
      return {
        id: a.id,
        title: a.title,
        courseCode: a.course.code,
        dueDate: a.dueDate,
        status: sub ? sub.status : 'PENDING',
      };
    });

    // Announcements
    const announcements = await prisma.announcement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      student: {
        id: student.id,
        name: student.user.name,
        registerNo: student.registerNo,
        program: student.program?.name,
        semester: student.semester,
        section: student.section,
        academicYear: student.academicYear,
        cgpa: student.cgpa,
      },
      metrics: {
        overallAttendance,
        registeredCredits,
        completedCredits: 64, // example completed credit total
        pendingFeesAmount,
      },
      subjectBreakdown,
      todaysClasses,
      upcomingExams,
      pendingAssignments,
      announcements,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return res.status(500).json({ message: 'Error loading student dashboard' });
  }
}

export async function getStudentProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        user: true,
        program: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    return res.json({ student });
  } catch (error) {
    return res.status(500).json({ message: 'Error loading student profile' });
  }
}

export async function updateStudentProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { phone, email, address } = req.body;

    const updated = await prisma.studentProfile.update({
      where: { userId: req.user.userId },
      data: { phone, email, address },
    });

    return res.json({ message: 'Profile updated successfully', student: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}
