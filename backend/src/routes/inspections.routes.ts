import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAudit } from '../services/audit.service';

const router = Router();

// List Inspection Templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    const where: any = { isActive: true };
    if (type) where.type = String(type);

    const templates = await prisma.inspectionTemplate.findMany({
      where,
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single Inspection Template
router.get('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const template = await prisma.inspectionTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Inspection Template
router.post(
  '/templates',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, type, productCode, items } = req.body;

      const template = await prisma.inspectionTemplate.create({
        data: {
          name,
          type: type || 'InProcess',
          productCode: productCode || '12KV',
          items: {
            create: (items || []).map((item: any, idx: number) => ({
              category: item.category || 'Visual',
              itemNo: idx + 1,
              checkItem: item.checkItem,
              acceptance: item.acceptance,
              unit: item.unit,
              isMandatory: item.isMandatory ?? true,
              sortOrder: idx + 1,
            })),
          },
        },
        include: { items: true },
      });

      await logAudit(req.user!.id, 'CREATE_INSPECTION_TEMPLATE', 'InspectionTemplate', template.id, { name, type }, req.ip);

      res.status(201).json(template);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// In-Process Inspection Runs
router.get('/in-process', authenticateToken, async (req, res) => {
  try {
    const runs = await prisma.inspectionRun.findMany({
      where: {
        template: { type: 'InProcess' },
      },
      include: {
        panel: {
          select: { id: true, serialNumber: true, status: true },
        },
        inspector: { select: { id: true, name: true } },
        results: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(runs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
