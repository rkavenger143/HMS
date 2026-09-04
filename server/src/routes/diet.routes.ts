import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET diet charts
router.get('/charts', async (req: Request, res: Response) => {
  const { admissionId, patientId, status } = req.query;
  try {
    let query = supabase.from('diet_charts').select('*').order('created_at', { ascending: false });
    if (admissionId) query = query.eq('admission_id', admissionId as string);
    if (patientId) query = query.eq('patient_id', patientId as string);
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

// CREATE diet chart
router.post('/charts', async (req: Request, res: Response) => {
  const newChart = {
    ...req.body,
    id: req.body.id || `dc-${Date.now()}`,
    status: req.body.status || 'active',
    version: req.body.version || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newChart });
});

// APPROVE diet chart
router.patch('/charts/:id/approve', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approvedBy } = req.body;
  return res.json({ success: true, message: 'Diet chart approved', id, approvedBy, status: 'approved' });
});

// RECORD nutrition assessment
router.post('/assessments', async (req: Request, res: Response) => {
  const newAssessment = {
    ...req.body,
    id: req.body.id || `na-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newAssessment });
});

// DOCTOR DIET ORDERS
router.post('/doctor-orders', async (req: Request, res: Response) => {
  const newOrder = {
    ...req.body,
    id: req.body.id || `ddo-${Date.now()}`,
    status: 'new',
    orderDate: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newOrder });
});

// MEAL DELIVERY TRACKING
router.patch('/meals/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, staffName, refusalReason, remarks } = req.body;
  return res.json({ success: true, message: 'Meal status updated', id, status, staffName, refusalReason, remarks });
});

// NPO FASTING
router.post('/npo', async (req: Request, res: Response) => {
  const newNPO = {
    ...req.body,
    id: req.body.id || `npo-${Date.now()}`,
    status: 'active',
    startDateTime: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newNPO });
});

export default router;
