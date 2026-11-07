import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAudit } from '../services/audit.service';

const router = Router();

// Get Operation Logs for a Panel
router.get('/panel/:panelId', authenticateToken, async (req, res) => {
  try {
    const { panelId } = req.params;
    const logs = await prisma.operationLog.findMany({
      where: { panelId },
      include: {
        operator: { select: { id: true, name: true, department: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record New Manufacturing Operation Log
router.post(
  '/',
  authenticateToken,
  requireRoles(['ADMIN', 'PRODUCTION']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { panelId, operation, stage, description, status, remarks } = req.body;

      if (!panelId || !operation || !stage) {
        return res.status(400).json({ error: 'panelId, operation, and stage are required' });
      }

      const log = await prisma.operationLog.create({
        data: {
          panelId,
          operation,
          stage,
          description,
          status: status || 'Completed',
          operatorId: req.user!.id,
          startTime: new Date(),
          endTime: status === 'Completed' ? new Date() : null,
          remarks,
        },
      });

      await logAudit(req.user!.id, 'LOG_OPERATION', 'OperationLog', log.id, { panelId, operation, stage }, req.ip);

      res.status(201).json(log);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
