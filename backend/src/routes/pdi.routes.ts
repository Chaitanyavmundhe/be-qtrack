import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { generatePdiPdf } from '../services/pdf.service';
import { logAudit } from '../services/audit.service';

const router = Router();

// List PDI inspection runs
router.get('/runs', authenticateToken, async (req, res) => {
  try {
    const { status, panelId } = req.query;

    const where: any = {
      template: { type: 'PDI' },
    };
    if (status) where.status = String(status);
    if (panelId) where.panelId = String(panelId);

    const runs = await prisma.inspectionRun.findMany({
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
        inspector: { select: { id: true, name: true } },
        _count: { select: { results: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(runs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get PDI details for a specific run
router.get('/runs/:id', authenticateToken, async (req, res) => {
  try {
    const run = await prisma.inspectionRun.findUnique({
      where: { id: req.params.id },
      include: {
        template: {
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        },
        panel: {
          include: {
            workOrder: {
              include: {
                project: { include: { customer: true } },
                productTemplate: true,
              },
            },
            ncrs: true,
          },
        },
        inspector: true,
        results: {
          include: { ncr: true },
          orderBy: { category: 'asc' },
        },
      },
    });

    if (!run) return res.status(404).json({ error: 'Inspection run not found' });
    res.json(run);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start or Load Active PDI Run for a Panel
router.post(
  '/start',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_INSPECTOR', 'QUALITY_MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { panelId, templateId } = req.body;

      if (!panelId) return res.status(400).json({ error: 'panelId is required' });

      // Find template
      let template;
      if (templateId) {
        template = await prisma.inspectionTemplate.findUnique({
          where: { id: templateId },
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        });
      } else {
        template = await prisma.inspectionTemplate.findFirst({
          where: { type: 'PDI', isActive: true },
          include: { items: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { version: 'desc' },
        });
      }

      if (!template) {
        return res.status(400).json({ error: 'No active PDI inspection template found in system' });
      }

      // Check if an in-progress PDI run already exists
      const existingRun = await prisma.inspectionRun.findFirst({
        where: {
          panelId,
          templateId: template.id,
          status: 'InProgress',
        },
        include: {
          results: true,
          template: { include: { items: true } },
        },
      });

      if (existingRun) {
        return res.json(existingRun);
      }

      // Count prior runs for this panel
      const priorCount = await prisma.inspectionRun.count({
        where: { panelId, templateId: template.id },
      });

      // Create new InspectionRun
      const run = await prisma.inspectionRun.create({
        data: {
          panelId,
          templateId: template.id,
          runNumber: priorCount + 1,
          status: 'InProgress',
          inspectorId: req.user!.id,
        },
      });

      // Pre-populate inspection results from template items
      const resultInserts = template.items.map((item) => ({
        inspectionRunId: run.id,
        templateItemId: item.id,
        checkItem: item.checkItem,
        category: item.category,
        acceptance: item.acceptance,
        unit: item.unit,
        result: 'Pass', // Default clean state
      }));

      await prisma.inspectionResult.createMany({
        data: resultInserts,
      });

      // Advance panel lifecycle to PDI if currently in previous stage
      await prisma.panel.update({
        where: { id: panelId },
        data: { status: 'PDI' },
      });

      await logAudit(req.user!.id, 'START_PDI', 'InspectionRun', run.id, { panelId, runNumber: priorCount + 1 }, req.ip);

      const createdRun = await prisma.inspectionRun.findUnique({
        where: { id: run.id },
        include: { results: true, template: { include: { items: true } } },
      });

      res.status(201).json(createdRun);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Record or Update a single checklist item result
router.post(
  '/record-item',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_INSPECTOR', 'QUALITY_MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { inspectionRunId, resultId, result, measuredValue, comment, evidenceUrl, autoCreateNcr } = req.body;

      if (!resultId || !result) {
        return res.status(400).json({ error: 'resultId and result are required' });
      }

      let ncrId = null;

      // If user failed the item and requested auto-create NCR
      if (result === 'Fail' && autoCreateNcr) {
        const currentResult = await prisma.inspectionResult.findUnique({
          where: { id: resultId },
          include: { inspectionRun: { include: { panel: true } } },
        });

        if (currentResult) {
          const year = new Date().getFullYear();
          const count = await prisma.ncr.count();
          const ncrNumber = `NCR-${year}-${String(count + 1).padStart(3, '0')}`;

          const ncr = await prisma.ncr.create({
            data: {
              ncrNumber,
              panelId: currentResult.inspectionRun.panelId,
              defectCategory: currentResult.category || 'PDI Testing',
              defectDescription: `PDI Check Failure on "${currentResult.checkItem}": ${comment || 'Criteria not met'}`,
              severity: 'High',
              status: 'RAISED',
              raisedById: req.user!.id,
            },
          });

          ncrId = ncr.id;
        }
      }

      const updated = await prisma.inspectionResult.update({
        where: { id: resultId },
        data: {
          result,
          measuredValue: measuredValue !== undefined ? String(measuredValue) : undefined,
          comment: comment || undefined,
          evidenceUrl: evidenceUrl || undefined,
          ncrId: ncrId || undefined,
        },
      });

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Submit PDI for Approval
router.post(
  '/runs/:id/submit',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_INSPECTOR']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;

      const run = await prisma.inspectionRun.findUnique({
        where: { id },
        include: { results: true },
      });

      if (!run) return res.status(404).json({ error: 'Inspection run not found' });

      const hasFailures = run.results.some((r) => r.result === 'Fail');

      const updated = await prisma.inspectionRun.update({
        where: { id },
        data: {
          status: hasFailures ? 'Completed' : 'Completed',
          remarks: remarks || run.remarks,
        },
      });

      await logAudit(req.user!.id, 'SUBMIT_PDI', 'InspectionRun', id, { hasFailures }, req.ip);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Formally Approve PDI & Release Dispatch Gate
router.post(
  '/runs/:id/approve',
  authenticateToken,
  requireRoles(['ADMIN', 'QUALITY_MANAGER']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { decision, remarks } = req.body; // 'Approved' or 'Rejected'

      const run = await prisma.inspectionRun.findUnique({
        where: { id },
        include: {
          results: true,
          panel: {
            include: {
              ncrs: {
                where: { status: { notIn: ['CLOSED', 'REJECTED'] } },
              },
            },
          },
        },
      });

      if (!run) return res.status(404).json({ error: 'Inspection run not found' });

      if (decision === 'Approved') {
        // Enforce gate: cannot approve PDI if there are open blocking NCRs!
        if (run.panel.ncrs.length > 0) {
          return res.status(400).json({
            error: `Gate Failure: Cannot approve PDI report while panel has ${run.panel.ncrs.length} unresolved NCR(s)!`,
            ncrs: run.panel.ncrs.map((n) => n.ncrNumber),
          });
        }

        // Check if any failed items exist in this run
        const failedItems = run.results.filter((r) => r.result === 'Fail');
        if (failedItems.length > 0) {
          return res.status(400).json({
            error: `Gate Failure: Cannot approve PDI report with ${failedItems.length} failing inspection checks. Resolve or disposition required.`,
          });
        }

        // Mark inspection approved
        await prisma.inspectionRun.update({
          where: { id },
          data: {
            status: 'Approved',
            approvedById: req.user!.id,
            approvedAt: new Date(),
            remarks: remarks || run.remarks,
          },
        });

        // Advance panel status to DISPATCH_READY
        await prisma.panel.update({
          where: { id: run.panelId },
          data: { status: 'DISPATCH_READY' },
        });

        await prisma.panelStatusHistory.create({
          data: {
            panelId: run.panelId,
            fromStatus: 'PDI',
            toStatus: 'DISPATCH_READY',
            changedBy: `${req.user!.name} (Quality Manager)`,
            reason: `PDI Run #${run.runNumber} approved for dispatch release`,
          },
        });

        await logAudit(req.user!.id, 'APPROVE_PDI', 'InspectionRun', id, { panelId: run.panelId }, req.ip);

        return res.json({ message: 'PDI approved and panel marked DISPATCH_READY', runId: id });
      } else {
        // Rejected
        await prisma.inspectionRun.update({
          where: { id },
          data: {
            status: 'Rejected',
            approvedById: req.user!.id,
            approvedAt: new Date(),
            remarks: remarks || 'Rejected during quality manager review',
          },
        });

        await prisma.panel.update({
          where: { id: run.panelId },
          data: { status: 'REWORK_REQUIRED' },
        });

        await logAudit(req.user!.id, 'REJECT_PDI', 'InspectionRun', id, { panelId: run.panelId }, req.ip);

        return res.json({ message: 'PDI rejected. Panel returned to REWORK_REQUIRED', runId: id });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Stream Downloadable PDI Inspection Certificate PDF
router.get('/pdf/:runId', authenticateToken, async (req, res: Response) => {
  try {
    const { runId } = req.params;
    const pdfBuffer = await generatePdiPdf(runId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PDI-Report-${runId.slice(0, 8)}.pdf`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
