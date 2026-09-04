import {
  DEMO_PATIENTS, DEMO_DOCTORS, DEMO_APPOINTMENTS, DEMO_ADMISSIONS,
  DEMO_BEDS, DEMO_WARDS, DEMO_LAB_REQUESTS, DEMO_LAB_TESTS,
  DEMO_RADIOLOGY_STUDIES, DEMO_MEDICINES, DEMO_BILLS,
  DEMO_BLOOD_STOCK, DEMO_BLOOD_DONORS, DEMO_AMBULANCE_REQUESTS,
  DEMO_DIET_CHARTS
} from '../data/seedData';
import type { UserRole, Medicine } from '../types';

export type DetectedLanguage = 'en' | 'te' | 'te-mixed';

export interface AISearchResult {
  id: string;
  category: 'patient' | 'doctor' | 'appointment' | 'opd' | 'ipd' | 'bed' | 'pharmacy' | 'lab' | 'radiology' | 'bloodbank' | 'billing' | 'report' | 'nav' | 'nursing' | 'diet' | 'ambulance' | 'admin' | 'settings';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal';
  route: string;
  metadata?: Record<string, any>;
}

export interface AIActionPayload {
  actionType: 'cancel_appointment' | 'transfer_bed' | 'discharge_patient' | 'emergency_dispatch' | 'reorder_medicine' | 'delete_patient' | 'cancel_invoice' | 'refund_payment';
  title: string;
  description: string;
  details: Record<string, string>;
  targetRoute?: string;
}

export interface AICommandResponse {
  rawQuery: string;
  detectedLanguage: DetectedLanguage;
  intentType: 'SEARCH' | 'NAVIGATE' | 'STAT_QUERY' | 'ACTION_CONFIRMATION' | 'INFORMATION' | 'DENIED';
  voiceText: string;
  displayText: string;
  targetRoute?: string;
  statSummary?: {
    label: string;
    value: string | number;
    subtitle?: string;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  };
  results: AISearchResult[];
  pendingAction?: AIActionPayload;
}

export interface AIAuditLogEntry {
  id: string;
  timestamp: string;
  userRole: string;
  query: string;
  language: DetectedLanguage;
  intent: string;
  status: 'SUCCESS' | 'DENIED' | 'REQUIRES_CONFIRMATION';
}

const AUDIT_LOGS: AIAuditLogEntry[] = [
  {
    id: 'audit-init-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userRole: 'super_admin',
    query: 'Open OPD',
    language: 'en',
    intent: 'NAV_OPD',
    status: 'SUCCESS',
  },
  {
    id: 'audit-init-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    userRole: 'super_admin',
    query: 'Available beds chupinchu',
    language: 'te-mixed',
    intent: 'STAT_TOTAL_BEDS',
    status: 'SUCCESS',
  },
  {
    id: 'audit-init-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    userRole: 'super_admin',
    query: 'ఫార్మసీ ఓపెన్ చేయి',
    language: 'te',
    intent: 'NAV_PHARMACY',
    status: 'SUCCESS',
  }
];

