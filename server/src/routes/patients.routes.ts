import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DEMO_PATIENTS } from '../../../src/data/seedData';

const router = Router();

// GET all patients
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('patients').select('*').order('registration_date', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to in-memory demo data if Supabase DB is not populated yet
      return res.json({ success: true, data: DEMO_PATIENTS, source: 'seed' });
    }

    return res.json({ success: true, data, source: 'supabase' });
  } catch (err: any) {
    return res.json({ success: true, data: DEMO_PATIENTS, source: 'fallback' });
  }
});

// GET single patient by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();

    if (error || !data) {
      const patient = DEMO_PATIENTS.find(p => p.id === id);
      if (patient) return res.json({ success: true, data: patient });
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    return res.json({ success: true, data });
  } catch (err: any) {
    const patient = DEMO_PATIENTS.find(p => p.id === id);
    if (patient) return res.json({ success: true, data: patient });
    return res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE patient
router.post('/', async (req: Request, res: Response) => {
  const newPatient = req.body;
  if (!newPatient.firstName || !newPatient.phone) {
    return res.status(400).json({ success: false, error: 'First name and phone are required' });
  }

  const patientId = newPatient.id || `ALN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const patientData = {
    ...newPatient,
    id: patientId,
    registrationDate: new Date().toISOString(),
    isActive: true,
  };

  try {
    const { data, error } = await supabase.from('patients').insert([patientData]).select().single();
    if (error) {
      return res.json({ success: true, data: patientData, source: 'local' });
    }
    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return res.json({ success: true, data: patientData, source: 'local' });
  }
});

// UPDATE patient
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase.from('patients').update(updates).eq('id', id).select().single();
    if (error) {
      return res.json({ success: true, data: { id, ...updates }, source: 'local' });
    }
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.json({ success: true, data: { id, ...updates }, source: 'local' });
  }
});

export default router;
