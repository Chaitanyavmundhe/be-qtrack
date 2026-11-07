import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAudit } from '../services/audit.service';

const router = Router();

// ===================== PRODUCTS =====================

router.get('/products', authenticateToken, async (_req, res) => {
  try {
    const products = await prisma.productTemplate.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { workOrders: true },
        },
      },
      orderBy: { code: 'asc' },
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await prisma.productTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        workOrders: {
          include: {
            project: {
              include: { customer: true },
            },
            panels: true,
          },
        },
      },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== CUSTOMERS =====================

router.get('/customers', authenticateToken, async (_req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        projects: {
          include: {
            workOrders: {
              include: {
                _count: { select: { panels: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/customers',
  authenticateToken,
  requireRoles(['ADMIN', 'ENGINEERING', 'MANAGEMENT']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, code, address, contact, email, phone } = req.body;
      const customer = await prisma.customer.create({
        data: { name, code: code.toUpperCase(), address, contact, email, phone },
      });
      await logAudit(req.user!.id, 'CREATE_CUSTOMER', 'Customer', customer.id, { code }, req.ip);
      res.status(201).json(customer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===================== PROJECTS =====================

router.get('/projects', authenticateToken, async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        customer: true,
        workOrders: {
          include: {
            productTemplate: true,
            _count: { select: { panels: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/projects',
  authenticateToken,
  requireRoles(['ADMIN', 'ENGINEERING', 'MANAGEMENT']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { projectNo, name, customerId, description, startDate, targetDate } = req.body;
      const project = await prisma.project.create({
        data: {
          projectNo: projectNo.toUpperCase(),
          name,
          customerId,
          description,
          startDate: startDate ? new Date(startDate) : null,
          targetDate: targetDate ? new Date(targetDate) : null,
        },
      });
      await logAudit(req.user!.id, 'CREATE_PROJECT', 'Project', project.id, { projectNo }, req.ip);
      res.status(201).json(project);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ===================== WORK ORDERS =====================

router.get('/work-orders', authenticateToken, async (_req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        project: {
          include: { customer: true },
        },
        productTemplate: true,
        panels: {
          select: {
            id: true,
            serialNumber: true,
            status: true,
            createdAt: true,
          },
        },
        bomRevisions: {
          where: { status: 'Approved' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(workOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/work-orders/:id', authenticateToken, async (req, res) => {
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          include: { customer: true },
        },
        productTemplate: true,
        panels: {
          include: {
            ncrs: true,
            inspectionRuns: true,
          },
        },
        bomRevisions: {
          include: {
            items: true,
          },
          orderBy: { revision: 'desc' },
        },
      },
    });
    if (!workOrder) return res.status(404).json({ error: 'Work order not found' });
    res.json(workOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