export function getAIAuditLogs(): AIAuditLogEntry[] {
  try {
    const stored = localStorage.getItem('aln_ai_audit_logs');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return [...AUDIT_LOGS];
}

export function saveAIAuditLog(entry: AIAuditLogEntry) {
  AUDIT_LOGS.unshift(entry);
  if (AUDIT_LOGS.length > 50) AUDIT_LOGS.pop();
  try {
    localStorage.setItem('aln_ai_audit_logs', JSON.stringify(AUDIT_LOGS.slice(0, 50)));
  } catch {
    // ignore
  }
}

export interface RealtimeVoiceEvaluation {
  isConfident: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  response: AICommandResponse | null;
  matchedEntity?: string;
}

/**
 * Real-Time Streaming Speech Evaluator (0ms Lag Intent Recognition)
 * Evaluates interim speech transcripts on the fly without waiting for silence or final results.
 */
export function evaluateRealtimeVoiceStream(
  transcript: string,
  userRole: UserRole = 'super_admin',
  forcedLang?: 'auto' | 'en' | 'te'
): RealtimeVoiceEvaluation {
  const raw = transcript.trim();
  if (!raw || raw.length < 2) {
    return { isConfident: false, confidence: 'LOW', response: null };
  }

  const qLower = raw.toLowerCase();

  // Strip common trailing/leading filler words for early intent detection
  const normalized = qLower
    .replace(/\b(please|can you|could you|kindly|for me|now|fast ga|urgent|urgently|sir|madam|brother|andi|garu|twaraga|veganga|chusi)\b/gi, '')
    .trim();

  // 1. Destructive / Sensitive Write Action (HIGH Confidence)
  const isDestructive = /(cancel|delete|discharge|transfer|refund|allocate|రద్దు|డిశ్చార్జ్|బదిలీ|తొలగించు|cancel chey|discharge chey|transfer chey)/i.test(normalized);
  if (isDestructive && (normalized.includes('appointment') || normalized.includes('patient') || normalized.includes('bed') || normalized.includes('admission') || normalized.includes('అపాయింట్‌మెంట్') || normalized.includes('డిశ్చార్జ్') || normalized.includes('బదిలీ'))) {
    const res = processAICommand(raw, userRole, forcedLang);
    return { isConfident: true, confidence: 'HIGH', response: res, matchedEntity: 'destructive_action' };
  }

  // 2. Specific Live Hospital Statistics Query (HIGH Confidence)
  const isStat = /(available bed|available beds|icu bed|icu beds|bed vacancy|ఖాళీ బెడ్లు|బెడ్స్|beds enni|low stock|pharmacy stock|pending lab|lab reports|today's opd|today opd|opd queue|blood stock|blood units|today's revenue|today revenue|collections|outstanding)/i.test(normalized);
  if (isStat) {
    const res = processAICommand(raw, userRole, forcedLang);
    if (res.intentType === 'STAT_QUERY' || res.intentType === 'DENIED') {
      return { isConfident: true, confidence: 'HIGH', response: res, matchedEntity: 'stat_query' };
    }
  }

  // 3. Direct Master Navigation Routing (HIGH Confidence)
  for (const item of NAV_COMMAND_REGISTRY) {
    const isDirectMatch = item.keywords.some(kw => {
      const kwLower = kw.toLowerCase();
      // Match whole word or exact token
      return normalized.includes(kwLower);
    });

    if (isDirectMatch) {
      const res = processAICommand(raw, userRole, forcedLang);
      return { isConfident: true, confidence: 'HIGH', response: res, matchedEntity: item.route };
    }
  }

  // 4. Search Exact Matches
  if (normalized.length >= 4) {
    const searchRes = performGlobalSearch(normalized, userRole);
    if (searchRes.length > 0) {
      const res = processAICommand(raw, userRole, forcedLang);
      return { isConfident: true, confidence: 'MEDIUM', response: res, matchedEntity: 'search_match' };
    }
  }

  return { isConfident: false, confidence: 'LOW', response: null };
}

/**
 * Language Detector for English, Telugu Script, and Code-Mixed Tanglish
 */
export function detectLanguage(input: string): DetectedLanguage {
  const text = input.trim();
  // Check for Telugu Unicode characters (U+0C00 to U+0C7F)
  const hasTeluguChars = /[\u0C00-\u0C7F]/.test(text);
  if (hasTeluguChars) {
    return 'te';
  }

  // Tanglish / Telugu-English code-mixed keywords & verb patterns
  const tanglishPatterns = [
    /\b(chupinchu|chupiyyi|choodu|chudali|kanipinchu|enti|enni|entha|unnayi|unnaru|undhi|undha|cheyi|cheyyi|veellu|pettu|kavali|ivala|ee\s*roju|eerodu|repu|ninna|lo|ki|mariyu|ani|chesko|vellandi|tiseseyyi|ippudu)\b/i,
    /\b(patients|beds|doctors|revenue|pharmacy|stock|queue|opd|ipd|bill|report|icu|lab|tests|units|admissions)\s+(enni|entha|chupinchu|enti|open|chudali)\b/i,
    /\b(open\s+cheyyi|open\s+chey|open\s+chesko|chupinchu|velthunnam)\b/i
  ];

  for (const pattern of tanglishPatterns) {
    if (pattern.test(text)) {
      return 'te-mixed';
    }
  }

  return 'en';
}

/**
 * Helper to calculate medicine total stock
 */
function getMedicineStock(m: Medicine): number {
  if (typeof m.currentStock === 'number') return m.currentStock;
  if (Array.isArray(m.batches)) {
    return m.batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  }
  return 0;
}

/**
 * Checks if user role is authorized for specific modules/actions
 */
export function isAuthorizedFor(role: UserRole = 'super_admin', target: string): boolean {
  if (role === 'super_admin' || role === 'hospital_admin' || role === 'management') return true;

  switch (target) {
    case 'financial':
    case 'revenue':
    case 'billing':
    case 'billing_admin':
      return ['super_admin', 'hospital_admin', 'billing_staff', 'management'].includes(role);
    case 'clinical_write':
    case 'prescriptions':
    case 'doctors':
      return ['super_admin', 'hospital_admin', 'doctor', 'management'].includes(role);
    case 'nursing':
      return ['super_admin', 'hospital_admin', 'nurse', 'doctor', 'management'].includes(role);
    case 'pharmacy':
      return ['super_admin', 'hospital_admin', 'pharmacist', 'doctor', 'management'].includes(role);
    case 'lab':
    case 'laboratory':
      return ['super_admin', 'hospital_admin', 'lab_technician', 'doctor', 'nurse', 'management'].includes(role);
    case 'radiology':
      return ['super_admin', 'hospital_admin', 'radiology_technician', 'doctor', 'management'].includes(role);
    case 'bloodbank':
    case 'blood_bank':
      return ['super_admin', 'hospital_admin', 'blood_bank_staff', 'doctor', 'management'].includes(role);
    case 'ambulance':
      return ['super_admin', 'hospital_admin', 'ambulance_staff', 'receptionist', 'management'].includes(role);
    case 'diet':
      return ['super_admin', 'hospital_admin', 'dietitian', 'doctor', 'nurse', 'management'].includes(role);
    case 'admin':
    case 'settings':
      return ['super_admin', 'hospital_admin'].includes(role);
    default:
      return true;
  }
}

/**
 * Executes Global Cross-Module Search
 */
export function performGlobalSearch(query: string, userRole: UserRole = 'super_admin'): AISearchResult[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  const results: AISearchResult[] = [];

  // Extract clean keywords
  const cleanQ = q.replace(/^(show|find|search|open|patient|doctor|bed|bill|invoice|for|the|me|dr|dr\.)\s+/i, '').trim();
  const targetQ = cleanQ.length >= 1 ? cleanQ : q;

  // 1. Patients Search (Name, ID, Phone, City, Blood Group)
  DEMO_PATIENTS.forEach(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    if (
      fullName.includes(targetQ) ||
      p.id.toLowerCase().includes(targetQ) ||
      p.phone.includes(targetQ) ||
      (p.city && p.city.toLowerCase().includes(targetQ)) ||
      (p.bloodGroup && p.bloodGroup.toLowerCase().includes(targetQ)) ||
      p.id.toLowerCase() === targetQ
    ) {
      results.push({
        id: `pat-${p.id}`,
        category: 'patient',
        categoryLabel: 'Patient Care',
        title: `${p.firstName} ${p.lastName} (${p.id})`,
        subtitle: `${p.gender.toUpperCase()} · ${p.phone} · Blood Group: ${p.bloodGroup} · ${p.city || 'Hyderabad'}`,
        badgeText: p.isActive ? 'ACTIVE' : 'INACTIVE',
        badgeVariant: 'primary',
        route: `/patients`,
        metadata: p,
      });
    }
  });

  // 2. Doctors Search
  DEMO_DOCTORS.forEach(d => {
    if (
      d.name.toLowerCase().includes(targetQ) ||
      d.specialization.toLowerCase().includes(targetQ) ||
      d.department.toLowerCase().includes(targetQ) ||
      d.id.toLowerCase().includes(targetQ)
    ) {
      results.push({
        id: `doc-${d.id}`,
        category: 'doctor',
        categoryLabel: 'Doctor Directory',
        title: `${d.name}`,
        subtitle: `${d.specialization} · Department: ${d.department} · Consultation: ₹${d.consultationFee}`,
        badgeText: d.isAvailable ? 'Available Now' : 'In Chamber',
        badgeVariant: d.isAvailable ? 'success' : 'warning',
        route: `/doctors`,
        metadata: d,
      });
    }
  });

  // 3. Appointments Search
  DEMO_APPOINTMENTS.forEach(a => {
    if (
      a.patientName.toLowerCase().includes(targetQ) ||
      a.doctorName.toLowerCase().includes(targetQ) ||
      a.id.toLowerCase().includes(targetQ) ||
      a.department.toLowerCase().includes(targetQ) ||
      a.status.toLowerCase().includes(targetQ)
    ) {
      results.push({
        id: `apt-${a.id}`,
        category: 'appointment',
        categoryLabel: 'Appointments',
        title: `Appointment: ${a.patientName} → Dr. ${a.doctorName}`,
        subtitle: `Slot: ${a.date} at ${a.time} · Dept: ${a.department} · Status: ${a.status.toUpperCase()}`,
        badgeText: a.status.toUpperCase(),
        badgeVariant: a.status === 'completed' ? 'success' : a.status === 'waiting' ? 'warning' : 'info',
        route: `/appointments`,
        metadata: a,
      });
    }
  });

  // 4. IPD Admissions & Inpatients
  DEMO_ADMISSIONS.forEach(adm => {
    const diagStr = Array.isArray(adm.diagnosis) ? adm.diagnosis.join(', ') : (adm.diagnosis || '');
    if (
      adm.patientName.toLowerCase().includes(targetQ) ||
      adm.id.toLowerCase().includes(targetQ) ||
      adm.bedNumber.toLowerCase().includes(targetQ) ||
      adm.ward.toLowerCase().includes(targetQ) ||
      adm.admittingDoctorName.toLowerCase().includes(targetQ) ||
      diagStr.toLowerCase().includes(targetQ)
    ) {
      results.push({
        id: `adm-${adm.id}`,
        category: 'ipd',
        categoryLabel: 'IPD Inpatients',
        title: `Inpatient: ${adm.patientName} (Bed: ${adm.bedNumber})`,
        subtitle: `Ward: ${adm.ward} · Admitted: ${adm.admissionDate} · Dr. ${adm.admittingDoctorName} · Diagnosis: ${diagStr || 'Clinical evaluation'}`,
        badgeText: adm.status === 'active' ? 'Admitted (Active)' : 'Discharged',
        badgeVariant: adm.status === 'active' ? 'danger' : 'success',
        route: `/ipd`,
        metadata: adm,
      });
    }
  });

  // 5. Beds Search
  DEMO_BEDS.forEach(b => {
    if (
      b.bedNumber.toLowerCase().includes(targetQ) ||
      b.ward.toLowerCase().includes(targetQ) ||
      b.type.toLowerCase().includes(targetQ) ||
      b.status.toLowerCase().includes(targetQ)
    ) {
      results.push({
        id: `bed-${b.id}`,
        category: 'bed',
        categoryLabel: 'Bed Management',
        title: `Bed ${b.bedNumber} — ${b.ward}`,
        subtitle: `Type: ${b.type.toUpperCase()} · Rate: ₹${b.dailyRate}/day · Floor: ${b.floor} · Room: ${b.roomNumber || 'Open Ward'}`,
        badgeText: b.status.toUpperCase(),
        badgeVariant: b.status === 'available' ? 'success' : b.status === 'occupied' ? 'danger' : 'warning',
        route: `/ipd`,
        metadata: b,
      });
    }
  });

  // 6. Pharmacy & Medicines
  if (isAuthorizedFor(userRole, 'pharmacy')) {
    DEMO_MEDICINES.forEach(m => {
      const stock = getMedicineStock(m);
      if (
        m.name.toLowerCase().includes(targetQ) ||
        m.genericName.toLowerCase().includes(targetQ) ||
        m.category.toLowerCase().includes(targetQ) ||
        m.manufacturer.toLowerCase().includes(targetQ)
      ) {
        results.push({
          id: `med-${m.id}`,
          category: 'pharmacy',
          categoryLabel: 'Pharmacy Inventory',
          title: `${m.name} (${m.strength})`,
          subtitle: `Generic: ${m.genericName} · Stock: ${stock} units · Reorder Level: ${m.reorderLevel} · Price: ₹${m.price || m.mrp}`,
          badgeText: stock <= m.reorderLevel ? 'LOW STOCK' : 'IN STOCK',
          badgeVariant: stock <= m.reorderLevel ? 'danger' : 'teal',
          route: `/pharmacy`,
          metadata: m,
        });
      }
    });
  }

  // 7. Laboratory Requests & Tests
  if (isAuthorizedFor(userRole, 'laboratory')) {
    DEMO_LAB_REQUESTS.forEach(req => {
      const testNames = Array.isArray(req.tests) ? req.tests.map(t => t.testName).join(', ') : '';
      if (
        req.patientName.toLowerCase().includes(targetQ) ||
        req.id.toLowerCase().includes(targetQ) ||
        testNames.toLowerCase().includes(targetQ) ||
        req.doctorName.toLowerCase().includes(targetQ) ||
        req.status.toLowerCase().includes(targetQ)
      ) {
        results.push({
          id: `lab-${req.id}`,
          category: 'lab',
          categoryLabel: 'Laboratory Orders',
          title: `Lab Order (${req.id}): ${req.patientName}`,
          subtitle: `Tests: ${testNames} · Prescribed by: Dr. ${req.doctorName} · Priority: ${req.priority.toUpperCase()}`,
          badgeText: req.status.toUpperCase(),
          badgeVariant: req.status === 'completed' ? 'success' : 'purple',
          route: `/laboratory`,
          metadata: req,
        });
      }
    });
  }

  // 8. Radiology Imaging
  if (isAuthorizedFor(userRole, 'radiology')) {
    DEMO_RADIOLOGY_STUDIES.forEach(rad => {
      if (
        rad.patientName.toLowerCase().includes(targetQ) ||
        rad.id.toLowerCase().includes(targetQ) ||
        rad.modality.toLowerCase().includes(targetQ) ||
        rad.bodyPart.toLowerCase().includes(targetQ) ||
        rad.status.toLowerCase().includes(targetQ)
      ) {
        results.push({
          id: `rad-${rad.id}`,
          category: 'radiology',
          categoryLabel: 'Radiology Imaging',
          title: `${rad.modality.toUpperCase()} Scan: ${rad.bodyPart} (${rad.patientName})`,
          subtitle: `Doctor: Dr. ${rad.doctorName} · Scheduled: ${rad.scheduledDate} ${rad.scheduledTime} · Status: ${rad.status.toUpperCase()}`,
          badgeText: rad.status.toUpperCase(),
          badgeVariant: rad.status === 'completed' ? 'success' : 'info',
          route: `/radiology`,
          metadata: rad,
        });
      }
    });
  }

  // 9. Blood Bank Inventory
  if (isAuthorizedFor(userRole, 'bloodbank')) {
    DEMO_BLOOD_STOCK.forEach((bs, index) => {
      if (
        bs.bloodGroup.toLowerCase().includes(targetQ) ||
        targetQ.includes('blood') ||
        targetQ.includes('బ్లడ్') ||
        targetQ.includes('రక్తం')
      ) {
        results.push({
          id: `blood-${index}`,
          category: 'bloodbank',
          categoryLabel: 'Blood Bank',
          title: `${bs.bloodGroup} Blood Units Available`,
          subtitle: `Current Stock: ${bs.units} units (bags) · Verified Tested Units`,
          badgeText: `${bs.units} Units`,
          badgeVariant: bs.units <= 5 ? 'danger' : 'success',
          route: `/blood-bank`,
          metadata: bs,
        });
      }
    });
  }

  // 10. Billing & Invoices (RBAC Enforced)
  if (isAuthorizedFor(userRole, 'revenue')) {
    DEMO_BILLS.forEach(b => {
      if (
        b.patientName.toLowerCase().includes(targetQ) ||
        b.id.toLowerCase().includes(targetQ) ||
        (b.billNumber && b.billNumber.toLowerCase().includes(targetQ)) ||
        b.status.toLowerCase().includes(targetQ)
      ) {
        const total = b.total || b.totalAmount || 0;
        const bal = b.balanceDue || 0;
        results.push({
          id: `bill-${b.id}`,
          category: 'billing',
          categoryLabel: 'Central Billing',
          title: `Invoice ${b.billNumber || b.id} — ${b.patientName}`,
          subtitle: `Total: ₹${total.toLocaleString()} · Paid: ₹${b.paidAmount.toLocaleString()} · Balance Due: ₹${bal.toLocaleString()}`,
          badgeText: b.status.toUpperCase(),
          badgeVariant: b.status === 'paid' ? 'success' : 'warning',
          route: `/billing`,
          metadata: b,
        });
      }
    });
  }

  return results.slice(0, 15);
}

