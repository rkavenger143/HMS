// ============================================================
// ALN Cure HMS — Demo Seed Data
// ============================================================

import type {
  User, Patient, Doctor, Appointment, Consultation, Admission, Bed, Ward,
  LabTest, LabRequest, RadiologyStudy, Medicine, Dispensing, Bill,
  DietChart, AmbulanceRequest, BloodStock, BloodDonor, Notification, Department,
  DashboardStats
} from '../types';

// ---- USERS ----
export const DEMO_USERS: User[] = [
  {
    id: 'u-001', name: 'Dr. Arvind Mehta', email: 'admin@alnhms.com', role: 'super_admin',
    department: 'Administration', phone: '9876543200', isActive: true,
    createdAt: '2024-01-01', lastLogin: '2026-08-31T10:00:00',
    permissions: ['*']
  },
  {
    id: 'u-002', name: 'Priya Sharma', email: 'hadmin@alnhms.com', role: 'hospital_admin',
    department: 'Administration', phone: '9876543201', isActive: true,
    createdAt: '2024-01-15', lastLogin: '2026-08-31T09:30:00',
    permissions: ['patients.*', 'doctors.*', 'staff.*', 'reports.*', 'admin.*']
  },
  {
    id: 'u-003', name: 'Dr. Rajesh Kumar', email: 'dr.rajesh@alnhms.com', role: 'doctor',
    department: 'Cardiology', phone: '9876543202', isActive: true,
    createdAt: '2024-02-01', lastLogin: '2026-08-31T08:00:00',
    permissions: ['patients.view', 'opd.*', 'ipd.*', 'lab.order', 'radiology.order', 'prescriptions.*']
  },
  {
    id: 'u-004', name: 'Dr. Sneha Patel', email: 'dr.sneha@alnhms.com', role: 'doctor',
    department: 'General Medicine', phone: '9876543203', isActive: true,
    createdAt: '2024-02-15', lastLogin: '2026-08-31T07:45:00',
    permissions: ['patients.view', 'opd.*', 'ipd.*', 'lab.order', 'radiology.order', 'prescriptions.*']
  },
  {
    id: 'u-005', name: 'Dr. Amit Singh', email: 'dr.amit@alnhms.com', role: 'doctor',
    department: 'Orthopedics', phone: '9876543204', isActive: true,
    createdAt: '2024-03-01', lastLogin: '2026-08-30T18:00:00',
    permissions: ['patients.view', 'opd.*', 'ipd.*', 'lab.order', 'radiology.order', 'prescriptions.*']
  },
  {
    id: 'u-006', name: 'Kavitha Nair', email: 'nurse@alnhms.com', role: 'nurse',
    department: 'General Ward', phone: '9876543205', isActive: true,
    createdAt: '2024-03-15', lastLogin: '2026-08-31T07:00:00',
    permissions: ['patients.view', 'ipd.nursing', 'vitals.*', 'medications.view']
  },
  {
    id: 'u-007', name: 'Rajan Tiwari', email: 'receptionist@alnhms.com', role: 'receptionist',
    department: 'Front Desk', phone: '9876543206', isActive: true,
    createdAt: '2024-04-01', lastLogin: '2026-08-31T08:30:00',
    permissions: ['patients.*', 'appointments.*', 'billing.view']
  },
  {
    id: 'u-008', name: 'Meena Joshi', email: 'pharma@alnhms.com', role: 'pharmacist',
    department: 'Pharmacy', phone: '9876543207', isActive: true,
    createdAt: '2024-04-15', lastLogin: '2026-08-31T09:00:00',
    permissions: ['pharmacy.*', 'prescriptions.view', 'billing.pharmacy']
  },
  {
    id: 'u-009', name: 'Suresh Reddy', email: 'lab@alnhms.com', role: 'lab_technician',
    department: 'Laboratory', phone: '9876543208', isActive: true,
    createdAt: '2024-05-01', lastLogin: '2026-08-31T08:00:00',
    permissions: ['lab.*', 'patients.view']
  },
  {
    id: 'u-010', name: 'Anita Verma', email: 'billing@alnhms.com', role: 'billing_staff',
    department: 'Billing & Accounts', phone: '9876543209', isActive: true,
    createdAt: '2024-05-15', lastLogin: '2026-08-31T09:15:00',
    permissions: ['billing.*', 'patients.view', 'reports.billing']
  },
  {
    id: 'u-011', name: 'Dr. Leela Krishnan', email: 'dietitian@alnhms.com', role: 'dietitian',
    department: 'Dietetics', phone: '9876543210', isActive: true,
    createdAt: '2024-06-01', lastLogin: '2026-08-31T09:00:00',
    permissions: ['diet.*', 'patients.view', 'ipd.view']
  },
];

// ---- DEPARTMENTS ----
export const DEMO_DEPARTMENTS: Department[] = [
  { id: 'd-001', name: 'General Medicine', code: 'GM', head: 'u-004', headName: 'Dr. Sneha Patel', phone: '0120-4001', isActive: true },
  { id: 'd-002', name: 'Cardiology', code: 'CARD', head: 'u-003', headName: 'Dr. Rajesh Kumar', phone: '0120-4002', isActive: true },
  { id: 'd-003', name: 'Orthopedics', code: 'ORTHO', head: 'u-005', headName: 'Dr. Amit Singh', phone: '0120-4003', isActive: true },
  { id: 'd-004', name: 'Pediatrics', code: 'PED', isActive: true },
  { id: 'd-005', name: 'Gynecology & Obstetrics', code: 'GYNO', isActive: true },
  { id: 'd-006', name: 'Neurology', code: 'NEURO', isActive: true },
  { id: 'd-007', name: 'Dermatology', code: 'DERM', isActive: true },
  { id: 'd-008', name: 'ENT', code: 'ENT', isActive: true },
  { id: 'd-009', name: 'Ophthalmology', code: 'OPHTHO', isActive: true },
  { id: 'd-010', name: 'Pulmonology', code: 'PULM', isActive: true },
  { id: 'd-011', name: 'Gastroenterology', code: 'GASTRO', isActive: true },
  { id: 'd-012', name: 'Urology', code: 'URO', isActive: true },
  { id: 'd-013', name: 'Psychiatry', code: 'PSYCH', isActive: true },
  { id: 'd-014', name: 'Emergency Medicine', code: 'EM', isActive: true },
  { id: 'd-015', name: 'Oncology', code: 'ONCO', isActive: true },
  { id: 'd-016', name: 'Laboratory', code: 'LAB', isActive: true },
  { id: 'd-017', name: 'Radiology', code: 'RAD', isActive: true },
  { id: 'd-018', name: 'Pharmacy', code: 'PHR', isActive: true },
  { id: 'd-019', name: 'Dietetics', code: 'DIET', isActive: true },
  { id: 'd-020', name: 'Physiotherapy', code: 'PHYSIO', isActive: true },
];

