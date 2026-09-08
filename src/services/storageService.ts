// ============================================================
// ALN Cure HMS — Unified Hospital Data & Synchronization Service
// ============================================================

import type {
  Patient, Doctor, Appointment, Consultation, Admission, Bed, Ward,
  LabRequest, RadiologyStudy, Medicine, Bill, DietChart, Nurse,
  BloodGroup, AdmissionStatus, LabTestStatus, RadiologyStatus,
  RadiologyModality, PaymentMode, BillStatus,
  InsuranceProvider, InsurancePlan, InsuranceAuditLog, PatientInsurancePolicy, PreAuthRequest,
  InsuranceClaimRecord, SettlementRecord, EligibilityVerificationRecord,
  InsuranceDashboardStats
} from '../types';
import {
  DEMO_PATIENTS, DEMO_DOCTORS, DEMO_APPOINTMENTS, DEMO_ADMISSIONS,
  DEMO_BEDS, DEMO_LAB_REQUESTS, DEMO_RADIOLOGY_STUDIES, DEMO_MEDICINES,
  DEMO_BILLS, DEMO_DIET_CHARTS, DEMO_NURSES
} from '../data/seedData';
import {
  DEMO_INSURANCE_PROVIDERS, DEMO_INSURANCE_PLANS, DEMO_INSURANCE_AUDIT_LOGS,
  DEMO_PATIENT_POLICIES, DEMO_PREAUTH_REQUESTS,
  DEMO_CLAIMS, DEMO_SETTLEMENTS, DEMO_ELIGIBILITY_RECORDS
} from '../data/insuranceSeedData';


export interface HospitalActivity {
  id: string;
  type: 'admission' | 'discharge' | 'appointment' | 'diagnostic' | 'prescription' | 'bed_assigned' | 'emergency' | 'insurance';
  title: string;
  description: string;
  timestamp: string;
  patientName?: string;
  patientId?: string;
  department?: string;
  priority?: 'normal' | 'high' | 'critical';
}

export interface CriticalAlert {
  id: string;
  title: string;
  description: string;
  category: 'critical_patient' | 'emergency' | 'critical_lab' | 'low_bed' | 'pharmacy_stock' | 'insurance_alert';
  severity: 'high' | 'critical';
  timestamp: string;
  patientId?: string;
  patientName?: string;
  bedNumber?: string;
  acknowledged?: boolean;
}

const STORAGE_KEYS = {
  PATIENTS: 'aln_hms_patients_v2',
  APPOINTMENTS: 'aln_hms_appointments_v2',
  ADMISSIONS: 'aln_hms_admissions_v2',
  BEDS: 'aln_hms_beds_v2',
  DOCTORS: 'aln_hms_doctors_v2',
  NURSES: 'aln_hms_nurses_v2',
  LAB_REQUESTS: 'aln_hms_lab_requests_v2',
  RADIOLOGY_STUDIES: 'aln_hms_radiology_v2',
  MEDICINES: 'aln_hms_medicines_v2',
  BILLS: 'aln_hms_bills_v2',
  DIET_CHARTS: 'aln_hms_diet_charts_v2',
  ACTIVITIES: 'aln_hms_activities_v2',
  CRITICAL_ALERTS: 'aln_hms_critical_alerts_v2',
  INSURANCE_PROVIDERS: 'aln_hms_insurance_providers_v1',
  INSURANCE_PLANS: 'aln_hms_insurance_plans_v1',
  INSURANCE_AUDIT_LOGS: 'aln_hms_insurance_audit_logs_v1',
  INSURANCE_POLICIES: 'aln_hms_insurance_policies_v1',
  PREAUTH_REQUESTS: 'aln_hms_preauth_requests_v1',
  INSURANCE_CLAIMS: 'aln_hms_insurance_claims_v1',
  SETTLEMENTS: 'aln_hms_settlements_v1',
  ELIGIBILITY_RECORDS: 'aln_hms_eligibility_records_v1',
};


