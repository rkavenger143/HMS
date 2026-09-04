import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'ALN Cure Hospital Management API',
    version: '1.0.0',
    database: 'Supabase PostgreSQL',
  });
});

export default router;
