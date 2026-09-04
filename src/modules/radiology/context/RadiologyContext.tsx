import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ComprehensiveRadiologyOrder,
  RadiologyModalityItem,
  RadiologyExaminationItem,
  RadiologyPackageItem,
  RadiologyEquipmentItem,
  RadiologyCriticalAlert,
  RadiologyReportTemplate,
  RadiologyDashboardKPIs,
  RadiologyModalityType,
  RadiologyPriority,
  RadiologyOrderStatus,
  RadiologyCheckInStatus,
  RadiologyReportStatus,
  RadiologySafetyChecklist,
  ContrastAdministrationRecord,
} from '../../../types';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';

export type RadiologyTab =
  | 'dashboard'
  | 'orders'
  | 'scheduling'
  | 'check_in'
  | 'worklist'
  | 'studies'
  | 'reporting'
  | 'verification'
  | 'critical_findings'
  | 'reports_archive'
  | 'patient_history'
  | 'billing'
  | 'modalities'
  | 'examinations'
  | 'equipment'
  | 'packages'
  | 'analytics'
  | 'statistical_reports'
  | 'settings';

interface RadiologyContextType {
  activeTab: RadiologyTab;
  setActiveTab: (tab: RadiologyTab) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedAccessionNumber: string | null;
  setSelectedAccessionNumber: (acc: string | null) => void;

  radiologyOrders: ComprehensiveRadiologyOrder[];
  modalities: RadiologyModalityItem[];
  examinations: RadiologyExaminationItem[];
  packages: RadiologyPackageItem[];
  equipment: RadiologyEquipmentItem[];
  criticalAlerts: RadiologyCriticalAlert[];
  reportTemplates: RadiologyReportTemplate[];
  kpis: RadiologyDashboardKPIs;

  // Order & Workflow Actions
  createRadiologyOrder: (data: Omit<ComprehensiveRadiologyOrder, 'id' | 'orderNumber' | 'accessionNumber' | 'status' | 'checkInStatus' | 'safetyChecklist' | 'version' | 'reportStatus' | 'isCriticalFinding'>) => ComprehensiveRadiologyOrder;
  scheduleExamination: (orderId: string, scheduledDate: string, scheduledTime: string, roomNumber: string) => void;
  rescheduleExamination: (orderId: string, newDate: string, newTime: string, reason: string) => void;
  checkInPatient: (orderId: string, status?: RadiologyCheckInStatus) => void;
  updateSafetyChecklist: (orderId: string, checklist: Partial<RadiologySafetyChecklist>) => void;
  recordContrastAdministration: (orderId: string, contrast: ContrastAdministrationRecord) => void;
  startExamination: (orderId: string, technicianName: string) => void;
  completeExamination: (orderId: string, studyUid: string, seriesCount: number, imageCount: number) => void;
  saveReportDraft: (orderId: string, reportData: { technique: string; findingsText: string; impressionText: string; recommendations?: string; radiologistName: string }) => void;
  verifyAndReleaseReport: (orderId: string, reportData: { technique: string; findingsText: string; impressionText: string; recommendations?: string; radiologistName: string }) => void;
  amendRadiologyReport: (orderId: string, amendedFindings: string, amendedImpression: string, amendmentReason: string, radiologistName: string) => void;
  escalateCriticalFinding: (orderId: string, findingDescription: string, radiologistName: string) => void;
  acknowledgeCriticalAlert: (alertId: string, acknowledgedBy: string) => void;
  cancelRadiologyOrder: (orderId: string, reason: string) => void;

  // Masters Management
  addModalityMaster: (modality: Omit<RadiologyModalityItem, 'id'>) => void;
  updateModalityMaster: (id: string, updates: Partial<RadiologyModalityItem>) => void;
  toggleModalityStatus: (id: string) => void;

  addExamMaster: (exam: Omit<RadiologyExaminationItem, 'id'>) => void;
  updateExamMaster: (id: string, updates: Partial<RadiologyExaminationItem>) => void;
  toggleExamStatus: (id: string) => void;

  addRadiologyPackage: (pkg: Omit<RadiologyPackageItem, 'id'>) => void;
  updateRadiologyPackage: (id: string, updates: Partial<RadiologyPackageItem>) => void;
  togglePackageStatus: (id: string) => void;

  addEquipment: (item: Omit<RadiologyEquipmentItem, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<RadiologyEquipmentItem>) => void;
  recordMaintenance: (id: string, nextDate: string, notes: string) => void;
}

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------