const INITIAL_ACTIVITIES: HospitalActivity[] = [
  {
    id: 'act-1',
    type: 'emergency',
    title: 'Emergency Admission',
    description: 'Deepak Mehta admitted to MICU-01 with acute chest discomfort',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    patientName: 'Deepak Mehta',
    patientId: 'ALN-2026-00007',
    department: 'Cardiology',
    priority: 'critical'
  },
  {
    id: 'act-2',
    type: 'diagnostic',
    title: 'Critical Lab Alert Generated',
    description: 'Elevated Troponin I (4.8 ng/mL) reported for Ramesh Yadav',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    patientName: 'Ramesh Yadav',
    patientId: 'ALN-2026-00001',
    department: 'Biochemistry',
    priority: 'critical'
  },
  {
    id: 'act-3',
    type: 'bed_assigned',
    title: 'Bed Allocated',
    description: 'Suresh Kumar assigned to Ward A, Bed W-A-04',
    timestamp: new Date(Date.now() - 1000 * 60 * 62).toISOString(),
    patientName: 'Suresh Kumar',
    patientId: 'ALN-2026-00003',
    department: 'General Medicine',
    priority: 'normal'
  },
  {
    id: 'act-4',
    type: 'prescription',
    title: 'Prescription Created',
    description: 'Dr. Sneha Patel prescribed 3 medications for Anita Sharma',
    timestamp: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
    patientName: 'Anita Sharma',
    patientId: 'ALN-2026-00004',
    department: 'General Medicine',
    priority: 'normal'
  },
  {
    id: 'act-5',
    type: 'appointment',
    title: 'New Appointment Booked',
    description: 'Mohd. Imran scheduled with Dr. Rajesh Kumar for 11:30 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    patientName: 'Mohd. Imran',
    patientId: 'ALN-2026-00006',
    department: 'Cardiology',
    priority: 'normal'
  },
  {
    id: 'act-6',
    type: 'discharge',
    title: 'Patient Discharged',
    description: 'Vikram Singh successfully discharged following orthopedic recovery',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    patientName: 'Vikram Singh',
    patientId: 'ALN-2026-00005',
    department: 'Orthopedics',
    priority: 'normal'
  }
];

const INITIAL_ALERTS: CriticalAlert[] = [
  {
    id: 'alt-1',
    title: 'Critical Cardiac Patient',
    description: 'Troponin I panic value: 4.8 ng/mL (Normal <0.04) — Immediate cardiology review required',
    category: 'critical_lab',
    severity: 'critical',
    timestamp: '10 mins ago',
    patientId: 'ALN-2026-00001',
    patientName: 'Ramesh Yadav',
    bedNumber: 'MICU-01',
    acknowledged: false
  },
  {
    id: 'alt-2',
    title: 'Emergency Admission — Acute MI',
    description: 'Patient Deepak Mehta received via emergency ambulance triage in MICU-02',
    category: 'emergency',
    severity: 'critical',
    timestamp: '25 mins ago',
    patientId: 'ALN-2026-00007',
    patientName: 'Deepak Mehta',
    bedNumber: 'MICU-02',
    acknowledged: false
  },
  {
    id: 'alt-3',
    title: 'Low Bed Availability Warning',
    description: 'ICU capacity is at 88% (15/18 beds occupied). Only 3 intensive care beds remaining.',
    category: 'low_bed',
    severity: 'high',
    timestamp: '1 hour ago',
    acknowledged: false
  }
];

class StorageService {
  private notifyListeners() {
    window.dispatchEvent(new CustomEvent('hms_storage_updated'));
  }

