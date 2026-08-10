import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { comparePassword, generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/auth';

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

    // Fire-and-forget audit (don't block login response)
    prisma.auditLog
      .create({
        data: {
          userId: user.id,
          role: user.role,
          action: 'USER_LOGIN',
          details: `Successful login for user ${user.registerNo}`,
          ipAddress: req.ip || '127.0.0.1',
        },
      })
      .catch(() => undefined);

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

    // Lean /me — only fields needed for shell auth (faster cold starts)
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        registerNo: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User record not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user data' });
  }
}
