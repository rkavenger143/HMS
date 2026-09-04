import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import patientsRoutes from './routes/patients.routes';
import doctorsRoutes from './routes/doctors.routes';
import appointmentsRoutes from './routes/appointments.routes';
import opdRoutes from './routes/opd.routes';
import ipdRoutes from './routes/ipd.routes';
import laboratoryRoutes from './routes/laboratory.routes';
import radiologyRoutes from './routes/radiology.routes';
import pharmacyRoutes from './routes/pharmacy.routes';
import billingRoutes from './routes/billing.routes';
import bloodBankRoutes from './routes/bloodBank.routes';
import ambulanceRoutes from './routes/ambulance.routes';
import dietRoutes from './routes/diet.routes';
import nursingRoutes from './routes/nursing.routes';
import dashboardRoutes from './routes/dashboard.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';
import settingsRoutes from './routes/settings.routes';

import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ---- Security & Logging Middleware ----
app.use(helmet());
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- API Routes Mount ----
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/opd', opdRoutes);
app.use('/api/ipd', ipdRoutes);
app.use('/api/nursing', nursingRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/radiology', radiologyRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/blood-bank', bloodBankRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// ---- Global Error Handling ----
app.use(errorHandler);

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 ALN Cure HMS Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Connected with Supabase Client & PostgreSQL Ready`);
  console.log(`====================================================`);
});

export default app;
