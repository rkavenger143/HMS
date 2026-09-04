import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET all medicines inventory
router.get('/medicines', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('medicines').select('*');
    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: [], source: 'fallback' });
    }
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, data: [], source: 'fallback' });
  }
});

// CREATE / ADD Medicine
router.post('/medicines', async (req: Request, res: Response) => {
  const newMed = {
    ...req.body,
    id: req.body.id || `med-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newMed });
});

// GET Batches
router.get('/batches', async (_req: Request, res: Response) => {
  return res.json({ success: true, data: [] });
});

// INWARD STOCK (GRN)
router.post('/stock-in', async (req: Request, res: Response) => {
  const newBatch = {
    ...req.body,
    id: `batch-${Date.now()}`,
    receivedDate: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, message: 'Stock received and batch onboarded', data: newBatch });
});

// CREATE PURCHASE ORDER
router.post('/purchase-orders', async (req: Request, res: Response) => {
  const seq = Math.floor(100 + Math.random() * 900);
  const newPO = {
    ...req.body,
    id: `po-${Date.now()}`,
    poNumber: `PO-2026-00${seq}`,
    status: 'ordered',
    orderDate: new Date().toISOString().slice(0, 10),
  };
  return res.status(201).json({ success: true, message: 'Purchase order created', data: newPO });
});

// GET dispensing history
router.get('/dispensings', async (_req: Request, res: Response) => {
  return res.json({ success: true, data: [] });
});

// CREATE dispensing
router.post('/dispensings', async (req: Request, res: Response) => {
  const newDispense = {
    ...req.body,
    id: req.body.id || `disp-${Date.now()}`,
    dispensedAt: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, data: newDispense });
});

// PROCESS COUNTER POS SALE
router.post('/sales', async (req: Request, res: Response) => {
  const seq = Math.floor(1000 + Math.random() * 9000);
  const newSale = {
    ...req.body,
    id: `sale-${Date.now()}`,
    saleNumber: `POS-2026-00${seq}`,
    saleDate: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, message: 'Sale completed', data: newSale });
});

// PROCESS RETURN
router.post('/returns', async (req: Request, res: Response) => {
  const newReturn = {
    ...req.body,
    id: `ret-${Date.now()}`,
    returnDate: new Date().toISOString(),
  };
  return res.status(201).json({ success: true, message: 'Return logged', data: newReturn });
});

export default router;
