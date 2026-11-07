import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getRealtimeKpis } from '../services/kpi.service';

const router = Router();

// Get Current Quality KPIs
router.get('/kpi', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department, productCode } = req.query;

    const kpiData = await getRealtimeKpis({
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      department: department ? String(department) : undefined,
      productCode: productCode ? String(productCode) : undefined,
    });

    res.json(kpiData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Server-Sent Events (SSE) Stream for Real-time Dashboard Updates
router.get('/stream', async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial data
  const sendUpdate = async () => {
    try {
      const data = await getRealtimeKpis();
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error('SSE Error:', e);
    }
  };

  await sendUpdate();

  // Poll database every 15 seconds to push live metrics to connected clients
  const interval = setInterval(sendUpdate, 15000);

  _req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;
