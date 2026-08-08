import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateHallTicketPDF } from '../utils/pdf';

const prisma = new PrismaClient();

export async function getExams(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        examRegistrations: {
          include: { exam: { include: { course: true } } },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const exams = student.examRegistrations.map((er) => ({
      registrationId: er.id,
      hallTicketNo: er.hallTicketNo,
      status: er.status,
      examId: er.exam.id,
      name: er.exam.name,
      code: er.exam.code,
      type: er.exam.type,
      subject: er.exam.course.name,
      courseCode: er.exam.course.code,
      date: er.exam.date,
      time: er.exam.time,
      venue: er.exam.venue,
    }));

    return res.json({ exams });
  } catch (error) {
    return res.status(500).json({ message: 'Error loading examination details' });
  }
}

export async function downloadHallTicket(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { registrationId } = req.params;

    const registration = await prisma.examRegistration.findUnique({
      where: { id: registrationId },
      include: {
        exam: { include: { course: true } },
        student: { include: { user: true, program: true } },
      },
    });

    if (!registration) {
      return res.status(404).json({ message: 'Hall ticket record not found' });
    }

    const pdfBuffer = await generateHallTicketPDF(registration.student, registration.exam, registration.hallTicketNo);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=HallTicket_${registration.hallTicketNo}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Hall ticket error:', error);
    return res.status(500).json({ message: 'Failed to generate Hall Ticket PDF' });
  }
}
