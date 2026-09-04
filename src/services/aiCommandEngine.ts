import {
  DEMO_PATIENTS, DEMO_DOCTORS, DEMO_APPOINTMENTS, DEMO_ADMISSIONS,
  DEMO_BEDS, DEMO_WARDS, DEMO_LAB_REQUESTS, DEMO_LAB_TESTS,
  DEMO_RADIOLOGY_STUDIES, DEMO_MEDICINES, DEMO_BILLS,
  DEMO_BLOOD_STOCK, DEMO_BLOOD_DONORS, DEMO_AMBULANCE_REQUESTS,
  DEMO_DIET_CHARTS
} from '../data/seedData';
import type { UserRole, BloodStock, Medicine, Bill, Admission } from '../types';

export type DetectedLanguage = 'en' | 'te' | 'te-mixed';

export interface AISearchResult {
  id: string;
  category: 'patient' | 'doctor' | 'appointment' | 'opd' | 'ipd' | 'bed' | 'pharmacy' | 'lab' | 'radiology' | 'bloodbank' | 'billing' | 'report' | 'nav';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal';
  route: string;
  metadata?: Record<string, any>;
}

export interface AIActionPayload {
  actionType: 'cancel_appointment' | 'transfer_bed' | 'discharge_patient' | 'emergency_dispatch' | 'reorder_medicine';
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

const AUDIT_LOGS: AIAuditLogEntry[] = [];

export function getAIAuditLogs(): AIAuditLogEntry[] {
  return [...AUDIT_LOGS];
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

  // Tanglish / Telugu-English code-mixed keywords
  const tanglishPatterns = [
    /\b(chupinchu|chupiyyi|choodu|kanipinchu|enti|enni|entha|unnayi|unnaru|undhi|undha|cheyi|veellu|pettu|kavali|ivala|ee\s*roju|repu|ninna|lo|ki|mariyu|ani)\b/i,
    /\b(patients|beds|doctors|revenue|pharmacy|stock|queue|opd|ipd|bill|report|icu)\s+(enni|entha|chupinchu|enti)\b/i
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
function isAuthorizedFor(role: UserRole = 'receptionist', target: string): boolean {
  if (role === 'super_admin' || role === 'hospital_admin' || role === 'management') return true;

  switch (target) {
    case 'financial':
    case 'revenue':
    case 'billing_admin':
      return ['super_admin', 'hospital_admin', 'billing_staff', 'management'].includes(role);
    case 'clinical_write':
    case 'prescriptions':
      return ['super_admin', 'hospital_admin', 'doctor'].includes(role);
    case 'nursing':
      return ['super_admin', 'hospital_admin', 'nurse', 'doctor'].includes(role);
    case 'admin':
      return ['super_admin', 'hospital_admin'].includes(role);
    default:
      return true;
  }
}

/**
 * Executes Global Cross-Module Search
 */
export function performGlobalSearch(query: string, userRole: UserRole = 'super_admin'): AISearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: AISearchResult[] = [];

  // 1. Patients Search
  DEMO_PATIENTS.forEach(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    if (fullName.includes(q) || p.id.toLowerCase().includes(q) || p.phone.includes(q) || p.city.toLowerCase().includes(q) || p.bloodGroup.toLowerCase().includes(q)) {
      results.push({
        id: `pat-${p.id}`,
        category: 'patient',
        categoryLabel: 'Patient Care',
        title: `${p.firstName} ${p.lastName} (${p.id})`,
        subtitle: `${p.gender.toUpperCase()} · ${p.phone} · Blood Group: ${p.bloodGroup} · ${p.city}`,
        badgeText: 'Registered Patient',
        badgeVariant: 'primary',
        route: `/patients`,
        metadata: p,
      });
    }
  });

  // 2. Doctors Search
  DEMO_DOCTORS.forEach(d => {
    if (d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.department.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)) {
      results.push({
        id: `doc-${d.id}`,
        category: 'doctor',
        categoryLabel: 'Doctor Directory',
        title: `${d.name}`,
        subtitle: `${d.specialization} · Department: ${d.department} · Fee: ₹${d.consultationFee}`,
        badgeText: d.isAvailable ? 'Available' : 'In Chamber',
        badgeVariant: d.isAvailable ? 'success' : 'warning',
        route: `/doctors`,
        metadata: d,
      });
    }
  });

