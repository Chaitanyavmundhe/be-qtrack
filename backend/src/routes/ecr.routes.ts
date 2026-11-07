import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAudit } from '../services/audit.service';

const router = Router();

// List all ECR/ECNs
router.get('/', authenticateToken, async (_req, res) => {
  try {
    const changes = await prisma.engineeringChange.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(changes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create ECR
router.post(
  '/',
  authenticateToken,
  requireRoles(['ADMIN', 'ENGINEERING', 'QUALITY_MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, description, reason, impactAssessment, affectedPanels, type } = req.body;

      const year = new Date().getFullYear();
      const count = await prisma.engineeringChange.count();
      const ecrNumber = `ECR-${year}-${String(count + 1).padStart(3, '0')}`;

      const change = await prisma.engineeringChange.create({
        data: {
          ecrNumber,
          type: type || 'ECR',
          title,
          description,
          reason,
          impactAssessment,
          affectedPanels: affectedPanels || [],
          status: 'Submitted',
          requestedBy: req.user!.name,
        },
      });

      await logAudit(req.user!.id, 'CREATE_ECR', 'EngineeringChange', change.id, { ecrNumber, title }, req.ip);

      res.status(201).json(change);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Approve ECR -> Convert to ECN
router.patch(
  '/:id/approve',
  authenticateToken,
  requireRoles(['ADMIN', 'ENGINEERING', 'QUALITY_MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { newBomRevision, effectiveDate } = req.body;

      const updated = await prisma.engineeringChange.update({
        where: { id },
        data: {
          status: 'Approved',
          type: 'ECN', // Upgraded to ECN upon formal release
          approvedBy: req.user!.name,
          approvedAt: new Date(),
          effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
          newBomRevision: newBomRevision || 'Rev 2.0',
        },
      });

      await logAudit(req.user!.id, 'APPROVE_ECR', 'EngineeringChange', id, { newBomRevision }, req.ip);

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
