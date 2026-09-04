import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DEMO_BLOOD_STOCK, DEMO_BLOOD_DONORS } from '../../../src/data/seedData';

const router = Router();

// GET blood stock
router.get('/stock', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('blood_stock').select('*');
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: DEMO_BLOOD_STOCK, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_BLOOD_STOCK, source: 'fallback' });
  }
});

// GET blood donors
router.get('/donors', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('blood_donors').select('*');
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: DEMO_BLOOD_DONORS, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_BLOOD_DONORS, source: 'fallback' });
  }
});

// ADD blood donor
router.post('/donors', async (req: Request, res: Response) => {
  const newDonor = {
    ...req.body,
    id: req.body.id || `donor-${Date.now()}`,
    registeredAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('blood_donors').insert([newDonor]).select().single();
    if (error) {
      return res.status(201).json({ success: true, data: newDonor, source: 'local' });
    }
    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(201).json({ success: true, data: newDonor, source: 'local' });
  }
});

export default router;
