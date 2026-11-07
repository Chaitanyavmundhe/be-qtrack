import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAudit } from '../services/audit.service';

const router = Router();

// Get Approved BOM for a Work Order
router.get('/work-order/:workOrderId', authenticateToken, async (req, res) => {
  try {
    const { workOrderId } = req.params;

    const bomRevision = await prisma.bomRevision.findFirst({
      where: {
        workOrderId,
        status: 'Approved',
      },
      include: {
        items: {
          orderBy: { itemNo: 'asc' },
        },
      },
    });

    if (!bomRevision) {
      // Fallback to latest draft or submitted revision
      const latest = await prisma.bomRevision.findFirst({
        where: { workOrderId },
        include: { items: { orderBy: { itemNo: 'asc' } } },
        orderBy: { revision: 'desc' },
      });
      return res.json(latest || null);
    }

    res.json(bomRevision);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Revisions for a Work Order (revision history)
router.get('/revisions/:workOrderId', authenticateToken, async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const revisions = await prisma.bomRevision.findMany({
      where: { workOrderId },
      include: {
        items: true,
      },
      orderBy: { revision: 'desc' },
    });
    res.json(revisions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Panel BOM Verification Overview & Discrepancy Report
router.get('/panel/:panelId/summary', authenticateToken, async (req, res) => {
  try {
    const { panelId } = req.params;

    const panel = await prisma.panel.findUnique({
      where: { id: panelId },
      include: {
        workOrder: {
          include: {
            bomRevisions: {
              where: { status: 'Approved' },
              include: { items: { orderBy: { itemNo: 'asc' } } },
              take: 1,
            },
          },
        },
        bomVerifications: {
          include: { verifiedBy: true },
        },
      },
    });

    if (!panel) return res.status(404).json({ error: 'Panel not found' });

    const activeBom = panel.workOrder.bomRevisions[0];
    if (!activeBom) {
      return res.json({
        hasApprovedBom: false,
        message: 'No approved BOM revision found for this panel work order',
        items: [],
      });
    }

    // Merge BOM items with verification records
    const verificationMap = new Map();
    panel.bomVerifications.forEach((v) => verificationMap.set(v.bomItemId, v));

    const comparisonList = activeBom.items.map((item) => {
      const verification = verificationMap.get(item.id);
      let status = 'Pending';
      if (verification) {
        status = verification.status;
      }

      return {
        bomItemId: item.id,
        itemNo: item.itemNo,
        componentCode: item.componentCode,
        componentName: item.componentName,
        category: item.category,
        requiredManufacturer: item.manufacturer,
        requiredModel: item.modelNumber,
        requiredQty: item.requiredQty,
        unit: item.unit,
        technicalSpec: item.technicalSpec,
        installLocation: item.installLocation,

        // Actual verified shopfloor details
        verificationId: verification?.id || null,
        actualManufacturer: verification?.actualManufacturer || null,
        actualModel: verification?.actualModel || null,
        actualQty: verification?.actualQty || null,
        actualSpec: verification?.actualSpec || null,
        actualBatch: verification?.actualBatch || null,
        actualSerial: verification?.actualSerial || null,
        status,
        remarks: verification?.remarks || null,
        verifiedBy: verification?.verifiedBy?.name || null,
        verifiedAt: verification?.verifiedAt || null,
      };
    });

    const total = comparisonList.length;
    const matched = comparisonList.filter((i) => i.status === 'Matched').length;
    const mismatches = comparisonList.filter((i) => i.status === 'Mismatch').length;
    const missing = comparisonList.filter((i) => i.status === 'Missing').length;
    const pending = comparisonList.filter((i) => i.status === 'Pending').length;

    res.json({
      hasApprovedBom: true,
      bomNumber: activeBom.bomNumber,
      revision: activeBom.revision,
      panelSerialNumber: panel.serialNumber,
      summary: {
        total,
        matched,
        mismatches,
        missing,
        pending,
        matchPercentage: total > 0 ? Math.round((matched / total) * 1000) / 10 : 0,
      },
      items: comparisonList,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record or Update Shopfloor BOM Verification
router.post(
  '/verify',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_INSPECTOR', 'PRODUCTION']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        bomItemId,
        panelId,
        actualModel,
        actualManufacturer,
        actualQty,
        actualSpec,
        actualBatch,
        actualSerial,
        status,
        remarks,
        evidenceUrl,
      } = req.body;

      if (!bomItemId || !panelId || !status) {
        return res.status(400).json({ error: 'bomItemId, panelId, and status are required' });
      }

      const verification = await prisma.bomItemVerification.upsert({
        where: {
          bomItemId_panelId: {
            bomItemId,
            panelId,
          },
        },
        create: {
          bomItemId,
          panelId,
          actualModel,
          actualManufacturer,
          actualQty: actualQty ? parseFloat(actualQty) : 1,
          actualSpec,
          actualBatch,
          actualSerial,
          status,
          remarks,
          evidenceUrl,
          verifiedById: req.user!.id,
          verifiedAt: new Date(),
        },
        update: {
          actualModel,
          actualManufacturer,
          actualQty: actualQty ? parseFloat(actualQty) : 1,
          actualSpec,
          actualBatch,
          actualSerial,
          status,
          remarks,
          evidenceUrl,
          verifiedById: req.user!.id,
          verifiedAt: new Date(),
        },
      });

      await logAudit(
        req.user!.id,
        'VERIFY_BOM_ITEM',
        'BomItemVerification',
        verification.id,
        { panelId, bomItemId, status, actualModel },
        req.ip
      );

      res.json(verification);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Approve a BOM Revision
router.post(
  '/revisions/:id/approve',
  authenticateToken,
  requireRoles(['ADMIN', 'ENGINEERING', 'QUALITY_MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const revision = await prisma.bomRevision.findUnique({ where: { id } });

      if (!revision) return res.status(404).json({ error: 'BOM revision not found' });

      // Mark older approved revisions of this work order as Superseded
      await prisma.bomRevision.updateMany({
        where: {
          workOrderId: revision.workOrderId,
          status: 'Approved',
        },
        data: { status: 'Superseded' },
      });

      const updated = await prisma.bomRevision.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedBy: req.user!.name,
          approvedAt: new Date(),
        },
      });

      await logAudit(req.user!.id, 'APPROVE_BOM_REVISION', 'BomRevision', id, { revision: revision.revision }, req.ip);

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