// ---- DOCTORS ----
export const DEMO_DOCTORS: Doctor[] = [
  {
    id: 'doc-001', userId: 'u-003', name: 'Dr. Rajesh Kumar', specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)'], experience: 18,
    department: 'Cardiology', phone: '9876543202', email: 'dr.rajesh@alnhms.com',
    registrationNumber: 'MCI-12345', consultationFee: 800, isAvailable: true,
    bio: 'Senior Cardiologist with 18 years experience in interventional cardiology and heart failure management.',
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
      { day: 'wednesday', startTime: '14:00', endTime: '18:00', maxPatients: 20, isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
    ]
  },
  {
    id: 'doc-002', userId: 'u-004', name: 'Dr. Sneha Patel', specialization: 'General Medicine',
    qualifications: ['MBBS', 'MD (General Medicine)'], experience: 12,
    department: 'General Medicine', phone: '9876543203', email: 'dr.sneha@alnhms.com',
    registrationNumber: 'MCI-23456', consultationFee: 600, isAvailable: true,
    bio: 'Expert in internal medicine, infectious diseases, and diabetes management.',
    schedule: [
      { day: 'monday', startTime: '08:00', endTime: '14:00', maxPatients: 30, isAvailable: true },
      { day: 'tuesday', startTime: '08:00', endTime: '14:00', maxPatients: 30, isAvailable: true },
      { day: 'wednesday', startTime: '08:00', endTime: '14:00', maxPatients: 30, isAvailable: true },
      { day: 'thursday', startTime: '08:00', endTime: '14:00', maxPatients: 30, isAvailable: true },
      { day: 'friday', startTime: '08:00', endTime: '14:00', maxPatients: 30, isAvailable: true },
      { day: 'saturday', startTime: '09:00', endTime: '12:00', maxPatients: 15, isAvailable: true },
    ]
  },
  {
    id: 'doc-003', userId: 'u-005', name: 'Dr. Amit Singh', specialization: 'Orthopedics',
    qualifications: ['MBBS', 'MS (Orthopedics)', 'Fellowship in Spine Surgery'], experience: 15,
    department: 'Orthopedics', phone: '9876543204', email: 'dr.amit@alnhms.com',
    registrationNumber: 'MCI-34567', consultationFee: 700, isAvailable: true,
    bio: 'Specialist in joint replacement, spine surgery, and sports injuries.',
    schedule: [
      { day: 'monday', startTime: '10:00', endTime: '14:00', maxPatients: 15, isAvailable: true },
      { day: 'wednesday', startTime: '10:00', endTime: '14:00', maxPatients: 15, isAvailable: true },
      { day: 'friday', startTime: '10:00', endTime: '14:00', maxPatients: 15, isAvailable: true },
    ]
  },
  {
    id: 'doc-004', userId: 'u-004', name: 'Dr. Nisha Gupta', specialization: 'Pediatrics',
    qualifications: ['MBBS', 'MD (Pediatrics)'], experience: 10,
    department: 'Pediatrics', phone: '9876543211', email: 'dr.nisha@alnhms.com',
    registrationNumber: 'MCI-45678', consultationFee: 500, isAvailable: true,
    bio: 'Dedicated pediatrician specializing in neonatology and developmental disorders.',
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', maxPatients: 25, isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', maxPatients: 25, isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', maxPatients: 25, isAvailable: true },
    ]
  },
  {
    id: 'doc-005', userId: 'u-004', name: 'Dr. Pradeep Iyer', specialization: 'Neurology',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Neurology)'], experience: 20,
    department: 'Neurology', phone: '9876543212', email: 'dr.pradeep@alnhms.com',
    registrationNumber: 'MCI-56789', consultationFee: 900, isAvailable: false,
    bio: 'Head of Neurology with expertise in stroke, epilepsy, and movement disorders.',
    schedule: []
  },
];

// ---- PATIENTS ----
export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'ALN-2026-00001', firstName: 'Ramesh', lastName: 'Yadav',
    dateOfBirth: '1978-06-15', gender: 'male', phone: '9123456781',
    email: 'ramesh.yadav@email.com', address: '42, Shivaji Nagar', city: 'Noida',
    state: 'Uttar Pradesh', pincode: '201301', bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContact: { name: 'Sunita Yadav', relationship: 'Wife', phone: '9123456782' },
    registrationDate: '2026-01-10', isActive: true,
    insurance: { provider: 'Star Health', policyNumber: 'SH2024001234', validUpto: '2027-01-09' }
  },
  {
    id: 'ALN-2026-00002', firstName: 'Lakshmi', lastName: 'Krishnan',
    dateOfBirth: '1992-03-22', gender: 'female', phone: '9123456783',
    address: '15, Gandhi Road', city: 'Delhi', state: 'Delhi', pincode: '110001',
    bloodGroup: 'O+', allergies: [],
    emergencyContact: { name: 'Venkat Krishnan', relationship: 'Husband', phone: '9123456784' },
    registrationDate: '2026-02-14', isActive: true,
  },
  {
    id: 'ALN-2026-00003', firstName: 'Vijay', lastName: 'Malhotra',
    dateOfBirth: '1965-11-08', gender: 'male', phone: '9123456785',
    address: '7, Park Avenue', city: 'Gurgaon', state: 'Haryana', pincode: '122001',
    bloodGroup: 'A+', allergies: ['Aspirin'],
    emergencyContact: { name: 'Anjali Malhotra', relationship: 'Daughter', phone: '9123456786' },
    registrationDate: '2026-03-05', isActive: true,
    insurance: { provider: 'Medi Assist', policyNumber: 'MA2024005678', validUpto: '2026-12-31', tpaName: 'Medi Assist India' }
  },
  {
    id: 'ALN-2026-00004', firstName: 'Priya', lastName: 'Sharma',
    dateOfBirth: '1988-07-30', gender: 'female', phone: '9123456787',
    email: 'priya.s@email.com', address: '22, MG Road', city: 'Faridabad',
    state: 'Haryana', pincode: '121001', bloodGroup: 'AB+',
    allergies: ['Latex', 'NSAIDs'],
    emergencyContact: { name: 'Rahul Sharma', relationship: 'Brother', phone: '9123456788' },
    registrationDate: '2026-04-18', isActive: true,
  },
  {
    id: 'ALN-2026-00005', firstName: 'Mohan', lastName: 'Das',
    dateOfBirth: '1950-02-14', gender: 'male', phone: '9876543210',
    address: '8, Nehru Colony', city: 'Noida', state: 'Uttar Pradesh', pincode: '201304',
    bloodGroup: 'O-', allergies: ['Codeine'],
    emergencyContact: { name: 'Ravi Das', relationship: 'Son', phone: '9123456789' },
    registrationDate: '2026-05-22', isActive: true,
  },
  {
    id: 'ALN-2026-00006', firstName: 'Ananya', lastName: 'Singh',
    dateOfBirth: '2010-09-12', gender: 'female', phone: '9123456790',
    address: '55, Sector 18', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301',
    bloodGroup: 'B-', allergies: [],
    emergencyContact: { name: 'Suresh Singh', relationship: 'Father', phone: '9123456791' },
    registrationDate: '2026-06-01', isActive: true,
  },
  {
    id: 'ALN-2026-00007', firstName: 'Deepak', lastName: 'Mehta',
    dateOfBirth: '1972-04-05', gender: 'male', phone: '9123456792',
    address: '101, Lajpat Nagar', city: 'Delhi', state: 'Delhi', pincode: '110024',
    bloodGroup: 'A-', allergies: ['Pollen', 'Dust'],
    emergencyContact: { name: 'Rekha Mehta', relationship: 'Wife', phone: '9123456793' },
    registrationDate: '2026-07-12', isActive: true,
  },
  {
    id: 'ALN-2026-00008', firstName: 'Sunita', lastName: 'Agarwal',
    dateOfBirth: '1980-12-28', gender: 'female', phone: '9123456794',
    address: '33, Civil Lines', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201001',
    bloodGroup: 'AB-', allergies: ['Shellfish'],
    emergencyContact: { name: 'Vikas Agarwal', relationship: 'Husband', phone: '9123456795' },
    registrationDate: '2026-08-01', isActive: true,
  },
];

