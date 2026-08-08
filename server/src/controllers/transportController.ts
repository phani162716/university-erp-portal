import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getTransportInfo(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.userId },
      include: {
        transportAlloc: {
          include: {
            route: { include: { buses: true } },
          },
        },
      },
    });

    const routes = await prisma.transportRoute.findMany({
      include: { buses: true },
    });

    return res.json({
      allocation: student?.transportAlloc || null,
      routes,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching transport details' });
  }
}