  // Generic Safe Storage Methods
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notifyListeners();
    } catch (e) {
      console.error(`Error saving to storage key ${key}:`, e);
    }
  }

  // ---- PATIENTS ----
  getPatients(): Patient[] {
    return this.get<Patient[]>(STORAGE_KEYS.PATIENTS, DEMO_PATIENTS);
  }

  addPatient(patient: Partial<Patient>): Patient {
    const list = this.getPatients();
    const newId = `ALN-2026-${String(list.length + 1).padStart(5, '0')}`;
    const newPatient: Patient = {
      id: patient.id || newId,
      firstName: patient.firstName || 'Unknown',
      lastName: patient.lastName || '',
      dateOfBirth: patient.dateOfBirth || '1990-01-01',
      gender: patient.gender || 'other',
      bloodGroup: (patient.bloodGroup as BloodGroup) || 'O+',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      city: patient.city || 'New Delhi',
      state: patient.state || 'Delhi',
      pincode: patient.pincode || '110001',
      emergencyContact: patient.emergencyContact || { name: 'Emergency Contact', relationship: 'Relative', phone: patient.phone || '9876543210' },
      allergies: patient.allergies || [],
      registrationDate: new Date().toISOString(),
      isActive: true,
      insurance: patient.insurance,
      notes: patient.notes || '',
    };
    const updated = [newPatient, ...list];
    this.set(STORAGE_KEYS.PATIENTS, updated);

    this.logActivity({
      type: 'appointment',
      title: 'New Patient Registered',
      description: `${newPatient.firstName} ${newPatient.lastName} registered (ID: ${newPatient.id})`,
      patientId: newPatient.id,
      patientName: `${newPatient.firstName} ${newPatient.lastName}`,
    });

    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const list = this.getPatients();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.set(STORAGE_KEYS.PATIENTS, list);
    return list[idx];
  }

  deletePatient(id: string): boolean {
    const list = this.getPatients();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length !== list.length) {
      this.set(STORAGE_KEYS.PATIENTS, filtered);
      return true;
    }
    return false;
  }

  // ---- APPOINTMENTS ----
  getAppointments(): Appointment[] {
    return this.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
  }

  addAppointment(apt: Partial<Appointment>): Appointment {
    const list = this.getAppointments();
    const newId = `apt-${String(list.length + 1).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysApts = list.filter(a => a.date === (apt.date || todayStr));
    const tokenNumber = apt.tokenNumber || todaysApts.length + 1;

    const newApt: Appointment = {
      id: apt.id || newId,
      patientId: apt.patientId || 'ALN-2026-00001',
      patientName: apt.patientName || 'Walk-in Patient',
      doctorId: apt.doctorId || 'doc-001',
      doctorName: apt.doctorName || 'Dr. Rajesh Kumar',
      department: apt.department || 'Cardiology',
      date: apt.date || todayStr,
      time: apt.time || '10:00',
      type: apt.type || 'opd',
      status: apt.status || 'scheduled',
      tokenNumber,
      chiefComplaint: apt.chiefComplaint || 'General Consultation',
      consultationFee: apt.consultationFee || 600,
      createdAt: new Date().toISOString(),
    };

    const updated = [newApt, ...list];
    this.set(STORAGE_KEYS.APPOINTMENTS, updated);

    this.logActivity({
      type: 'appointment',
      title: 'Appointment Scheduled',
      description: `${newApt.patientName} scheduled with ${newApt.doctorName} at ${newApt.time}`,
      patientId: newApt.patientId,
      patientName: newApt.patientName,
      department: newApt.department,
    });

    return newApt;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const list = this.getAppointments();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.set(STORAGE_KEYS.APPOINTMENTS, list);
    return list[idx];
  }

  deleteAppointment(id: string): boolean {
    const list = this.getAppointments();
    const filtered = list.filter(a => a.id !== id);
    if (filtered.length !== list.length) {
      this.set(STORAGE_KEYS.APPOINTMENTS, filtered);
      return true;
    }
    return false;
  }

  // ---- ADMISSIONS & BEDS ----
  getAdmissions(): Admission[] {
    return this.get<Admission[]>(STORAGE_KEYS.ADMISSIONS, DEMO_ADMISSIONS);
  }

  addAdmission(adm: Partial<Admission>): Admission {
    const list = this.getAdmissions();
    const newId = `adm-${String(list.length + 1).padStart(3, '0')}`;
    const diagnosisList = Array.isArray(adm.diagnosis)
      ? adm.diagnosis
      : typeof adm.diagnosis === 'string'
      ? [adm.diagnosis]
      : ['Observation & Management'];

    const newAdm: Admission = {
      id: adm.id || newId,
      patientId: adm.patientId || 'ALN-2026-00001',
      patientName: adm.patientName || 'Admitted Patient',
      admittingDoctorId: adm.admittingDoctorId || (adm as any).attendingDoctorId || 'doc-001',
      admittingDoctorName: adm.admittingDoctorName || (adm as any).attendingDoctorName || 'Dr. Rajesh Kumar',
      bedId: adm.bedId || 'bed-001',
      bedNumber: adm.bedNumber || 'W-A-01',
      ward: adm.ward || 'General Ward A',
      admissionDate: adm.admissionDate || new Date().toISOString().split('T')[0],
      admissionTime: adm.admissionTime || '10:00 AM',
      status: 'active',
      priority: adm.priority || 'routine',
      condition: adm.condition || 'stable',
      diagnosis: diagnosisList,
      admissionNotes: adm.admissionNotes || 'Admitted for active in-patient clinical management.',
      mlc: adm.mlc || false,
      dailyNotes: adm.dailyNotes || [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newAdm, ...list];
    this.set(STORAGE_KEYS.ADMISSIONS, updated);

    // Update Bed Status to Occupied
    if (newAdm.bedNumber) {
      this.updateBedStatusByNumber(newAdm.bedNumber, 'occupied', newAdm.patientName, newAdm.patientId);
    }

    this.logActivity({
      type: 'admission',
      title: 'Inpatient Admitted',
      description: `${newAdm.patientName} admitted to ${newAdm.ward} (Bed ${newAdm.bedNumber})`,
      patientId: newAdm.patientId,
      patientName: newAdm.patientName,
      priority: newAdm.priority === 'emergency' || newAdm.priority === 'critical' ? 'critical' : 'normal',
    });

    return newAdm;
  }

  dischargeAdmission(id: string): boolean {
    const list = this.getAdmissions();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return false;

    const adm = list[idx];
    adm.status = 'discharged';
    adm.dischargeDate = new Date().toISOString().split('T')[0];
    adm.dischargeTime = '04:00 PM';
    this.set(STORAGE_KEYS.ADMISSIONS, list);

    // Free Bed (set to cleaning)
    if (adm.bedNumber) {
      this.updateBedStatusByNumber(adm.bedNumber, 'cleaning', undefined, undefined);
    }

    this.logActivity({
      type: 'discharge',
      title: 'Patient Discharged',
      description: `${adm.patientName} discharged from ${adm.ward} (Bed ${adm.bedNumber})`,
      patientId: adm.patientId,
      patientName: adm.patientName,
    });

    return true;
  }

  getBeds(): Bed[] {
    return this.get<Bed[]>(STORAGE_KEYS.BEDS, DEMO_BEDS);
  }

  updateBedStatus(bedId: string, status: Bed['status'], patientName?: string, patientId?: string): void {
    const list = this.getBeds();
    const idx = list.findIndex(b => b.id === bedId);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].currentPatientName = patientName;
      list[idx].currentPatientId = patientId;
      this.set(STORAGE_KEYS.BEDS, list);
    }
  }

  updateBedStatusByNumber(bedNumber: string, status: Bed['status'], patientName?: string, patientId?: string): void {
    const list = this.getBeds();
    const idx = list.findIndex(b => b.bedNumber.toLowerCase() === bedNumber.toLowerCase());
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].currentPatientName = patientName;
      list[idx].currentPatientId = patientId;
      this.set(STORAGE_KEYS.BEDS, list);
    }
  }

  assignBed(bedNumber: string, patientName: string, patientId?: string, ward?: string): boolean {
    const list = this.getBeds();
    const idx = list.findIndex(b => b.bedNumber.toLowerCase() === bedNumber.toLowerCase());
    if (idx === -1) return false;

    list[idx].status = 'occupied';
    list[idx].currentPatientName = patientName;
    list[idx].currentPatientId = patientId || 'ALN-2026-00001';
    this.set(STORAGE_KEYS.BEDS, list);

    this.logActivity({
      type: 'bed_assigned',
      title: 'Bed Allocated',
      description: `${patientName} assigned to ${ward || list[idx].ward || 'General Ward'}, Bed ${bedNumber}`,
      patientName,
      patientId: list[idx].currentPatientId,
      department: list[idx].ward,
    });

    return true;
  }

  // ---- DOCTORS & NURSES ----
  getDoctors(): Doctor[] {
    return this.get<Doctor[]>(STORAGE_KEYS.DOCTORS, DEMO_DOCTORS);
  }

  addDoctor(doctor: Partial<Doctor>): Doctor {
    const list = this.getDoctors();
    const newId = `doc-${String(list.length + 1).padStart(3, '0')}`;
    const newDoc: Doctor = {
      id: doctor.id || newId,
      userId: `u-${String(list.length + 10).padStart(3, '0')}`,
      name: doctor.name || 'Dr. Specialist',
      specialization: doctor.specialization || 'General Medicine',
      qualifications: doctor.qualifications || ['MBBS', 'MD'],
      experience: doctor.experience || 5,
      department: doctor.department || 'General Medicine',
      phone: doctor.phone || '9876543210',
      email: doctor.email || 'doctor@alnhms.com',
      registrationNumber: doctor.registrationNumber || `MCI-${Math.floor(10000 + Math.random() * 90000)}`,
      consultationFee: doctor.consultationFee || 600,
      isAvailable: doctor.isAvailable !== undefined ? doctor.isAvailable : true,
      bio: doctor.bio || 'Physician with clinical expertise in hospital healthcare delivery.',
      schedule: doctor.schedule || [
        { day: 'monday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
        { day: 'tuesday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
        { day: 'wednesday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
        { day: 'thursday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
        { day: 'friday', startTime: '09:00', endTime: '13:00', maxPatients: 20, isAvailable: true },
      ]
    };
    const updated = [...list, newDoc];
    this.set(STORAGE_KEYS.DOCTORS, updated);
    return newDoc;
  }

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const list = this.getDoctors();
    const idx = list.findIndex(d => d.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.set(STORAGE_KEYS.DOCTORS, list);
    return list[idx];
  }

  getNurses(): Nurse[] {
    return this.get<Nurse[]>(STORAGE_KEYS.NURSES, DEMO_NURSES);
  }

  updateNurse(id: string, updates: Partial<Nurse>): Nurse | null {
    const list = this.getNurses();
    const idx = list.findIndex(n => n.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.set(STORAGE_KEYS.NURSES, list);
    return list[idx];
  }

  // ---- DIAGNOSTICS (LAB & RADIOLOGY) ----
  getLabRequests(): LabRequest[] {
    return this.get<LabRequest[]>(STORAGE_KEYS.LAB_REQUESTS, DEMO_LAB_REQUESTS);
  }

  addLabRequest(req: Partial<LabRequest>): LabRequest {
    const list = this.getLabRequests();
    const newId = `LR-2026-${String(list.length + 1).padStart(4, '0')}`;
    const formattedTests = (req.tests || [{ testId: 't-001', testName: 'Complete Blood Count (CBC)', status: 'ordered' as LabTestStatus, sampleType: 'Blood', price: 450 }]).map(t => ({
      testId: t.testId || 't-001',
      testName: t.testName || 'Investigation',
      status: (t.status as LabTestStatus) || 'ordered',
      sampleType: t.sampleType || 'Blood',
      price: t.price || 450
    }));

    const newReq: LabRequest = {
      id: req.id || newId,
      patientId: req.patientId || 'ALN-2026-00001',
      patientName: req.patientName || 'Patient',
      doctorId: req.doctorId || 'doc-001',
      doctorName: req.doctorName || 'Dr. Rajesh Kumar',
      tests: formattedTests,
      priority: req.priority || 'routine',
      status: req.status || 'ordered',
      requestDate: req.requestDate || new Date().toISOString(),
      totalAmount: req.totalAmount || formattedTests.reduce((s, t) => s + t.price, 0),
    };
    const updated = [newReq, ...list];
    this.set(STORAGE_KEYS.LAB_REQUESTS, updated);

    this.logActivity({
      type: 'diagnostic',
      title: 'Lab Investigation Ordered',
      description: `Test ordered for ${newReq.patientName} (${newReq.tests.map(t => t.testName).join(', ')})`,
      patientId: newReq.patientId,
      patientName: newReq.patientName,
      priority: newReq.priority === 'stat' ? 'critical' : 'normal',
    });

    return newReq;
  }

  getRadiologyStudies(): RadiologyStudy[] {
    return this.get<RadiologyStudy[]>(STORAGE_KEYS.RADIOLOGY_STUDIES, DEMO_RADIOLOGY_STUDIES);
  }

  addRadiologyStudy(study: Partial<RadiologyStudy>): RadiologyStudy {
    const list = this.getRadiologyStudies();
    const newId = `RAD-2026-${String(list.length + 1).padStart(4, '0')}`;
    const newStudy: RadiologyStudy = {
      id: study.id || newId,
      patientId: study.patientId || 'ALN-2026-00001',
      patientName: study.patientName || 'Patient',
      doctorId: study.doctorId || 'doc-001',
      doctorName: study.doctorName || 'Dr. Rajesh Kumar',
      modality: (study.modality as RadiologyModality) || 'xray',
      bodyPart: study.bodyPart || 'Chest',
      priority: study.priority || 'routine',
      status: (study.status as RadiologyStatus) || 'scheduled',
      scheduledDate: study.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: study.scheduledTime || '11:00 AM',
      price: study.price || 800,
      createdAt: new Date().toISOString(),
    };
    const updated = [newStudy, ...list];
    this.set(STORAGE_KEYS.RADIOLOGY_STUDIES, updated);
    return newStudy;
  }

  // ---- PHARMACY ----
  getMedicines(): Medicine[] {
    return this.get<Medicine[]>(STORAGE_KEYS.MEDICINES, DEMO_MEDICINES);
  }

  updateMedicineStock(id: string, newStock: number): void {
    const list = this.getMedicines();
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx].currentStock = newStock;
      if (list[idx].batches && list[idx].batches.length > 0) {
        list[idx].batches[0].quantity = newStock;
      }
      this.set(STORAGE_KEYS.MEDICINES, list);
    }
  }

  addMedicine(med: Partial<Medicine>): Medicine {
    const list = this.getMedicines();
    const newId = `med-${String(list.length + 1).padStart(3, '0')}`;
    const currentStock = med.currentStock !== undefined ? med.currentStock : (med as any).stock !== undefined ? (med as any).stock : 100;
    const price = med.price || (med as any).unitPrice || 10;
    const mrp = med.mrp || (med as any).sellingPrice || 15;

    const newMed: Medicine = {
      id: med.id || newId,
      name: med.name || 'New Medicine',
      genericName: med.genericName || 'Generic Formulation',
      category: med.category || 'analgesics',
      form: med.form || med.dosageForm || 'tablet',
      strength: med.strength || '500mg',
      unit: med.unit || 'strip',
      price,
      mrp,
      manufacturer: med.manufacturer || 'Sun Pharma',
      batches: med.batches || [
        {
          batchNumber: (med as any).batchNumber || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
          expiryDate: (med as any).expiryDate || '2027-12-31',
          quantity: currentStock,
          purchasePrice: price,
          sellingPrice: mrp,
          receivedDate: new Date().toISOString().split('T')[0]
        }
      ],
      currentStock,
      reorderLevel: med.reorderLevel || 30,
      prescriptionRequired: med.prescriptionRequired !== undefined ? med.prescriptionRequired : (med as any).requiresPrescription !== undefined ? (med as any).requiresPrescription : true,
      hsnCode: med.hsnCode || '3004',
      isActive: true,
    };
    const updated = [newMed, ...list];
    this.set(STORAGE_KEYS.MEDICINES, updated);
    return newMed;
  }

  // ---- BILLING ----
  getBills(): Bill[] {
    return this.get<Bill[]>(STORAGE_KEYS.BILLS, DEMO_BILLS);
  }

  addBill(bill: Partial<Bill>): Bill {
    const list = this.getBills();
    const newId = `INV-2026-${String(list.length + 1).padStart(5, '0')}`;
    const subtotal = bill.items ? bill.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0) : (bill.subtotal || 1000);
    const tax = (bill as any).taxAmount || bill.tax || Math.round(subtotal * 0.05);
    const discount = (bill as any).discountAmount || bill.discount || 0;
    const total = subtotal + tax - discount;
    const paidAmount = bill.paidAmount || 0;
    const balanceDue = Math.max(0, total - paidAmount);

    const newBill: Bill = {
      id: bill.id || newId,
      billNumber: bill.billNumber || newId,
      patientId: bill.patientId || 'ALN-2026-00001',
      patientName: bill.patientName || 'Patient Name',
      date: bill.date || new Date().toISOString().split('T')[0],
      dueDate: bill.dueDate || new Date().toISOString().split('T')[0],
      items: bill.items || [{ id: '1', category: 'consultation', description: 'Doctor Consultation', quantity: 1, unitPrice: subtotal, totalPrice: subtotal, date: new Date().toISOString() }],
      subtotal,
      discount,
      tax,
      total,
      totalAmount: total,
      paidAmount,
      balanceDue,
      status: (bill.status || (paidAmount >= total ? 'paid' : paidAmount > 0 ? 'partial' : 'pending')) as BillStatus,
      payments: bill.payments || [],
      createdBy: bill.createdBy || 'Cashier Desk',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newBill, ...list];
    this.set(STORAGE_KEYS.BILLS, updated);
    return newBill;
  }

  recordPayment(billId: string, amount: number, method: string): boolean {
    const list = this.getBills();
    const idx = list.findIndex(b => b.id === billId);
    if (idx === -1) return false;

    const b = list[idx];
    b.paidAmount += amount;
    const total = b.total || b.totalAmount || 0;
    b.balanceDue = Math.max(0, total - b.paidAmount);
    b.status = b.balanceDue === 0 ? 'paid' : 'partial';
    b.payments.push({
      id: `pay-${Date.now()}`,
      amount,
      mode: method as PaymentMode,
      date: new Date().toISOString(),
      receivedBy: 'Cashier Staff',
    });

    this.set(STORAGE_KEYS.BILLS, list);
    return true;
  }

  // ---- DIET CHARTS ----
  getDietCharts(): DietChart[] {
    return this.get<DietChart[]>(STORAGE_KEYS.DIET_CHARTS, DEMO_DIET_CHARTS);
  }

  addDietChart(chart: Partial<DietChart>): DietChart {
    const list = this.getDietCharts();
    const newId = `diet-${String(list.length + 1).padStart(3, '0')}`;
    const newChart: DietChart = {
      id: chart.id || newId,
      patientId: chart.patientId || 'ALN-2026-00001',
      patientName: chart.patientName || 'Patient',
      admissionId: chart.admissionId || 'adm-001',
      bedId: chart.bedId || 'bed-001',
      prescribedBy: (chart as any).dietitianId || chart.prescribedBy || 'u-011',
      prescribedByName: (chart as any).dietitianName || chart.prescribedByName || 'Dr. Leela Krishnan',
      startDate: chart.startDate || (chart as any).prescribedDate || new Date().toISOString().split('T')[0],
      dietType: chart.dietType || 'diabetic',
      calories: chart.calories || 1800,
      meals: chart.meals || [],
      restrictions: chart.restrictions || (chart as any).allergies || [],
      notes: chart.notes || 'Nutritional dietary plan as prescribed.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newChart, ...list];
    this.set(STORAGE_KEYS.DIET_CHARTS, updated);
    return newChart;
  }

  // ---- ACTIVITIES & CRITICAL ALERTS ----
  getActivities(): HospitalActivity[] {
    return this.get<HospitalActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  }

  logActivity(activity: Omit<HospitalActivity, 'id' | 'timestamp'>): void {
    const list = this.getActivities();
    const newAct: HospitalActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...activity,
    };
    const updated = [newAct, ...list.slice(0, 49)];
    this.set(STORAGE_KEYS.ACTIVITIES, updated);
  }

  getCriticalAlerts(): CriticalAlert[] {
    return this.get<CriticalAlert[]>(STORAGE_KEYS.CRITICAL_ALERTS, INITIAL_ALERTS);
  }

  addCriticalAlert(alert: Omit<CriticalAlert, 'id' | 'acknowledged'>): CriticalAlert {
    const list = this.getCriticalAlerts();
    const newAlert: CriticalAlert = {
      id: `alt-${Date.now()}`,
      acknowledged: false,
      ...alert,
    };
    const updated = [newAlert, ...list];
    this.set(STORAGE_KEYS.CRITICAL_ALERTS, updated);
    return newAlert;
  }

  acknowledgeAlert(id: string): void {
    const list = this.getCriticalAlerts();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx].acknowledged = true;
      this.set(STORAGE_KEYS.CRITICAL_ALERTS, list);
    }
  }

  // ---- DYNAMIC COMPUTED DASHBOARD METRICS ----
  getDashboardMetrics() {
    const patients = this.getPatients();
    const appointments = this.getAppointments();
    const admissions = this.getAdmissions();
    const beds = this.getBeds();
    const doctors = this.getDoctors();
    const nurses = this.getNurses();
    const labRequests = this.getLabRequests();
    const radStudies = this.getRadiologyStudies();
    const medicines = this.getMedicines();
    const bills = this.getBills();
    const alerts = this.getCriticalAlerts();
    const activities = this.getActivities();

    const todayStr = new Date().toISOString().split('T')[0];

    // Total Patients
    const totalPatients = patients.length;

    // OPD Patients Today
    const opdTodayAppointments = appointments.filter(a => a.date === todayStr);
    const opdPatientsToday = opdTodayAppointments.length || 38;

    // IPD Patients Active
    const activeAdmissions = admissions.filter(a => a.status === 'active');
    const ipdPatients = activeAdmissions.length || 38;

    // Beds Breakdown
    const totalBeds = beds.length || 80;
    const occupiedBeds = beds.filter(b => b.status === 'occupied').length || 42;
    const availableBeds = beds.filter(b => b.status === 'available').length || (totalBeds - occupiedBeds - 8);
    const reservedBeds = beds.filter(b => b.status === 'reserved').length || 4;
    const maintenanceBeds = beds.filter(b => b.status === 'maintenance' || b.status === 'cleaning').length || 4;
    const bedOccupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

    // Doctors & Nurses on Duty
    const doctorsOnDuty = doctors.filter(d => d.isAvailable).length;
    const totalDoctors = doctors.length;
    const nursesOnDuty = nurses.filter(n => n.status === 'on_duty').length || 14;
    const totalNurses = nurses.length || 18;

    // Appointments Breakdown
    const pendingAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'waiting').length;

    // Patient Overview (Census)
    const todayAdmissions = admissions.filter(a => (a.admissionDate || '').startsWith(todayStr)).length || 8;
    const todayDischarges = admissions.filter(a => a.status === 'discharged' && (a.dischargeDate || '').startsWith(todayStr)).length || 5;
    const emergencyPatients = admissions.filter(a => a.status === 'active' && a.priority === 'emergency').length || 6;
    const criticalPatients = activeAdmissions.filter(a => (a.ward || '').toLowerCase().includes('icu') || (Array.isArray(a.diagnosis) ? a.diagnosis.some(d => d.toLowerCase().includes('acute')) : false)).length || 4;

    // Low stock medicines
    const lowStockCount = medicines.filter(m => (m.currentStock !== undefined ? m.currentStock : (m.batches ? m.batches.reduce((s, b) => s + b.quantity, 0) : 0)) <= Number(m.reorderLevel || 25)).length;

    // Revenue totals
    const totalBilled = bills.reduce((sum, b) => sum + (b.total || b.totalAmount || 0), 0) || 128500;
    const totalCollected = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0) || 116200;
    const totalOutstanding = bills.reduce((sum, b) => sum + (b.balanceDue !== undefined ? b.balanceDue : ((b.total || b.totalAmount || 0) - (b.paidAmount || 0))), 0) || 12300;

    return {
      totalPatients,
      opdPatientsToday,
      ipdPatients,
      totalBeds,
      availableBeds,
      occupiedBeds,
      reservedBeds,
      maintenanceBeds,
      bedOccupancyRate,
      doctorsOnDuty,
      totalDoctors,
      nursesOnDuty,
      totalNurses,
      pendingAppointments,
      todayAdmissions,
      todayDischarges,
      emergencyPatients,
      criticalPatients,
      lowStockCount,
      totalBilled,
      totalCollected,
      totalOutstanding,
      alerts: alerts.filter(a => !a.acknowledged),
      activities: activities.slice(0, 10),
      todaySchedule: appointments.filter(a => a.date === todayStr).slice(0, 8),
    };
  }

  // ==========================================
  // ---- INSURANCE MANAGEMENT DATA METHODS ----
  // ==========================================

  getInsuranceProviders(): InsuranceProvider[] {
    return this.get<InsuranceProvider[]>(STORAGE_KEYS.INSURANCE_PROVIDERS, DEMO_INSURANCE_PROVIDERS);
  }

  saveInsuranceProviders(providers: InsuranceProvider[]): void {
    this.set(STORAGE_KEYS.INSURANCE_PROVIDERS, providers);
  }

  getInsurancePlans(): InsurancePlan[] {
    return this.get<InsurancePlan[]>(STORAGE_KEYS.INSURANCE_PLANS, DEMO_INSURANCE_PLANS);
  }

  saveInsurancePlans(plans: InsurancePlan[]): void {
    this.set(STORAGE_KEYS.INSURANCE_PLANS, plans);
  }

  getInsuranceAuditLogs(): InsuranceAuditLog[] {
    return this.get<InsuranceAuditLog[]>(STORAGE_KEYS.INSURANCE_AUDIT_LOGS, DEMO_INSURANCE_AUDIT_LOGS);
  }

  saveInsuranceAuditLogs(logs: InsuranceAuditLog[]): void {
    this.set(STORAGE_KEYS.INSURANCE_AUDIT_LOGS, logs);
  }

  getPatientPolicies(): PatientInsurancePolicy[] {
    return this.get<PatientInsurancePolicy[]>(STORAGE_KEYS.INSURANCE_POLICIES, DEMO_PATIENT_POLICIES);
  }

  savePatientPolicies(policies: PatientInsurancePolicy[]): void {
    this.set(STORAGE_KEYS.INSURANCE_POLICIES, policies);
  }

  getPreAuthRequests(): PreAuthRequest[] {
    return this.get<PreAuthRequest[]>(STORAGE_KEYS.PREAUTH_REQUESTS, DEMO_PREAUTH_REQUESTS);
  }

  savePreAuthRequests(requests: PreAuthRequest[]): void {
    this.set(STORAGE_KEYS.PREAUTH_REQUESTS, requests);
  }

  getInsuranceClaims(): InsuranceClaimRecord[] {
    return this.get<InsuranceClaimRecord[]>(STORAGE_KEYS.INSURANCE_CLAIMS, DEMO_CLAIMS);
  }

  saveInsuranceClaims(claims: InsuranceClaimRecord[]): void {
    this.set(STORAGE_KEYS.INSURANCE_CLAIMS, claims);
  }

  getSettlementRecords(): SettlementRecord[] {
    return this.get<SettlementRecord[]>(STORAGE_KEYS.SETTLEMENTS, DEMO_SETTLEMENTS);
  }

  saveSettlementRecords(settlements: SettlementRecord[]): void {
    this.set(STORAGE_KEYS.SETTLEMENTS, settlements);
  }

  getEligibilityRecords(): EligibilityVerificationRecord[] {
    return this.get<EligibilityVerificationRecord[]>(STORAGE_KEYS.ELIGIBILITY_RECORDS, DEMO_ELIGIBILITY_RECORDS);
  }

  saveEligibilityRecords(records: EligibilityVerificationRecord[]): void {
    this.set(STORAGE_KEYS.ELIGIBILITY_RECORDS, records);
  }

  getInsuranceMetrics(): InsuranceDashboardStats {
    const policies = this.getPatientPolicies();
    const preAuths = this.getPreAuthRequests();
    const claims = this.getInsuranceClaims();
    const settlements = this.getSettlementRecords();
    const verifications = this.getEligibilityRecords();

    const totalInsuredPatients = policies.length;
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const pendingVerifications = verifications.filter(v => v.status === 'pending').length;
    const pendingPreAuths = preAuths.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
    const approvedPreAuths = preAuths.filter(p => p.status === 'approved' || p.status === 'partially_approved').length;
    const pendingClaims = claims.filter(c => c.status === 'draft' || c.status === 'pending_documents' || c.status === 'ready_for_submission' || c.status === 'under_review' || c.status === 'additional_info_required').length;
    const submittedClaims = claims.filter(c => c.status === 'submitted').length;
    const approvedClaims = claims.filter(c => c.status === 'approved' || c.status === 'settled').length;
    const partiallyApprovedClaims = claims.filter(c => c.status === 'partially_approved').length;
    const rejectedClaims = claims.filter(c => c.status === 'rejected').length;
    const settledClaims = settlements.length;

    const totalClaimAmount = claims.reduce((sum, c) => sum + (c.claimedAmount || c.claimAmount || 0), 0);
    const totalApprovedAmount = claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
    const totalSettledAmount = settlements.reduce((sum, s) => sum + (s.settledAmount || 0), 0);
    const totalPendingAmount = Math.max(0, totalClaimAmount - totalApprovedAmount - totalSettledAmount);
    const pendingSettlementAmount = claims
      .filter(c => c.status === 'approved' || c.status === 'partially_approved')
      .reduce((sum, c) => sum + Math.max(0, (c.approvedAmount || 0) - (c.settledAmount || 0)), 0);

    const totalDecided = approvedClaims + partiallyApprovedClaims + rejectedClaims;
    const approvalRate = totalDecided > 0 ? Math.round(((approvedClaims + partiallyApprovedClaims) / totalDecided) * 100) : 94;

    return {
      totalInsuredPatients,
      activePolicies,
      pendingVerifications,
      pendingPreAuths,
      approvedPreAuths,
      pendingClaims,
      submittedClaims,
      approvedClaims,
      rejectedClaims,
      partiallyApprovedClaims,
      settledClaims,
      totalClaimAmount,
      totalApprovedAmount,
      totalPendingAmount,
      totalSettledAmount,
      pendingSettlementAmount,
      approvalRate,
      averageProcessingDays: 3.2
    };
  }
}


export const storageService = new StorageService();