// ---- WARDS & BEDS ----
export const DEMO_WARDS: Ward[] = [
  { id: 'w-001', name: 'General Ward A', floor: 1, type: 'general', totalBeds: 20, availableBeds: 8, inchargeName: 'Head Nurse Rekha', phone: '0120-5001' },
  { id: 'w-002', name: 'General Ward B', floor: 1, type: 'general', totalBeds: 20, availableBeds: 12, inchargeName: 'Head Nurse Preethi', phone: '0120-5002' },
  { id: 'w-003', name: 'Private Ward', floor: 2, type: 'private', totalBeds: 15, availableBeds: 5, inchargeName: 'Head Nurse Kavitha', phone: '0120-5003' },
  { id: 'w-004', name: 'Semi-Private Ward', floor: 2, type: 'semi_private', totalBeds: 20, availableBeds: 9, inchargeName: 'Head Nurse Suman', phone: '0120-5004' },
  { id: 'w-005', name: 'Medical ICU', floor: 3, type: 'icu', totalBeds: 10, availableBeds: 3, inchargeName: 'Dr. ICU Head Incharge', phone: '0120-5005' },
  { id: 'w-006', name: 'Surgical ICU', floor: 3, type: 'icu', totalBeds: 8, availableBeds: 2, inchargeName: 'Dr. Surgical ICU Head', phone: '0120-5006' },
  { id: 'w-007', name: 'Pediatric Ward', floor: 1, type: 'picu', totalBeds: 10, availableBeds: 6, inchargeName: 'Head Nurse Meena', phone: '0120-5007' },
  { id: 'w-008', name: 'Emergency Ward', floor: 0, type: 'emergency', totalBeds: 12, availableBeds: 4, inchargeName: 'EM Head Nurse', phone: '0120-5008' },
];

export const DEMO_BEDS: Bed[] = [
  // General Ward A
  { id: 'bed-001', bedNumber: 'GA-01', ward: 'General Ward A', wardId: 'w-001', floor: 1, type: 'general', status: 'occupied', currentPatientId: 'ALN-2026-00001', currentAdmissionId: 'adm-001', dailyRate: 800, features: ['TV', 'Call Bell'] },
  { id: 'bed-002', bedNumber: 'GA-02', ward: 'General Ward A', wardId: 'w-001', floor: 1, type: 'general', status: 'available', dailyRate: 800, features: ['TV', 'Call Bell'] },
  { id: 'bed-003', bedNumber: 'GA-03', ward: 'General Ward A', wardId: 'w-001', floor: 1, type: 'general', status: 'occupied', currentPatientId: 'ALN-2026-00003', currentAdmissionId: 'adm-002', dailyRate: 800, features: ['TV', 'Call Bell'] },
  { id: 'bed-004', bedNumber: 'GA-04', ward: 'General Ward A', wardId: 'w-001', floor: 1, type: 'general', status: 'available', dailyRate: 800, features: ['TV', 'Call Bell'] },
  { id: 'bed-005', bedNumber: 'GA-05', ward: 'General Ward A', wardId: 'w-001', floor: 1, type: 'general', status: 'maintenance', dailyRate: 800, features: ['TV', 'Call Bell'] },
  // Private Ward
  { id: 'bed-010', bedNumber: 'PR-01', ward: 'Private Ward', wardId: 'w-003', floor: 2, type: 'private', status: 'occupied', currentPatientId: 'ALN-2026-00002', currentAdmissionId: 'adm-003', dailyRate: 3500, features: ['TV', 'AC', 'Sofa', 'Mini Fridge', 'Attached Bath', 'WiFi'] },
  { id: 'bed-011', bedNumber: 'PR-02', ward: 'Private Ward', wardId: 'w-003', floor: 2, type: 'private', status: 'available', dailyRate: 3500, features: ['TV', 'AC', 'Sofa', 'Mini Fridge', 'Attached Bath', 'WiFi'] },
  { id: 'bed-012', bedNumber: 'PR-03', ward: 'Private Ward', wardId: 'w-003', floor: 2, type: 'private', status: 'reserved', dailyRate: 3500, features: ['TV', 'AC', 'Sofa', 'Attached Bath'] },
  // ICU
  { id: 'bed-020', bedNumber: 'MICU-01', ward: 'Medical ICU', wardId: 'w-005', floor: 3, type: 'icu', status: 'occupied', currentPatientId: 'ALN-2026-00007', currentAdmissionId: 'adm-004', dailyRate: 8000, features: ['Ventilator', 'Monitor', 'Infusion Pump'] },
  { id: 'bed-021', bedNumber: 'MICU-02', ward: 'Medical ICU', wardId: 'w-005', floor: 3, type: 'icu', status: 'available', dailyRate: 8000, features: ['Ventilator', 'Monitor', 'Infusion Pump'] },
  { id: 'bed-022', bedNumber: 'MICU-03', ward: 'Medical ICU', wardId: 'w-005', floor: 3, type: 'icu', status: 'occupied', currentPatientId: 'ALN-2026-00004', currentAdmissionId: 'adm-005', dailyRate: 8000, features: ['Ventilator', 'Monitor', 'Infusion Pump'] },
];

// ---- APPOINTMENTS ----
export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav',
    doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar', department: 'Cardiology',
    date: '2026-08-31', time: '09:30', type: 'opd', status: 'completed',
    tokenNumber: 1, consultationFee: 800, chiefComplaint: 'Chest pain and shortness of breath',
    createdAt: '2026-08-30T10:00:00'
  },
  {
    id: 'apt-002', patientId: 'ALN-2026-00002', patientName: 'Lakshmi Krishnan',
    doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel', department: 'General Medicine',
    date: '2026-08-31', time: '10:00', type: 'opd', status: 'waiting',
    tokenNumber: 3, consultationFee: 600, chiefComplaint: 'Fever and body ache for 3 days',
    createdAt: '2026-08-31T08:00:00'
  },
  {
    id: 'apt-003', patientId: 'ALN-2026-00003', patientName: 'Vijay Malhotra',
    doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar', department: 'Cardiology',
    date: '2026-08-31', time: '10:30', type: 'follow_up', status: 'in_progress',
    tokenNumber: 2, consultationFee: 800, chiefComplaint: 'Post-cardiac follow-up',
    createdAt: '2026-08-25T14:00:00'
  },
  {
    id: 'apt-004', patientId: 'ALN-2026-00004', patientName: 'Priya Sharma',
    doctorId: 'doc-003', doctorName: 'Dr. Amit Singh', department: 'Orthopedics',
    date: '2026-08-31', time: '11:00', type: 'opd', status: 'scheduled',
    tokenNumber: 5, consultationFee: 700, chiefComplaint: 'Right knee pain',
    createdAt: '2026-08-28T16:00:00'
  },
  {
    id: 'apt-005', patientId: 'ALN-2026-00005', patientName: 'Mohan Das',
    doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel', department: 'General Medicine',
    date: '2026-08-31', time: '11:30', type: 'opd', status: 'scheduled',
    tokenNumber: 7, consultationFee: 600, chiefComplaint: 'Diabetes check-up',
    createdAt: '2026-08-29T09:00:00'
  },
  {
    id: 'apt-006', patientId: 'ALN-2026-00006', patientName: 'Ananya Singh',
    doctorId: 'doc-004', doctorName: 'Dr. Nisha Gupta', department: 'Pediatrics',
    date: '2026-08-31', time: '10:00', type: 'opd', status: 'waiting',
    tokenNumber: 4, consultationFee: 500, chiefComplaint: 'Cold and cough',
    createdAt: '2026-08-31T09:30:00'
  },
  {
    id: 'apt-007', patientId: 'ALN-2026-00007', patientName: 'Deepak Mehta',
    doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar', department: 'Cardiology',
    date: '2026-09-01', time: '09:00', type: 'opd', status: 'scheduled',
    tokenNumber: 1, consultationFee: 800, chiefComplaint: 'Hypertension review',
    createdAt: '2026-08-30T11:00:00'
  },
  {
    id: 'apt-008', patientId: 'ALN-2026-00008', patientName: 'Sunita Agarwal',
    doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel', department: 'General Medicine',
    date: '2026-08-31', time: '14:00', type: 'opd', status: 'scheduled',
    tokenNumber: 9, consultationFee: 600, chiefComplaint: 'Thyroid follow-up',
    createdAt: '2026-08-29T14:00:00'
  },
];

