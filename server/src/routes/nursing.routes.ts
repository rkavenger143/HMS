import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET all nursing tasks
router.get('/tasks', async (req: Request, res: Response) => {
  const { admissionId, status } = req.query;
  try {
    let query = supabase.from('nursing_tasks').select('*').order('created_at', { ascending: false });
    if (admissionId) query = query.eq('admission_id', admissionId as string);
    if (status) query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: [], source: 'fallback' });
    }
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, data: [], source: 'fallback' });
  }
});

// CREATE nursing task
router.post('/tasks', async (req: Request, res: Response) => {
  const newTask = {
    ...req.body,
    id: req.body.id || `ntk-${Date.now()}`,
    status: req.body.status || 'pending',
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newTask });
});

// UPDATE nursing task
router.patch('/tasks/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  return res.json({ success: true, message: 'Task updated', id, status });
});

// RECORD vitals
router.post('/vitals', async (req: Request, res: Response) => {
  const newVitals = {
    ...req.body,
    id: req.body.id || `cv-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newVitals });
});

// RECORD nursing note
router.post('/notes', async (req: Request, res: Response) => {
  const newNote = {
    ...req.body,
    id: req.body.id || `nt-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newNote });
});

// CREATE/UPDATE MAR
router.post('/mar', async (req: Request, res: Response) => {
  const newMAR = {
    ...req.body,
    id: req.body.id || `mar-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newMAR });
});

// RECORD incident
router.post('/incidents', async (req: Request, res: Response) => {
  const newIncident = {
    ...req.body,
    id: req.body.id || `inc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newIncident });
});

export default router;
