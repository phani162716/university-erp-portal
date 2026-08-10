import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getStudentDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Lean profile first (no heavy nested includes)
    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      select: {
        id: true,
        registerNo: true,
        semester: true,
        section: true,
        academicYear: true,
        cgpa: true,
        user: { select: { name: true } },
        program: { select: { name: true } },
        registrations: {
          where: { status: 'REGISTERED' },
          select: {
            courseId: true,
            course: { select: { id: true, code: true, name: true, credits: true } },
          },
        },
        feeRecords: { select: { totalAmount: true, paidAmount: true } },
        examRegistrations: {
          select: {
            exam: {
              select: {
                name: true,
                date: true,
                time: true,
                venue: true,
                course: { select: { name: true, code: true } },
              },
            },
          },
          take: 5,
        },
        submissions: { select: { assignmentId: true, status: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const courseIds = student.registrations.map((r) => r.courseId);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Parallel lightweight queries
    const [attendanceRows, todaysClasses, assignments, announcements] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
        select: { courseId: true, status: true, course: { select: { code: true, name: true } } },
      }),
      courseIds.length
        ? prisma.timeTableSlot.findMany({
            where: { courseId: { in: courseIds }, day: today },
            select: {
              startTime: true,
              endTime: true,
              room: true,
              course: {
                select: {
                  code: true,
                  name: true,
                  faculty: { select: { user: { select: { name: true } } } },
                },
              },
            },
            orderBy: { startTime: 'asc' },
          })
        : Promise.resolve([]),
      courseIds.length
        ? prisma.assignment.findMany({
            where: { courseId: { in: courseIds } },
            select: {
              id: true,
              title: true,
              dueDate: true,
              course: { select: { code: true } },
            },
            orderBy: { dueDate: 'asc' },
            take: 10,
          })
        : Promise.resolve([]),
      prisma.announcement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          date: true,
        },
      }),
    ]);

    const totalAttendanceCount = attendanceRows.length;
    const presentCount = attendanceRows.filter((a) => a.status === 'PRESENT').length;
    const overallAttendance =
      totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 100;

    const registeredCredits = student.registrations.reduce(
      (acc, r) => acc + (r.course?.credits || 0),
      0
    );

    const pendingFeesAmount = student.feeRecords.reduce(
      (acc, f) => acc + (f.totalAmount - f.paidAmount),
      0
    );

    const subjectAttendanceMap: {
      [key: string]: { name: string; code: string; present: number; total: number };
    } = {};
    for (const record of attendanceRows) {
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
      if (record.status === 'PRESENT') subjectAttendanceMap[cId].present += 1;
    }

    const subjectBreakdown = Object.values(subjectAttendanceMap).map((item) => ({
      code: item.code,
      name: item.name,
      percentage: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0,
      present: item.present,
      total: item.total,
    }));

    const upcomingExams = student.examRegistrations.map((er) => ({
      examName: er.exam.name,
      subject: er.exam.course.name,
      code: er.exam.course.code,
      date: er.exam.date,
      time: er.exam.time,
      venue: er.exam.venue,
    }));

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
        completedCredits: 64,
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
        user: { select: { id: true, email: true, registerNo: true, name: true, role: true } },
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
