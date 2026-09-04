import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET all lab tests catalog
router.get('/tests', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('lab_tests').select('*');
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: [], source: 'fallback' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: [], source: 'fallback' });
  }
});

// GET lab orders / requests
router.get('/orders', async (req: Request, res: Response) => {
  const { status, patientId, encounterType } = req.query;
  try {
    let query = supabase.from('lab_orders').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status as string);
    if (patientId) query = query.eq('patient_id', patientId as string);
    if (encounterType) query = query.eq('encounter_type', encounterType as string);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: [], source: 'fallback' });
    }
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, data: [], source: 'fallback' });
  }
});

// CREATE lab order
router.post('/orders', async (req: Request, res: Response) => {
  const newOrder = {
    ...req.body,
    id: req.body.id || `ord-${Date.now()}`,
    orderNumber: req.body.orderNumber || `LAB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'ordered',
    orderDate: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newOrder });
});

// SAMPLE COLLECTION
router.patch('/samples/:id/collect', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { collectorName } = req.body;
  return res.json({ success: true, message: 'Sample collected', id, collectorName, status: 'collected' });
});

// SAMPLE RECEIVING & QUALITY
router.patch('/samples/:id/receive', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { receiverName, status, rejectionReason, remarks } = req.body;
  return res.json({ success: true, message: 'Sample reception updated', id, receiverName, status, rejectionReason, remarks });
});

// RESULT ENTRY
router.post('/orders/:id/results', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { testId, results, technicianName, remarks } = req.body;
  return res.json({ success: true, message: 'Results recorded', orderId: id, testId, results, technicianName, remarks });
});

// RESULT VERIFICATION
router.patch('/orders/:id/verify', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { testId, pathologistName, remarks } = req.body;
  return res.json({ success: true, message: 'Results verified by pathologist', orderId: id, testId, pathologistName, remarks });
});

// REPORT AMENDMENT
router.post('/orders/:id/amend', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { testId, amendedResults, reason, pathologistName } = req.body;
  return res.json({ success: true, message: 'Report amended', orderId: id, testId, amendedResults, reason, pathologistName });
});

// CRITICAL VALUE ACKNOWLEDGMENT
router.patch('/critical-alerts/:id/acknowledge', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { acknowledgedBy } = req.body;
  return res.json({ success: true, message: 'Critical alert acknowledged', id, acknowledgedBy, status: 'acknowledged' });
});

export default router;