/**
 * Computes Real-Time Operational Statistics across all HMS Modules
 */
export function computeLiveHospitalMetrics() {
  const totalPatients = DEMO_PATIENTS.length;
  const activeAdmissions = DEMO_ADMISSIONS.filter(a => a.status === 'active').length;
  const availableBeds = DEMO_BEDS.filter(b => b.status === 'available').length;
  const occupiedBeds = DEMO_BEDS.filter(b => b.status === 'occupied').length;
  const icuBeds = DEMO_BEDS.filter(b => b.ward.toLowerCase().includes('icu'));
  const availableIcuBeds = icuBeds.filter(b => b.status === 'available').length;
  const pendingLab = DEMO_LAB_REQUESTS.filter(l => l.status === 'ordered' || l.status === 'sample_collected' || l.status === 'processing').length;
  const pendingRad = DEMO_RADIOLOGY_STUDIES.filter(r => r.status === 'scheduled' || r.status === 'in_progress').length;
  const lowStockMeds = DEMO_MEDICINES.filter(m => getMedicineStock(m) <= m.reorderLevel);
  const totalRevenue = DEMO_BILLS.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const pendingCollections = DEMO_BILLS.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const waitingOPD = DEMO_APPOINTMENTS.filter(a => a.status === 'waiting' || a.status === 'confirmed').length;

  return {
    totalPatients,
    activeAdmissions,
    availableBeds,
    occupiedBeds,
    totalBeds: DEMO_BEDS.length,
    icuTotal: icuBeds.length,
    availableIcuBeds,
    pendingLab,
    pendingRad,
    lowStockCount: lowStockMeds.length,
    lowStockMeds,
    totalRevenue,
    pendingCollections,
    waitingOPD,
  };
}

