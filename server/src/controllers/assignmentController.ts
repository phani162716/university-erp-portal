import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getAssignments(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    let assignments: any[] = [];

    if (req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findFirst({
        where: { userId: req.user.userId },
        include: { registrations: true, submissions: true },
      });

      if (student) {
        const courseIds = student.registrations.map((r) => r.courseId);
        const list = await prisma.assignment.findMany({
          where: { courseId: { in: courseIds } },
          include: {
            course: true,
            faculty: { include: { user: true } },
          },
          orderBy: { dueDate: 'asc' },
        });

        assignments = list.map((a) => {
          const sub = student.submissions.find((s) => s.assignmentId === a.id);
          return {
            ...a,
            submission: sub || null,
          };
        });
      }
    } else {
      assignments = await prisma.assignment.findMany({
        include: {
          course: true,
          faculty: { include: { user: true } },
          submissions: { include: { student: { include: { user: true } } } },
        },
      });
    }

    return res.json({ assignments });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching assignments' });
  }
}

export async function submitAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { assignmentId, fileUrl } = req.body;

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: student.id,
        fileUrl: fileUrl || '/uploads/submission.pdf',
        status: 'SUBMITTED',
      },
    });

    return res.json({ message: 'Assignment submitted successfully!', submission });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit assignment' });
  }
}