// ---- ADMISSIONS ----
export const DEMO_ADMISSIONS: Admission[] = [
  {
    id: 'adm-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav',
    admittingDoctorId: 'doc-001', admittingDoctorName: 'Dr. Rajesh Kumar',
    bedId: 'bed-001', bedNumber: 'GA-01', ward: 'General Ward A',
    admissionDate: '2026-08-28', admissionTime: '14:30', status: 'active',
    diagnosis: ['Unstable Angina', 'Hypertension'],
    admissionNotes: 'Patient admitted with chest pain. ECG showing ST changes.',
    attendantName: 'Sunita Yadav', attendantPhone: '9123456782', attendantRelation: 'Wife',
    mlc: false, dailyNotes: [], createdAt: '2026-08-28T14:30:00'
  },
  {
    id: 'adm-002', patientId: 'ALN-2026-00003', patientName: 'Vijay Malhotra',
    admittingDoctorId: 'doc-001', admittingDoctorName: 'Dr. Rajesh Kumar',
    bedId: 'bed-003', bedNumber: 'GA-03', ward: 'General Ward A',
    admissionDate: '2026-08-30', admissionTime: '11:00', status: 'active',
    diagnosis: ['Post CABG Observation', 'Diabetes Mellitus Type 2'],
    admissionNotes: 'Post-operative cardiac surgery observation.',
    attendantName: 'Anjali Malhotra', attendantPhone: '9123456786', attendantRelation: 'Daughter',
    mlc: false, dailyNotes: [], createdAt: '2026-08-30T11:00:00'
  },
  {
    id: 'adm-003', patientId: 'ALN-2026-00002', patientName: 'Lakshmi Krishnan',
    admittingDoctorId: 'doc-002', admittingDoctorName: 'Dr. Sneha Patel',
    bedId: 'bed-010', bedNumber: 'PR-01', ward: 'Private Ward',
    admissionDate: '2026-08-29', admissionTime: '09:00', status: 'active',
    diagnosis: ['Typhoid Fever', 'Dehydration'],
    admissionNotes: 'High grade fever, Widal positive. IV fluids started.',
    attendantName: 'Venkat Krishnan', attendantPhone: '9123456784', attendantRelation: 'Husband',
    mlc: false, dailyNotes: [], createdAt: '2026-08-29T09:00:00'
  },
  {
    id: 'adm-004', patientId: 'ALN-2026-00007', patientName: 'Deepak Mehta',
    admittingDoctorId: 'doc-001', admittingDoctorName: 'Dr. Rajesh Kumar',
    bedId: 'bed-020', bedNumber: 'MICU-01', ward: 'Medical ICU',
    admissionDate: '2026-08-31', admissionTime: '02:15', status: 'active',
    diagnosis: ['Acute MI', 'Cardiogenic Shock'],
    admissionNotes: 'Emergency admission. Thrombolysis given. Hemodynamically unstable.',
    attendantName: 'Rekha Mehta', attendantPhone: '9123456793', attendantRelation: 'Wife',
    mlc: false, dailyNotes: [], createdAt: '2026-08-31T02:15:00'
  },
];

