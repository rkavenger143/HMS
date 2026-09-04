-- ============================================================
-- ALN CURE HOSPITAL MANAGEMENT SYSTEM (HMS)
-- Complete Supabase PostgreSQL Schema & Seed Data
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUMS & DOMAINS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin', 'hospital_admin', 'receptionist', 'doctor',
    'nurse', 'dietitian', 'lab_technician', 'radiology_technician',
    'pharmacist', 'billing_staff', 'insurance_coordinator',
    'ambulance_staff', 'blood_bank_staff', 'patient', 'management'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_type AS ENUM ('opd', 'follow_up', 'emergency', 'teleconsult');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE bed_type AS ENUM ('general', 'private', 'semi_private', 'icu', 'nicu', 'picu', 'emergency');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE admission_status AS ENUM ('active', 'discharged', 'transferred', 'ama', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lab_test_status AS ENUM ('ordered', 'sample_collected', 'processing', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('routine', 'urgent', 'stat');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE radiology_modality AS ENUM ('xray', 'ecg', 'ultrasound', 'ct', 'mri', 'mammography', 'dexa');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE radiology_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_mode AS ENUM ('cash', 'card', 'upi', 'insurance', 'tpa', 'cheque', 'online');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE bill_status AS ENUM ('draft', 'pending', 'partial', 'paid', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'settled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ambulance_status AS ENUM ('pending', 'dispatched', 'en_route', 'arrived', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE emergency_priority AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  head VARCHAR(255),
  head_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL,
  avatar TEXT,
  department VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  password_hash TEXT,
  permissions TEXT[] DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(64) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  blood_group blood_group_type NOT NULL,
  allergies TEXT[] DEFAULT '{}',
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  insurance JSONB DEFAULT NULL,
  aadhaar VARCHAR(50),
  photo TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCTORS
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  qualifications TEXT[] DEFAULT '{}',
  experience INT DEFAULT 0,
  department VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) NOT NULL,
  avatar TEXT,
  consultation_fee NUMERIC(10, 2) DEFAULT 0.00,
  is_available BOOLEAN DEFAULT TRUE,
  schedule JSONB DEFAULT '[]'::jsonb,
  opd_schedule JSONB DEFAULT '{}'::jsonb,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE RESTRICT,
  doctor_name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  type appointment_type NOT NULL DEFAULT 'opd',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  token_number INT NOT NULL DEFAULT 1,
  consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  chief_complaint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OPD CONSULTATIONS
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(64) PRIMARY KEY,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  chief_complaint TEXT NOT NULL,
  history TEXT,
  examination TEXT,
  diagnosis TEXT[] DEFAULT '{}',
  icd_codes TEXT[] DEFAULT '{}',
  prescription JSONB DEFAULT '[]'::jsonb,
  lab_orders JSONB DEFAULT '[]'::jsonb,
  radiology_orders JSONB DEFAULT '[]'::jsonb,
  vitals JSONB DEFAULT '{}'::jsonb,
  ai_draft_note TEXT,
  ai_approved BOOLEAN DEFAULT FALSE,
  ai_approved_by VARCHAR(64),
  ai_approved_at TIMESTAMPTZ,
  notes TEXT,
  follow_up_date DATE,
  follow_up_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WARDS & BEDS
CREATE TABLE IF NOT EXISTS wards (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  type bed_type NOT NULL,
  total_beds INT NOT NULL DEFAULT 0,
  available_beds INT NOT NULL DEFAULT 0,
  incharge_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beds (
  id VARCHAR(64) PRIMARY KEY,
  bed_number VARCHAR(50) NOT NULL,
  ward VARCHAR(255) NOT NULL,
  ward_id VARCHAR(64) REFERENCES wards(id) ON DELETE CASCADE,
  floor INT NOT NULL DEFAULT 1,
  type bed_type NOT NULL,
  status bed_status NOT NULL DEFAULT 'available',
  current_patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE SET NULL,
  current_admission_id VARCHAR(64),
  daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IPD ADMISSIONS
CREATE TABLE IF NOT EXISTS admissions (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE RESTRICT,
  patient_name VARCHAR(255) NOT NULL,
  admitting_doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE RESTRICT,
  admitting_doctor_name VARCHAR(255) NOT NULL,
  bed_id VARCHAR(64) REFERENCES beds(id) ON DELETE RESTRICT,
  bed_number VARCHAR(50) NOT NULL,
  ward VARCHAR(255) NOT NULL,
  admission_date DATE NOT NULL,
  admission_time VARCHAR(50) NOT NULL,
  discharge_date DATE,
  discharge_time VARCHAR(50),
  status admission_status NOT NULL DEFAULT 'active',
  diagnosis TEXT[] DEFAULT '{}',
  admission_notes TEXT,
  attendant_name VARCHAR(255),
  attendant_phone VARCHAR(50),
  attendant_relation VARCHAR(100),
  referred_by VARCHAR(255),
  mlc BOOLEAN DEFAULT FALSE,
  discharge_type VARCHAR(50),
  discharge_summary JSONB,
  ai_discharge_draft TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY NOTES (DOCTOR ROUNDS / NURSING)
CREATE TABLE IF NOT EXISTS daily_notes (
  id VARCHAR(64) PRIMARY KEY,
  admission_id VARCHAR(64) REFERENCES admissions(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note_type VARCHAR(50) NOT NULL,
  author_id VARCHAR(64) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  vitals JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LABORATORY TESTS CATALOG
CREATE TABLE IF NOT EXISTS lab_tests (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sample_type VARCHAR(100) NOT NULL,
  normal_range TEXT,
  unit VARCHAR(50),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  turnaround_hours INT DEFAULT 24,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LAB REQUESTS & RESULTS
CREATE TABLE IF NOT EXISTS lab_requests (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE RESTRICT,
  doctor_name VARCHAR(255) NOT NULL,
  consultation_id VARCHAR(64) REFERENCES consultations(id) ON DELETE SET NULL,
  admission_id VARCHAR(64) REFERENCES admissions(id) ON DELETE SET NULL,
  request_date TIMESTAMPTZ DEFAULT NOW(),
  tests JSONB DEFAULT '[]'::jsonb,
  priority priority_level NOT NULL DEFAULT 'routine',
  status lab_test_status NOT NULL DEFAULT 'ordered',
  sample_collected_at TIMESTAMPTZ,
  collected_by VARCHAR(255),
  results JSONB DEFAULT '[]'::jsonb,
  ai_insight TEXT,
  ai_insight_approved BOOLEAN DEFAULT FALSE,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RADIOLOGY STUDIES
CREATE TABLE IF NOT EXISTS radiology_studies (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE RESTRICT,
  doctor_name VARCHAR(255) NOT NULL,
  modality radiology_modality NOT NULL,
  body_part VARCHAR(255) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(50) NOT NULL,
  status radiology_status NOT NULL DEFAULT 'scheduled',
  technician_id VARCHAR(64),
  radiologist_id VARCHAR(64),
  radiologist_name VARCHAR(255),
  clinical_history TEXT,
  findings_text TEXT,
  impression_text TEXT,
  image_files TEXT[] DEFAULT '{}',
  report_url TEXT,
  ai_draft_report TEXT,
  ai_report_approved BOOLEAN DEFAULT FALSE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  consultation_id VARCHAR(64),
  admission_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHARMACY INVENTORY & MEDICINES
CREATE TABLE IF NOT EXISTS medicines (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  form VARCHAR(100) NOT NULL,
  strength VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  hsn_code VARCHAR(50),
  prescription_required BOOLEAN DEFAULT TRUE,
  batches JSONB DEFAULT '[]'::jsonb,
  reorder_level INT NOT NULL DEFAULT 50,
  current_stock INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHARMACY DISPENSING
CREATE TABLE IF NOT EXISTS dispensing_records (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  prescription_id VARCHAR(64),
  doctor_id VARCHAR(64),
  doctor_name VARCHAR(255),
  dispensed_by VARCHAR(255) NOT NULL,
  dispensed_at TIMESTAMPTZ DEFAULT NOW(),
  items JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10, 2) DEFAULT 0.00,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_mode payment_mode NOT NULL DEFAULT 'cash',
  status VARCHAR(50) NOT NULL DEFAULT 'dispensed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BILLING & INVOICING
CREATE TABLE IF NOT EXISTS bills (
  id VARCHAR(64) PRIMARY KEY,
  bill_number VARCHAR(100) NOT NULL UNIQUE,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE RESTRICT,
  patient_name VARCHAR(255) NOT NULL,
  admission_id VARCHAR(64) REFERENCES admissions(id) ON DELETE SET NULL,
  consultation_id VARCHAR(64) REFERENCES consultations(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  balance_due NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status bill_status NOT NULL DEFAULT 'pending',
  payments JSONB DEFAULT '[]'::jsonb,
  insurance_claim JSONB,
  notes TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIET CHARTS
CREATE TABLE IF NOT EXISTS diet_charts (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  admission_id VARCHAR(64) REFERENCES admissions(id) ON DELETE CASCADE,
  bed_id VARCHAR(64),
  prescribed_by VARCHAR(64) NOT NULL,
  prescribed_by_name VARCHAR(255) NOT NULL,
  dietitian_name VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE,
  diet_type VARCHAR(100) NOT NULL,
  restrictions TEXT[] DEFAULT '{}',
  meals JSONB DEFAULT '[]'::jsonb,
  calorie_target INT,
  protein NUMERIC(6, 2),
  carbohydrates NUMERIC(6, 2),
  fat NUMERIC(6, 2),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  ai_draft_plan TEXT,
  ai_plan_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLOOD BANK
CREATE TABLE IF NOT EXISTS blood_stock (
  blood_group blood_group_type PRIMARY KEY,
  units INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blood_donors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  blood_group blood_group_type NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  date_of_birth DATE NOT NULL,
  last_donation_date DATE,
  total_donations INT NOT NULL DEFAULT 0,
  is_eligible BOOLEAN DEFAULT TRUE,
  address TEXT NOT NULL,
  notes TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- AMBULANCE / EMERGENCY
CREATE TABLE IF NOT EXISTS ambulance_requests (
  id VARCHAR(64) PRIMARY KEY,
  requested_by VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_coordinates JSONB,
  patient_condition TEXT NOT NULL,
  priority emergency_priority NOT NULL DEFAULT 'high',
  status ambulance_status NOT NULL DEFAULT 'pending',
  assigned_ambulance_id VARCHAR(64),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  estimated_arrival VARCHAR(50),
  dispatched_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  recipient_id VARCHAR(64) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(50) NOT NULL DEFAULT 'in_app',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  metadata JSONB
);

-- ============================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_bills_patient ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_lab_requests_patient ON lab_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_radiology_patient ON radiology_studies(patient_id);

-- ============================================================
-- 4. SEED DATA
-- ============================================================

-- DEPARTMENTS SEED
INSERT INTO departments (id, name, code, head, head_name, phone, email, location, is_active)
VALUES
  ('dept-001', 'General Medicine', 'GEN_MED', 'u-003', 'Dr. Rajesh Sharma', '+91 98765 00001', 'genmed@alnhms.com', 'Block A, 1st Floor', true),
  ('dept-002', 'Cardiology', 'CARDIO', 'u-004', 'Dr. Sneha Patel', '+91 98765 00002', 'cardio@alnhms.com', 'Block B, 2nd Floor', true),
  ('dept-003', 'Orthopaedics', 'ORTHO', 'u-005', 'Dr. Amit Verma', '+91 98765 00003', 'ortho@alnhms.com', 'Block A, 2nd Floor', true),
  ('dept-004', 'Paediatrics', 'PAED', 'u-012', 'Dr. Priya Nair', '+91 98765 00004', 'paed@alnhms.com', 'Block C, Ground Floor', true),
  ('dept-005', 'Gynaecology & Obstetrics', 'OBGYN', 'u-013', 'Dr. Ananya Roy', '+91 98765 00005', 'obgyn@alnhms.com', 'Block C, 1st Floor', true),
  ('dept-006', 'Neurology', 'NEURO', 'u-014', 'Dr. Vikram Seth', '+91 98765 00006', 'neuro@alnhms.com', 'Block B, 3rd Floor', true),
  ('dept-007', 'Emergency Medicine', 'EMERG', 'u-015', 'Dr. Kiran Rao', '+91 98765 00007', 'emergency@alnhms.com', 'Block A, Ground Floor', true)
ON CONFLICT (id) DO NOTHING;

-- BLOOD STOCK SEED
INSERT INTO blood_stock (blood_group, units) VALUES
  ('A+', 24), ('A-', 8), ('B+', 32), ('B-', 6),
  ('AB+', 14), ('AB-', 4), ('O+', 45), ('O-', 11)
ON CONFLICT (blood_group) DO UPDATE SET units = EXCLUDED.units;

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiology_studies ENABLE ROW LEVEL SECURITY;

-- Base Policies allowing public reading for authenticated / anon in demo mode
CREATE POLICY "Allow public read access for all tables" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access for patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow public read access for doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read access for appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow public read access for consultations" ON consultations FOR ALL USING (true);
CREATE POLICY "Allow public read access for admissions" ON admissions FOR ALL USING (true);
CREATE POLICY "Allow public read access for bills" ON bills FOR ALL USING (true);
CREATE POLICY "Allow public read access for lab_requests" ON lab_requests FOR ALL USING (true);
CREATE POLICY "Allow public read access for radiology_studies" ON radiology_studies FOR ALL USING (true);
