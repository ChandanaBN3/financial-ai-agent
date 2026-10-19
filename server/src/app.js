import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Route imports
import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js';
import advisoryRoutes from './routes/advisory.js';
import fraudRoutes from './routes/fraud.js';
import agentRoutes from './routes/agent.js';
import transactionRoutes from './routes/transactions.js';
import knowledgeRoutes from './routes/knowledge.js';
import demoRoutes from './routes/demo.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '1mb' }));

  // API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/advisory', advisoryRoutes);
  app.use('/api/fraud', fraudRoutes);
  app.use('/api/agent', agentRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/knowledge', knowledgeRoutes);
  app.use('/api/demo', demoRoutes);

  // 404 Handler for API
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Serve static client build if present
  const clientDistPath = new URL('../../client/dist', import.meta.url).pathname;
  // Handle Windows paths if pathname has leading slash like /C:/
  const normalizedPath = process.platform === 'win32' && clientDistPath.startsWith('/')
    ? clientDistPath.slice(1)
    : clientDistPath;

  app.use(express.static(normalizedPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile('index.html', { root: normalizedPath }, (err) => {
      if (err) next();
    });
  });

  // Centralized Error Handler
  app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err.message);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}
