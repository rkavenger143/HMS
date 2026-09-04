import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DEMO_ADMISSIONS, DEMO_BEDS, DEMO_WARDS } from '../../../src/data/seedData';

const router = Router();

// GET all admissions
router.get('/admissions', async (req: Request, res: Response) => {
  const { status, patientId } = req.query;
  try {
    let query = supabase.from('admissions').select('*').order('admission_date', { ascending: false });
    if (status) query = query.eq('status', status as string);
    if (patientId) query = query.eq('patient_id', patientId as string);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = DEMO_ADMISSIONS;
      if (status) filtered = filtered.filter(a => a.status === status);
      if (patientId) filtered = filtered.filter(a => a.patientId === patientId);
      return res.json({ success: true, data: filtered, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_ADMISSIONS, source: 'fallback' });
  }
});

// GET all beds & wards
router.get('/beds', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('beds').select('*');
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: DEMO_BEDS, wards: DEMO_WARDS, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_BEDS, wards: DEMO_WARDS, source: 'fallback' });
  }
});

// UPDATE bed status
router.patch('/beds/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, currentPatientId, currentAdmissionId } = req.body;
  try {
    const { data, error } = await supabase
      .from('beds')
      .update({ status, current_patient_id: currentPatientId, current_admission_id: currentAdmissionId })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.json({ success: true, message: 'Updated locally', status });
    }
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, message: 'Updated fallback', status });
  }
});

// CREATE admission
router.post('/admissions', async (req: Request, res: Response) => {
  const newAdmission = {
    ...req.body,
    id: req.body.id || `adm-${Date.now()}`,
    status: req.body.status || 'active',
    createdAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('admissions').insert([newAdmission]).select().single();
    if (error) {
      return res.status(201).json({ success: true, data: newAdmission, source: 'local' });
    }
    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(201).json({ success: true, data: newAdmission, source: 'local' });
  }
});

// CREATE bed transfer
router.post('/transfers', async (req: Request, res: Response) => {
  const newTransfer = {
    ...req.body,
    id: req.body.id || `trf-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newTransfer });
});

// CREATE doctor round
router.post('/rounds', async (req: Request, res: Response) => {
  const newRound = {
    ...req.body,
    id: req.body.id || `rnd-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newRound });
});

// CREATE discharge record
router.post('/discharges', async (req: Request, res: Response) => {
  const newDischarge = {
    ...req.body,
    id: req.body.id || `dis-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newDischarge });
});

export default router;