const DEFAULT_MODALITIES: RadiologyModalityItem[] = [
  { id: 'mod-xray', modalityCode: 'XR-01', modalityName: 'Digital Radiography (X-Ray)', modalityType: 'xray', department: 'Diagnostic Radiology', roomNumber: 'Room 101 (Ground Floor)', machineName: 'Philips DuraDiagnost Digital X-Ray', manufacturer: 'Philips Healthcare', model: 'DuraDiagnost F30', location: 'Radiology Wing A', availabilityStatus: 'available', isActive: true },
  { id: 'mod-ct', modalityCode: 'CT-01', modalityName: '128-Slice Multidetector CT', modalityType: 'ct', department: 'Advanced Imaging', roomNumber: 'Room 104 (Ground Floor)', machineName: 'GE Revolution EVO 128-Slice CT', manufacturer: 'GE Healthcare', model: 'Revolution EVO Gen3', location: 'Radiology Wing B', availabilityStatus: 'available', isActive: true },
  { id: 'mod-mri', modalityCode: 'MR-01', modalityName: '1.5T Superconducting High-Field MRI', modalityType: 'mri', department: 'Magnetic Resonance Imaging', roomNumber: 'Room 108 (Ground Floor)', machineName: 'Siemens MAGNETOM Altea 1.5T', manufacturer: 'Siemens Healthineers', model: 'MAGNETOM Altea', location: 'Radiology Wing C (Shielded)', availabilityStatus: 'available', isActive: true },
  { id: 'mod-usg', modalityCode: 'US-01', modalityName: 'High-Resolution Ultrasound & Color Doppler', modalityType: 'ultrasound', department: 'Ultrasonography', roomNumber: 'Room 102 (Ground Floor)', machineName: 'Mindray Resona I9 Ultrasound', manufacturer: 'Mindray Medical', model: 'Resona I9', location: 'Radiology Wing A', availabilityStatus: 'available', isActive: true },
  { id: 'mod-mammo', modalityCode: 'MM-01', modalityName: 'Full-Field Digital Mammography (3D Tomosynthesis)', modalityType: 'mammography', department: 'Women Imaging Center', roomNumber: 'Room 105 (Ground Floor)', machineName: 'Hologic Selenia Dimensions 3D', manufacturer: 'Hologic', model: 'Dimensions 3D', location: 'Women Wellness Suite', availabilityStatus: 'available', isActive: true },
  { id: 'mod-dexa', modalityCode: 'DX-01', modalityName: 'DEXA Bone Densitometer', modalityType: 'dexa', department: 'Bone Health', roomNumber: 'Room 106 (Ground Floor)', machineName: 'Hologic Horizon DXA System', manufacturer: 'Hologic', model: 'Horizon A', location: 'Radiology Wing A', availabilityStatus: 'available', isActive: true },
];

