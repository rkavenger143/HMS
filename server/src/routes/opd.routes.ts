import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DEMO_CONSULTATIONS } from '../../../src/data/seedData';

const router = Router();

// In-memory OPD visits storage for backend fallback
let localVisits: any[] = [];

// GET consultations
router.get('/', async (req: Request, res: Response) => {
  const { patientId, doctorId } = req.query;

  try {
    let query = supabase.from('consultations').select('*').order('date', { ascending: false });
    if (patientId) query = query.eq('patient_id', patientId as string);
    if (doctorId) query = query.eq('doctor_id', doctorId as string);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_CONSULTATIONS];
      if (patientId) filtered = filtered.filter(c => c.patientId === patientId);
      return res.json({ success: true, data: filtered, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_CONSULTATIONS, source: 'fallback' });
  }
});

// CREATE consultation
router.post('/', async (req: Request, res: Response) => {
  const newConsultation = {
    ...req.body,
    id: req.body.id || `cons-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('consultations').insert([newConsultation]).select().single();
    if (error) {
      return res.status(201).json({ success: true, data: newConsultation, source: 'local' });
    }
    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(201).json({ success: true, data: newConsultation, source: 'local' });
  }
});

// GET OPD visits
router.get('/visits', async (req: Request, res: Response) => {
  const { date, doctorId, status } = req.query;
  try {
    let query = supabase.from('opd_visits').select('*').order('created_at', { ascending: false });
    if (date) query = query.eq('visit_date', date as string);
    if (doctorId) query = query.eq('doctor_id', doctorId as string);
    if (status) query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: localVisits, source: 'local' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: localVisits, source: 'fallback' });
  }
});

// CREATE OPD visit
router.post('/visits', async (req: Request, res: Response) => {
  const newVisit = {
    ...req.body,
    id: req.body.id || `OPD-2026-${Date.now().toString().slice(-5)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localVisits.unshift(newVisit);

  try {
    const { data, error } = await supabase.from('opd_visits').insert([newVisit]).select().single();
    if (error) {
      return res.status(201).json({ success: true, data: newVisit, source: 'local' });
    }
    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(201).json({ success: true, data: newVisit, source: 'local' });
  }
});

// UPDATE OPD visit status
router.patch('/visits/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  localVisits = localVisits.map(v => v.id === id ? { ...v, status, updatedAt: new Date().toISOString() } : v);

  try {
    const { data, error } = await supabase.from('opd_visits').update({ status }).eq('id', id).select().single();
    if (error) {
      return res.json({ success: true, data: { id, status }, source: 'local' });
    }
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, data: { id, status }, source: 'local' });
  }
});

export default router;
