import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        attendanceRecords: {
          include: { course: true },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const totalCount = student.attendanceRecords.length;
    const presentCount = student.attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const overallPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

    const courseMap: { [key: string]: { id: string; code: string; name: string; present: number; total: number; records: any[] } } = {};

    for (const r of student.attendanceRecords) {
      if (!courseMap[r.courseId]) {
        courseMap[r.courseId] = {
          id: r.course.id,
          code: r.course.code,
          name: r.course.name,
          present: 0,
          total: 0,
          records: [],
        };
      }
      courseMap[r.courseId].total += 1;
      if (r.status === 'PRESENT') courseMap[r.courseId].present += 1;
      courseMap[r.courseId].records.push({
        date: r.date,
        status: r.status,
      });
    }

    const subjectBreakdown = Object.values(courseMap).map((item) => {
      const percentage = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
      return {
        id: item.id,
        code: item.code,
        name: item.name,
        present: item.present,
        total: item.total,
        percentage,
        isWarning: percentage < 75,
        records: item.records,
      };
    });

    return res.json({
      overallPercentage,
      subjectBreakdown,
      isWarning: overallPercentage < 75,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching attendance' });
  }
}

export async function markAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'FACULTY' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ message: 'Only faculty or admins can mark attendance' });
    }

    const { courseId, date, records } = req.body; // records: [{ studentId, status: 'PRESENT' | 'ABSENT' }]

    for (const item of records) {
      // Upsert record
      const existing = await prisma.attendanceRecord.findFirst({
        where: {
          studentId: item.studentId,
          courseId,
          date,
        },
      });

      if (existing) {
        await prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: { status: item.status },
        });
      } else {
        await prisma.attendanceRecord.create({
          data: {
            studentId: item.studentId,
            courseId,
            date,
            status: item.status,
          },
        });
      }
    }

    return res.json({ message: 'Attendance updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark attendance' });
  }
}
