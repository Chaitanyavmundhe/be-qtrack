import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAudit } from '../services/audit.service';

const router = Router();

// List Suppliers
router.get('/', authenticateToken, async (_req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        incomingInspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List Incoming Material Inspections
router.get('/incoming-inspections', authenticateToken, async (_req, res) => {
  try {
    const inspections = await prisma.incomingInspection.findMany({
      include: { supplier: true },
      orderBy: { inspectionDate: 'desc' },
    });
    res.json(inspections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record Incoming Inspection
router.post(
  '/incoming-inspections',
  authenticateToken,
  requireRoles(['ADMIN', 'PROCUREMENT', 'QUALITY_INSPECTOR']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { supplierId, materialName, quantity, unit, batchNumber, result, remarks } = req.body;

      const year = new Date().getFullYear();
      const count = await prisma.incomingInspection.count();
      const grNumber = `GRN-${year}-${String(count + 1).padStart(4, '0')}`;

      const item = await prisma.incomingInspection.create({
        data: {
          grNumber,
          supplierId,
          materialName,
          quantity: parseFloat(quantity) || 1,
          unit: unit || 'Nos',
          batchNumber,
          result: result || 'Accepted',
          remarks,
          inspectedBy: req.user!.name,
        },
      });

      await logAudit(req.user!.id, 'RECORD_INCOMING_INSPECTION', 'IncomingInspection', item.id, { grNumber, result }, req.ip);

      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