  // 3. Appointments Search
  DEMO_APPOINTMENTS.forEach(a => {
    if (a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.department.toLowerCase().includes(q) || a.status.toLowerCase().includes(q)) {
      results.push({
        id: `apt-${a.id}`,
        category: 'appointment',
        categoryLabel: 'Appointment Desk',
        title: `Appointment: ${a.patientName} → Dr. ${a.doctorName}`,
        subtitle: `Slot: ${a.date} at ${a.time} · Dept: ${a.department} · Status: ${a.status.toUpperCase()}`,
        badgeText: a.status.toUpperCase(),
        badgeVariant: a.status === 'completed' ? 'success' : a.status === 'waiting' ? 'warning' : 'info',
        route: `/appointments`,
        metadata: a,
      });
    }
  });

  // 4. IPD Admissions & Bed Occupancy Search
  DEMO_ADMISSIONS.forEach(adm => {
    const diagStr = Array.isArray(adm.diagnosis) ? adm.diagnosis.join(', ') : '';
    if (adm.patientName.toLowerCase().includes(q) || adm.id.toLowerCase().includes(q) || adm.bedNumber.toLowerCase().includes(q) || adm.ward.toLowerCase().includes(q) || adm.admittingDoctorName.toLowerCase().includes(q) || diagStr.toLowerCase().includes(q)) {
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
    if (b.bedNumber.toLowerCase().includes(q) || b.ward.toLowerCase().includes(q) || b.type.toLowerCase().includes(q) || b.status.toLowerCase().includes(q)) {
      results.push({
        id: `bed-${b.id}`,
        category: 'bed',
        categoryLabel: 'Bed Management',
        title: `Bed ${b.bedNumber} (${b.ward})`,
        subtitle: `Type: ${b.type.toUpperCase()} · Rate: ₹${b.dailyRate}/day · Floor: ${b.floor} · Room: ${b.roomNumber || 'Open Ward'}`,
        badgeText: b.status.toUpperCase(),
        badgeVariant: b.status === 'available' ? 'success' : b.status === 'occupied' ? 'danger' : 'warning',
        route: `/ipd`,
        metadata: b,
      });
    }
  });

  // 6. Pharmacy & Medicines Search
  DEMO_MEDICINES.forEach(m => {
    const stock = getMedicineStock(m);
    if (m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q)) {
      results.push({
        id: `med-${m.id}`,
        category: 'pharmacy',
        categoryLabel: 'Pharmacy Inventory',
        title: `${m.name} (${m.strength})`,
        subtitle: `Generic: ${m.genericName} · Stock: ${stock} units · Reorder: ${m.reorderLevel} · Price: ₹${m.price || m.mrp}`,
        badgeText: stock <= m.reorderLevel ? 'LOW STOCK' : 'IN STOCK',
        badgeVariant: stock <= m.reorderLevel ? 'danger' : 'teal',
        route: `/pharmacy`,
        metadata: m,
      });
    }
  });

