import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DEMO_AMBULANCE_REQUESTS } from '../../../src/data/seedData';

const router = Router();

// GET ambulance requests
router.get('/requests', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('ambulance_requests').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: DEMO_AMBULANCE_REQUESTS, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_AMBULANCE_REQUESTS, source: 'fallback' });
  }
});

// DISPATCH ambulance
router.post('/dispatch', async (req: Request, res: Response) => {
  const dispatchData = {
    ...req.body,
    id: req.body.id || `amb-req-${Date.now()}`,
    status: 'dispatched',
    dispatchedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('ambulance_requests').insert([dispatchData]).select().single();
    if (error) {
      return res.status(201).json({ success: true, data: dispatchData, source: 'local' });
    }
    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(201).json({ success: true, data: dispatchData, source: 'local' });
  }
});

export default router;
