import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type {
  DiagnosticCategory,
  DiagnosticSubCategory,
  DiagnosticPriority,
  DiagnosticRequestStatus,
  DiagnosticSampleStatus,
  DiagnosticResultStatus,
  DiagnosticReportStatus,
  DiagnosticEquipmentStatus,
  DiagnosticTestMasterItem,
  DiagnosticResultParameter,
  DiagnosticRequest,
  DiagnosticCriticalAlert,
  DiagnosticEquipmentItem,
  DiagnosticDashboardKPIs,
  Patient,
  Doctor,
  Admission,
} from '../../../types';
import {
  DEMO_PATIENTS,
  DEMO_DOCTORS,
  DEMO_ADMISSIONS,
} from '../../../data/seedData';

// -------------------------------------------------------------
// 1. SEED DIAGNOSTIC TEST MASTER (Lab, Radiology, Other)
// -------------------------------------------------------------
export const INITIAL_DIAGNOSTIC_TESTS: DiagnosticTestMasterItem[] = [
  // --- LABORATORY: BLOOD TESTS ---
  {
    id: 'dt-cbc',
    code: 'CBC-01',
    name: 'Complete Blood Count (CBC) with Differential',
    category: 'laboratory',
    subCategory: 'blood',
    department: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    containerType: 'Lavender Top Tube',
    preparationInstructions: 'No special preparation needed.',
    turnaroundHours: 2,
    price: 350,
    isActive: true,
    parameters: [
      { id: 'p-hb', name: 'Hemoglobin (Hb)', unit: 'g/dL', referenceRange: '12.0 - 16.0', criticalLow: 7.0, criticalHigh: 20.0, format: 'numeric' },
      { id: 'p-rbc', name: 'RBC Count', unit: 'million/mcL', referenceRange: '4.0 - 5.5', format: 'numeric' },
      { id: 'p-wbc', name: 'Total WBC Count', unit: 'cells/mcL', referenceRange: '4,000 - 11,000', criticalLow: 2000, criticalHigh: 30000, format: 'numeric' },
      { id: 'p-plt', name: 'Platelet Count', unit: 'lakhs/mcL', referenceRange: '1.5 - 4.5', criticalLow: 0.5, criticalHigh: 10.0, format: 'numeric' },
      { id: 'p-neut', name: 'Neutrophils', unit: '%', referenceRange: '40 - 75', format: 'numeric' },
      { id: 'p-lymph', name: 'Lymphocytes', unit: '%', referenceRange: '20 - 45', format: 'numeric' },
    ],
  },
  {
    id: 'dt-lft',
    code: 'LFT-02',
    name: 'Liver Function Test (LFT) Comprehensive',
    category: 'laboratory',
    subCategory: 'blood',
    department: 'Biochemistry',
    sampleType: 'Serum (SST Gel)',
    containerType: 'Gold / Yellow Top Tube',
    preparationInstructions: 'Overnight 8-10 hour fasting recommended.',
    turnaroundHours: 3,
    price: 750,
    isActive: true,
    parameters: [
      { id: 'p-bili-tot', name: 'Bilirubin Total', unit: 'mg/dL', referenceRange: '0.2 - 1.2', criticalHigh: 15.0, format: 'numeric' },
      { id: 'p-sgot', name: 'SGOT (AST)', unit: 'U/L', referenceRange: '10 - 40', criticalHigh: 500, format: 'numeric' },
      { id: 'p-sgpt', name: 'SGPT (ALT)', unit: 'U/L', referenceRange: '7 - 56', criticalHigh: 500, format: 'numeric' },
      { id: 'p-alp', name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', referenceRange: '44 - 147', format: 'numeric' },
      { id: 'p-alb', name: 'Serum Albumin', unit: 'g/dL', referenceRange: '3.5 - 5.5', criticalLow: 2.0, format: 'numeric' },
    ],
  },
  {
    id: 'dt-kft',
    code: 'KFT-03',
    name: 'Kidney Function Test (KFT) with Electrolytes',
    category: 'laboratory',
    subCategory: 'blood',
    department: 'Biochemistry',
    sampleType: 'Serum (SST Gel)',
    containerType: 'Gold / Yellow Top Tube',
    preparationInstructions: 'Fasting preferred.',
    turnaroundHours: 3,
    price: 650,
    isActive: true,
    parameters: [
      { id: 'p-urea', name: 'Blood Urea', unit: 'mg/dL', referenceRange: '15 - 45', criticalHigh: 100, format: 'numeric' },
      { id: 'p-creat', name: 'Serum Creatinine', unit: 'mg/dL', referenceRange: '0.7 - 1.3', criticalHigh: 4.0, format: 'numeric' },
      { id: 'p-na', name: 'Sodium (Na+)', unit: 'mEq/L', referenceRange: '135 - 145', criticalLow: 120, criticalHigh: 160, format: 'numeric' },
      { id: 'p-k', name: 'Potassium (K+)', unit: 'mEq/L', referenceRange: '3.5 - 5.1', criticalLow: 2.8, criticalHigh: 6.0, format: 'numeric' },
      { id: 'p-cl', name: 'Chloride (Cl-)', unit: 'mEq/L', referenceRange: '96 - 106', format: 'numeric' },
    ],
  },
  {
    id: 'dt-lipid',
    code: 'LIP-04',
    name: 'Lipid Profile Screen',
    category: 'laboratory',
    subCategory: 'blood',
    department: 'Biochemistry',
    sampleType: 'Serum (SST Gel)',
    containerType: 'Gold / Yellow Top Tube',
    preparationInstructions: 'Strict 12-hour fasting mandatory.',
    turnaroundHours: 4,
    price: 600,
    isActive: true,
    parameters: [
      { id: 'p-chol', name: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '< 200', criticalHigh: 300, format: 'numeric' },
      { id: 'p-trig', name: 'Triglycerides', unit: 'mg/dL', referenceRange: '< 150', criticalHigh: 500, format: 'numeric' },
      { id: 'p-hdl', name: 'HDL (Good) Cholesterol', unit: 'mg/dL', referenceRange: '> 40', format: 'numeric' },
      { id: 'p-ldl', name: 'LDL (Bad) Cholesterol', unit: 'mg/dL', referenceRange: '< 100', format: 'numeric' },
    ],
  },
  {
    id: 'dt-bsf',
    code: 'BSF-05',
    name: 'Blood Glucose Fasting (FBS)',
    category: 'laboratory',
    subCategory: 'blood',
    department: 'Biochemistry',
    sampleType: 'Fluoride Plasma',
    containerType: 'Grey Top Tube',
    preparationInstructions: '8-10 hour overnight fasting.',
    turnaroundHours: 1,
    price: 120,
    isActive: true,
    parameters: [
      { id: 'p-fbs', name: 'Fasting Blood Sugar', unit: 'mg/dL', referenceRange: '70 - 99', criticalLow: 45, criticalHigh: 450, format: 'numeric' },
    ],
  },
  {
    id: 'dt-hba1c',
    code: 'HBA-06',
    name: 'Glycated Hemoglobin (HbA1c)',
    category: 'laboratory',
    subCategory: 'blood',
    department: 'Biochemistry',
    sampleType: 'Whole Blood (EDTA)',
    containerType: 'Lavender Top Tube',
    turnaroundHours: 3,
    price: 500,
    isActive: true,
    parameters: [
      { id: 'p-hba1c-val', name: 'HbA1c Level', unit: '%', referenceRange: '4.0 - 5.6', criticalHigh: 12.0, format: 'numeric' },
    ],
  },
  {
    id: 'dt-trop-i',
    code: 'TRP-07',
    name: 'Troponin I (High Sensitivity STAT)',
    category: 'laboratory',
    subCategory: 'blood',
    department: 'Emergency Lab',
    sampleType: 'Lithium Heparin Plasma',
    containerType: 'Green Top Tube',
    turnaroundHours: 1,
    price: 1200,
    isActive: true,
    parameters: [
      { id: 'p-trop-val', name: 'hs-Troponin I', unit: 'ng/L', referenceRange: '< 14.0', criticalHigh: 50.0, format: 'numeric' },
    ],
  },

  // --- LABORATORY: URINE TESTS ---
  {
    id: 'dt-urine-re',
    code: 'URN-01',
    name: 'Urine Routine & Microscopic Examination (R/M)',
    category: 'laboratory',
    subCategory: 'urine',
    department: 'Clinical Pathology',
    sampleType: 'Midstream Urine',
    containerType: 'Sterile Urine Container (Yellow Cup)',
    preparationInstructions: 'Clean catch midstream morning specimen.',
    turnaroundHours: 2,
    price: 180,
    isActive: true,
    parameters: [
      { id: 'p-u-color', name: 'Color & Appearance', unit: '', referenceRange: 'Pale Yellow, Clear', defaultValue: 'Pale Yellow, Clear', format: 'selectable', options: ['Pale Yellow, Clear', 'Dark Yellow', 'Turbid / Cloudy', 'Reddish / Hematuria'] },
      { id: 'p-u-ph', name: 'pH', unit: '', referenceRange: '4.5 - 8.0', format: 'numeric' },
      { id: 'p-u-prot', name: 'Protein (Albumin)', unit: '', referenceRange: 'Negative', defaultValue: 'Negative', format: 'selectable', options: ['Negative', 'Trace', '1+ (30 mg/dL)', '2+ (100 mg/dL)', '3+ (300 mg/dL)'] },
      { id: 'p-u-sug', name: 'Urine Sugar', unit: '', referenceRange: 'Negative', defaultValue: 'Negative', format: 'selectable', options: ['Negative', 'Trace', '1+', '2+', '3+'] },
      { id: 'p-u-pus', name: 'Pus Cells (WBCs)', unit: '/hpf', referenceRange: '0 - 5', format: 'numeric' },
      { id: 'p-u-rbc', name: 'RBCs', unit: '/hpf', referenceRange: '0 - 2', format: 'numeric' },
    ],
  },

  // --- LABORATORY: STOOL TESTS ---
  {
    id: 'dt-stool-re',
    code: 'STL-01',
    name: 'Stool Routine & Occult Blood Examination',
    category: 'laboratory',
    subCategory: 'stool',
    department: 'Clinical Pathology',
    sampleType: 'Fresh Stool Specimen',
    containerType: 'Sterile Stool Container (Blue Cup with Scoop)',
    turnaroundHours: 2,
    price: 220,
    isActive: true,
    parameters: [
      { id: 'p-st-color', name: 'Consistency & Color', unit: '', referenceRange: 'Formed, Brown', defaultValue: 'Formed, Brown', format: 'text' },
      { id: 'p-st-ob', name: 'Occult Blood (OBT)', unit: '', referenceRange: 'Negative', defaultValue: 'Negative', format: 'selectable', options: ['Negative', 'Positive'] },
      { id: 'p-st-ova', name: 'Ova / Parasites / Cysts', unit: '', referenceRange: 'Not Detected', defaultValue: 'Not Detected', format: 'text' },
    ],
  },

  // --- RADIOLOGY: X-RAY ---
  {
    id: 'dt-xray-chest',
    code: 'RAD-X01',
    name: 'Digital X-Ray Chest (PA View)',
    category: 'radiology',
    subCategory: 'xray',
    department: 'Radiology & Imaging',
    preparationInstructions: 'Remove metallic objects, jewelry, and clothing over torso.',
    turnaroundHours: 2,
    price: 450,
    isActive: true,
    parameters: [
      { id: 'p-rad-chest-find', name: 'Radiological Findings', unit: '', referenceRange: 'Normal lung parenchyma and cardiac silhouette', defaultValue: 'Bilateral lung fields clear. Cardiac silhouette normal. Costophrenic angles clear.', format: 'text' },
      { id: 'p-rad-chest-imp', name: 'Impression', unit: '', referenceRange: 'Normal Chest Radiograph', defaultValue: 'Normal Chest Radiograph. No active pulmonary parenchymal lesion.', format: 'text' },
    ],
  },

  // --- RADIOLOGY: ULTRASOUND ---
  {
    id: 'dt-usg-abdo',
    code: 'RAD-U01',
    name: 'Ultrasound Whole Abdomen & Pelvis (USG)',
    category: 'radiology',
    subCategory: 'ultrasound',
    department: 'Radiology & Imaging',
    preparationInstructions: 'Overnight fasting + full bladder required.',
    turnaroundHours: 2,
    price: 1200,
    isActive: true,
    parameters: [
      { id: 'p-rad-usg-find', name: 'Sonographic Findings', unit: '', referenceRange: 'Normal abdominal viscera', defaultValue: 'Liver, gallbladder, kidneys, spleen, and pancreas are normal in size and echotexture.', format: 'text' },
      { id: 'p-rad-usg-imp', name: 'Impression', unit: '', referenceRange: 'Normal Study', defaultValue: 'Normal Ultrasound of Whole Abdomen & Pelvis.', format: 'text' },
    ],
  },

  // --- RADIOLOGY: CT SCAN ---
  {
    id: 'dt-ct-brain',
    code: 'RAD-C01',
    name: 'CT Brain Plain (NCCT Head)',
    category: 'radiology',
    subCategory: 'ct',
    department: 'Radiology & Imaging',
    preparationInstructions: 'No metal pins/dentures. Fasting 2h if IV contrast is considered.',
    turnaroundHours: 3,
    price: 2800,
    isActive: true,
    parameters: [
      { id: 'p-rad-ct-find', name: 'CT Neuro Findings', unit: '', referenceRange: 'Normal brain parenchyma and ventricles', defaultValue: 'No acute intracranial hemorrhage, mass effect, or midline shift.', format: 'text' },
      { id: 'p-rad-ct-imp', name: 'Impression', unit: '', referenceRange: 'Normal CT Brain', defaultValue: 'Normal NCCT Brain study.', format: 'text' },
    ],
  },

  // --- RADIOLOGY: MRI ---
  {
    id: 'dt-mri-brain',
    code: 'RAD-M01',
    name: 'MRI Brain with Diffusion & Contrast',
    category: 'radiology',
    subCategory: 'mri',
    department: 'Radiology & Imaging',
    preparationInstructions: 'Strict MRI Safety Screening: No pacemaker, aneurysm clips, or metallic implants.',
    turnaroundHours: 4,
    price: 6500,
    isActive: true,
    parameters: [
      { id: 'p-rad-mri-find', name: 'MRI Brain Findings', unit: '', referenceRange: 'Normal cerebral architecture', defaultValue: 'No restricted diffusion to suggest acute infarct. Ventricles and sulci normal for age.', format: 'text' },
      { id: 'p-rad-mri-imp', name: 'Impression', unit: '', referenceRange: 'Normal MRI Brain', defaultValue: 'Normal MRI Brain study.', format: 'text' },
    ],
  },

  // --- OTHER DIAGNOSTIC TESTS: ECG ---
  {
    id: 'dt-ecg-12',
    code: 'OTH-E01',
    name: '12-Lead Electrocardiogram (ECG)',
    category: 'other',
    subCategory: 'ecg',
    department: 'Cardiology Diagnostics',
    preparationInstructions: 'Relaxed supine position. No electrical devices on body.',
    turnaroundHours: 1,
    price: 350,
    isActive: true,
    parameters: [
      { id: 'p-ecg-rate', name: 'Heart Rate', unit: 'bpm', referenceRange: '60 - 100', format: 'numeric' },
      { id: 'p-ecg-rhythm', name: 'Rhythm & Axis', unit: '', referenceRange: 'Normal Sinus Rhythm', defaultValue: 'Normal Sinus Rhythm', format: 'text' },
      { id: 'p-ecg-imp', name: 'ECG Impression', unit: '', referenceRange: 'Normal 12-Lead ECG', defaultValue: 'Normal Sinus Rhythm at 76 bpm. No acute ST-T wave changes.', format: 'text' },
    ],
  },
];

// -------------------------------------------------------------
// 2. SEED DIAGNOSTIC EQUIPMENT LIST
// -------------------------------------------------------------
export const INITIAL_DIAGNOSTIC_EQUIPMENT: DiagnosticEquipmentItem[] = [
  {
    id: 'eq-001',
    name: 'Sysmex XN-550 Automated Hematology Analyzer',
    category: 'laboratory',
    department: 'Hematology',
    modelNumber: 'XN-550-V3',
    serialNumber: 'SN-HEM-9021',
    location: 'Lab Room 101',
    status: 'available',
    lastMaintenanceDate: '2026-08-15',
    nextMaintenanceDate: '2026-09-15',
    dailyCapacity: 200,
    currentTestsQueued: 4,
  },
  {
    id: 'eq-002',
    name: 'Roche Cobas c311 Clinical Chemistry Analyzer',
    category: 'laboratory',
    department: 'Biochemistry',
    modelNumber: 'Cobas-C311',
    serialNumber: 'SN-BIO-4412',
    location: 'Lab Room 102',
    status: 'available',
    lastMaintenanceDate: '2026-08-20',
    nextMaintenanceDate: '2026-09-20',
    dailyCapacity: 300,
    currentTestsQueued: 6,
  },
  {
    id: 'eq-003',
    name: 'Siemens Multix Impact Digital X-Ray System',
    category: 'radiology',
    department: 'Radiology & Imaging',
    modelNumber: 'Multix-Impact-DR',
    serialNumber: 'SN-RAD-1099',
    location: 'X-Ray Suite 1',
    status: 'available',
    lastMaintenanceDate: '2026-08-10',
    nextMaintenanceDate: '2026-09-10',
    dailyCapacity: 80,
    currentTestsQueued: 2,
  },
  {
    id: 'eq-004',
    name: 'GE Voluson E10 High-Resolution Ultrasound',
    category: 'radiology',
    department: 'Radiology & Imaging',
    modelNumber: 'Voluson-E10',
    serialNumber: 'SN-USG-8831',
    location: 'USG Suite 2',
    status: 'available',
    lastMaintenanceDate: '2026-08-25',
    nextMaintenanceDate: '2026-09-25',
    dailyCapacity: 40,
    currentTestsQueued: 3,
  },
  {
    id: 'eq-005',
    name: 'Philips Ingenuity 128-Slice CT Scanner',
    category: 'radiology',
    department: 'Radiology & Imaging',
    modelNumber: 'Ingenuity-128',
    serialNumber: 'SN-CT-5510',
    location: 'CT Scan Bay',
    status: 'available',
    lastMaintenanceDate: '2026-08-01',
    nextMaintenanceDate: '2026-09-01',
    dailyCapacity: 30,
    currentTestsQueued: 1,
  },
  {
    id: 'eq-006',
    name: 'Siemens Magnetom 1.5T Superconducting MRI',
    category: 'radiology',
    department: 'Radiology & Imaging',
    modelNumber: 'Magnetom-Aera',
    serialNumber: 'SN-MRI-3001',
    location: 'MRI Bay (Zone 4)',
    status: 'maintenance',
    lastMaintenanceDate: '2026-09-06',
    nextMaintenanceDate: '2026-09-08',
    dailyCapacity: 20,
    currentTestsQueued: 0,
  },
  {
    id: 'eq-007',
    name: 'GE MAC 2000 12-Channel Diagnostic ECG',
    category: 'other',
    department: 'Cardiology Diagnostics',
    modelNumber: 'MAC-2000-HD',
    serialNumber: 'SN-ECG-7102',
    location: 'Cardio OPD & Emergency',
    status: 'available',
    lastMaintenanceDate: '2026-08-28',
    nextMaintenanceDate: '2026-09-28',
    dailyCapacity: 100,
    currentTestsQueued: 1,
  },
];

// -------------------------------------------------------------
// 3. SEED INITIAL DIAGNOSTIC REQUESTS (Today's Date: 2026-09-07)
// -------------------------------------------------------------
const TODAY = new Date().toISOString().slice(0, 10);

export const INITIAL_DIAGNOSTIC_REQUESTS: DiagnosticRequest[] = [
  {
    id: 'req-001',
    requestId: 'DIA-2026-0001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    age: 34,
    gender: 'female',
    encounterType: 'ipd',
    admissionId: 'adm-001',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'General Medicine',
    testId: 'dt-cbc',
    testCode: 'CBC-01',
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'laboratory',
    subCategory: 'blood',
    requestDate: `${TODAY} 08:30`,
    priority: 'normal',
    clinicalNotes: 'Follow-up for viral pyrexia and fatigue. Assess recovery.',
    diagnosis: 'Viral Fever in Resolution',
    price: 350,
    status: 'completed',
    sampleStatus: 'received',
    sampleType: 'Whole Blood (EDTA)',
    sampleId: 'SMP-2026-0101',
    barcode: 'BC9010101',
    sampleCollectedAt: `${TODAY} 09:00`,
    sampleCollectedBy: 'Deepa Sen, Phlebotomist',
    technicianName: 'Sanjay Deshmukh, MLT',
    technicianAt: `${TODAY} 10:15`,
    results: [
      { parameterId: 'p-hb', parameterName: 'Hemoglobin (Hb)', value: 13.5, unit: 'g/dL', referenceRange: '12.0 - 16.0', status: 'normal', isCritical: false },
      { parameterId: 'p-rbc', parameterName: 'RBC Count', value: 4.6, unit: 'million/mcL', referenceRange: '4.0 - 5.5', status: 'normal', isCritical: false },
      { parameterId: 'p-wbc', parameterName: 'Total WBC Count', value: 7600, unit: 'cells/mcL', referenceRange: '4,000 - 11,000', status: 'normal', isCritical: false },
      { parameterId: 'p-plt', parameterName: 'Platelet Count', value: 2.3, unit: 'lakhs/mcL', referenceRange: '1.5 - 4.5', status: 'normal', isCritical: false },
      { parameterId: 'p-neut', parameterName: 'Neutrophils', value: 64, unit: '%', referenceRange: '40 - 75', status: 'normal', isCritical: false },
      { parameterId: 'p-lymph', parameterName: 'Lymphocytes', value: 28, unit: '%', referenceRange: '20 - 45', status: 'normal', isCritical: false },
    ],
    overallResultStatus: 'normal',
    reportStatus: 'released',
    reportDate: `${TODAY} 11:30`,
    authorizedBy: 'Dr. Sunita Rao, MD (Pathologist)',
  },
  {
    id: 'req-002',
    requestId: 'DIA-2026-0002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    age: 62,
    gender: 'male',
    encounterType: 'ipd',
    admissionId: 'adm-002',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sarah Khan',
    department: 'Cardiology',
    testId: 'dt-kft',
    testCode: 'KFT-03',
    testName: 'Kidney Function Test (KFT) with Electrolytes',
    category: 'laboratory',
    subCategory: 'blood',
    requestDate: `${TODAY} 09:15`,
    priority: 'emergency',
    clinicalNotes: 'ICU monitoring. Acute oliguria and bradycardia suspicion.',
    diagnosis: 'Acute Coronary Syndrome & Renal Impairment',
    price: 650,
    status: 'result_ready',
    sampleStatus: 'received',
    sampleType: 'Serum (SST Gel)',
    sampleId: 'SMP-2026-0102',
    barcode: 'BC9010102',
    sampleCollectedAt: `${TODAY} 09:30`,
    sampleCollectedBy: 'Kavitha Nair, ICU Nurse',
    technicianName: 'Aarti Kulkarni, MLT',
    technicianAt: `${TODAY} 10:45`,
    results: [
      { parameterId: 'p-urea', parameterName: 'Blood Urea', value: 58, unit: 'mg/dL', referenceRange: '15 - 45', status: 'abnormal', isCritical: false },
      { parameterId: 'p-creat', parameterName: 'Serum Creatinine', value: 1.8, unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: 'abnormal', isCritical: false },
      { parameterId: 'p-na', parameterName: 'Sodium (Na+)', value: 136, unit: 'mEq/L', referenceRange: '135 - 145', status: 'normal', isCritical: false },
      { parameterId: 'p-k', parameterName: 'Potassium (K+)', value: 6.3, unit: 'mEq/L', referenceRange: '3.5 - 5.1', status: 'critical', isCritical: true, remarks: 'Severe Hyperkalemia. Immediate telephonic escalation required.' },
      { parameterId: 'p-cl', parameterName: 'Chloride (Cl-)', value: 101, unit: 'mEq/L', referenceRange: '96 - 106', status: 'normal', isCritical: false },
    ],
    overallResultStatus: 'critical',
    reportStatus: 'ready',
    reportDate: `${TODAY} 11:00`,
    authorizedBy: 'Dr. Sunita Rao, MD (Pathologist)',
    criticalNotified: true,
  },
  {
    id: 'req-003',
    requestId: 'DIA-2026-0003',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    age: 62,
    gender: 'male',
    encounterType: 'ipd',
    admissionId: 'adm-002',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorId: 'doc-002',
    doctorName: 'Dr. Sarah Khan',
    department: 'Cardiology',
    testId: 'dt-trop-i',
    testCode: 'TRP-07',
    testName: 'Troponin I (High Sensitivity STAT)',
    category: 'laboratory',
    subCategory: 'blood',
    requestDate: `${TODAY} 09:20`,
    priority: 'emergency',
    clinicalNotes: 'Acute retrosternal chest pain with diaphoresis.',
    diagnosis: 'Rule out NSTEMI / Unstable Angina',
    price: 1200,
    status: 'result_ready',
    sampleStatus: 'received',
    sampleType: 'Lithium Heparin Plasma',
    sampleId: 'SMP-2026-0103',
    barcode: 'BC9010103',
    sampleCollectedAt: `${TODAY} 09:30`,
    sampleCollectedBy: 'Kavitha Nair, ICU Nurse',
    technicianName: 'Aarti Kulkarni, MLT',
    technicianAt: `${TODAY} 10:30`,
    results: [
      { parameterId: 'p-trop-val', parameterName: 'hs-Troponin I', value: 68.4, unit: 'ng/L', referenceRange: '< 14.0', status: 'critical', isCritical: true, remarks: 'Acute myocardial injury.' },
    ],
    overallResultStatus: 'critical',
    reportStatus: 'ready',
    reportDate: `${TODAY} 10:45`,
    authorizedBy: 'Dr. Sunita Rao, MD (Pathologist)',
    criticalNotified: true,
  },
  {
    id: 'req-004',
    requestId: 'DIA-2026-0004',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    age: 58,
    gender: 'female',
    encounterType: 'ipd',
    admissionId: 'adm-003',
    bedNumber: 'PW-101',
    ward: 'Private Ward',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'General Medicine',
    testId: 'dt-xray-chest',
    testCode: 'RAD-X01',
    testName: 'Digital X-Ray Chest (PA View)',
    category: 'radiology',
    subCategory: 'xray',
    requestDate: `${TODAY} 10:00`,
    priority: 'normal',
    clinicalNotes: 'Mild dyspnea on exertion. Cardiac silhouette evaluation.',
    diagnosis: 'Congestive Cardiac Assessment',
    price: 450,
    status: 'completed',
    sampleStatus: 'received',
    technicianName: 'Rajesh Nair, Radiographer',
    technicianAt: `${TODAY} 10:30`,
    results: [
      { parameterId: 'p-rad-chest-find', parameterName: 'Radiological Findings', value: 'Bilateral lung fields clear. Mild cardiomegaly noted (CTR 0.54). Costophrenic sulci are sharp.', unit: '', referenceRange: 'Normal', status: 'abnormal', isCritical: false },
      { parameterId: 'p-rad-chest-imp', parameterName: 'Impression', value: 'Mild Cardiomegaly. No active pulmonary consolidation or pleural effusion.', unit: '', referenceRange: 'Normal', status: 'abnormal', isCritical: false },
    ],
    overallResultStatus: 'abnormal',
    reportStatus: 'released',
    reportDate: `${TODAY} 11:45`,
    authorizedBy: 'Dr. Priya Sharma, MD (Radiologist)',
    findingsText: 'Bilateral lung fields clear. Mild cardiomegaly noted (CTR 0.54). Costophrenic sulci are sharp.',
    impressionText: 'Mild Cardiomegaly. No active pulmonary consolidation or pleural effusion.',
  },
  {
    id: 'req-005',
    requestId: 'DIA-2026-0005',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    age: 45,
    gender: 'male',
    encounterType: 'ipd',
    admissionId: 'adm-004',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    doctorId: 'doc-003',
    doctorName: 'Dr. Amit Trivedi',
    department: 'Orthopedics',
    testId: 'dt-bsf',
    testCode: 'BSF-05',
    testName: 'Blood Glucose Fasting (FBS)',
    category: 'laboratory',
    subCategory: 'blood',
    requestDate: `${TODAY} 10:15`,
    priority: 'urgent',
    clinicalNotes: 'Post-op orthopedic recovery metabolic check.',
    diagnosis: 'Post-Op Fracture Recovery with T2D',
    price: 120,
    status: 'processing',
    sampleStatus: 'received',
    sampleType: 'Fluoride Plasma',
    sampleId: 'SMP-2026-0105',
    barcode: 'BC9010105',
    sampleCollectedAt: `${TODAY} 10:45`,
    sampleCollectedBy: 'Deepa Sen, Phlebotomist',
    technicianName: 'Sanjay Deshmukh, MLT',
    results: [],
    reportStatus: 'draft',
  },
  {
    id: 'req-006',
    requestId: 'DIA-2026-0006',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    age: 45,
    gender: 'male',
    encounterType: 'ipd',
    admissionId: 'adm-004',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    doctorId: 'doc-003',
    doctorName: 'Dr. Amit Trivedi',
    department: 'Orthopedics',
    testId: 'dt-ecg-12',
    testCode: 'OTH-E01',
    testName: '12-Lead Electrocardiogram (ECG)',
    category: 'other',
    subCategory: 'ecg',
    requestDate: `${TODAY} 10:30`,
    priority: 'normal',
    clinicalNotes: 'Routine pre-discharge cardiovascular check.',
    diagnosis: 'Orthopedic Recovery',
    price: 350,
    status: 'sample_collected',
    sampleStatus: 'collected',
    sampleCollectedAt: `${TODAY} 10:50`,
    sampleCollectedBy: 'Suresh Kumar, ECG Tech',
    results: [],
    reportStatus: 'draft',
  },
  {
    id: 'req-007',
    requestId: 'DIA-2026-0007',
    patientId: 'ALN-2026-00003',
    patientName: 'Meera Deshmukh',
    age: 58,
    gender: 'female',
    encounterType: 'ipd',
    admissionId: 'adm-003',
    bedNumber: 'PW-101',
    ward: 'Private Ward',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'General Medicine',
    testId: 'dt-usg-abdo',
    testCode: 'RAD-U01',
    testName: 'Ultrasound Whole Abdomen & Pelvis (USG)',
    category: 'radiology',
    subCategory: 'ultrasound',
    requestDate: `${TODAY} 11:00`,
    priority: 'normal',
    clinicalNotes: 'Right upper quadrant postprandial discomfort.',
    diagnosis: 'Suspected Biliary Sludge',
    price: 1200,
    status: 'requested',
    sampleStatus: 'pending_collection',
    results: [],
    reportStatus: 'draft',
  },
  {
    id: 'req-008',
    requestId: 'DIA-2026-0008',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    age: 34,
    gender: 'female',
    encounterType: 'ipd',
    admissionId: 'adm-001',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'General Medicine',
    testId: 'dt-urine-re',
    testCode: 'URN-01',
    testName: 'Urine Routine & Microscopic Examination (R/M)',
    category: 'laboratory',
    subCategory: 'urine',
    requestDate: `${TODAY} 11:15`,
    priority: 'normal',
    clinicalNotes: 'Dysuria screening.',
    diagnosis: 'Suspected Lower UTI',
    price: 180,
    status: 'requested',
    sampleStatus: 'pending_collection',
    results: [],
    reportStatus: 'draft',
  },
];

// -------------------------------------------------------------
// 4. SEED INITIAL CRITICAL ALERTS
// -------------------------------------------------------------
export const INITIAL_CRITICAL_ALERTS: DiagnosticCriticalAlert[] = [
  {
    id: 'crit-001',
    requestId: 'DIA-2026-0002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorName: 'Dr. Sarah Khan',
    testName: 'Kidney Function Test (KFT)',
    parameterName: 'Potassium (K+)',
    resultValue: 6.3,
    criticalThreshold: '> 6.0 mEq/L (Severe Hyperkalemia)',
    detectedAt: `${TODAY} 10:48`,
    status: 'notified',
    notifiedTo: 'Dr. Sarah Khan (Attending Cardiologist)',
  },
  {
    id: 'crit-002',
    requestId: 'DIA-2026-0003',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorName: 'Dr. Sarah Khan',
    testName: 'Troponin I (High Sensitivity STAT)',
    parameterName: 'hs-Troponin I',
    resultValue: 68.4,
    criticalThreshold: '> 50.0 ng/L (Acute Myocardial Infarction)',
    detectedAt: `${TODAY} 10:35`,
    status: 'acknowledged',
    notifiedTo: 'Dr. Sarah Khan (Attending Cardiologist)',
    acknowledgedBy: 'Dr. Sarah Khan',
    acknowledgedAt: `${TODAY} 10:42`,
  },
];

// -------------------------------------------------------------
// 9 CLEAN NAVIGATION TABS
// -------------------------------------------------------------
export type DiagnosticTab =
  | 'dashboard'
  | 'requests'
  | 'categories'
  | 'sample_collection'
  | 'processing'
  | 'results'
  | 'critical_results'
  | 'reports'
  | 'report_history';

interface DiagnosticContextType {
  // Navigation & Inpatient Selection
  activeTab: DiagnosticTab;
  setActiveTab: (tab: DiagnosticTab) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;

  // Master Data
  patients: Patient[];
  doctors: Doctor[];
  admissions: Admission[];
  testMaster: DiagnosticTestMasterItem[];
  equipmentList: DiagnosticEquipmentItem[];

  // Diagnostic State
  requests: DiagnosticRequest[];
  criticalAlerts: DiagnosticCriticalAlert[];
  kpis: DiagnosticDashboardKPIs;

  // Workflow Actions
  createDiagnosticRequest: (requestData: Omit<DiagnosticRequest, 'id' | 'requestId' | 'requestDate' | 'status' | 'sampleStatus' | 'results' | 'reportStatus'>) => string;
  acceptRequest: (requestId: string) => void;
  updatePriority: (requestId: string, priority: DiagnosticPriority) => void;
  cancelRequest: (requestId: string, reason?: string) => void;
  collectSample: (requestId: string, collectorName: string, sampleType?: string) => void;
  receiveSample: (requestId: string, receiverName?: string) => void;
  rejectSample: (requestId: string, reason: string) => void;
  startProcessing: (requestId: string, technicianName: string) => void;
  enterResults: (requestId: string, results: DiagnosticResultParameter[], technicianName: string, findings?: string, impression?: string) => void;
  acknowledgeCriticalAlert: (alertId: string, acknowledgedBy: string) => void;
  generateReport: (requestId: string, authorizedBy: string) => void;
  releaseReport: (requestId: string) => void;
  updateEquipmentStatus: (equipmentId: string, status: DiagnosticEquipmentStatus) => void;
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export function DiagnosticProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('req-001');

  // Master Data
  const [patients] = useState<Patient[]>(DEMO_PATIENTS);
  const [doctors] = useState<Doctor[]>(DEMO_DOCTORS);
  const [admissions] = useState<Admission[]>(DEMO_ADMISSIONS);

  // Diagnostic Data with LocalStorage Persistence
  const [testMaster, setTestMaster] = useState<DiagnosticTestMasterItem[]>(() => {
    const saved = localStorage.getItem('hms_diagnostic_tests_v1');
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSTIC_TESTS;
  });

  const [equipmentList, setEquipmentList] = useState<DiagnosticEquipmentItem[]>(() => {
    const saved = localStorage.getItem('hms_diagnostic_equipment_v1');
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSTIC_EQUIPMENT;
  });

  const [requests, setRequests] = useState<DiagnosticRequest[]>(() => {
    const saved = localStorage.getItem('hms_diagnostic_requests_v1');
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSTIC_REQUESTS;
  });

  const [criticalAlerts, setCriticalAlerts] = useState<DiagnosticCriticalAlert[]>(() => {
    const saved = localStorage.getItem('hms_diagnostic_alerts_v1');
    return saved ? JSON.parse(saved) : INITIAL_CRITICAL_ALERTS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('hms_diagnostic_tests_v1', JSON.stringify(testMaster));
  }, [testMaster]);

  useEffect(() => {
    localStorage.setItem('hms_diagnostic_equipment_v1', JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    localStorage.setItem('hms_diagnostic_requests_v1', JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('hms_storage_updated'));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('hms_diagnostic_alerts_v1', JSON.stringify(criticalAlerts));
    window.dispatchEvent(new CustomEvent('hms_storage_updated'));
  }, [criticalAlerts]);

  // -------------------------------------------------------------
  // DYNAMIC 7 ESSENTIAL KPIS
  // -------------------------------------------------------------
  const kpis: DiagnosticDashboardKPIs = useMemo(() => {
    const todayRequests = requests.length;
    const pendingTests = requests.filter(r => r.status === 'requested' || r.status === 'sample_collected').length;
    const samplesCollected = requests.filter(r => r.sampleStatus === 'collected' || r.sampleStatus === 'received').length;
    const inProgress = requests.filter(r => r.status === 'processing').length;
    const reportsReady = requests.filter(r => r.reportStatus === 'ready').length;
    const criticalResults = requests.filter(r => r.overallResultStatus === 'critical' || r.results.some(p => p.isCritical)).length;
    const completedTests = requests.filter(r => r.status === 'completed' || r.reportStatus === 'released').length;

    return {
      todayRequests,
      pendingTests,
      samplesCollected,
      inProgress,
      reportsReady,
      criticalResults,
      completedTests,
    };
  }, [requests]);

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------
  const createDiagnosticRequest = (
    requestData: Omit<DiagnosticRequest, 'id' | 'requestId' | 'requestDate' | 'status' | 'sampleStatus' | 'results' | 'reportStatus'>
  ): string => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newId = `req-${Date.now().toString().slice(-4)}`;
    const newReqId = `DIA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest: DiagnosticRequest = {
      ...requestData,
      id: newId,
      requestId: newReqId,
      requestDate: now,
      status: 'requested',
      sampleStatus: requestData.category === 'radiology' || requestData.category === 'other' ? 'received' : 'pending_collection',
      results: [],
      reportStatus: 'draft',
    };

    setRequests(prev => [newRequest, ...prev]);
    return newId;
  };

  const acceptRequest = (requestId: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId && r.status === 'requested') {
          return {
            ...r,
            status: r.category === 'laboratory' ? 'requested' : 'processing',
          };
        }
        return r;
      })
    );
  };

  const updatePriority = (requestId: string, priority: DiagnosticPriority) => {
    setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, priority } : r)));
  };

  const cancelRequest = (requestId: string, reason?: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'cancelled' as DiagnosticRequestStatus, clinicalNotes: reason ? `${r.clinicalNotes || ''} [Cancelled: ${reason}]` : r.clinicalNotes } : r))
    );
  };

  const collectSample = (requestId: string, collectorName: string, sampleType?: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const sampleId = `SMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const barcode = `BC90${Math.floor(10000 + Math.random() * 90000)}`;

    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'sample_collected' as DiagnosticRequestStatus,
            sampleStatus: 'collected' as DiagnosticSampleStatus,
            sampleId,
            barcode,
            sampleType: sampleType || r.sampleType,
            sampleCollectedAt: now,
            sampleCollectedBy: collectorName,
          };
        }
        return r;
      })
    );
  };

  const receiveSample = (requestId: string, receiverName?: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            sampleStatus: 'received' as DiagnosticSampleStatus,
            status: 'processing' as DiagnosticRequestStatus,
            technicianName: receiverName || r.technicianName,
          };
        }
        return r;
      })
    );
  };

  const rejectSample = (requestId: string, reason: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            sampleStatus: 'rejected' as DiagnosticSampleStatus,
            clinicalNotes: `${r.clinicalNotes || ''} [Sample Rejected: ${reason}]`,
          };
        }
        return r;
      })
    );
  };

  const startProcessing = (requestId: string, technicianName: string) => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'processing' as DiagnosticRequestStatus,
            technicianName,
          };
        }
        return r;
      })
    );
  };

  const enterResults = (
    requestId: string,
    results: DiagnosticResultParameter[],
    technicianName: string,
    findings?: string,
    impression?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const hasCritical = results.some(p => p.isCritical || p.status === 'critical');
    const hasAbnormal = results.some(p => p.status === 'abnormal');
    const overallResultStatus: DiagnosticResultStatus = hasCritical ? 'critical' : hasAbnormal ? 'abnormal' : 'normal';

    const targetReq = requests.find(r => r.id === requestId);

    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'result_ready' as DiagnosticRequestStatus,
            reportStatus: 'ready' as DiagnosticReportStatus,
            results,
            overallResultStatus,
            technicianName,
            technicianAt: now,
            findingsText: findings || r.findingsText,
            impressionText: impression || r.impressionText,
            criticalNotified: hasCritical ? true : r.criticalNotified,
          };
        }
        return r;
      })
    );

    // If critical, trigger automatic panic alert
    if (hasCritical && targetReq) {
      const critParams = results.filter(p => p.isCritical || p.status === 'critical');
      critParams.forEach(cp => {
        const newAlert: DiagnosticCriticalAlert = {
          id: `crit-${Date.now().toString().slice(-4)}`,
          requestId,
          patientId: targetReq.patientId,
          patientName: targetReq.patientName,
          bedNumber: targetReq.bedNumber,
          ward: targetReq.ward,
          doctorName: targetReq.doctorName,
          testName: targetReq.testName,
          parameterName: cp.parameterName,
          resultValue: cp.value,
          criticalThreshold: `Ref: ${cp.referenceRange} (Critical)`,
          detectedAt: now,
          status: 'new',
          notifiedTo: `${targetReq.doctorName} (${targetReq.department})`,
        };
        setCriticalAlerts(prevA => [newAlert, ...prevA]);
      });
    }
  };

  const acknowledgeCriticalAlert = (alertId: string, acknowledgedBy: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setCriticalAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'acknowledged', acknowledgedBy, acknowledgedAt: now } : a))
    );
  };

  const generateReport = (requestId: string, authorizedBy: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            reportStatus: 'ready' as DiagnosticReportStatus,
            reportDate: now,
            authorizedBy,
          };
        }
        return r;
      })
    );
  };

  const releaseReport = (requestId: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'completed' as DiagnosticRequestStatus,
            reportStatus: 'released' as DiagnosticReportStatus,
            reportDate: r.reportDate || now,
          };
        }
        return r;
      })
    );
  };

  const updateEquipmentStatus = (equipmentId: string, status: DiagnosticEquipmentStatus) => {
    setEquipmentList(prev => prev.map(eq => (eq.id === equipmentId ? { ...eq, status } : eq)));
  };

  return (
    <DiagnosticContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedRequestId,
        setSelectedRequestId,
        patients,
        doctors,
        admissions,
        testMaster,
        equipmentList,
        requests,
        criticalAlerts,
        kpis,
        createDiagnosticRequest,
        acceptRequest,
        updatePriority,
        cancelRequest,
        collectSample,
        receiveSample,
        rejectSample,
        startProcessing,
        enterResults,
        acknowledgeCriticalAlert,
        generateReport,
        releaseReport,
        updateEquipmentStatus,
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
}