// ---- LAB TESTS ----
export const DEMO_LAB_TESTS: LabTest[] = [
  { id: 'lt-001', name: 'Complete Blood Count (CBC)', category: 'Hematology', sampleType: 'Blood (EDTA)', normalRange: 'See report', unit: '', price: 350, turnaroundHours: 4 },
  { id: 'lt-002', name: 'Blood Glucose - Fasting (FBS)', category: 'Biochemistry', sampleType: 'Blood (Fluoride)', normalRange: '70-100 mg/dL', unit: 'mg/dL', price: 120, turnaroundHours: 2 },
  { id: 'lt-003', name: 'Blood Glucose - Post Prandial (PPBS)', category: 'Biochemistry', sampleType: 'Blood (Fluoride)', normalRange: '<140 mg/dL', unit: 'mg/dL', price: 120, turnaroundHours: 2 },
  { id: 'lt-004', name: 'HbA1c (Glycosylated Hemoglobin)', category: 'Biochemistry', sampleType: 'Blood (EDTA)', normalRange: '<5.7%', unit: '%', price: 650, turnaroundHours: 6 },
  { id: 'lt-005', name: 'Lipid Profile', category: 'Biochemistry', sampleType: 'Blood (Serum)', normalRange: 'See report', unit: 'mg/dL', price: 750, turnaroundHours: 6 },
  { id: 'lt-006', name: 'Liver Function Tests (LFT)', category: 'Biochemistry', sampleType: 'Blood (Serum)', normalRange: 'See report', unit: '', price: 900, turnaroundHours: 6 },
  { id: 'lt-007', name: 'Kidney Function Tests (KFT)', category: 'Biochemistry', sampleType: 'Blood (Serum)', normalRange: 'See report', unit: '', price: 800, turnaroundHours: 6 },
  { id: 'lt-008', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', sampleType: 'Blood (Serum)', normalRange: 'See report', unit: '', price: 1200, turnaroundHours: 12 },
  { id: 'lt-009', name: 'Urine Routine & Microscopy', category: 'Microbiology', sampleType: 'Urine (midstream)', normalRange: 'See report', unit: '', price: 200, turnaroundHours: 3 },
  { id: 'lt-010', name: 'Widal Test', category: 'Serology', sampleType: 'Blood (Serum)', normalRange: 'Negative', unit: '', price: 350, turnaroundHours: 4 },
  { id: 'lt-011', name: 'Dengue NS1 Antigen', category: 'Serology', sampleType: 'Blood (Serum)', normalRange: 'Negative', unit: '', price: 900, turnaroundHours: 6 },
  { id: 'lt-012', name: 'Troponin I (High Sensitivity)', category: 'Cardiac Markers', sampleType: 'Blood (Serum)', normalRange: '<19 ng/L', unit: 'ng/L', price: 1800, turnaroundHours: 1 },
  { id: 'lt-013', name: 'D-Dimer', category: 'Coagulation', sampleType: 'Blood (Citrate)', normalRange: '<500 ng/mL', unit: 'ng/mL', price: 1400, turnaroundHours: 3 },
  { id: 'lt-014', name: 'C-Reactive Protein (CRP)', category: 'Immunology', sampleType: 'Blood (Serum)', normalRange: '<5 mg/L', unit: 'mg/L', price: 500, turnaroundHours: 4 },
  { id: 'lt-015', name: 'Prothrombin Time (PT / INR)', category: 'Coagulation', sampleType: 'Blood (Citrate)', normalRange: 'INR 0.8-1.2', unit: '', price: 450, turnaroundHours: 3 },
];

// ---- LAB REQUESTS ----
export const DEMO_LAB_REQUESTS: LabRequest[] = [
  {
    id: 'lr-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav',
    doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar',
    admissionId: 'adm-001', requestDate: '2026-08-31', priority: 'urgent',
    status: 'completed',
    sampleCollectedAt: '2026-08-31T07:00:00', collectedBy: 'Suresh Reddy',
    tests: [
      { testId: 'lt-012', testName: 'Troponin I (High Sensitivity)', status: 'completed', sampleType: 'Blood (Serum)', price: 1800 },
      { testId: 'lt-001', testName: 'Complete Blood Count (CBC)', status: 'completed', sampleType: 'Blood (EDTA)', price: 350 },
      { testId: 'lt-015', testName: 'Prothrombin Time (PT / INR)', status: 'completed', sampleType: 'Blood (Citrate)', price: 450 },
    ],
    results: [
      { testId: 'lt-012', testName: 'Troponin I (High Sensitivity)', value: '285', unit: 'ng/L', referenceRange: '<19 ng/L', status: 'critical_high', reportedAt: '2026-08-31T08:00:00', reportedBy: 'Suresh Reddy' },
      { testId: 'lt-001', testName: 'CBC - Hemoglobin', value: '11.2', unit: 'g/dL', referenceRange: '13-17 g/dL', status: 'low', reportedAt: '2026-08-31T08:00:00', reportedBy: 'Suresh Reddy' },
      { testId: 'lt-015', testName: 'INR', value: '1.8', unit: '', referenceRange: '0.8-1.2', status: 'high', reportedAt: '2026-08-31T08:00:00', reportedBy: 'Suresh Reddy' },
    ],
    aiInsight: 'Critical elevation of Troponin I (285 ng/L, ref <19 ng/L) is strongly suggestive of acute myocardial injury. Combined with hemoglobin of 11.2 g/dL (mild anemia) and elevated INR (1.8), this patient requires urgent cardiology review. Previous troponin from 2026-08-28 was 45 ng/L — indicating progressive rise. Immediate intervention consideration recommended by treating cardiologist.',
    aiInsightApproved: true,
    totalAmount: 2600
  },
  {
    id: 'lr-002', patientId: 'ALN-2026-00002', patientName: 'Lakshmi Krishnan',
    doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel',
    admissionId: 'adm-003', requestDate: '2026-08-31', priority: 'routine',
    status: 'processing',
    sampleCollectedAt: '2026-08-31T09:00:00', collectedBy: 'Suresh Reddy',
    tests: [
      { testId: 'lt-010', testName: 'Widal Test', status: 'processing', sampleType: 'Blood (Serum)', price: 350 },
      { testId: 'lt-001', testName: 'Complete Blood Count (CBC)', status: 'completed', sampleType: 'Blood (EDTA)', price: 350 },
      { testId: 'lt-014', testName: 'C-Reactive Protein (CRP)', status: 'completed', sampleType: 'Blood (Serum)', price: 500 },
    ],
    results: [
      { testId: 'lt-001', testName: 'CBC - WBC', value: '14500', unit: '/µL', referenceRange: '4000-11000 /µL', status: 'high', reportedAt: '2026-08-31T10:00:00', reportedBy: 'Suresh Reddy' },
      { testId: 'lt-014', testName: 'CRP', value: '42', unit: 'mg/L', referenceRange: '<5 mg/L', status: 'high', reportedAt: '2026-08-31T10:00:00', reportedBy: 'Suresh Reddy' },
    ],
    totalAmount: 1200
  },
  {
    id: 'lr-003', patientId: 'ALN-2026-00005', patientName: 'Mohan Das',
    doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel',
    requestDate: '2026-08-31', priority: 'routine', status: 'sample_collected',
    sampleCollectedAt: '2026-08-31T11:00:00', collectedBy: 'Suresh Reddy',
    tests: [
      { testId: 'lt-002', testName: 'Blood Glucose - Fasting (FBS)', status: 'sample_collected', sampleType: 'Blood (Fluoride)', price: 120 },
      { testId: 'lt-004', testName: 'HbA1c', status: 'sample_collected', sampleType: 'Blood (EDTA)', price: 650 },
      { testId: 'lt-005', testName: 'Lipid Profile', status: 'sample_collected', sampleType: 'Blood (Serum)', price: 750 },
      { testId: 'lt-007', testName: 'Kidney Function Tests (KFT)', status: 'sample_collected', sampleType: 'Blood (Serum)', price: 800 },
    ],
    totalAmount: 2320
  },
];

// ---- RADIOLOGY STUDIES ----
export const DEMO_RADIOLOGY: RadiologyStudy[] = [
  {
    id: 'rad-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav',
    doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar',
    modality: 'xray', bodyPart: 'Chest (PA View)',
    scheduledDate: '2026-08-31', scheduledTime: '08:00',
    status: 'completed', technicianId: 'u-009', radiologistId: 'u-009', radiologistName: 'Dr. Radiology Consultant',
    clinicalHistory: 'Chest pain, ST changes on ECG. Rule out cardiomegaly and pulmonary edema.',
    findingsText: 'Cardiomegaly present. Increased bronchovascular markings bilaterally. No pleural effusion. No pneumothorax.',
    impressionText: 'Cardiomegaly with pulmonary congestion — correlate clinically.',
    aiDraftReport: 'Cardiac silhouette appears enlarged with CTR approximately 0.55. Bilateral hilar haziness and increased bronchovascular markings suggestive of early pulmonary venous hypertension. Costophrenic angles appear clear. No rib fractures or pneumothorax identified.',
    aiReportApproved: true,
    price: 500, admissionId: 'adm-001', createdAt: '2026-08-31T07:30:00'
  },
  {
    id: 'rad-002', patientId: 'ALN-2026-00004', patientName: 'Priya Sharma',
    doctorId: 'doc-003', doctorName: 'Dr. Amit Singh',
    modality: 'xray', bodyPart: 'Right Knee (AP & Lateral)',
    scheduledDate: '2026-08-31', scheduledTime: '10:00',
    status: 'in_progress', price: 400, createdAt: '2026-08-31T09:00:00',
    clinicalHistory: 'Knee pain, difficulty walking.',
  },
  {
    id: 'rad-003', patientId: 'ALN-2026-00002', patientName: 'Lakshmi Krishnan',
    doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel',
    modality: 'ultrasound', bodyPart: 'Abdomen (Whole)',
    scheduledDate: '2026-08-31', scheduledTime: '11:30',
    status: 'scheduled', price: 900, admissionId: 'adm-003', createdAt: '2026-08-31T09:30:00',
    clinicalHistory: 'Typhoid fever, rule out hepatosplenomegaly.',
  },
];

// ---- MEDICINES ----
export const DEMO_MEDICINES: Medicine[] = [
  {
    id: 'med-001', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic',
    manufacturer: 'Sun Pharma', form: 'Tablet', strength: '500mg', unit: 'Tab', price: 3.50, mrp: 5,
    prescriptionRequired: true, reorderLevel: 200, isActive: true,
    batches: [
      { batchNumber: 'B2024001', expiryDate: '2027-06-30', quantity: 450, purchasePrice: 3, sellingPrice: 3.50, receivedDate: '2024-06-01' },
      { batchNumber: 'B2025001', expiryDate: '2028-01-31', quantity: 1000, purchasePrice: 3.2, sellingPrice: 3.50, receivedDate: '2025-01-15' }
    ]
  },
  {
    id: 'med-002', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive',
    manufacturer: 'Cipla', form: 'Tablet', strength: '5mg', unit: 'Tab', price: 4, mrp: 6,
    prescriptionRequired: true, reorderLevel: 150, isActive: true,
    batches: [
      { batchNumber: 'B2024002', expiryDate: '2027-03-31', quantity: 300, purchasePrice: 3.5, sellingPrice: 4, receivedDate: '2024-03-01' }
    ]
  },
  {
    id: 'med-003', name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic/Antipyretic',
    manufacturer: 'GSK', form: 'Tablet', strength: '500mg', unit: 'Tab', price: 1.50, mrp: 2,
    prescriptionRequired: false, reorderLevel: 500, isActive: true,
    batches: [
      { batchNumber: 'B2025002', expiryDate: '2028-06-30', quantity: 2000, purchasePrice: 1.2, sellingPrice: 1.50, receivedDate: '2025-06-01' }
    ]
  },
  {
    id: 'med-004', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', category: 'Statin',
    manufacturer: 'Dr. Reddys', form: 'Tablet', strength: '10mg', unit: 'Tab', price: 6, mrp: 9,
    prescriptionRequired: true, reorderLevel: 200, isActive: true,
    batches: [
      { batchNumber: 'B2024003', expiryDate: '2027-12-31', quantity: 40, purchasePrice: 5, sellingPrice: 6, receivedDate: '2024-12-01' }
    ]
  },
  {
    id: 'med-005', name: 'Ondansetron 4mg', genericName: 'Ondansetron HCl', category: 'Antiemetic',
    manufacturer: 'Zydus', form: 'Tablet', strength: '4mg', unit: 'Tab', price: 8, mrp: 12,
    prescriptionRequired: true, reorderLevel: 100, isActive: true,
    batches: [
      { batchNumber: 'B2025003', expiryDate: '2027-08-31', quantity: 15, purchasePrice: 6, sellingPrice: 8, receivedDate: '2025-08-01' }
    ]
  },
  {
    id: 'med-006', name: 'Cefixime 200mg', genericName: 'Cefixime', category: 'Antibiotic',
    manufacturer: 'Alkem', form: 'Capsule', strength: '200mg', unit: 'Cap', price: 22, mrp: 30,
    prescriptionRequired: true, reorderLevel: 150, isActive: true,
    batches: [
      { batchNumber: 'B2025004', expiryDate: '2027-11-30', quantity: 200, purchasePrice: 18, sellingPrice: 22, receivedDate: '2025-05-01' }
    ]
  },
  {
    id: 'med-007', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic',
    manufacturer: 'Pfizer', form: 'Tablet', strength: '500mg', unit: 'Tab', price: 35, mrp: 50,
    prescriptionRequired: true, reorderLevel: 100, isActive: true,
    batches: [
      { batchNumber: 'B2025005', expiryDate: '2026-09-30', quantity: 25, purchasePrice: 28, sellingPrice: 35, receivedDate: '2025-09-01' }
    ]
  },
  {
    id: 'med-008', name: 'Insulin Regular 40IU/mL', genericName: 'Human Insulin Regular', category: 'Antidiabetic',
    manufacturer: 'Novo Nordisk', form: 'Injection', strength: '40IU/mL', unit: 'Vial', price: 150, mrp: 200,
    prescriptionRequired: true, reorderLevel: 20, isActive: true,
    batches: [
      { batchNumber: 'B2025006', expiryDate: '2027-06-30', quantity: 45, purchasePrice: 130, sellingPrice: 150, receivedDate: '2025-06-01' }
    ]
  },
  {
    id: 'med-009', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'PPI',
    manufacturer: 'Sun Pharma', form: 'Tablet', strength: '40mg', unit: 'Tab', price: 8, mrp: 12,
    prescriptionRequired: true, reorderLevel: 200, isActive: true,
    batches: [
      { batchNumber: 'B2025007', expiryDate: '2028-03-31', quantity: 800, purchasePrice: 6, sellingPrice: 8, receivedDate: '2025-03-01' }
    ]
  },
  {
    id: 'med-010', name: 'Dolo 650mg', genericName: 'Paracetamol 650mg', category: 'Analgesic',
    manufacturer: 'Micro Labs', form: 'Tablet', strength: '650mg', unit: 'Tab', price: 2, mrp: 3,
    prescriptionRequired: false, reorderLevel: 300, isActive: true,
    batches: [
      { batchNumber: 'B2025008', expiryDate: '2028-01-31', quantity: 1200, purchasePrice: 1.5, sellingPrice: 2, receivedDate: '2025-01-01' }
    ]
  },
];

// ---- BILLS ----
export const DEMO_BILLS: Bill[] = [
  {
    id: 'bill-001', billNumber: 'ALN-BILL-2026-001',
    patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav',
    admissionId: 'adm-001', date: '2026-08-31', dueDate: '2026-09-07',
    items: [
      { id: 'bi-001', category: 'consultation', description: 'Cardiology Consultation', quantity: 1, unitPrice: 800, totalPrice: 800, date: '2026-08-31' },
      { id: 'bi-002', category: 'room', description: 'General Ward Bed Charges (3 days)', quantity: 3, unitPrice: 800, totalPrice: 2400, date: '2026-08-31' },
      { id: 'bi-003', category: 'lab', description: 'Troponin I + CBC + PT/INR', quantity: 1, unitPrice: 2600, totalPrice: 2600, date: '2026-08-31' },
      { id: 'bi-004', category: 'radiology', description: 'Chest X-Ray PA View', quantity: 1, unitPrice: 500, totalPrice: 500, date: '2026-08-31' },
    ],
    subtotal: 6300, discount: 300, tax: 0, total: 6000,
    paidAmount: 3000, balanceDue: 3000, status: 'partial',
    payments: [
      { id: 'pay-001', amount: 3000, mode: 'cash', date: '2026-08-28', receivedBy: 'Anita Verma' }
    ],
    createdBy: 'u-010', createdAt: '2026-08-31T10:00:00', updatedAt: '2026-08-31T10:00:00'
  },
  {
    id: 'bill-002', billNumber: 'ALN-BILL-2026-002',
    patientId: 'ALN-2026-00005', patientName: 'Mohan Das',
    date: '2026-08-31', dueDate: '2026-08-31',
    items: [
      { id: 'bi-005', category: 'consultation', description: 'General Medicine OPD', quantity: 1, unitPrice: 600, totalPrice: 600, date: '2026-08-31' },
      { id: 'bi-006', category: 'lab', description: 'FBS + HbA1c + Lipid Profile + KFT', quantity: 1, unitPrice: 2320, totalPrice: 2320, date: '2026-08-31' },
    ],
    subtotal: 2920, discount: 0, tax: 0, total: 2920,
    paidAmount: 2920, balanceDue: 0, status: 'paid',
    payments: [
      { id: 'pay-002', amount: 2920, mode: 'upi', referenceNumber: 'UPI20260831001', date: '2026-08-31', receivedBy: 'Anita Verma' }
    ],
    createdBy: 'u-010', createdAt: '2026-08-31T11:30:00', updatedAt: '2026-08-31T11:30:00'
  },
];

// ---- AMBULANCE REQUESTS ----
export const DEMO_AMBULANCE: AmbulanceRequest[] = [
  {
    id: 'amb-001', requestedBy: 'Rekha Mehta', phone: '9123456793',
    pickupLocation: 'Plot 45, Sector 62, Noida', patientCondition: 'Severe chest pain, difficulty breathing',
    priority: 'critical', status: 'completed',
    driverName: 'Ramkishan', driverPhone: '9876500001',
    dispatchedAt: '2026-08-31T01:55:00', arrivedAt: '2026-08-31T02:10:00',
    completedAt: '2026-08-31T02:20:00', createdAt: '2026-08-31T01:50:00'
  },
  {
    id: 'amb-002', requestedBy: 'Suresh Singh', phone: '9123456791',
    pickupLocation: 'Sector 18 Market, Noida', patientCondition: 'Child with high fever and seizure',
    priority: 'high', status: 'en_route',
    driverName: 'Jagdish', driverPhone: '9876500002',
    dispatchedAt: '2026-08-31T21:45:00', createdAt: '2026-08-31T21:40:00'
  },
];

// ---- BLOOD STOCK ----
export const DEMO_BLOOD_STOCK: BloodStock[] = [
  { bloodGroup: 'A+', units: 12, lastUpdated: '2026-08-31T08:00:00' },
  { bloodGroup: 'A-', units: 3, lastUpdated: '2026-08-31T08:00:00' },
  { bloodGroup: 'B+', units: 18, lastUpdated: '2026-08-31T08:00:00' },
  { bloodGroup: 'B-', units: 2, lastUpdated: '2026-08-31T08:00:00' },
  { bloodGroup: 'AB+', units: 8, lastUpdated: '2026-08-31T08:00:00' },
  { bloodGroup: 'AB-', units: 1, lastUpdated: '2026-08-31T08:00:00' },
  { bloodGroup: 'O+', units: 24, lastUpdated: '2026-08-31T08:00:00' },
  { bloodGroup: 'O-', units: 5, lastUpdated: '2026-08-31T08:00:00' },
];

// ---- NOTIFICATIONS ----
export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001', recipientId: 'u-003', recipientName: 'Dr. Rajesh Kumar',
    type: 'lab_report_ready', title: 'Lab Report Ready',
    message: 'Critical lab results for patient Ramesh Yadav (ALN-2026-00001) — Troponin I elevated.',
    channel: 'in_app', isRead: false, sentAt: '2026-08-31T08:05:00'
  },
  {
    id: 'notif-002', recipientId: 'u-003', recipientName: 'Dr. Rajesh Kumar',
    type: 'appointment_reminder', title: 'Upcoming Appointments',
    message: 'You have 5 OPD patients scheduled today starting at 09:30 AM.',
    channel: 'in_app', isRead: true, sentAt: '2026-08-31T07:00:00', readAt: '2026-08-31T07:30:00'
  },
  {
    id: 'notif-003', recipientId: 'u-007', recipientName: 'Rajan Tiwari',
    type: 'emergency', title: '🚨 Emergency Admission',
    message: 'Patient Deepak Mehta (Acute MI) has been admitted to MICU-01.',
    channel: 'in_app', isRead: false, sentAt: '2026-08-31T02:20:00'
  },
  {
    id: 'notif-004', recipientId: 'u-008', recipientName: 'Meena Joshi',
    type: 'general', title: '⚠️ Low Stock Alert',
    message: '4 medicines are below reorder level: Atorvastatin 10mg, Ondansetron 4mg, Azithromycin 500mg, Insulin Regular.',
    channel: 'in_app', isRead: false, sentAt: '2026-08-31T09:00:00'
  },
];