const DEFAULT_EXAMINATIONS: RadiologyExaminationItem[] = [
  { id: 'exam-cxr', examCode: 'RAD-XR-001', examName: 'Chest X-Ray (PA View)', modalityType: 'xray', bodyPart: 'Chest / Thorax', description: 'Standard posteroanterior projection to evaluate lungs, cardiac silhouette, and mediastinum', preparationInstructions: 'Remove upper body clothing and metal jewelry. Wear hospital gown.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 10, turnaroundHours: 2, price: 600, isActive: true },
  { id: 'exam-ct-brain', examCode: 'RAD-CT-001', examName: 'CT Brain (Non-Contrast Plain)', modalityType: 'ct', bodyPart: 'Brain / Cranium', description: 'Rapid helical non-contrast CT to evaluate stroke, intracranial hemorrhage, or trauma', preparationInstructions: 'Remove hairpins, earrings, dentures, and eyeglasses.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 15, turnaroundHours: 3, price: 3500, isActive: true },
  { id: 'exam-ct-chest-hrct', examCode: 'RAD-CT-002', examName: 'HRCT Chest (High Resolution CT)', modalityType: 'ct', bodyPart: 'Lungs / Thorax', description: 'Thin-slice high resolution pulmonary evaluation for interstitial lung disease and pneumonia', preparationInstructions: 'Remove metallic necklaces and underwire clothing.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 15, turnaroundHours: 4, price: 4500, isActive: true },
  { id: 'exam-ct-abd-cect', examCode: 'RAD-CT-003', examName: 'CECT Whole Abdomen & Pelvis (Triple Phase)', modalityType: 'ct', bodyPart: 'Abdomen & Pelvis', description: 'Intravenous and oral contrast-enhanced multiphase abdominal scan for visceral pathologies', preparationInstructions: '4-6 hours fasting. Check serum creatinine prior to IV contrast injection.', contrastRequired: true, fastingRequired: true, estimatedDurationMins: 30, turnaroundHours: 6, price: 7500, isActive: true },
  { id: 'exam-mri-brain', examCode: 'RAD-MR-001', examName: 'MRI Brain with MR Angiography (MRA)', modalityType: 'mri', bodyPart: 'Brain & Neurovascular', description: 'Multiplanar T1, T2, FLAIR, DWI, SWI and 3D TOF neurovascular study', preparationInstructions: 'Complete MRI safety questionnaire. Strictly remove all ferromagnetic objects and pacemakers.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 40, turnaroundHours: 6, price: 8500, isActive: true },
  { id: 'exam-mri-lspine', examCode: 'RAD-MR-002', examName: 'MRI Lumbar Spine (LS Spine)', modalityType: 'mri', bodyPart: 'Lumbar Spine', description: 'Detailed sagittal and axial evaluation of vertebrae, disc herniation, and nerve roots', preparationInstructions: 'Remove metallic belts, coins, and electronic keys. Notify if claustrophobic.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 30, turnaroundHours: 6, price: 7500, isActive: true },
  { id: 'exam-usg-abd', examCode: 'RAD-US-001', examName: 'USG Whole Abdomen & Pelvis', modalityType: 'ultrasound', bodyPart: 'Abdomen & Pelvis', description: 'Real-time B-mode sonography of liver, gallbladder, pancreas, spleen, kidneys, and urinary bladder', preparationInstructions: '6 hours fasting for gallbladder. Drink 1 liter water 1 hour prior for full urinary bladder.', contrastRequired: false, fastingRequired: true, estimatedDurationMins: 20, turnaroundHours: 2, price: 1800, isActive: true },
  { id: 'exam-usg-tiffa', examCode: 'RAD-US-002', examName: 'USG Obstetric TIFFA / Anomaly Scan (18-22 Weeks)', modalityType: 'ultrasound', bodyPart: 'Fetal / Obstetrics', description: 'Targeted Imaging for Fetal Anomalies to assess fetal anatomical organ development', preparationInstructions: 'No fasting required. Moderate bladder filling recommended.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 35, turnaroundHours: 3, price: 3200, isActive: true },
  { id: 'exam-mammo', examCode: 'RAD-MM-001', examName: 'Bilateral Digital Mammography (CC & MLO Views)', modalityType: 'mammography', bodyPart: 'Breast (Bilateral)', description: 'Standard craniocaudal and mediolateral oblique views for breast screening and mass detection', preparationInstructions: 'Do not apply deodorants, talcum powders, or lotions on breasts/underarms on exam day.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 20, turnaroundHours: 4, price: 2500, isActive: true },
  { id: 'exam-dexa', examCode: 'RAD-DX-001', examName: 'DEXA Bone Mineral Density (Spine & Hip)', modalityType: 'dexa', bodyPart: 'Lumbar Spine & Femoral Neck', description: 'Dual-energy X-ray absorptiometry for T-Score/Z-Score osteoporosis assessment', preparationInstructions: 'Avoid calcium supplements 24 hours prior to scan.', contrastRequired: false, fastingRequired: false, estimatedDurationMins: 15, turnaroundHours: 2, price: 2200, isActive: true },
];

const DEFAULT_PACKAGES: RadiologyPackageItem[] = [
  { id: 'pkg-exec-imaging', packageCode: 'RAD-PKG-01', packageName: 'Executive Health Imaging Profile', examIds: ['exam-cxr', 'exam-usg-abd', 'exam-dexa'], price: 3900, discountPercentage: 15, isActive: true, description: 'Comprehensive baseline imaging package including Chest X-Ray, Abdominal Sonography, and DEXA Bone Density' },
  { id: 'pkg-stroke-panel', packageCode: 'RAD-PKG-02', packageName: 'Acute Stroke Rapid Diagnostic Panel', examIds: ['exam-ct-brain', 'exam-mri-brain'], price: 10500, discountPercentage: 12, isActive: true, description: 'Rapid neuroimaging bundle for ischemic/hemorrhagic stroke detection and vascular flow analysis' },
  { id: 'pkg-spine-panel', packageCode: 'RAD-PKG-03', packageName: 'Comprehensive Spine & Joint Health Panel', examIds: ['exam-cxr', 'exam-mri-lspine', 'exam-dexa'], price: 9200, discountPercentage: 10, isActive: true, description: 'Specialist musculoskeletal evaluation for chronic back pain, radiculopathy, and bone density' },
];

const DEFAULT_EQUIPMENT: RadiologyEquipmentItem[] = [
  { id: 'eq-ct-01', equipmentName: 'GE Revolution EVO 128 CT', modalityType: 'ct', manufacturer: 'GE Healthcare', model: 'Revolution EVO', serialNumber: 'GE-CT-88392', roomLocation: 'Room 104', status: 'available', installationDate: '2023-04-15', lastMaintenanceDate: '2026-07-10', nextMaintenanceDate: '2026-10-10', isActive: true },
  { id: 'eq-mr-01', equipmentName: 'Siemens MAGNETOM Altea 1.5T', modalityType: 'mri', manufacturer: 'Siemens Healthineers', model: 'Altea 1.5T', serialNumber: 'SIE-MR-44120', roomLocation: 'Room 108', status: 'available', installationDate: '2022-11-20', lastMaintenanceDate: '2026-08-01', nextMaintenanceDate: '2026-11-01', isActive: true },
  { id: 'eq-xr-01', equipmentName: 'Philips DuraDiagnost X-Ray', modalityType: 'xray', manufacturer: 'Philips Healthcare', model: 'DuraDiagnost F30', serialNumber: 'PH-XR-99124', roomLocation: 'Room 101', status: 'available', installationDate: '2023-01-10', lastMaintenanceDate: '2026-06-15', nextMaintenanceDate: '2026-09-15', isActive: true },
  { id: 'eq-us-01', equipmentName: 'Mindray Resona I9 USG', modalityType: 'ultrasound', manufacturer: 'Mindray', model: 'Resona I9', serialNumber: 'MR-US-10294', roomLocation: 'Room 102', status: 'available', installationDate: '2024-02-14', lastMaintenanceDate: '2026-08-15', nextMaintenanceDate: '2026-11-15', isActive: true },
];

const DEFAULT_TEMPLATES: RadiologyReportTemplate[] = [
  {
    id: 'tmpl-cxr-normal',
    templateName: 'Chest X-Ray PA — Normal Adult',
    modalityType: 'xray',
    bodyPart: 'Chest / Thorax',
    defaultTechnique: 'Standard digital posteroanterior radiograph of the chest obtained in full inspiratory effort.',
    defaultFindings: '• The trachea is midline.\n• Cardiothoracic ratio is within normal limits (CTR < 0.50).\n• Both lung fields are clear of any focal consolidation, active infiltration, collapse, or pleural effusion.\n• Bronchovascular markings are normal in distribution.\n• Both costophrenic angles and cardiophrenic sulci are sharp and clear.\n• Visualized thoracic cage and bony rib cage appear intact with no evidence of acute fracture or lytic lesion.\n• Both hemidiaphragms are smooth and normal in contour.',
    defaultImpression: 'No acute cardiopulmonary disease detected on this chest radiograph.',
    defaultRecommendations: 'Clinical correlation advised.',
  },
  {
    id: 'tmpl-ct-brain-normal',
    templateName: 'CT Brain Plain — Normal Study',
    modalityType: 'ct',
    bodyPart: 'Brain / Cranium',
    defaultTechnique: 'Non-contrast contiguous axial helical CT sections of the brain obtained from skull base to vertex.',
    defaultFindings: '• Symmetrical bilateral cerebral and cerebellar hemispheres.\n• Normal attenuation of gray and white matter with preserved gray-white differentiation.\n• No evidence of acute intra-axial or extra-axial hemorrhage, hematoma, or mass effect.\n• Ventricular system, basal cisterns, and cortical sulci are within normal limits for age.\n• Midline structures are central with no midline shift.\n• Sella and parasellar regions appear unremarkable.\n• Calvarium and visualized facial bones show no acute fracture.',
    defaultImpression: 'Normal non-contrast CT study of the brain. No acute intracranial hemorrhage or mass effect.',
    defaultRecommendations: 'Follow-up or MRI study if neurological symptoms persist.',
  },
  {
    id: 'tmpl-mri-lspine',
    templateName: 'MRI Lumbar Spine — Disc Herniation Protocol',
    modalityType: 'mri',
    bodyPart: 'Lumbar Spine',
    defaultTechnique: 'Multiplanar T1, T2 weighted sagittal and axial MR images of the lumbar spine obtained on a 1.5T scanner.',
    defaultFindings: '• Normal lumbar lordosis is maintained.\n• Vertebral body heights and marrow signal intensities are preserved.\n• L4-L5 Level: Moderate diffuse disc bulge with posterior paracentral protrusion indenting the thecal sac and narrowing the left neural foramen, causing mild abutment of the traversing L5 nerve root.\n• L5-S1 Level: Mild broad-based posterior disc bulge without significant canal stenosis.\n• Conus medullaris terminates normally at the L1-L2 disc level.\n• Cauda equina nerve roots are normal in distribution.',
    defaultImpression: 'L4-L5 disc protrusion with mild thecal sac compression and left neural foraminal narrowing. Mild degenerative spondylosis.',
    defaultRecommendations: 'Clinical correlation with radiculopathy symptoms; physiotherapy or orthopedic review advised.',
  },
];

const DEFAULT_ORDERS: ComprehensiveRadiologyOrder[] = [
  {
    id: 'rad-ord-001',
    orderNumber: 'RAD-ORD-2026-00001',
    accessionNumber: 'RAD-2026-000001',
    patientId: DEMO_PATIENTS[0]?.id || 'ALN-2026-00001',
    patientName: `${DEMO_PATIENTS[0]?.firstName || 'Aarav'} ${DEMO_PATIENTS[0]?.lastName || 'Patel'}`,
    age: (DEMO_PATIENTS[0] as any)?.age || 38,
    gender: DEMO_PATIENTS[0]?.gender || 'male',
    encounterType: 'ipd',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    referringDoctorId: DEMO_DOCTORS[0]?.id || 'doc-1',
    referringDoctorName: DEMO_DOCTORS[0]?.name || 'Dr. Rajesh Sharma',
    department: 'General Medicine',
    orderDate: '2026-09-02 08:30',
    scheduledDate: '2026-09-02',
    scheduledTime: '10:00',
    priority: 'stat',
    modalityType: 'ct',
    examId: 'exam-ct-brain',
    examName: 'CT Brain (Non-Contrast Plain)',
    bodyPart: 'Brain / Cranium',
    clinicalIndication: 'Acute sudden onset left-sided weakness and slurred speech (Rule out stroke / hemorrhage)',
    contrastRequired: false,
    price: 3500,
    paymentStatus: 'paid',
    status: 'completed',
    checkInStatus: 'completed',
    safetyChecklist: { patientIdentityVerified: true, examinationVerified: true, consentStatus: 'obtained', fastingConfirmed: true, metalRemoved: true, contrastAllergyChecked: true, pregnancyChecked: true, remarks: 'Verified by Staff Nurse Priya' },
    technicianName: 'Kunal Joshi (Senior Radiographer)',
    technicianAt: '2026-09-02 10:25',
    studyUid: '1.2.840.113619.2.55.3.2831164.20260902.1001',
    seriesCount: 4,
    imageCount: 160,
    reportStatus: 'pending_verification',
    findingsText: '• Acute hyperdense area measuring approximately 2.4 x 1.8 cm noted in the right basal ganglia and internal capsule region with surrounding perilesional edema.\n• Mild mass effect causing partial effacement of the right lateral ventricle frontal horn.\n• Midline shift of 2.8 mm to the left.\n• No subarachnoid or intraventricular hemorrhage noted.',
    impressionText: 'ACUTE RIGHT BASAL GANGLIA INTRACEREBRAL HEMATOMA WITH MILD MASS EFFECT AND 2.8 MM MIDLINE SHIFT. CRITICAL ALERT ESCALATED TO ATTENDING PHYSICIAN.',
    recommendations: 'Immediate neurosurgical / stroke team consultation and ICU monitoring.',
    radiologistName: 'Dr. Vivek Malhotra, MD (Radiodiagnosis)',
    radiologistAt: '2026-09-02 10:50',
    isCriticalFinding: true,
    criticalFindingRemarks: 'Acute Intracerebral Hematoma with Midline Shift',
    version: 1,
  },
  {
    id: 'rad-ord-002',
    orderNumber: 'RAD-ORD-2026-00002',
    accessionNumber: 'RAD-2026-000002',
    patientId: DEMO_PATIENTS[1]?.id || 'ALN-2026-00002',
    patientName: `${DEMO_PATIENTS[1]?.firstName || 'Priya'} ${DEMO_PATIENTS[1]?.lastName || 'Deshmukh'}`,
    age: (DEMO_PATIENTS[1] as any)?.age || 42,
    gender: DEMO_PATIENTS[1]?.gender || 'female',
    encounterType: 'ipd',
    bedNumber: 'ICU-01',
    ward: 'Intensive Care Unit',
    referringDoctorId: DEMO_DOCTORS[1]?.id || 'doc-2',
    referringDoctorName: DEMO_DOCTORS[1]?.name || 'Dr. Anita Desai',
    department: 'Critical Care & Cardiology',
    orderDate: '2026-09-02 09:15',
    scheduledDate: '2026-09-02',
    scheduledTime: '11:30',
    priority: 'urgent',
    modalityType: 'xray',
    examId: 'exam-cxr',
    examName: 'Chest X-Ray (PA View)',
    bodyPart: 'Chest / Thorax',
    clinicalIndication: 'Persistent fever, cough with purulent expectoration, dyspnea. Evaluate pneumonia.',
    contrastRequired: false,
    price: 600,
    paymentStatus: 'paid',
    status: 'verified',
    checkInStatus: 'completed',
    safetyChecklist: { patientIdentityVerified: true, examinationVerified: true, consentStatus: 'not_required', fastingConfirmed: true, metalRemoved: true, contrastAllergyChecked: true, pregnancyChecked: true },
    technicianName: 'Suresh Patil (Radiology Tech)',
    technicianAt: '2026-09-02 11:45',
    studyUid: '1.2.840.113619.2.55.3.2831164.20260902.1002',
    seriesCount: 1,
    imageCount: 2,
    radiologistName: 'Dr. Vivek Malhotra, MD (Radiodiagnosis)',
    radiologistAt: '2026-09-02 12:15',
    technique: 'Digital PA chest radiograph obtained in erect posture.',
    findingsText: '• Ill-defined non-homogeneous patchy airspace consolidation noted in the right lower lobe with prominent air bronchograms.\n• Costophrenic angle blunting on the right suggestive of mild reactive pleural effusion.\n• Left lung field is clear.\n• Cardiac size is within normal limits.',
    impressionText: 'RIGHT LOWER LOBE PNEUMONIA WITH MILD REACTIVE RIGHT PLEURAL EFFUSION.',
    recommendations: 'Antibiotic therapy and repeat radiograph after 10-14 days for resolution.',
    reportStatus: 'verified',
    isCriticalFinding: false,
    version: 1,
  },
  {
    id: 'rad-ord-003',
    orderNumber: 'RAD-ORD-2026-00003',
    accessionNumber: 'RAD-2026-000003',
    patientId: DEMO_PATIENTS[2]?.id || 'ALN-2026-00003',
    patientName: `${DEMO_PATIENTS[2]?.firstName || 'Rahul'} ${DEMO_PATIENTS[2]?.lastName || 'Verma'}`,
    age: (DEMO_PATIENTS[2] as any)?.age || 52,
    gender: DEMO_PATIENTS[2]?.gender || 'male',
    encounterType: 'opd',
    referringDoctorId: DEMO_DOCTORS[2]?.id || 'doc-3',
    referringDoctorName: DEMO_DOCTORS[2]?.name || 'Dr. Vikram Seth',
    department: 'Orthopedics',
    orderDate: '2026-09-02 10:00',
    scheduledDate: '2026-09-02',
    scheduledTime: '14:00',
    priority: 'routine',
    modalityType: 'mri',
    examId: 'exam-mri-lspine',
    examName: 'MRI Lumbar Spine (LS Spine)',
    bodyPart: 'Lumbar Spine',
    clinicalIndication: 'Chronic severe low back pain radiating to left calf for 3 months (L5-S1 radiculopathy)',
    contrastRequired: false,
    price: 7500,
    paymentStatus: 'paid',
    status: 'scheduled',
    checkInStatus: 'waiting',
    safetyChecklist: { patientIdentityVerified: true, examinationVerified: true, consentStatus: 'obtained', fastingConfirmed: true, metalRemoved: true, contrastAllergyChecked: true, pregnancyChecked: true },
    reportStatus: 'draft',
    isCriticalFinding: false,
    version: 1,
  },
];

const DEFAULT_CRITICAL_ALERTS: RadiologyCriticalAlert[] = [
  {
    id: 'rad-crit-001',
    orderId: 'rad-ord-001',
    accessionNumber: 'RAD-2026-000001',
    patientId: DEMO_PATIENTS[0]?.id || 'ALN-2026-00001',
    patientName: `${DEMO_PATIENTS[0]?.firstName || 'Aarav'} ${DEMO_PATIENTS[0]?.lastName || 'Patel'}`,
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    doctorName: 'Dr. Rajesh Sharma',
    examName: 'CT Brain (Non-Contrast Plain)',
    modalityType: 'ct',
    findingDescription: 'Acute Right Basal Ganglia Intracerebral Hematoma (2.4 x 1.8 cm) with 2.8 mm Midline Shift',
    detectedAt: '2026-09-02 10:50',
    status: 'new',
  },
];

// ----------------------------------------------------
// CONTEXT CREATION & PROVIDER
// ----------------------------------------------------

const RadiologyContext = createContext<RadiologyContextType | undefined>(undefined);

export function RadiologyProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<RadiologyTab>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedAccessionNumber, setSelectedAccessionNumber] = useState<string | null>(null);

  const [radiologyOrders, setRadiologyOrders] = useState<ComprehensiveRadiologyOrder[]>(() => {
    const saved = localStorage.getItem('hms_radiology_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [modalities, setModalities] = useState<RadiologyModalityItem[]>(() => {
    const saved = localStorage.getItem('hms_radiology_modalities');
    return saved ? JSON.parse(saved) : DEFAULT_MODALITIES;
  });

  const [examinations, setExaminations] = useState<RadiologyExaminationItem[]>(() => {
    const saved = localStorage.getItem('hms_radiology_examinations');
    return saved ? JSON.parse(saved) : DEFAULT_EXAMINATIONS;
  });

  const [packages, setPackages] = useState<RadiologyPackageItem[]>(() => {
    const saved = localStorage.getItem('hms_radiology_packages');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGES;
  });

  const [equipment, setEquipment] = useState<RadiologyEquipmentItem[]>(() => {
    const saved = localStorage.getItem('hms_radiology_equipment');
    return saved ? JSON.parse(saved) : DEFAULT_EQUIPMENT;
  });

  const [criticalAlerts, setCriticalAlerts] = useState<RadiologyCriticalAlert[]>(() => {
    const saved = localStorage.getItem('hms_radiology_critical_alerts');
    return saved ? JSON.parse(saved) : DEFAULT_CRITICAL_ALERTS;
  });

  const [reportTemplates] = useState<RadiologyReportTemplate[]>(DEFAULT_TEMPLATES);

  useEffect(() => {
    localStorage.setItem('hms_radiology_orders', JSON.stringify(radiologyOrders));
  }, [radiologyOrders]);

  useEffect(() => {
    localStorage.setItem('hms_radiology_modalities', JSON.stringify(modalities));
  }, [modalities]);

  useEffect(() => {
    localStorage.setItem('hms_radiology_examinations', JSON.stringify(examinations));
  }, [examinations]);

  useEffect(() => {
    localStorage.setItem('hms_radiology_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('hms_radiology_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('hms_radiology_critical_alerts', JSON.stringify(criticalAlerts));
  }, [criticalAlerts]);

  // Compute Live KPIs
  const kpis: RadiologyDashboardKPIs = {
    totalOrdersToday: radiologyOrders.length,
    pendingOrders: radiologyOrders.filter(o => o.status === 'ordered' || o.status === 'pending_scheduling').length,
    scheduledExaminations: radiologyOrders.filter(o => o.status === 'scheduled').length,
    preparationPending: radiologyOrders.filter(o => o.status === 'preparation_pending' || o.checkInStatus === 'arrived').length,
    patientsWaiting: radiologyOrders.filter(o => o.checkInStatus === 'waiting' || o.checkInStatus === 'ready').length,
    examinationsInProgress: radiologyOrders.filter(o => o.status === 'in_progress').length,
    completedExaminations: radiologyOrders.filter(o => o.status === 'completed' || o.status === 'report_pending' || o.status === 'verified' || o.status === 'released').length,
    reportsPending: radiologyOrders.filter(o => o.status === 'completed' || o.reportStatus === 'draft' || o.reportStatus === 'pending_verification').length,
    reportsVerified: radiologyOrders.filter(o => o.reportStatus === 'verified' || o.reportStatus === 'released').length,
    criticalReportsCount: criticalAlerts.length,
    cancelledExaminationsCount: radiologyOrders.filter(o => o.status === 'cancelled').length,
  };

  // ----------------------------------------------------
  // WORKFLOW ACTION HANDLERS
  // ----------------------------------------------------

  const createRadiologyOrder = (data: Omit<ComprehensiveRadiologyOrder, 'id' | 'orderNumber' | 'accessionNumber' | 'status' | 'checkInStatus' | 'safetyChecklist' | 'version' | 'reportStatus' | 'isCriticalFinding'>): ComprehensiveRadiologyOrder => {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RAD-ORD-2026-${seq}`;
    const accessionNumber = `RAD-2026-00${seq}`;

    const newOrder: ComprehensiveRadiologyOrder = {
      ...data,
      id: `rad-ord-${Date.now()}`,
      orderNumber,
      accessionNumber,
      status: data.scheduledDate ? 'scheduled' : 'pending_scheduling',
      checkInStatus: 'scheduled',
      safetyChecklist: {
        patientIdentityVerified: false,
        examinationVerified: false,
        consentStatus: 'not_required',
        fastingConfirmed: !data.contrastRequired,
        metalRemoved: false,
        contrastAllergyChecked: false,
        pregnancyChecked: data.gender === 'female',
      },
      reportStatus: 'draft',
      isCriticalFinding: false,
      version: 1,
    };

    setRadiologyOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const scheduleExamination = (orderId: string, scheduledDate: string, scheduledTime: string, roomNumber: string) => {
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            scheduledDate,
            scheduledTime,
            status: 'scheduled',
            checkInStatus: 'scheduled',
          };
        }
        return ord;
      })
    );
  };

  const rescheduleExamination = (orderId: string, newDate: string, newTime: string, reason: string) => {
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            scheduledDate: newDate,
            scheduledTime: newTime,
            clinicalNotes: ord.clinicalNotes ? `${ord.clinicalNotes} (Rescheduled: ${reason})` : `Rescheduled: ${reason}`,
          };
        }
        return ord;
      })
    );
  };

  const checkInPatient = (orderId: string, status: RadiologyCheckInStatus = 'arrived') => {
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            checkInStatus: status,
            status: status === 'ready' ? 'ready' : ord.status,
          };
        }
        return ord;
      })
    );
  };

  const updateSafetyChecklist = (orderId: string, checklist: Partial<RadiologySafetyChecklist>) => {
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated = { ...ord.safetyChecklist, ...checklist };
          const allGood =
            updated.patientIdentityVerified &&
            updated.examinationVerified &&
            updated.metalRemoved &&
            (!ord.contrastRequired || updated.contrastAllergyChecked);

          return {
            ...ord,
            safetyChecklist: updated,
            checkInStatus: allGood ? 'ready' : 'waiting',
            status: allGood ? 'ready' : ord.status,
          };
        }
        return ord;
      })
    );
  };

  const recordContrastAdministration = (orderId: string, contrast: ContrastAdministrationRecord) => {
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            contrastRecord: contrast,
          };
        }
        return ord;
      })
    );
  };

  const startExamination = (orderId: string, technicianName: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'in_progress',
            checkInStatus: 'in_examination',
            technicianName,
            technicianAt: now,
          };
        }
        return ord;
      })
    );
  };

  const completeExamination = (orderId: string, studyUid: string, seriesCount: number, imageCount: number) => {
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'completed',
            checkInStatus: 'completed',
            studyUid: studyUid || `1.2.840.113619.2.55.3.${Date.now()}`,
            seriesCount: seriesCount || 2,
            imageCount: imageCount || 48,
            reportStatus: 'draft',
          };
        }
        return ord;
      })
    );
  };

  const saveReportDraft = (orderId: string, reportData: { technique: string; findingsText: string; impressionText: string; recommendations?: string; radiologistName: string }) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            technique: reportData.technique,
            findingsText: reportData.findingsText,
            impressionText: reportData.impressionText,
            recommendations: reportData.recommendations,
            radiologistName: reportData.radiologistName,
            radiologistAt: now,
            reportStatus: 'draft',
          };
        }
        return ord;
      })
    );
  };

  const verifyAndReleaseReport = (orderId: string, reportData: { technique: string; findingsText: string; impressionText: string; recommendations?: string; radiologistName: string }) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            technique: reportData.technique,
            findingsText: reportData.findingsText,
            impressionText: reportData.impressionText,
            recommendations: reportData.recommendations,
            radiologistName: reportData.radiologistName,
            radiologistAt: now,
            status: 'verified',
            reportStatus: 'verified',
          };
        }
        return ord;
      })
    );
  };

  const amendRadiologyReport = (orderId: string, amendedFindings: string, amendedImpression: string, amendmentReason: string, radiologistName: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            findingsText: amendedFindings,
            impressionText: amendedImpression,
            amendmentReason,
            amendedBy: radiologistName,
            amendedAt: now,
            version: (ord.version || 1) + 1,
            reportStatus: 'amended',
          };
        }
        return ord;
      })
    );
  };

  const escalateCriticalFinding = (orderId: string, findingDescription: string, radiologistName: string) => {
    const ord = radiologyOrders.find(o => o.id === orderId);
    if (!ord) return;

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newAlert: RadiologyCriticalAlert = {
      id: `crit-alert-${Date.now()}`,
      orderId: ord.id,
      accessionNumber: ord.accessionNumber,
      patientId: ord.patientId,
      patientName: ord.patientName,
      bedNumber: ord.bedNumber,
      ward: ord.ward,
      doctorName: ord.referringDoctorName,
      examName: ord.examName,
      modalityType: ord.modalityType,
      findingDescription,
      detectedAt: now,
      status: 'new',
    };

    setCriticalAlerts(prev => [newAlert, ...prev]);

    setRadiologyOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, isCriticalFinding: true, criticalFindingRemarks: findingDescription } : o))
    );
  };

  const acknowledgeCriticalAlert = (alertId: string, acknowledgedBy: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setCriticalAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'acknowledged', acknowledgedBy, acknowledgedAt: now } : a))
    );
  };

  const cancelRadiologyOrder = (orderId: string, reason: string) => {
    setRadiologyOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'cancelled',
            checkInStatus: 'cancelled',
            clinicalNotes: ord.clinicalNotes ? `${ord.clinicalNotes} (Cancelled: ${reason})` : `Cancelled: ${reason}`,
          };
        }
        return ord;
      })
    );
  };

  // ----------------------------------------------------
  // MASTERS HANDLERS
  // ----------------------------------------------------

  const addModalityMaster = (mod: Omit<RadiologyModalityItem, 'id'>) => {
    const newMod: RadiologyModalityItem = { ...mod, id: `mod-${Date.now()}` };
    setModalities(prev => [...prev, newMod]);
  };

  const updateModalityMaster = (id: string, updates: Partial<RadiologyModalityItem>) => {
    setModalities(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const toggleModalityStatus = (id: string) => {
    setModalities(prev => prev.map(m => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  };

  const addExamMaster = (exam: Omit<RadiologyExaminationItem, 'id'>) => {
    const newExam: RadiologyExaminationItem = { ...exam, id: `exam-${Date.now()}` };
    setExaminations(prev => [...prev, newExam]);
  };

  const updateExamMaster = (id: string, updates: Partial<RadiologyExaminationItem>) => {
    setExaminations(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
  };

  const toggleExamStatus = (id: string) => {
    setExaminations(prev => prev.map(e => (e.id === id ? { ...e, isActive: !e.isActive } : e)));
  };

  const addRadiologyPackage = (pkg: Omit<RadiologyPackageItem, 'id'>) => {
    const newPkg: RadiologyPackageItem = { ...pkg, id: `pkg-${Date.now()}` };
    setPackages(prev => [...prev, newPkg]);
  };

  const updateRadiologyPackage = (id: string, updates: Partial<RadiologyPackageItem>) => {
    setPackages(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const togglePackageStatus = (id: string) => {
    setPackages(prev => prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  const addEquipment = (item: Omit<RadiologyEquipmentItem, 'id'>) => {
    const newItem: RadiologyEquipmentItem = { ...item, id: `eq-${Date.now()}` };
    setEquipment(prev => [...prev, newItem]);
  };

  const updateEquipment = (id: string, updates: Partial<RadiologyEquipmentItem>) => {
    setEquipment(prev => prev.map(eq => (eq.id === id ? { ...eq, ...updates } : eq)));
  };

  const recordMaintenance = (id: string, nextDate: string, notes: string) => {
    const now = new Date().toISOString().slice(0, 10);
    setEquipment(prev =>
      prev.map(eq => {
        if (eq.id === id) {
          return {
            ...eq,
            lastMaintenanceDate: now,
            nextMaintenanceDate: nextDate,
            status: 'available',
          };
        }
        return eq;
      })
    );
  };

  return (
    <RadiologyContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedOrderId,
        setSelectedOrderId,
        selectedAccessionNumber,
        setSelectedAccessionNumber,
        radiologyOrders,
        modalities,
        examinations,
        packages,
        equipment,
        criticalAlerts,
        reportTemplates,
        kpis,
        createRadiologyOrder,
        scheduleExamination,
        rescheduleExamination,
        checkInPatient,
        updateSafetyChecklist,
        recordContrastAdministration,
        startExamination,
        completeExamination,
        saveReportDraft,
        verifyAndReleaseReport,
        amendRadiologyReport,
        escalateCriticalFinding,
        acknowledgeCriticalAlert,
        cancelRadiologyOrder,
        addModalityMaster,
        updateModalityMaster,
        toggleModalityStatus,
        addExamMaster,
        updateExamMaster,
        toggleExamStatus,
        addRadiologyPackage,
        updateRadiologyPackage,
        togglePackageStatus,
        addEquipment,
        updateEquipment,
        recordMaintenance,
      }}
    >
      {children}
    </RadiologyContext.Provider>
  );
}

export function useRadiology() {
  const context = useContext(RadiologyContext);
  if (!context) {
    throw new Error('useRadiology must be used within a RadiologyProvider');
  }
  return context;
}
