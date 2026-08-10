import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAdminStats(req: AuthenticatedRequest, res: Response) {
  try {
    const totalStudents = await prisma.studentProfile.count();
    const totalFaculty = await prisma.facultyProfile.count();
    const activeCourses = await prisma.course.count();
    const totalUsers = await prisma.user.count();

    const pendingFeesRecords = await prisma.feeRecord.findMany({
      where: { status: { in: ['PENDING', 'PARTIAL'] } },
    });
    const pendingFeesTotal = pendingFeesRecords.reduce((acc, f) => acc + (f.totalAmount - f.paidAmount), 0);

    const auditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    const studentsList = await prisma.studentProfile.findMany({
      take: 10,
      include: { user: true, program: true },
    });

    const coursesList = await prisma.course.findMany({
      take: 10,
      include: { faculty: { include: { user: true } } },
    });

    return res.json({
      stats: {
        totalStudents,
        totalFaculty,
        activeCourses,
        totalUsers,
        pendingFeesTotal,
      },
      auditLogs,
      students: studentsList,
      courses: coursesList,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching admin dashboard metrics' });
  }
}