// ---- DASHBOARD STATS ----
export const DEMO_DASHBOARD_STATS: DashboardStats = {
  totalPatients: 1842,
  todayAppointments: 47,
  waitingPatients: 12,
  availableDoctors: 8,
  opdConsultations: 28,
  ipdAdmissions: 4,
  availableBeds: 38,
  icuBedsAvailable: 5,
  occupiedBeds: 42,
  pendingLabTests: 15,
  pendingRadiologyReports: 6,
  lowStockMedicines: 4,
  expiringMedicines: 2,
  todayRevenue: 125400,
  pendingPayments: 48200,
  insuranceClaims: 7,
  ambulanceRequests: 2,
  emergencyAlerts: 1,
};

// ---- CHART DATA ----
export const DEMO_CHART_DATA = {
  patientRegistrations: [
    { month: 'Mar', count: 142 }, { month: 'Apr', count: 168 }, { month: 'May', count: 195 },
    { month: 'Jun', count: 210 }, { month: 'Jul', count: 188 }, { month: 'Aug', count: 224 },
  ],
  opdVolume: [
    { day: 'Mon', count: 52 }, { day: 'Tue', count: 48 }, { day: 'Wed', count: 61 },
    { day: 'Thu', count: 55 }, { day: 'Fri', count: 58 }, { day: 'Sat', count: 38 }, { day: 'Sun', count: 22 },
  ],
  bedOccupancy: [
    { ward: 'General A', total: 20, occupied: 12 }, { ward: 'General B', total: 20, occupied: 8 },
    { ward: 'Private', total: 15, occupied: 10 }, { ward: 'Semi-Pvt', total: 20, occupied: 11 },
    { ward: 'ICU', total: 18, occupied: 15 }, { ward: 'Pediatric', total: 10, occupied: 4 },
  ],
  revenue: [
    { month: 'Mar', opd: 45000, ipd: 180000, lab: 55000, pharmacy: 38000 },
    { month: 'Apr', opd: 52000, ipd: 195000, lab: 62000, pharmacy: 44000 },
    { month: 'May', opd: 61000, ipd: 210000, lab: 70000, pharmacy: 51000 },
    { month: 'Jun', opd: 58000, ipd: 225000, lab: 68000, pharmacy: 48000 },
    { month: 'Jul', opd: 54000, ipd: 198000, lab: 64000, pharmacy: 46000 },
    { month: 'Aug', opd: 67000, ipd: 240000, lab: 75000, pharmacy: 54000 },
  ],
  appointmentTrends: [
    { date: '25', scheduled: 42, completed: 38, cancelled: 4 },
    { date: '26', scheduled: 48, completed: 44, cancelled: 4 },
    { date: '27', scheduled: 51, completed: 47, cancelled: 4 },
    { date: '28', scheduled: 45, completed: 40, cancelled: 5 },
    { date: '29', scheduled: 38, completed: 35, cancelled: 3 },
    { date: '30', scheduled: 52, completed: 49, cancelled: 3 },
    { date: '31', scheduled: 47, completed: 28, cancelled: 2 },
  ],
  pharmacySales: [
    { category: 'Antibiotics', amount: 18500 }, { category: 'Antidiabetic', amount: 12200 },
    { category: 'Cardiac', amount: 9800 }, { category: 'Analgesics', amount: 6400 },
    { category: 'Others', amount: 7100 },
  ],
};

