import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getResults(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        examResults: {
          include: { exam: { include: { course: true } } },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const results = student.examResults.map((r) => ({
      id: r.id,
      courseCode: r.exam.course.code,
      courseName: r.exam.course.name,
      credits: r.exam.course.credits,
      marksObtained: r.marksObtained,
      grade: r.grade,
      gradePoints: r.gradePoints,
      result: r.result,
      semester: r.semester,
    }));

    // Calculate SGPA
    const totalCredits = results.reduce((acc, r) => acc + r.credits, 0);
    const weightedPoints = results.reduce((acc, r) => acc + r.gradePoints * r.credits, 0);
    const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

    return res.json({
      cgpa: student.cgpa,
      sgpa: parseFloat(sgpa),
      totalCredits,
      results,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching results' });
  }
}
