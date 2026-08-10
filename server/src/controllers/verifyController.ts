import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function verifyDocument(req: Request, res: Response) {
  try {
    const { documentId } = req.params;

    // Check if hall ticket
    const examReg = await prisma.examRegistration.findFirst({
      where: { hallTicketNo: documentId },
      include: {
        exam: { include: { course: true } },
        student: { include: { user: true, program: true } },
      },
    });

    if (examReg) {
      return res.json({
        valid: true,
        documentType: 'Official Examination Hall Ticket',
        documentId: examReg.hallTicketNo,
        studentName: examReg.student.user.name,
        registerNo: examReg.student.registerNo,
        program: examReg.student.program?.name,
        details: `${examReg.exam.name} - ${examReg.exam.course.name} (${examReg.exam.date})`,
        status: 'VERIFIED & AUTHENTIC',
      });
    }

    // Check if payment transaction
    const payment = await prisma.paymentTransaction.findFirst({
      where: { transactionId: documentId },
      include: {
        feeRecord: true,
        student: { include: { user: true } },
      },
    });

    if (payment) {
      return res.json({
        valid: true,
        documentType: 'Official Fee Receipt',
        documentId: payment.transactionId,
        studentName: payment.student.user.name,
        registerNo: payment.student.registerNo,
        details: `${payment.feeRecord.category} - â‚¹${payment.amount.toLocaleString()}`,
        status: 'VERIFIED & PAID',
      });
    }

    return res.status(404).json({
      valid: false,
      message: 'Document Record Not Found or Unverified ID.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error performing document verification' });
  }
}