/**
 * Master Command Definition Table
 */
interface NavCommandDef {
  route: string;
  categoryLabel: string;
  keywords: string[];
  enTitle: string;
  enVoice: string;
  teVoice: string;
  mixedVoice: string;
  reqRole?: string;
}

const NAV_COMMAND_REGISTRY: NavCommandDef[] = [
  {
    route: '/dashboard',
    categoryLabel: 'Hospital Overview',
    keywords: ['dashboard', 'home', 'main page', 'డాష్ బోర్డ్', 'డాష్‌బోర్డ్', 'హోమ్', 'dashboard open', 'home open'],
    enTitle: 'Hospital Operational Dashboard',
    enVoice: 'Opening Hospital Dashboard',
    teVoice: 'హాస్పిటల్ డాష్‌బోర్డ్ ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Hospital dashboard open chestunnanu',
  },
  {
    route: '/ai',
    categoryLabel: 'AI Command Center',
    keywords: ['ai', 'ai assistant', 'ai command center', 'voice center', 'ఎఐ', 'కమాండ్ సెంటర్', 'ai open'],
    enTitle: 'AI Command Center & Assistant',
    enVoice: 'Opening ALN Cure AI Command Center',
    teVoice: 'AI కమాండ్ సెంటర్‌ను ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'AI command center open chestunnanu',
  },
  {
    route: '/patients',
    categoryLabel: 'Patient Care',
    keywords: ['patients', 'patient directory', 'patient registration', 'find patient', 'search patient', 'రోగులు', 'పేషెంట్లు', 'పేషెంట్', 'patients chupinchu', 'patient open', 'patients list'],
    enTitle: 'Patient Registration Directory',
    enVoice: 'Opening Patient Registration Directory',
    teVoice: 'రోగుల రిజిస్ట్రేషన్ డైరెక్టరీ ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Patient directory open chestunnanu',
  },
  {
    route: '/appointments',
    categoryLabel: 'Patient Care',
    keywords: ['appointments', 'appointment', 'booking', 'doctor schedule', 'అపాయింట్‌మెంట్', 'అపాయింట్‌మెంట్లు', 'బుకింగ్', 'appointments open', 'appointment chupinchu', 'appointment booking'],
    enTitle: 'Doctor Appointment Scheduling',
    enVoice: 'Opening Doctor Appointment Scheduling',
    teVoice: 'వైద్యుల అపాయింట్‌మెంట్ల విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Doctor appointments schedule open chestunnanu',
  },
  {
    route: '/opd',
    categoryLabel: 'Clinical Care',
    keywords: ['opd', 'outpatient', 'opd queue', 'opd dashboard', 'opd clinic', 'ఓపీడీ', 'ఒపిడి', 'opd open', 'opd section', 'opd chupinchu', 'opd clinic open'],
    enTitle: 'Outpatient Department (OPD)',
    enVoice: 'Opening Outpatient Department (OPD)',
    teVoice: 'OPD విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'OPD section open chestunnanu',
  },
  {
    route: '/ipd',
    categoryLabel: 'Clinical Care',
    keywords: ['ipd', 'inpatient', 'beds', 'bed management', 'admissions', 'wards', 'icu', 'ఐపీడీ', 'ఇన్ పేషెంట్', 'బెడ్లు', 'బెడ్స్', 'వార్డులు', 'ipd open', 'ipd beds', 'bed management open', 'available beds'],
    enTitle: 'Inpatient Department (IPD) & Bed Management',
    enVoice: 'Opening IPD & Bed Management',
    teVoice: 'IPD మరియు బెడ్ల నిర్వహణ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'IPD and Bed management open chestunnanu',
  },
  {
    route: '/nursing',
    categoryLabel: 'Clinical Care',
    keywords: ['nursing', 'nurse', 'vitals charting', 'mar', 'ward nurse', 'నర్సింగ్', 'నర్సులు', 'వైటల్స్', 'nursing open', 'nursing station open'],
    enTitle: 'Nursing Station & Inpatient Care',
    enVoice: 'Opening Nursing Station & Inpatient Care',
    teVoice: 'నర్సింగ్ స్టేషన్ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Nursing care module open chestunnanu',
    reqRole: 'nursing',
  },
  {
    route: '/diet',
    categoryLabel: 'Clinical Care',
    keywords: ['diet', 'diet chart', 'nutrition', 'meal plan', 'డైట్', 'ఆహార ప్రణాళిక', 'diet open', 'diet charts chupinchu'],
    enTitle: 'Clinical Nutrition & Diet Charts',
    enVoice: 'Opening Clinical Nutrition & Diet Charts',
    teVoice: 'డైట్ మరియు న్యూట్రిషన్ చార్టులను ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Diet charts open chestunnanu',
    reqRole: 'diet',
  },
  {
    route: '/laboratory',
    categoryLabel: 'Diagnostic Services',
    keywords: ['laboratory', 'lab', 'pathology', 'blood test', 'lab reports', 'lab tests', 'ల్యాబ్', 'ల్యాబొరేటరీ', 'పాథాలజీ', 'రక్త పరీక్షలు', 'lab open', 'laboratory open', 'lab reports open', 'lab tests list'],
    enTitle: 'Clinical Pathology & Laboratory',
    enVoice: 'Opening Clinical Pathology & Laboratory',
    teVoice: 'ల్యాబొరేటరీ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Laboratory diagnostics open chestunnanu',
    reqRole: 'laboratory',
  },
  {
    route: '/radiology',
    categoryLabel: 'Diagnostic Services',
    keywords: ['radiology', 'x-ray', 'xray', 'mri', 'ct scan', 'ultrasound', 'pacs', 'రేడియోలజీ', 'ఎక్స్-రే', 'స్కానింగ్', 'radiology open', 'pacs imaging open'],
    enTitle: 'Radiology Imaging & PACS',
    enVoice: 'Opening Radiology Imaging & PACS',
    teVoice: 'రేడియోలజీ మరియు ఇమేజింగ్ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Radiology imaging open chestunnanu',
    reqRole: 'radiology',
  },
  {
    route: '/pharmacy',
    categoryLabel: 'Medication & Pharmacy',
    keywords: ['pharmacy', 'medicines', 'medicine', 'drugs', 'dispensary', 'pharma', 'మందులు', 'ఫార్మసీ', 'మెడిసిన్స్', 'pharmacy open', 'pharmacy stock', 'low stock medicines'],
    enTitle: 'Pharmacy POS & Medication Inventory',
    enVoice: 'Opening Pharmacy POS & Drug Inventory',
    teVoice: 'ఫార్మసీ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Pharmacy inventory open chestunnanu',
    reqRole: 'pharmacy',
  },
  {
    route: '/billing',
    categoryLabel: 'Finance & Revenue',
    keywords: ['billing', 'central billing', 'invoices', 'receipts', 'payments', 'cashier', 'accounts', 'బిల్లింగ్', 'బిల్లులు', 'చెల్లింపులు', 'కలెక్షన్లు', 'billing open', 'billing counter open', 'invoices list'],
    enTitle: 'Central Billing & Cashier Desk',
    enVoice: 'Opening Central Billing & Cashier Desk',
    teVoice: 'సెంట్రల్ బిల్లింగ్ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Central billing counter open chestunnanu',
    reqRole: 'revenue',
  },
  {
    route: '/doctors',
    categoryLabel: 'Staff Directory',
    keywords: ['doctors', 'doctor directory', 'physicians', 'consultants', 'వైద్యులు', 'డాక్టర్లు', 'స్పెషలిస్టులు', 'doctors open', 'doctors list', 'doctor directory open'],
    enTitle: 'Medical Consultants Directory',
    enVoice: 'Opening Medical Consultants Directory',
    teVoice: 'వైద్యుల వివరాల జాబితాను ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Doctors directory open chestunnanu',
    reqRole: 'doctors',
  },
  {
    route: '/ambulance',
    categoryLabel: 'Emergency Services',
    keywords: ['ambulance', 'emergency dispatch', 'emergency', 'rescue', 'అంబులెన్స్', 'ఎమర్జెన్సీ', 'ambulance open', 'emergency ambulance'],
    enTitle: 'Emergency Ambulance & Fleet Dispatch',
    enVoice: 'Opening Emergency Ambulance Dispatch',
    teVoice: 'అంబులెన్స్ మరియు ఎమర్జెన్సీ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Emergency ambulance dispatch open chestunnanu',
    reqRole: 'ambulance',
  },
  {
    route: '/blood-bank',
    categoryLabel: 'Blood Bank',
    keywords: ['blood bank', 'bloodbank', 'blood', 'blood stock', 'donors', 'బ్లడ్ బ్యాంక్', 'బ్లడ్', 'రక్తం', 'రక్త నిధి', 'blood bank open', 'blood stock chupinchu'],
    enTitle: 'Blood Bank & Donor Inventory',
    enVoice: 'Opening Blood Bank Inventory',
    teVoice: 'బ్లడ్ బ్యాంక్ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Blood bank inventory open chestunnanu',
    reqRole: 'bloodbank',
  },
  {
    route: '/reports',
    categoryLabel: 'Analytics & Reports',
    keywords: ['reports', 'analytics', 'statistics', 'revenue report', 'opd report', 'రిపోర్ట్స్', 'రిపోర్టులు', 'నివేదికలు', 'reports open', 'reports chupinchu'],
    enTitle: 'Clinical & Operational Reports',
    enVoice: 'Opening Clinical & Operational Reports',
    teVoice: 'హాస్పిటల్ రిపోర్టులు మరియు అనలిటిక్స్ ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Hospital reports open chestunnanu',
    reqRole: 'revenue',
  },
  {
    route: '/admin',
    categoryLabel: 'Governance',
    keywords: ['admin', 'admin panel', 'user management', 'governance', 'roles', 'అడ్మిన్', 'అడ్మినిస్ట్రేషన్', 'admin open', 'admin panel open'],
    enTitle: 'Hospital Administration & User Governance',
    enVoice: 'Opening Hospital Administrative Panel',
    teVoice: 'హాస్పిటల్ అడ్మిన్ ప్యానెల్ ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'Admin governance panel open chestunnanu',
    reqRole: 'admin',
  },
  {
    route: '/settings',
    categoryLabel: 'System Settings',
    keywords: ['settings', 'configuration', 'system settings', 'hospital profile', 'సెట్టింగ్స్', 'కాన్ఫిగరేషన్', 'settings open', 'system settings open'],
    enTitle: 'System & Hospital Settings',
    enVoice: 'Opening Hospital System Settings',
    teVoice: 'సిస్టమ్ సెట్టింగ్స్ విభాగాన్ని ఓపెన్ చేస్తున్నాను',
    mixedVoice: 'System settings open chestunnanu',
    reqRole: 'settings',
  },
];

