import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Login route (Supports Supabase Auth with fallback)
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

// Patient OTP Login
router.post('/login-otp', async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
  }

  if (otp !== '1234') {
    return res.status(400).json({ success: false, error: 'Invalid OTP. Demo OTP is 1234' });
  }

  return res.json({
    success: true,
    user: {
      id: `patient-${phone}`,
      name: `Patient (${phone})`,
      phone,
      role: 'patient',
      permissions: ['patient.own.*'],
    },
  });
});

// Current User info
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, error: 'Invalid session' });
  }

  return res.json({ success: true, user });
});

export default router;
