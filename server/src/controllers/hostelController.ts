import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getHostelInfo(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        hostelAllocation: {
          include: {
            room: { include: { block: true } },
          },
        },
      },
    });

    const blocks = await prisma.hostelBlock.findMany({
      include: { rooms: true },
    });

    return res.json({
      allocation: student?.hostelAllocation || null,
      blocks,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching hostel details' });
  }
}