/**
 * Natural Language AI Intent & Multilingual Command Processor
 */
export function processAICommand(
  rawInput: string,
  userRole: UserRole = 'super_admin',
  forcedLang?: 'auto' | 'en' | 'te'
): AICommandResponse {
  const query = rawInput.trim();
  const detectedLang: DetectedLanguage = forcedLang === 'en' ? 'en' : forcedLang === 'te' ? 'te' : detectLanguage(query);
  const qLower = query.toLowerCase();
  const metrics = computeLiveHospitalMetrics();

  // Helper for audit logging
  const logAudit = (intent: string, status: 'SUCCESS' | 'DENIED' | 'REQUIRES_CONFIRMATION') => {
    saveAIAuditLog({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userRole,
      query,
      language: detectedLang,
      intent,
      status,
    });
  };

  // -------------------------------------------------------------
  // 0. SENSITIVE WRITE ACTIONS (Explicit Confirmation Required)
  // -------------------------------------------------------------
  const isDestructive = /(cancel|delete|discharge|transfer|refund|allocate|రద్దు|డిశ్చార్జ్|బదిలీ|తొలగించు|cancel chey|discharge chey|transfer chey)/i.test(qLower);

  if (isDestructive) {
    // A. Cancel Appointment
    if (qLower.includes('appointment') || qLower.includes('అపాయింట్‌మెంట్') || qLower.includes('booking')) {
      logAudit('ACTION_CANCEL_APPOINTMENT_REQUEST', 'REQUIRES_CONFIRMATION');
      const pendingAction: AIActionPayload = {
        actionType: 'cancel_appointment',
        title: detectedLang === 'te' ? 'అపాయింట్‌మెంట్ రద్దు నిర్ధారణ' : 'Appointment Cancellation Confirmation',
        description: detectedLang === 'te' ? 'మీరు ఈ క్రింది అపాయింట్‌మెంట్ రికార్డును రద్దు చేయాలనుకుంటున్నారా?' : 'Are you sure you want to cancel this scheduled appointment? Please confirm.',
        details: {
          'Patient': 'Ramesh Yadav (ALN-2026-00001)',
          'Doctor': 'Dr. Rajesh Kumar (Cardiology)',
          'Scheduled Time': 'Today at 10:30 AM',
          'Current Status': 'Waiting',
        },
        targetRoute: '/appointments',
      };
      const voice = detectedLang === 'te'
        ? 'రమేష్ యాదవ్ గారి అపాయింట్‌మెంట్ రద్దు చేయాలా? దయచేసి నిర్ధారించండి.'
        : detectedLang === 'te-mixed'
        ? 'Ramesh Yadav appointment cancel cheyala? Please confirm cheyandi.'
        : 'Are you sure you want to cancel the appointment for Ramesh Yadav? Please confirm.';

      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'ACTION_CONFIRMATION',
        voiceText: voice,
        displayText: voice,
        pendingAction,
        results: performGlobalSearch('Ramesh', userRole),
      };
    }

    // B. Discharge Patient
    if (qLower.includes('discharge') || qLower.includes('డిశ్చార్జ్') || qLower.includes('patient discharge')) {
      logAudit('ACTION_DISCHARGE_PATIENT_REQUEST', 'REQUIRES_CONFIRMATION');
      const pendingAction: AIActionPayload = {
        actionType: 'discharge_patient',
        title: detectedLang === 'te' ? 'రోగి డిశ్చార్జ్ నిర్ధారణ' : 'Patient Discharge Authorization',
        description: detectedLang === 'te' ? 'ఈ క్రింది ఇన్-పేషెంట్‌ను డిశ్చార్జ్ చేయుటకు క్లినికల్ మరియు బిల్లింగ్ క్లియరెన్స్ నిర్ధారించండి.' : 'Are you sure you want to process the clinical discharge for this patient?',
        details: {
          'Patient': 'Deepak Mehta (ADM-001)',
          'Ward & Bed': 'MICU-01 (Bed 102)',
          'Admitting Doctor': 'Dr. Rajesh Kumar',
          'Billing Status': 'Clearance Pending Verification',
        },
        targetRoute: '/ipd',
      };
      const voice = detectedLang === 'te'
        ? 'దీపక్ మెహతా గారి డిశ్చార్జ్ ప్రక్రియను ప్రారంభించాలా? నిర్ధారించండి.'
        : detectedLang === 'te-mixed'
        ? 'Deepak Mehta discharge process confirm cheyandi.'
        : 'Are you sure you want to discharge patient Deepak Mehta? Please confirm.';

      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'ACTION_CONFIRMATION',
        voiceText: voice,
        displayText: voice,
        pendingAction,
        results: performGlobalSearch('Deepak', userRole),
      };
    }

    // C. Bed Transfer
    if (qLower.includes('transfer') || qLower.includes('బదిలీ') || qLower.includes('bed transfer')) {
      logAudit('ACTION_TRANSFER_BED_REQUEST', 'REQUIRES_CONFIRMATION');
      const pendingAction: AIActionPayload = {
        actionType: 'transfer_bed',
        title: detectedLang === 'te' ? 'బెడ్ బదిలీ నిర్ధారణ' : 'Bed Transfer Confirmation',
        description: detectedLang === 'te' ? 'రోగిని కొత్త వార్డు/బెడ్ కు మార్చడానికి అనుమతించండి.' : 'Are you sure you want to initiate a bed transfer for this patient?',
        details: {
          'Patient': 'Suresh Reddy (ADM-003)',
          'Current Bed': 'General Ward - GW-04',
          'Target Bed': 'Semi-Private - SP-02',
          'Reason': 'Post-operative observation',
        },
        targetRoute: '/ipd',
      };
      const voice = detectedLang === 'te'
        ? 'సురేష్ రెడ్డి గారి బెడ్ బదిలీని నిర్ధారించండి.'
        : detectedLang === 'te-mixed'
        ? 'Suresh Reddy bed transfer confirm cheyandi.'
        : 'Are you sure you want to transfer Suresh Reddy to a Semi-Private room? Please confirm.';

      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'ACTION_CONFIRMATION',
        voiceText: voice,
        displayText: voice,
        pendingAction,
        results: performGlobalSearch('Suresh', userRole),
      };
    }
  }

  // -------------------------------------------------------------
  // 1. SPECIFIC INTENT / LIVE HOSPITAL STATS QUERIES
  // -------------------------------------------------------------

  // A. Bed & ICU Availability Queries
  const isBedStat = /(available bed|available beds|how many beds|icu bed|icu beds|occupied beds|bed vacancy|బెడ్స్|బెడ్లు|ఎన్ని బెడ్లు|ఖాళీ బెడ్లు|available beds|icu beds enni|beds enni)/i.test(qLower);
  if (isBedStat) {
    if (qLower.includes('icu') || qLower.includes('ఐసియు') || qLower.includes('ఐసీయూ')) {
      logAudit('STAT_ICU_BEDS', 'SUCCESS');
      const voice = detectedLang === 'te'
        ? `ప్రస్తుతం ${metrics.availableIcuBeds} ఐసీయూ బెడ్లు అందుబాటులో ఉన్నాయి, మొత్తం ${metrics.icuTotal} లో.`
        : detectedLang === 'te-mixed'
        ? `Currently ${metrics.availableIcuBeds} ICU beds available unnayi, total ${metrics.icuTotal} beds lo.`
        : `Currently, ${metrics.availableIcuBeds} out of ${metrics.icuTotal} ICU beds are available.`;

      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'STAT_QUERY',
        voiceText: voice,
        displayText: voice,
        targetRoute: '/ipd',
        statSummary: {
          label: 'Available ICU Beds',
          value: `${metrics.availableIcuBeds} / ${metrics.icuTotal}`,
          subtitle: `${metrics.icuTotal - metrics.availableIcuBeds} ICU beds currently occupied`,
          variant: metrics.availableIcuBeds <= 2 ? 'danger' : 'success',
        },
        results: performGlobalSearch('icu', userRole),
      };
    }

    logAudit('STAT_TOTAL_BEDS', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ప్రస్తుతం ${metrics.availableBeds} బెడ్లు అందుబాటులో ఉన్నాయి, మొత్తం ${metrics.totalBeds} లో.`
      : detectedLang === 'te-mixed'
      ? `Currently ${metrics.availableBeds} beds available unnayi, ${metrics.occupiedBeds} occupied unnayi.`
      : `Currently, ${metrics.availableBeds} out of ${metrics.totalBeds} beds are available.`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/ipd',
      statSummary: {
        label: 'Hospital Bed Vacancy',
        value: `${metrics.availableBeds} Available`,
        subtitle: `${metrics.occupiedBeds} Occupied of ${metrics.totalBeds} Total Beds`,
        variant: 'success',
      },
      results: performGlobalSearch('bed', userRole),
    };
  }

  // B. OPD Patients & Queue
  const isOpdStat = /(today opd|today's opd|opd queue|waiting patients|opd patients|ఈరోజు opd|క్యూ|రోగులు|today opd patients|opd queue|waiting patients)/i.test(qLower);
  if (isOpdStat && (qLower.includes('patient') || qLower.includes('queue') || qLower.includes('waiting') || qLower.includes('ఎంత') || qLower.includes('ఎన్ని') || qLower.includes('చూపించు') || qLower.includes('chupinchu'))) {
    logAudit('STAT_OPD_QUEUE', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ఈరోజు OPD లో ${metrics.waitingOPD} మంది రోగులు కన్సల్టేషన్ కొరకు వేచి ఉన్నారు.`
      : detectedLang === 'te-mixed'
      ? `Today OPD lo ${metrics.waitingOPD} patients waiting queue lo unnaru.`
      : `There are currently ${metrics.waitingOPD} patients scheduled and waiting in the OPD queue today.`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/opd',
      statSummary: {
        label: "Today's OPD Queue",
        value: `${metrics.waitingOPD} Waiting`,
        subtitle: 'Live token and consultation triage active',
        variant: 'info',
      },
      results: performGlobalSearch('waiting', userRole),
    };
  }

  // C. Pharmacy Low Stock & Drug Inventory
  const isPharmaStat = /(low stock|stock|medicines|out of stock|expired|మందులు|స్టాక్|తక్కువ స్టాక్|low stock medicines|pharmacy stock|expired medicines)/i.test(qLower);
  if (isPharmaStat && !qLower.startsWith('open pharmacy') && !qLower.includes('ఫార్మసీ ఓపెన్ చేయి')) {
    if (!isAuthorizedFor(userRole, 'pharmacy')) {
      logAudit('PHARMACY_STAT_DENIED', 'DENIED');
      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'DENIED',
        voiceText: detectedLang === 'te' ? 'ఫార్మసీ స్టాక్ చూసేందుకు మీకు అనుమతి లేదు.' : 'Access Denied. You do not have permission to view pharmacy inventory.',
        displayText: detectedLang === 'te' ? 'ఈ విభాగాన్ని చూసేందుకు మీకు అనుమతి లేదు (RBAC Restriction).' : 'Access Denied: Your role does not have authorization to view pharmacy inventory.',
        results: [],
      };
    }

    logAudit('STAT_PHARMACY', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ఫార్మసీలో ${metrics.lowStockCount} రకాల మందులు రీ-ఆర్డర్ లెవల్ కన్నా తక్కువగా ఉన్నాయి.`
      : detectedLang === 'te-mixed'
      ? `Pharmacy lo ${metrics.lowStockCount} medicines low stock threshold lo unnayi.`
      : `There are ${metrics.lowStockCount} medicines at or below reorder level in pharmacy inventory.`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/pharmacy',
      statSummary: {
        label: 'Low Stock Alerts',
        value: `${metrics.lowStockCount} Medicines`,
        subtitle: 'Requires purchase order generation',
        variant: metrics.lowStockCount > 0 ? 'warning' : 'success',
      },
      results: performGlobalSearch('paracetamol', userRole).concat(performGlobalSearch('stock', userRole)),
    };
  }

  // D. Pending Lab Tests & Pathology
  const isLabStat = /(pending lab|lab reports|lab tests|pathology tests|ల్యాబ్ రిపోర్ట్స్|పెండింగ్ ల్యాబ్|pending lab reports|pending lab tests|today's lab reports)/i.test(qLower);
  if (isLabStat) {
    if (!isAuthorizedFor(userRole, 'laboratory')) {
      logAudit('LAB_STAT_DENIED', 'DENIED');
      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'DENIED',
        voiceText: detectedLang === 'te' ? 'ల్యాబ్ వివరాలను చూసేందుకు మీకు అనుమతి లేదు.' : 'Access Denied. You do not have permission to view laboratory diagnostics.',
        displayText: detectedLang === 'te' ? 'ఈ విభాగాన్ని చూసేందుకు మీకు అనుమతి లేదు (RBAC Restriction).' : 'Access Denied: Your role does not have authorization to view laboratory diagnostics.',
        results: [],
      };
    }

    logAudit('STAT_LAB', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ప్రస్తుతం ${metrics.pendingLab} ల్యాబ్ ఆర్డర్లు ప్రాసెసింగ్ లో ఉన్నాయి.`
      : detectedLang === 'te-mixed'
      ? `Currently ${metrics.pendingLab} lab orders pending processing lo unnayi.`
      : `Currently, ${metrics.pendingLab} laboratory diagnostic orders are pending processing.`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/laboratory',
      statSummary: {
        label: 'Pending Lab Orders',
        value: `${metrics.pendingLab} Orders`,
        subtitle: 'Sample collection and testing on schedule',
        variant: 'info',
      },
      results: performGlobalSearch('lab', userRole),
    };
  }

  // E. Blood Bank Stock & Specific Units
  const isBloodStat = /(blood units|blood stock|o positive|o\+|b positive|b\+|a positive|a\+|బ్లడ్ యూనిట్లు|బ్లడ్ స్టాక్|రక్తం|available blood units|o positive stock)/i.test(qLower);
  if (isBloodStat) {
    if (!isAuthorizedFor(userRole, 'bloodbank')) {
      logAudit('BLOOD_STAT_DENIED', 'DENIED');
      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'DENIED',
        voiceText: detectedLang === 'te' ? 'బ్లడ్ బ్యాంక్ వివరాలను చూసేందుకు అనుమతి లేదు.' : 'Access Denied. You do not have permission to view Blood Bank inventory.',
        displayText: detectedLang === 'te' ? 'ఈ విభాగాన్ని చూసేందుకు మీకు అనుమతి లేదు (RBAC Restriction).' : 'Access Denied: Your role does not have authorization to view Blood Bank records.',
        results: [],
      };
    }

    logAudit('STAT_BLOOD_BANK', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? 'బ్లడ్ బ్యాంక్ లో O+, B+, A+, AB+ గ్రూపుల యూనిట్లు అందుబాటులో ఉన్నాయి.'
      : detectedLang === 'te-mixed'
      ? 'Blood bank lo O positive, B positive, A positive units available unnayi.'
      : 'Blood bank inventory has verified active units available for O+, B+, A+, and AB+ blood groups.';

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/blood-bank',
      statSummary: {
        label: 'Blood Bank Inventory',
        value: 'Active Stock',
        subtitle: 'All blood groups tested and available',
        variant: 'success',
      },
      results: performGlobalSearch('blood', userRole),
    };
  }

  // F. Revenue & Billing Enquiries (Strict RBAC Protection)
  const isRevenueStat = /(revenue|collection|collections|outstanding|income|today's billing|ఆదాయం|కలెక్షన్|బకాయిలు|today collections|billing outstanding)/i.test(qLower);
  if (isRevenueStat) {
    if (!isAuthorizedFor(userRole, 'revenue')) {
      logAudit('REVENUE_DENIED', 'DENIED');
      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'DENIED',
        voiceText: detectedLang === 'te' ? 'ఆర్థిక వివరాలను చూసేందుకు మీకు అనుమతి లేదు.' : 'Access Denied. You do not have permission to view financial revenue data.',
        displayText: detectedLang === 'te' ? 'ఆర్థిక వివరాలను చూసేందుకు మీకు అనుమతి లేదు (RBAC Restriction).' : 'Access Denied: Financial and billing intelligence is restricted to authorized personnel.',
        results: [],
      };
    }

    logAudit('STAT_REVENUE', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ఈరోజు మొత్తం కలెక్షన్స్ ₹${metrics.totalRevenue.toLocaleString()} మరియు పెండింగ్ డ్యూస్ ₹${metrics.pendingCollections.toLocaleString()} ఉన్నాయి.`
      : detectedLang === 'te-mixed'
      ? `Realized revenue ₹${metrics.totalRevenue.toLocaleString()} and pending dues ₹${metrics.pendingCollections.toLocaleString()} unnayi.`
      : `Today's realized collections are ₹${metrics.totalRevenue.toLocaleString()} with ₹${metrics.pendingCollections.toLocaleString()} in pending receivables.`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/billing',
      statSummary: {
        label: 'Realized Collections',
        value: `₹${metrics.totalRevenue.toLocaleString()}`,
        subtitle: `₹${metrics.pendingCollections.toLocaleString()} pending receivables`,
        variant: 'success',
      },
      results: performGlobalSearch('invoice', userRole),
    };
  }

  // -------------------------------------------------------------
  // 2. MASTER NAVIGATION ROUTING (Auto Navigation for All Modules)
  // -------------------------------------------------------------
  for (const item of NAV_COMMAND_REGISTRY) {
    const matched = item.keywords.some(k => qLower.includes(k.toLowerCase()));
    if (matched) {
      if (item.reqRole && !isAuthorizedFor(userRole, item.reqRole)) {
        logAudit(`NAV_DENIED_${item.route.toUpperCase()}`, 'DENIED');
        return {
          rawQuery: query,
          detectedLanguage: detectedLang,
          intentType: 'DENIED',
          voiceText: detectedLang === 'te' ? 'ఈ విభాగాన్ని చూసేందుకు మీకు అనుమతి లేదు.' : 'Access Denied. You do not have permission to access this module.',
          displayText: detectedLang === 'te' ? 'ఈ విభాగాన్ని చూసేందుకు మీకు అనుమతి లేదు (RBAC Restriction).' : 'Access Denied: Your role does not have authorization to view this section.',
          results: [],
        };
      }

      logAudit(`NAV_${item.route.replace('/', '').toUpperCase()}`, 'SUCCESS');
      const voice = detectedLang === 'te' ? item.teVoice : detectedLang === 'te-mixed' ? item.mixedVoice : item.enVoice;
      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'NAVIGATE',
        voiceText: voice,
        displayText: voice,
        targetRoute: item.route,
        results: [{
          id: `nav-${item.route}`,
          category: 'nav',
          categoryLabel: item.categoryLabel,
          title: item.enTitle,
          subtitle: `Direct Route: ${item.route}`,
          badgeText: 'Navigating...',
          badgeVariant: 'primary',
          route: item.route,
        }],
      };
    }
  }

  // -------------------------------------------------------------
  // 3. EXACT ID & GENERAL SEARCH (Patients, Doctors, Invoices, etc.)
  // -------------------------------------------------------------
  const searchResults = performGlobalSearch(query, userRole);
  logAudit('SEARCH_QUERY', 'SUCCESS');

  if (searchResults.length > 0) {
    const topResult = searchResults[0];
    const voice = detectedLang === 'te'
      ? `నేను ${searchResults.length} సంబంధిత ఫలితాలను కనుగొన్నాను.`
      : detectedLang === 'te-mixed'
      ? `Nenu ${searchResults.length} matching records find chesanu.`
      : `I found ${searchResults.length} matching records for "${query}".`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'SEARCH',
      voiceText: voice,
      displayText: voice,
      targetRoute: topResult.route,
      results: searchResults,
    };
  }

  // -------------------------------------------------------------
  // 4. ZERO-HALLUCINATION FALLBACK
  // -------------------------------------------------------------
  const noResultVoice = detectedLang === 'te'
    ? `క్షమించండి, "${query}" కు సంబంధించిన వివరాలు ఏవీ లభించలేదు. దయచేసి సరైన కమాండ్ చెప్పండి.`
    : detectedLang === 'te-mixed'
    ? `Sorry, "${query}" ki matching details emi dorakaledu. Please try another command.`
    : `I couldn't find any matching records or commands for "${query}". Please try speaking or typing another command.`;

  return {
    rawQuery: query,
    detectedLanguage: detectedLang,
    intentType: 'INFORMATION',
    voiceText: noResultVoice,
    displayText: noResultVoice,
    results: [],
  };
}

