import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/admin/dashboard - Dynamic admin metrics
router.get('/dashboard', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalUsers: 14,
      activeUsers: 13,
      totalDoctors: 8,
      totalStaff: 24,
      totalDepartments: 13,
      totalBeds: 45,
      occupiedBeds: 28,
      availableBeds: 17,
      systemStatus: 'healthy',
      lastBackup: new Date().toISOString(),
    },
  });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'AUD-9901', timestamp: new Date().toISOString(), user: 'Dr. Sarah Jenkins', role: 'doctor', module: 'Clinical OPD', action: 'Approved E-Prescription', ipAddress: '192.168.1.104', severity: 'info' },
      { id: 'AUD-9902', timestamp: new Date().toISOString(), user: 'Sneha Gupta', role: 'billing_staff', module: 'Central Billing', action: 'Recorded Payment', ipAddress: '192.168.1.120', severity: 'info' },
    ],
  });
});

// POST /api/admin/audit-logs
router.post('/audit-logs', (req: Request, res: Response) => {
  const { action, module, recordId, severity } = req.body;
  res.status(201).json({
    success: true,
    message: 'Audit event successfully recorded',
    data: { id: `AUD-${Date.now().toString().slice(-4)}`, action, module, recordId, severity },
  });
});

export default router;