// ---- DIET CHARTS ----
// ---- AMBULANCE FLEET ----
export interface AmbulanceVehicle {
  id: string; vehicleNumber: string; type: string;
  status: 'available' | 'dispatched' | 'on_duty' | 'maintenance';
  driverName: string; driverPhone: string; lastLocation?: string; currentPatientId?: string;
}

export const DEMO_AMBULANCES: AmbulanceVehicle[] = [
  { id: 'veh-001', vehicleNumber: 'UP16-AB-1234', type: 'Advanced Life Support (ALS)', status: 'available', driverName: 'Ramkishan', driverPhone: '9876500001', lastLocation: 'Hospital Campus' },
  { id: 'veh-002', vehicleNumber: 'UP16-AB-2345', type: 'Basic Life Support (BLS)', status: 'dispatched', driverName: 'Jagdish Prasad', driverPhone: '9876500002', lastLocation: 'Sector 62, Noida', currentPatientId: 'p-002' },
  { id: 'veh-003', vehicleNumber: 'UP16-AB-3456', type: 'Patient Transport Vehicle', status: 'available', driverName: 'Mahesh Kumar', driverPhone: '9876500003', lastLocation: 'Hospital Campus' },
  { id: 'veh-004', vehicleNumber: 'UP16-AB-4567', type: 'Basic Life Support (BLS)', status: 'maintenance', driverName: 'Suresh Yadav', driverPhone: '9876500004' },
  { id: 'veh-005', vehicleNumber: 'UP16-AB-5678', type: 'Advanced Life Support (ALS)', status: 'available', driverName: 'Gopal Das', driverPhone: '9876500005', lastLocation: 'Hospital Campus' },
];

// ---- PRESCRIPTIONS ----
export interface SimplePrescription {
  id: string; patientId: string; patientName: string; doctorId: string; doctorName: string;
  date: string; diagnosis: string; dispensed: boolean;
  medicines: { medicineName: string; dosage: string; frequency: string; duration: string; }[];
}

