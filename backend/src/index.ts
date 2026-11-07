import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import masterRoutes from './routes/master.routes';
import panelRoutes from './routes/panels.routes';
import bomRoutes from './routes/bom.routes';
import ncrRoutes from './routes/ncr.routes';
import pdiRoutes from './routes/pdi.routes';
import inspectionRoutes from './routes/inspections.routes';
import dashboardRoutes from './routes/dashboard.routes';
import operationRoutes from './routes/operations.routes';
import ecrRoutes from './routes/ecr.routes';
import supplierRoutes from './routes/suppliers.routes';
import userRoutes from './routes/users.routes';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(config.uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/ncr', ncrRoutes);
app.use('/api/pdi', pdiRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/ecr', ecrRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);

// Root healthcheck
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'BE-QTrack API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BE-QTrack] API server running on http://0.0.0.0:${PORT}`);
  console.log(`[BE-QTrack] Environment: ${config.nodeEnv}`);
});

export default app;
