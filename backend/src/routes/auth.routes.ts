import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../services/audit.service';

const router = Router();

// Standard Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    await logAudit(user.id, 'LOGIN', 'User', user.id, { email: user.email }, req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo Instant Role Switcher (for faculty and exhibition evaluators)
router.post('/demo-switch', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role required for demo switch' });
    }

    const user = await prisma.user.findFirst({
      where: { role: role as any, isActive: true },
    });

    if (!user) {
      return res.status(404).json({ error: `No active user found with role ${role}` });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    await logAudit(user.id, 'DEMO_ROLE_SWITCH', 'User', user.id, { role }, req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        badgeNumber: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List Available Demo Accounts
router.get('/demo-accounts', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        badgeNumber: true,
      },
      orderBy: { role: 'asc' },
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