export const DEMO_PRESCRIPTIONS: SimplePrescription[] = [
  {
    id: 'rx-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav',
    doctorId: 'doc-001', doctorName: 'Dr. Rajesh Kumar',
    date: '2026-08-28', diagnosis: 'Acute Myocardial Infarction',
    dispensed: true,
    medicines: [
      { medicineName: 'Aspirin', dosage: '150mg', frequency: 'Once daily', duration: '30 days' },
      { medicineName: 'Atorvastatin', dosage: '40mg', frequency: 'Once at night', duration: '30 days' },
      { medicineName: 'Metoprolol Succinate', dosage: '25mg', frequency: 'Once daily', duration: '30 days' },
      { medicineName: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily', duration: '30 days' },
    ]
  },
  {
    id: 'rx-002', patientId: 'ALN-2026-00002', patientName: 'Priya Malhotra',
    doctorId: 'doc-002', doctorName: 'Dr. Sneha Patel',
    date: '2026-08-31', diagnosis: 'Type 2 Diabetes Mellitus',
    dispensed: false,
    medicines: [
      { medicineName: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '30 days' },
      { medicineName: 'Glimepiride', dosage: '2mg', frequency: 'Before breakfast', duration: '30 days' },
    ]
  },
  {
    id: 'rx-003', patientId: 'ALN-2026-00003', patientName: 'Arun Kumar Sharma',
    doctorId: 'doc-003', doctorName: 'Dr. Amit Singh',
    date: '2026-08-29', diagnosis: 'Osteoarthritis — Right Knee',
    dispensed: true,
    medicines: [
      { medicineName: 'Diclofenac', dosage: '50mg', frequency: 'Twice daily after meals', duration: '10 days' },
      { medicineName: 'Paracetamol', dosage: '500mg', frequency: 'Thrice daily', duration: '10 days' },
    ]
  },
];

// ---- BLOOD DONORS ----
export const DEMO_BLOOD_BANK = DEMO_BLOOD_STOCK;

export const DEMO_DIET_CHARTS: DietChart[] = [
  {
    id: 'diet-001', patientId: 'ALN-2026-00001', patientName: 'Ramesh Yadav',
    admissionId: 'adm-001', bedId: 'bed-001',
    prescribedBy: 'u-011', prescribedByName: 'Dr. Leela Krishnan',
    startDate: '2026-08-28', dietType: 'Cardiac Diet',
    restrictions: ['Low Sodium', 'Low Fat', 'Penicillin (Note: food allergy n/a)', 'Sulfa Drugs (Note: food allergy n/a)'],
    meals: [
      { mealTime: 'breakfast', items: ['Oats porridge (unsalted)', 'Skimmed milk 200ml', '2 boiled egg whites', '1 orange'], calories: 320, notes: 'No added salt' },
      { mealTime: 'mid_morning', items: ['Coconut water 200ml', '5 almonds'], calories: 120 },
      { mealTime: 'lunch', items: ['Brown rice 1 cup', 'Dal (less salt)', 'Boiled vegetables', 'Curd 100ml', 'Salad'], calories: 450, notes: 'No oily preparations' },
      { mealTime: 'afternoon', items: ['Fruit (apple/pear)', 'Green tea'], calories: 80 },
      { mealTime: 'dinner', items: ['2 Wheat chapati', 'Grilled fish/chicken (low oil)', 'Soup', 'Steamed vegetables'], calories: 380, notes: 'Early dinner by 7 PM' },
    ],
    calorieTarget: 1800, notes: 'Cardiac diet — low sodium (<2g/day), low saturated fat. Avoid fried foods.',
    isActive: true, aiPlanApproved: true,
    createdAt: '2026-08-28T16:00:00', updatedAt: '2026-08-28T16:00:00'
  }
];

// ---- ALIASES & COMPATIBILITY EXPORTS ----
export const DEMO_CONSULTATIONS: Consultation[] = [
  {
    id: 'cons-001',
    appointmentId: 'apt-001',
    patientId: 'ALN-2026-00001',
    doctorId: 'doc-001',
    date: '2026-08-31',
    chiefComplaint: 'Chest tightness, radiating pain to left shoulder and neck',
    history: 'Known case of HTN since 5 years on Telmisartan. Occasional chest discomfort for past 2 weeks.',
    examination: 'Pulse: 92 bpm, BP: 154/96 mmHg, Heart sounds: S1 S2 heard, no murmurs. Lungs clear.',
    diagnosis: ['Acute Coronary Syndrome', 'Essential Hypertension'],
    icdCodes: ['I24.9', 'I10'],
    prescription: [
      { id: 'rx-01', medicineName: 'Aspirin 150mg', dosage: '150mg', frequency: 'Once daily', duration: '30 days', route: 'Oral', quantity: 30 },
      { id: 'rx-02', medicineName: 'Atorvastatin 40mg', dosage: '40mg', frequency: 'Once at bedtime', duration: '30 days', route: 'Oral', quantity: 30 },
      { id: 'rx-03', medicineName: 'Metoprolol 25mg', dosage: '25mg', frequency: 'Once daily', duration: '30 days', route: 'Oral', quantity: 30 }
    ],
    labOrders: [
      { testId: 'lt-012', testName: 'Troponin I (High Sensitivity)', priority: 'urgent' },
      { testId: 'lt-005', testName: 'Lipid Profile', priority: 'routine' }
    ],
    radiologyOrders: [
      { studyType: 'Chest X-Ray (PA)', bodyPart: 'Chest', priority: 'routine' }
    ],
    vitals: { bloodPressure: '154/96', pulse: 92, temperature: 98.4, spo2: 97, respiratoryRate: 18, weight: 74, height: 172, bmi: 25.0 },
    notes: 'Advised immediate admission to cardiac care unit for continuous ECG and enzyme monitoring.',
    aiDraftNote: 'Patient presents with classic anginal symptoms and elevated BP. Strongly advise serial troponins and 12-lead ECG monitoring.',
    aiApproved: true,
    aiApprovedBy: 'u-003',
    aiApprovedAt: '2026-08-31T10:15:00',
    createdAt: '2026-08-31T09:45:00',
    updatedAt: '2026-08-31T10:15:00'
  }
];

export const DEMO_RADIOLOGY_STUDIES = DEMO_RADIOLOGY;

export const DEMO_DISPENSINGS: Dispensing[] = [
  {
    id: 'disp-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    prescriptionId: 'rx-001',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
    dispensedBy: 'Meena Joshi',
    dispensedAt: '2026-08-28T15:00:00',
    items: [
      { medicineId: 'med-004', medicineName: 'Atorvastatin 10mg', batchNumber: 'B2024003', quantity: 30, unitPrice: 6, totalPrice: 180, dosageInstructions: 'Once daily at night' },
      { medicineId: 'med-003', medicineName: 'Paracetamol 500mg', batchNumber: 'B2025002', quantity: 15, unitPrice: 1.5, totalPrice: 22.5, dosageInstructions: 'SOS for fever' }
    ],
    totalAmount: 202.5,
    discount: 0,
    paidAmount: 202.5,
    paymentMode: 'cash',
    status: 'dispensed'
  }
];

export const DEMO_BLOOD_DONORS: BloodDonor[] = [
  {
    id: 'bd-001',
    name: 'Amitabh Sen',
    bloodGroup: 'O+',
    phone: '9876543299',
    email: 'amitabh.sen@email.com',
    dateOfBirth: '1990-05-14',
    lastDonationDate: '2026-06-10',
    totalDonations: 4,
    isEligible: true,
    address: 'B-14, Sector 50, Noida',
    registeredAt: '2025-01-15'
  },
  {
    id: 'bd-002',
    name: 'Ritu Varma',
    bloodGroup: 'A+',
    phone: '9876543288',
    email: 'ritu.v@email.com',
    dateOfBirth: '1994-08-20',
    lastDonationDate: '2026-05-22',
    totalDonations: 2,
    isEligible: true,
    address: 'C-22, Greater Noida',
    registeredAt: '2025-04-10'
  }
];

export const DEMO_STATS = DEMO_DASHBOARD_STATS;
export const DEMO_AMBULANCE_REQUESTS = DEMO_AMBULANCE;