  // 7. Laboratory Requests & Tests Search
  DEMO_LAB_REQUESTS.forEach(req => {
    const testNames = req.tests.map(t => t.testName).join(', ');
    if (req.patientName.toLowerCase().includes(q) || req.id.toLowerCase().includes(q) || testNames.toLowerCase().includes(q) || req.doctorName.toLowerCase().includes(q) || req.status.toLowerCase().includes(q)) {
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

  // 8. Radiology Studies Search
  DEMO_RADIOLOGY_STUDIES.forEach(rad => {
    if (rad.patientName.toLowerCase().includes(q) || rad.id.toLowerCase().includes(q) || rad.modality.toLowerCase().includes(q) || rad.bodyPart.toLowerCase().includes(q) || rad.status.toLowerCase().includes(q)) {
      results.push({
        id: `rad-${rad.id}`,
        category: 'radiology',
        categoryLabel: 'Radiology Imaging',
        title: `${rad.modality.toUpperCase()} Scan: ${rad.bodyPart} (${rad.patientName})`,
        subtitle: `Ref Doctor: Dr. ${rad.doctorName} · Date: ${rad.scheduledDate} ${rad.scheduledTime} · Status: ${rad.status}`,
        badgeText: rad.status.toUpperCase(),
        badgeVariant: rad.status === 'completed' ? 'success' : 'info',
        route: `/radiology`,
        metadata: rad,
      });
    }
  });

  // 9. Blood Bank Inventory Search
  DEMO_BLOOD_STOCK.forEach((bs, index) => {
    if (bs.bloodGroup.toLowerCase().includes(q)) {
      results.push({
        id: `blood-${index}`,
        category: 'bloodbank',
        categoryLabel: 'Blood Bank Inventory',
        title: `${bs.bloodGroup} Blood Units`,
        subtitle: `Available Units: ${bs.units} bags · Last Updated: ${bs.lastUpdated}`,
        badgeText: `${bs.units} Units`,
        badgeVariant: bs.units <= 5 ? 'danger' : 'success',
        route: `/blood-bank`,
        metadata: bs,
      });
    }
  });

  // 10. Central Billing & Invoices Search (Authorized Roles Only)
  if (isAuthorizedFor(userRole, 'revenue')) {
    DEMO_BILLS.forEach(b => {
      if (b.patientName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.status.toLowerCase().includes(q)) {
        const total = b.total || b.totalAmount || 0;
        const bal = b.balanceDue || 0;
        results.push({
          id: `bill-${b.id}`,
          category: 'billing',
          categoryLabel: 'Central Billing',
          title: `Invoice ${b.billNumber || b.id} — ${b.patientName}`,
          subtitle: `Total: ₹${total.toLocaleString()} · Paid: ₹${b.paidAmount.toLocaleString()} · Balance: ₹${bal.toLocaleString()}`,
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
    AUDIT_LOGS.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userRole,
      query,
      language: detectedLang,
      intent,
      status,
    });
  };

  // -------------------------------------------------------------
  // 1. NAVIGATION INTENTS (English, Telugu, and Tanglish)
  // -------------------------------------------------------------
  const navMap: Record<string, { route: string; en: string; te: string; mixed: string; reqRole?: string }> = {
    'opd': { route: '/opd', en: 'Opening Outpatient Department (OPD)', te: 'OPD విభాగాన్ని ఓపెన్ చేస్తున్నాను', mixed: 'OPD section open chestunnanu' },
    'ipd': { route: '/ipd', en: 'Opening Inpatient Department (IPD) & Bed Management', te: 'IPD మరియు బెడ్ల విభాగాన్ని ఓపెన్ చేస్తున్నాను', mixed: 'IPD and Bed management open chestunnanu' },
    'pharmacy': { route: '/pharmacy', en: 'Navigating to Pharmacy POS & Drug Inventory', te: 'ఫార్మసీ విభాగానికి వెళ్తున్నాను', mixed: 'Pharmacy module ki velthunnanu' },
    'laboratory': { route: '/laboratory', en: 'Opening Clinical Pathology & Laboratory', te: 'ల్యాబొరేటరీ విభాగాన్ని ఓపెన్ చేస్తున్నాను', mixed: 'Laboratory orders open chestunnanu' },
    'radiology': { route: '/radiology', en: 'Opening Radiology & Diagnostic Imaging', te: 'రేడియోలజీ విభాగాన్ని ఓపెన్ చేస్తున్నాను', mixed: 'Radiology imaging open chestunnanu' },
    'blood': { route: '/blood-bank', en: 'Navigating to Blood Bank Inventory', te: 'బ్లడ్ బ్యాంక్ విభాగానికి వెళ్తున్నాను', mixed: 'Blood bank inventory open chestunnanu' },
    'billing': { route: '/billing', en: 'Opening Central Billing & Revenue Counter', te: 'సెంట్రల్ బిల్లింగ్ విభాగాన్ని ఓపెన్ చేస్తున్నాను', mixed: 'Central billing counter open chestunnanu', reqRole: 'revenue' },
    'reports': { route: '/reports', en: 'Opening Hospital Clinical & Operational Reports', te: 'హాస్పిటల్ రిపోర్టులు ఓపెన్ చేస్తున్నాను', mixed: 'Hospital reports open chestunnanu' },
    'appointments': { route: '/appointments', en: 'Navigating to Doctor Appointment Scheduling', te: 'అపాయింట్‌మెంట్ల విభాగానికి వెళ్తున్నాను', mixed: 'Doctor appointments list open chestunnanu' },
    'patients': { route: '/patients', en: 'Opening Patient Registration Directory', te: 'రోగుల రిజిస్ట్రేషన్ డైరెక్టరీ ఓపెన్ చేస్తున్నాను', mixed: 'Patient directory open chestunnanu' },
    'doctors': { route: '/doctors', en: 'Opening Medical Consultants Directory', te: 'వైద్యుల వివరాల జాబితా ఓపెన్ చేస్తున్నాను', mixed: 'Doctors directory open chestunnanu' },
    'ambulance': { route: '/ambulance', en: 'Opening Emergency & Ambulance Dispatch', te: 'ఎమర్జెన్సీ మరియు అంబులెన్స్ విభాగాన్ని ఓపెన్ చేస్తున్నాను', mixed: 'Emergency ambulance dispatch open chestunnanu' },
    'admin': { route: '/admin', en: 'Opening Hospital Administrative Governance', te: 'అడ్మిన్ ప్యానెల్ ఓపెన్ చేస్తున్నాను', mixed: 'Admin governance panel open chestunnanu', reqRole: 'admin' },
    'settings': { route: '/settings', en: 'Opening Hospital System Settings', te: 'సిస్టమ్ సెట్టింగ్స్ ఓపెన్ చేస్తున్నాను', mixed: 'System settings open chestunnanu', reqRole: 'admin' },
  };

  const isNavQuery = /(open|go to|show|take me to|navigate to|వెళ్ళు|ఓపెన్ చేయి|చూపించు|chupinchu|open cheyi|velthu)/i.test(qLower);

  for (const [key, nav] of Object.entries(navMap)) {
    if (qLower.includes(key) && isNavQuery && !qLower.includes('how many') && !qLower.includes('enni') && !qLower.includes('entha') && !qLower.includes('count')) {
      if (nav.reqRole && !isAuthorizedFor(userRole, nav.reqRole)) {
        logAudit('NAV_DENIED', 'DENIED');
        return {
          rawQuery: query,
          detectedLanguage: detectedLang,
          intentType: 'DENIED',
          voiceText: detectedLang === 'te' ? 'ఈ విభాగాన్ని చూసేందుకు మీకు అనుమతి లేదు.' : 'Access Denied. You do not have permission to access this module.',
          displayText: detectedLang === 'te' ? 'ఈ విభాగాన్ని చూసేందుకు మీకు అనుమతి లేదు (RBAC Restriction).' : 'Access Denied: Your role does not have authorization to view this section.',
          results: [],
        };
      }

      logAudit(`NAV_${key.toUpperCase()}`, 'SUCCESS');
      const voice = detectedLang === 'te' ? nav.te : detectedLang === 'te-mixed' ? nav.mixed : nav.en;
      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'NAVIGATE',
        voiceText: voice,
        displayText: voice,
        targetRoute: nav.route,
        results: [{
          id: `nav-${key}`,
          category: 'nav',
          categoryLabel: 'Hospital Navigation',
          title: nav.en,
          subtitle: `Direct Route: ${nav.route}`,
          badgeText: 'Go to Section',
          badgeVariant: 'primary',
          route: nav.route,
        }],
      };
    }
  }

  // -------------------------------------------------------------
  // 2. LIVE STATISTICAL QUERIES (English, Telugu, and Tanglish)
  // -------------------------------------------------------------

  // A. Bed & ICU Availability
  if (qLower.includes('bed') || qLower.includes('icu') || qLower.includes('బెడ్') || qLower.includes('బెడ్లు')) {
    if (qLower.includes('icu') || qLower.includes('ఐసియు')) {
      logAudit('STAT_ICU_BEDS', 'SUCCESS');
      const voice = detectedLang === 'te'
        ? `ప్రస్తుతం ${metrics.availableIcuBeds} ఐసియు బెడ్లు అందుబాటులో ఉన్నాయి, మొత్తం ${metrics.icuTotal} లో.`
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
      ? `ప్రస్తుతం ${metrics.availableBeds} బెడ్లు ఖాళీగా ఉన్నాయి, ${metrics.occupiedBeds} బెడ్లు ఆక్యుపై చేయబడ్డాయి.`
      : detectedLang === 'te-mixed'
      ? `Currently ${metrics.availableBeds} beds available unnayi, ${metrics.occupiedBeds} occupied unnayi.`
      : `Currently, ${metrics.availableBeds} beds are available and ${metrics.occupiedBeds} are occupied.`;

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

  // B. OPD & Queue Enquiries
  if (qLower.includes('opd') || qLower.includes('queue') || qLower.includes('waiting') || qLower.includes('క్యూ') || qLower.includes('రోగులు')) {
    logAudit('STAT_OPD_QUEUE', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ఈరోజు OPD లో ${metrics.waitingOPD} మంది రోగులు వేచి ఉన్నారు.`
      : detectedLang === 'te-mixed'
      ? `Today OPD lo ${metrics.waitingOPD} patients waiting lo unnaru.`
      : `There are currently ${metrics.waitingOPD} patients waiting in the OPD queue.`;

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
        subtitle: 'Live token and triage flow active',
        variant: 'info',
      },
      results: performGlobalSearch('waiting', userRole),
    };
  }

  // C. Revenue & Billing Enquiries (RBAC Enforced)
  if (qLower.includes('revenue') || qLower.includes('collection') || qLower.includes('income') || qLower.includes('ఆదాయం') || qLower.includes('కలెక్షన్') || qLower.includes('డబ్బు')) {
    if (!isAuthorizedFor(userRole, 'revenue')) {
      logAudit('REVENUE_DENIED', 'DENIED');
      return {
        rawQuery: query,
        detectedLanguage: detectedLang,
        intentType: 'DENIED',
        voiceText: detectedLang === 'te' ? 'ఆర్థిక వివరాలను చూసేందుకు మీకు అనుమతి లేదు.' : 'Access Denied. You do not have permission to view financial revenue data.',
        displayText: detectedLang === 'te' ? 'ఆర్థిక వివరాలను చూసేందుకు మీకు అనుమతి లేదు (RBAC Restriction).' : 'Access Denied: Financial and billing intelligence is restricted to authorized administrative personnel.',
        results: [],
      };
    }

    logAudit('STAT_REVENUE', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ఈరోజు మొత్తం కలెక్షన్స్ ₹${metrics.totalRevenue.toLocaleString()} మరియు పెండింగ్ డ్యూస్ ₹${metrics.pendingCollections.toLocaleString()} ఉన్నాయి.`
      : detectedLang === 'te-mixed'
      ? `Total realized collections ₹${metrics.totalRevenue.toLocaleString()} and pending dues ₹${metrics.pendingCollections.toLocaleString()} unnayi.`
      : `Total realized collections are ₹${metrics.totalRevenue.toLocaleString()} with ₹${metrics.pendingCollections.toLocaleString()} pending in receivables.`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/billing',
      statSummary: {
        label: 'Hospital Realized Collections',
        value: `₹${metrics.totalRevenue.toLocaleString()}`,
        subtitle: `₹${metrics.pendingCollections.toLocaleString()} pending receivables`,
        variant: 'success',
      },
      results: performGlobalSearch('invoice', userRole),
    };
  }

  // D. Pharmacy Stock & Expiry Enquiries
  if (qLower.includes('pharmacy') || qLower.includes('medicine') || qLower.includes('stock') || qLower.includes('మందులు') || qLower.includes('స్టాక్') || qLower.includes('paracetamol')) {
    logAudit('STAT_PHARMACY', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ఫార్మసీలో ${metrics.lowStockCount} రకాల మందులు రీ-ఆర్డర్ లెవల్ కన్నా తక్కువగా ఉన్నాయి.`
      : detectedLang === 'te-mixed'
      ? `Pharmacy lo ${metrics.lowStockCount} medicines low stock threshold lo unnayi.`
      : `There are ${metrics.lowStockCount} medicines at or below the reorder threshold in pharmacy inventory.`;

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
        subtitle: 'Requires purchase order reorder',
        variant: metrics.lowStockCount > 0 ? 'warning' : 'success',
      },
      results: performGlobalSearch('paracetamol', userRole).concat(performGlobalSearch('stock', userRole)),
    };
  }

  // E. Laboratory & Pathology Tests
  if (qLower.includes('lab') || qLower.includes('test') || qLower.includes('pathology') || qLower.includes('ల్యాబ్') || qLower.includes('టెస్ట్')) {
    logAudit('STAT_LAB', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? `ప్రస్తుతం ${metrics.pendingLab} ల్యాబ్ ఆర్డర్లు ప్రాసెసింగ్ లో ఉన్నాయి.`
      : detectedLang === 'te-mixed'
      ? `Currently ${metrics.pendingLab} lab orders pending processing lo unnayi.`
      : `Currently, ${metrics.pendingLab} laboratory test requests are pending processing.`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/laboratory',
      statSummary: {
        label: 'Pending Lab Tests',
        value: `${metrics.pendingLab} Orders`,
        subtitle: 'Diagnostic processing on schedule',
        variant: 'info',
      },
      results: performGlobalSearch('lab', userRole),
    };
  }

  // F. Blood Bank Stock
  if (qLower.includes('blood') || qLower.includes('బ్లడ్') || qLower.includes('రక్తం') || qLower.includes('positive') || qLower.includes('negative')) {
    logAudit('STAT_BLOOD_BANK', 'SUCCESS');
    const voice = detectedLang === 'te'
      ? 'బ్లడ్ బ్యాంక్ లో O+, B+, A+ గ్రూప్ యూనిట్లు అందుబాటులో ఉన్నాయి.'
      : detectedLang === 'te-mixed'
      ? 'Blood bank lo O positive, B positive, A positive units available unnayi.'
      : 'Blood bank inventory has active units available for O+, B+, A+, and AB+ blood groups.';

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'STAT_QUERY',
      voiceText: voice,
      displayText: voice,
      targetRoute: '/blood-bank',
      results: performGlobalSearch('blood', userRole),
    };
  }

  // -------------------------------------------------------------
  // 3. SENSITIVE WRITE ACTIONS (Requires Explicit Confirmation)
  // -------------------------------------------------------------
  if (qLower.includes('cancel') || qLower.includes('రద్దు') || qLower.includes('discharge') || qLower.includes('డిశ్చార్జ్') || qLower.includes('transfer') || qLower.includes('బదిలీ')) {
    logAudit('ACTION_SENSITIVE_REQUEST', 'REQUIRES_CONFIRMATION');

    if (qLower.includes('appointment') || qLower.includes('రద్దు')) {
      const pendingAction: AIActionPayload = {
        actionType: 'cancel_appointment',
        title: detectedLang === 'te' ? 'అపాయింట్‌మెంట్ రద్దు నిర్ధారణ' : 'Appointment Cancellation Confirmation',
        description: detectedLang === 'te' ? 'మీరు ఈ క్రింది అపాయింట్‌మెంట్ ను రద్దు చేయాలనుకుంటున్నారా?' : 'You are about to cancel this appointment record. Please confirm to proceed.',
        details: {
          'Patient': 'Ramesh Yadav',
          'Doctor': 'Dr. Rajesh Kumar (Cardiology)',
          'Date & Time': 'Today, 10:30 AM',
          'Status': 'Scheduled (Waiting)',
        },
        targetRoute: '/appointments',
      };

      const voice = detectedLang === 'te'
        ? 'రమేష్ యాదవ్ గారి అపాయింట్‌మెంట్ రద్దు చేయాలా? దయచేసి కన్ఫర్మ్ చేయండి.'
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
  }

  // -------------------------------------------------------------
  // 4. GENERAL SEARCH FALLBACK (Deep Cross-Module Querying)
  // -------------------------------------------------------------
  const searchResults = performGlobalSearch(query, userRole);
  logAudit('SEARCH_QUERY', 'SUCCESS');

  if (searchResults.length > 0) {
    const voice = detectedLang === 'te'
      ? `నేను ${searchResults.length} సంబంధిత రికార్డులను కనుగొన్నాను.`
      : detectedLang === 'te-mixed'
      ? `Nenu ${searchResults.length} matching records find chesanu.`
      : `I found ${searchResults.length} matching records for "${query}".`;

    return {
      rawQuery: query,
      detectedLanguage: detectedLang,
      intentType: 'SEARCH',
      voiceText: voice,
      displayText: voice,
      results: searchResults,
    };
  }

  // 5. NO RECORD FOUND (Zero Hallucination Guardrail)
  const noResultVoice = detectedLang === 'te'
    ? `క్షమించండి, హాస్పిటల్ డేటాబేస్ లో "${query}" కు సంబంధించిన వివరాలు ఏవీ లభించలేదు.`
    : detectedLang === 'te-mixed'
    ? `Sorry, hospital database lo "${query}" ki matching details emi dorakaledu.`
    : `I couldn't find any matching records for "${query}" in the hospital database.`;

  return {
    rawQuery: query,
    detectedLanguage: detectedLang,
    intentType: 'INFORMATION',
    voiceText: noResultVoice,
    displayText: noResultVoice,
    results: [],
  };
}
