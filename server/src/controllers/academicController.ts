import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getCourses(req: AuthenticatedRequest, res: Response) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        faculty: { include: { user: true } },
        program: true,
      },
    });

    let registeredCourseIds: string[] = [];
    if (req.user) {
      const student = await prisma.studentProfile.findFirst({
        where: { userId: req.user.userId },
        include: { registrations: true },
      });
      if (student) {
        registeredCourseIds = student.registrations.map((r) => r.courseId);
      }
    }

    return res.json({ courses, registeredCourseIds });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching courses' });
  }
}

export async function registerCourse(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.body;

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: { registrations: { include: { course: true } } },
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // Check if already registered
    const existing = student.registrations.find((r) => r.courseId === courseId);
    if (existing) {
      return res.status(400).json({ message: 'Already registered for this course.' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.seatsTaken >= course.seatsTotal) {
      return res.status(400).json({ message: 'Course seats are full.' });
    }

    // Check credit limit
    const currentCredits = student.registrations.reduce((acc, r) => acc + r.course.credits, 0);
    if (currentCredits + course.credits > 26) {
      return res.status(400).json({ message: 'Cannot exceed maximum credit limit of 26.' });
    }

    await prisma.courseRegistration.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        status: 'REGISTERED',
      },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { seatsTaken: course.seatsTaken + 1 },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        title: 'Course Registration Successful',
        message: `Registered for ${course.code} - ${course.name} (${course.credits} Credits).`,
        type: 'SUCCESS',
      },
    });

    return res.json({ message: 'Course registered successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register course' });
  }
}

export async function dropCourse(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { courseId } = req.body;

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const registration = await prisma.courseRegistration.findFirst({
      where: { studentId: student.id, courseId: courseId },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration record not found.' });
    }

    await prisma.courseRegistration.delete({ where: { id: registration.id } });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course && course.seatsTaken > 0) {
      await prisma.course.update({
        where: { id: courseId },
        data: { seatsTaken: course.seatsTaken - 1 },
      });
    }

    return res.json({ message: 'Course dropped successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to drop course' });
  }
}
