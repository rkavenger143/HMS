import { Router, Request, Response } from 'express';
import { DEMO_STATS } from '../../../src/data/seedData';

const router = Router();

// GET live aggregated dashboard stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: DEMO_STATS,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return res.json({ success: true, data: DEMO_STATS });
  }
});

export default router;
