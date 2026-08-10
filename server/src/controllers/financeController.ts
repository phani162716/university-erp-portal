import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateFeeReceiptPDF } from '../utils/pdf';

export async function getFees(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        feeRecords: {
          include: { payments: true },
        },
        payments: {
          include: { feeRecord: true },
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const totalFee = student.feeRecords.reduce((acc, f) => acc + f.totalAmount, 0);
    const paidAmount = student.feeRecords.reduce((acc, f) => acc + f.paidAmount, 0);
    const pendingAmount = totalFee - paidAmount;

    return res.json({
      summary: {
        totalFee,
        paidAmount,
        pendingAmount,
      },
      feeRecords: student.feeRecords,
      transactions: student.payments,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching fee records' });
  }
}

export async function processMockPayment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { feeRecordId, amount, paymentMethod } = req.body;

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
    });

    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const feeRecord = await prisma.feeRecord.findUnique({ where: { id: feeRecordId } });
    if (!feeRecord) return res.status(404).json({ message: 'Fee record not found' });

    const transactionId = `TXN${Date.now()}`;

    const newPaidAmount = feeRecord.paidAmount + Number(amount);
    const status = newPaidAmount >= feeRecord.totalAmount ? 'PAID' : 'PARTIAL';

    await prisma.feeRecord.update({
      where: { id: feeRecordId },
      data: {
        paidAmount: newPaidAmount,
        status,
      },
    });

    const payment = await prisma.paymentTransaction.create({
      data: {
        feeRecordId,
        studentId: student.id,
        transactionId,
        amount: Number(amount),
        paymentMethod: paymentMethod || 'Online Gateway',
        status: 'SUCCESS',
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        title: 'Fee Payment Successful',
        message: `Payment of â‚¹${amount} for ${feeRecord.category} confirmed. Txn ID: ${transactionId}`,
        type: 'SUCCESS',
      },
    });

    return res.json({
      message: 'Payment processed successfully!',
      transaction: payment,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ message: 'Payment processing failed' });
  }
}

export async function downloadReceipt(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { transactionId } = req.params;

    const payment = await prisma.paymentTransaction.findFirst({
      where: { transactionId },
      include: {
        feeRecord: true,
        student: { include: { user: true } },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment transaction record not found' });
    }

    const pdfBuffer = await generateFeeReceiptPDF(payment.student, payment.feeRecord, payment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt_${transactionId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating receipt' });
  }
}
