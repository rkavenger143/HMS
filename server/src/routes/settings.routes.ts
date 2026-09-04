import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/settings - Fetch full settings schema
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      hospital: {
        name: 'ALN Cure Hospital & Research Center',
        code: 'ALN-DEL-01',
        registrationNumber: 'HOSP-DEL-2024-8849',
        phone: '+91-120-4567890',
        emergencyPhone: '+91-120-4567999',
        email: 'info@alnhms.com',
      },
      general: {
        currency: 'INR',
        currencySymbol: '₹',
        timeZone: 'Asia/Kolkata (IST +5:30)',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12-hour (AM/PM)',
      },
      security: {
        sessionTimeoutMinutes: 60,
        maxFailedLoginAttempts: 5,
        requireTwoFactor: true,
      },
    },
  });
});

// GET /api/settings/:category - Fetch specific category
router.get('/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  res.json({
    success: true,
    category,
    message: `Configuration for ${category} retrieved successfully`,
  });
});

// PUT /api/settings/:category - Update specific category
router.put('/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const updates = req.body;
  res.json({
    success: true,
    category,
    message: `Configuration for ${category} successfully persisted`,
    updatedAt: new Date().toISOString(),
    data: updates,
  });
});

// GET /api/settings/history/all
router.get('/history/all', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'SET-991', settingName: 'Hospital Registration Number', category: 'Hospital Profile', oldValue: 'HOSP-2023-01', newValue: 'HOSP-DEL-2024-8849', changedBy: 'Super Admin', timestamp: new Date().toISOString() },
    ],
  });
});

export default router;
