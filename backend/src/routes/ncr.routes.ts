import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAudit } from '../services/audit.service';
import { NcrStatus } from '@prisma/client';

const router = Router();

// List all NCRs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, panelId, severity, department } = req.query;

    const where: any = {};
    if (status) where.status = status as NcrStatus;
    if (panelId) where.panelId = String(panelId);
    if (severity) where.severity = String(severity);
    if (department) where.department = String(department);

    const ncrs = await prisma.ncr.findMany({
      where,
      include: {
        panel: {
          select: {
            id: true,
            serialNumber: true,
            status: true,
            workOrder: {
              select: {
                workOrderNo: true,
                project: { select: { customer: { select: { name: true } } } },
              },
            },
          },
        },
        raisedBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        correctiveActions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ncrs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single NCR Details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ncr = await prisma.ncr.findUnique({
      where: { id: req.params.id },
      include: {
        panel: {
          include: {
            workOrder: {
              include: {
                project: { include: { customer: true } },
                productTemplate: true,
              },
            },
          },
        },
        raisedBy: { select: { id: true, name: true, role: true, department: true } },
        assignedTo: { select: { id: true, name: true, role: true, department: true } },
        correctiveActions: {
          include: {
            assignedTo: { select: { id: true, name: true } },
            verifiedBy: { select: { id: true, name: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        inspectionResults: true,
      },
    });

    if (!ncr) return res.status(404).json({ error: 'NCR not found' });
    res.json(ncr);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create NCR
router.post(
  '/',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_INSPECTOR', 'QUALITY_MANAGER', 'PRODUCTION']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        panelId,
        workOrderId,
        department,
        defectCategory,
        defectDescription,
        severity,
        immediateCorrection,
        rootCauseMethod,
        rootCauseAnalysis,
        targetDate,
        assignedToId,
        evidenceUrls,
      } = req.body;

      if (!defectCategory || !defectDescription) {
        return res.status(400).json({ error: 'defectCategory and defectDescription are required' });
      }

      // Generate unique NCR number: NCR-2026-XXX
      const year = new Date().getFullYear();
      const prefix = `NCR-${year}-`;
      const count = await prisma.ncr.count();
      const ncrNumber = `${prefix}${String(count + 1).padStart(3, '0')}`;

      const ncr = await prisma.ncr.create({
        data: {
          ncrNumber,
          panelId: panelId || null,
          workOrderId: workOrderId || null,
          department: department || 'Assembly',
          defectCategory,
          defectDescription,
          severity: severity || 'Medium',
          status: 'RAISED',
          raisedById: req.user!.id,
          assignedToId: assignedToId || null,
          immediateCorrection: immediateCorrection || null,
          rootCauseMethod: rootCauseMethod || '5Why',
          rootCauseAnalysis: rootCauseAnalysis || null,
          targetDate: targetDate ? new Date(targetDate) : null,
          evidenceUrls: evidenceUrls || [],
        },
        include: {
          raisedBy: true,
          panel: true,
        },
      });

      // If immediate correction was provided, auto-create a correction action
      if (immediateCorrection) {
        await prisma.correctiveAction.create({
          data: {
            ncrId: ncr.id,
            actionType: 'Immediate Correction',
            description: immediateCorrection,
            assignedToId: assignedToId || null,
            status: 'InProgress',
          },
        });
      }

      // Record status history
      await prisma.ncrStatusHistory.create({
        data: {
          ncrId: ncr.id,
          fromStatus: 'NONE',
          toStatus: 'RAISED',
          changedBy: `${req.user!.name} (${req.user!.role})`,
          comment: `NCR Raised: ${defectDescription.slice(0, 80)}`,
        },
      });

      // If panel is attached and severity is High or Critical, put panel on REWORK_REQUIRED or ON_HOLD
      if (panelId && (severity === 'High' || severity === 'Critical')) {
        await prisma.panel.update({
          where: { id: panelId },
          data: { status: 'REWORK_REQUIRED' },
        });

        await prisma.panelStatusHistory.create({
          data: {
            panelId,
            fromStatus: 'CURRENT',
            toStatus: 'REWORK_REQUIRED',
            changedBy: req.user!.name,
            reason: `System trigger: High severity NCR ${ncrNumber} logged`,
          },
        });
      }

      await logAudit(req.user!.id, 'CREATE_NCR', 'Ncr', ncr.id, { ncrNumber, severity, panelId }, req.ip);

      res.status(201).json(ncr);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update NCR Status & Investigation Details
router.patch(
  '/:id/status',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const {
        status,
        comment,
        rootCauseMethod,
        rootCauseAnalysis,
        immediateCorrection,
        assignedToId,
        targetDate,
      } = req.body;

      const existing = await prisma.ncr.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'NCR not found' });

      // Verification to close: Only Quality Manager or Admin can CLOSE an NCR!
      if (status === 'CLOSED') {
        if (req.user!.role !== 'ADMIN' && req.user!.role !== 'QUALITY_MANAGER') {
          return res.status(403).json({
            error: 'Authorization Block: Only Quality Manager or Administrator can formally close an NCR.',
          });
        }
      }

      const updateData: any = {};
      if (status) updateData.status = status as NcrStatus;
      if (rootCauseMethod) updateData.rootCauseMethod = rootCauseMethod;
      if (rootCauseAnalysis) updateData.rootCauseAnalysis = rootCauseAnalysis;
      if (immediateCorrection) updateData.immediateCorrection = immediateCorrection;
      if (assignedToId) updateData.assignedToId = assignedToId;
      if (targetDate) updateData.targetDate = new Date(targetDate);
      if (status === 'CLOSED') updateData.closedAt = new Date();

      const updated = await prisma.ncr.update({
        where: { id },
        data: updateData,
      });

      if (status && status !== existing.status) {
        await prisma.ncrStatusHistory.create({
          data: {
            ncrId: id,
            fromStatus: existing.status,
            toStatus: status,
            changedBy: `${req.user!.name} (${req.user!.role})`,
            comment: comment || `Status progressed to ${status}`,
          },
        });
      }

      await logAudit(
        req.user!.id,
        'UPDATE_NCR_STATUS',
        'Ncr',
        id,
        { from: existing.status, to: status, comment },
        req.ip
      );

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Add Corrective Action to NCR
router.post(
  '/:id/corrective-actions',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_INSPECTOR', 'QUALITY_MANAGER', 'PRODUCTION']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { actionType, description, assignedToId, targetDate } = req.body;

      if (!description || !actionType) {
        return res.status(400).json({ error: 'actionType and description are required' });
      }

      const action = await prisma.correctiveAction.create({
        data: {
          ncrId: id,
          actionType, // Immediate Correction, Root-Cause Corrective, Preventive
          description,
          assignedToId: assignedToId || null,
          targetDate: targetDate ? new Date(targetDate) : null,
          status: 'Open',
        },
      });

      // Update NCR status to CORRECTIVE_ACTION_ASSIGNED if in earlier stage
      const ncr = await prisma.ncr.findUnique({ where: { id } });
      if (ncr && (ncr.status === 'RAISED' || ncr.status === 'UNDER_INVESTIGATION' || ncr.status === 'ROOT_CAUSE_IDENTIFIED')) {
        await prisma.ncr.update({
          where: { id },
          data: { status: 'CORRECTIVE_ACTION_ASSIGNED' },
        });
      }

      await logAudit(req.user!.id, 'CREATE_CORRECTIVE_ACTION', 'CorrectiveAction', action.id, { ncrId: id, actionType }, req.ip);

      res.status(201).json(action);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Verify & Complete Corrective Action
router.patch(
  '/corrective-actions/:actionId',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { actionId } = req.params;
      const { status, verificationResult } = req.body;

      const action = await prisma.correctiveAction.update({
        where: { id: actionId },
        data: {
          status,
          verificationResult: verificationResult || null,
          verifiedById: req.user!.id,
          verifiedAt: new Date(),
          completedAt: status === 'Completed' || status === 'Verified' ? new Date() : undefined,
        },
      });

      await logAudit(req.user!.id, 'VERIFY_CORRECTIVE_ACTION', 'CorrectiveAction', actionId, { status, verificationResult }, req.ip);

      res.json(action);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
