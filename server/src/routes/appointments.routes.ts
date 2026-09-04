import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { DEMO_APPOINTMENTS } from '../../../src/data/seedData';

const router = Router();

// GET all appointments
router.get('/', async (req: Request, res: Response) => {
  const { date, doctorId, patientId, status } = req.query;

  try {
    let query = supabase.from('appointments').select('*').order('date', { ascending: false });

    if (date) query = query.eq('date', date as string);
    if (doctorId) query = query.eq('doctor_id', doctorId as string);
    if (patientId) query = query.eq('patient_id', patientId as string);
    if (status) query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = [...DEMO_APPOINTMENTS];
      if (date) filtered = filtered.filter(a => a.date === date);
      if (doctorId) filtered = filtered.filter(a => a.doctorId === doctorId);
      if (status) filtered = filtered.filter(a => a.status === status);
      return res.json({ success: true, data: filtered, source: 'seed' });
    }
    return res.json({ success: true, data, source: 'supabase' });
  } catch {
    return res.json({ success: true, data: DEMO_APPOINTMENTS, source: 'fallback' });
  }
});

// CREATE appointment
router.post('/', async (req: Request, res: Response) => {
  const appointment = req.body;
  const newAppointment = {
    ...appointment,
    id: appointment.id || `apt-${Date.now()}`,
    tokenNumber: appointment.tokenNumber || Math.floor(Math.random() * 30) + 1,
    status: appointment.status || 'scheduled',
    createdAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('appointments').insert([newAppointment]).select().single();
    if (error) {
      return res.status(201).json({ success: true, data: newAppointment, source: 'local' });
    }
    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(201).json({ success: true, data: newAppointment, source: 'local' });
  }
});

// UPDATE appointment status
router.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (error) {
      return res.json({ success: true, data: { id, status }, source: 'local' });
    }
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, data: { id, status }, source: 'local' });
  }
});

export default router;
