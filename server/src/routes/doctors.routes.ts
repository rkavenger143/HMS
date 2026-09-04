import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DEMO_DOCTORS } from '../../../src/data/seedData';

const router = Router();

// GET all doctors
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: DEMO_DOCTORS, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_DOCTORS, source: 'fallback' });
  }
});

// GET single doctor
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('doctors').select('*').eq('id', id).single();
    if (error || !data) {
      const doc = DEMO_DOCTORS.find(d => d.id === id);
      if (doc) return res.json({ success: true, data: doc });
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    return res.json({ success: true, data });
  } catch {
    const doc = DEMO_DOCTORS.find(d => d.id === id);
    if (doc) return res.json({ success: true, data: doc });
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// TOGGLE Doctor Availability
router.patch('/:id/availability', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  try {
    const { data, error } = await supabase.from('doctors').update({ is_available: isAvailable }).eq('id', id).select().single();
    if (error) {
      return res.json({ success: true, data: { id, isAvailable }, source: 'local' });
    }
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, data: { id, isAvailable }, source: 'local' });
  }
});

export default router;
