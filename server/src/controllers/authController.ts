import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword, generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  try {
    const { registerNo, password, captcha, captchaExpected } = req.body;

    if (!registerNo || !password) {
      return res.status(400).json({ message: 'Register Number and Password are required.' });
    }

    if (captchaExpected && captcha?.toUpperCase() !== captchaExpected?.toUpperCase()) {
      return res.status(400).json({ message: 'Invalid CAPTCHA code. Please try again.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ registerNo: registerNo }, { email: registerNo }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Register Number or Password.' });
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid Register Number or Password.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      registerNo: user.registerNo,
      role: user.role,
      name: user.name,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        role: user.role,
        action: 'USER_LOGIN',
        details: `Successful login for user ${user.registerNo}`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        registerNo: user.registerNo,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        studentProfile: {
          include: { program: true },
        },
        facultyProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User record not found' });
    }

    const { passwordHash: _ph, ...safeUser } = user;
    return res.json({
      user: {
        id: safeUser.id,
        email: safeUser.email,
        registerNo: safeUser.registerNo,
        name: safeUser.name,
        role: safeUser.role,
        studentProfile: safeUser.studentProfile,
        facultyProfile: safeUser.facultyProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user data' });
  }
}
