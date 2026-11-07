import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { generatePanelSerialNumber, generateQrDataUri } from '../services/serial.service';
import { logAudit } from '../services/audit.service';
import { PanelStatus } from '@prisma/client';

const router = Router();

// List panels with search & filter
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, workOrderId } = req.query;

    const where: any = {};
    if (status) where.status = status as PanelStatus;
    if (workOrderId) where.workOrderId = String(workOrderId);
    if (search) {
      where.OR = [
        { serialNumber: { contains: String(search), mode: 'insensitive' } },
        { workOrder: { workOrderNo: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const panels = await prisma.panel.findMany({
      where,
      include: {
        workOrder: {
          include: {
            project: { include: { customer: true } },
            productTemplate: true,
          },
        },
        _count: {
          select: {
            ncrs: true,
            inspectionRuns: true,
            operationLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(panels);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lookup by Serial Number (used by QR scanner & quick lookup)
router.get('/by-serial/:serial', authenticateToken, async (req, res) => {
  try {
    const { serial } = req.params;
    const panel = await prisma.panel.findUnique({
      where: { serialNumber: serial.trim().toUpperCase() },
      include: {
        workOrder: {
          include: {
            project: { include: { customer: true } },
            productTemplate: true,
            bomRevisions: {
              where: { status: 'Approved' },
              include: { items: true },
              take: 1,
            },
          },
        },
        ncrs: {
          include: { raisedBy: true, assignedTo: true },
        },
        inspectionRuns: {
          include: { template: true, inspector: true, results: true },
          orderBy: { createdAt: 'desc' },
        },
        operationLogs: {
          include: { operator: true },
          orderBy: { startTime: 'desc' },
        },
        bomVerifications: {
          include: { bomItem: true, verifiedBy: true },
        },
        dispatchRecord: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!panel) {
      return res.status(404).json({ error: `Panel with serial ${serial} not found in database` });
    }

    res.json(panel);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Panel 360 Full Traceability Dossier
router.get('/:id/360', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const panel = await prisma.panel.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            project: { include: { customer: true } },
            productTemplate: true,
            bomRevisions: {
              include: { items: true },
              orderBy: { revision: 'desc' },
            },
          },
        },
        operationLogs: {
          include: { operator: true },
          orderBy: { startTime: 'asc' },
        },
        bomVerifications: {
          include: { bomItem: true, verifiedBy: true },
        },
        ncrs: {
          include: {
            raisedBy: true,
            assignedTo: true,
            correctiveActions: { include: { assignedTo: true, verifiedBy: true } },
            statusHistory: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        inspectionRuns: {
          include: {
            template: true,
            inspector: true,
            results: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        dispatchRecord: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!panel) return res.status(404).json({ error: 'Panel not found' });

    res.json(panel);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Register New Panel
router.post(
  '/register',
  authenticateToken,
  requireRoles(['ADMIN', 'ENGINEERING', 'PRODUCTION']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { workOrderId, specifications, notes } = req.body;

      const workOrder = await prisma.workOrder.findUnique({
        where: { id: workOrderId },
        include: { productTemplate: true },
      });

      if (!workOrder) {
        return res.status(400).json({ error: 'Valid Work Order required' });
      }

      // Generate standardized serial number: BEE-12K-2026-XXX
      const serialNumber = await generatePanelSerialNumber(workOrder.productTemplate.code);

      const panel = await prisma.panel.create({
        data: {
          serialNumber,
          workOrderId,
          status: 'DRAFT',
          specifications: specifications || workOrder.specifications || {},
          notes,
        },
      });

      // Generate QR Code data URL containing serial
      const qrCodeData = await generateQrDataUri({
        serialNumber,
        panelId: panel.id,
      });

      const updatedPanel = await prisma.panel.update({
        where: { id: panel.id },
        data: { qrCodeData },
      });

      // Record status history
      await prisma.panelStatusHistory.create({
        data: {
          panelId: panel.id,
          fromStatus: 'NONE',
          toStatus: 'DRAFT',
          changedBy: req.user!.name,
          reason: 'Initial registration on shopfloor',
        },
      });

      await logAudit(req.user!.id, 'REGISTER_PANEL', 'Panel', panel.id, { serialNumber }, req.ip);

      res.status(201).json(updatedPanel);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update Panel Lifecycle Status (with Quality Gate Enforcement!)
router.patch(
  '/:id/status',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const panel = await prisma.panel.findUnique({
        where: { id },
        include: {
          ncrs: {
            where: {
              status: { notIn: ['CLOSED', 'REJECTED'] },
            },
          },
          inspectionRuns: {
            where: {
              template: { type: 'PDI' },
              status: 'Approved',
            },
          },
          workOrder: {
            include: {
              bomRevisions: { where: { status: 'Approved' } },
            },
          },
        },
      });

      if (!panel) return res.status(404).json({ error: 'Panel not found' });

      // MANDATORY QUALITY GATES ENFORCEMENT:
      // Gate 1: Cannot move to MANUFACTURING without an approved BOM revision
      if (status === 'MANUFACTURING') {
        if (!panel.workOrder.bomRevisions || panel.workOrder.bomRevisions.length === 0) {
          return res.status(400).json({
            error: 'Quality Gate Block: Cannot start manufacturing without an approved BOM revision!',
          });
        }
      }

      // Gate 2: Cannot advance to DISPATCH_READY if there are open/unresolved NCRs!
      if (status === 'DISPATCH_READY' || status === 'DISPATCHED') {
        if (panel.ncrs.length > 0) {
          return res.status(400).json({
            error: `Quality Gate Block: Cannot release panel for dispatch! Panel has ${panel.ncrs.length} open NCR(s) awaiting resolution.`,
            openNcrs: panel.ncrs.map((n) => n.ncrNumber),
          });
        }

        // Gate 3: Cannot dispatch without approved PDI inspection
        if (panel.inspectionRuns.length === 0) {
          return res.status(400).json({
            error: 'Quality Gate Block: Cannot release panel without an Approved Pre-Dispatch Inspection (PDI) report!',
          });
        }

        // Gate 4: Only Quality Manager or Admin can authorize dispatch ready
        if (req.user!.role !== 'ADMIN' && req.user!.role !== 'QUALITY_MANAGER') {
          return res.status(403).json({
            error: 'Authorization Block: Only Quality Manager or Administrator can authorize final dispatch release.',
          });
        }
      }

      const prevStatus = panel.status;
      const updated = await prisma.panel.update({
        where: { id },
        data: { status: status as PanelStatus },
      });

      // Record history
      await prisma.panelStatusHistory.create({
        data: {
          panelId: panel.id,
          fromStatus: prevStatus,
          toStatus: status,
          changedBy: `${req.user!.name} (${req.user!.role})`,
          reason: reason || 'Routine lifecycle transition',
        },
      });

      await logAudit(
        req.user!.id,
        'UPDATE_PANEL_STATUS',
        'Panel',
        panel.id,
        { from: prevStatus, to: status, reason },
        req.ip
      );

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
