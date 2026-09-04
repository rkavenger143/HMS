import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ComprehensiveLabOrder,
  LabSampleRecord,
  LabTestMasterItem,
  LabPackageMasterItem,
  LabCriticalAlert,
  LabReportAmendment,
  LabDashboardKPIs,
  LabPriority,
  LabOrderStatus,
  LabSampleStatus,
  LabResultFlag,
  LabParameterResult,
} from '../../../types';
import { DEMO_PATIENTS, DEMO_DOCTORS } from '../../../data/seedData';

export type LabTab =
  | 'dashboard'
  | 'orders'
  | 'diagnostics'
  | 'sample_collection'
  | 'sample_receiving'
  | 'sample_tracking'
  | 'test_processing'
  | 'result_entry'
  | 'result_verification'
  | 'critical_results'
  | 'reports'
  | 'patient_history'
  | 'billing'
  | 'test_master'
  | 'packages'
  | 'analytics'
  | 'statistical_reports'
  | 'settings';

export const INITIAL_LAB_TESTS: LabTestMasterItem[] = [
  {
    id: 'test-cbc',
    testCode: 'CBC-01',
    testName: 'Complete Blood Count (CBC) with Differential',
    category: 'hematology',
    department: 'Hematology & Clinical Pathology',
    sampleType: 'Whole Blood',
    containerType: 'EDTA (Lavender Top)',
    sampleVolume: '3.0 ml',
    turnaroundHours: 2,
    price: 350,
    preparationInstructions: 'No special preparation needed.',
    fastingRequired: false,
    isActive: true,
    parameters: [
      { id: 'p-hb', parameterName: 'Hemoglobin (Hb)', unit: 'g/dL', referenceRangeMale: '13.0 - 17.0', referenceRangeFemale: '12.0 - 15.0', referenceRangePediatric: '11.0 - 14.0', criticalLow: 7.0, criticalHigh: 20.0, format: 'numeric' },
      { id: 'p-rbc', parameterName: 'RBC Count', unit: 'million/mcL', referenceRangeMale: '4.5 - 5.9', referenceRangeFemale: '4.0 - 5.2', format: 'numeric' },
      { id: 'p-wbc', parameterName: 'Total WBC Count', unit: 'cells/mcL', referenceRangeMale: '4,000 - 11,000', referenceRangeFemale: '4,000 - 11,000', criticalLow: 2000, criticalHigh: 30000, format: 'numeric' },
      { id: 'p-plt', parameterName: 'Platelet Count', unit: 'lakhs/mcL', referenceRangeMale: '1.5 - 4.5', referenceRangeFemale: '1.5 - 4.5', criticalLow: 0.5, criticalHigh: 10.0, format: 'numeric' },
      { id: 'p-neut', parameterName: 'Neutrophils', unit: '%', referenceRangeMale: '40 - 75', referenceRangeFemale: '40 - 75', format: 'numeric' },
      { id: 'p-lymph', parameterName: 'Lymphocytes', unit: '%', referenceRangeMale: '20 - 45', referenceRangeFemale: '20 - 45', format: 'numeric' },
    ],
  },
  {
    id: 'test-lft',
    testCode: 'LFT-02',
    testName: 'Liver Function Test (LFT) Comprehensive',
    category: 'biochemistry',
    department: 'Clinical Biochemistry',
    sampleType: 'Serum',
    containerType: 'SST / Gel (Gold/Yellow Top)',
    sampleVolume: '4.0 ml',
    turnaroundHours: 4,
    price: 750,
    preparationInstructions: 'Overnight 8-10 hour fasting recommended.',
    fastingRequired: true,
    isActive: true,
    parameters: [
      { id: 'p-bili-tot', parameterName: 'Bilirubin Total', unit: 'mg/dL', referenceRangeMale: '0.2 - 1.2', referenceRangeFemale: '0.2 - 1.2', criticalHigh: 15.0, format: 'numeric' },
      { id: 'p-bili-dir', parameterName: 'Bilirubin Direct', unit: 'mg/dL', referenceRangeMale: '0.0 - 0.3', referenceRangeFemale: '0.0 - 0.3', format: 'numeric' },
      { id: 'p-sgot', parameterName: 'SGOT (AST)', unit: 'U/L', referenceRangeMale: '10 - 40', referenceRangeFemale: '9 - 32', criticalHigh: 500, format: 'numeric' },
      { id: 'p-sgpt', parameterName: 'SGPT (ALT)', unit: 'U/L', referenceRangeMale: '7 - 56', referenceRangeFemale: '7 - 45', criticalHigh: 500, format: 'numeric' },
      { id: 'p-alp', parameterName: 'Alkaline Phosphatase (ALP)', unit: 'U/L', referenceRangeMale: '44 - 147', referenceRangeFemale: '44 - 147', format: 'numeric' },
      { id: 'p-tp', parameterName: 'Total Protein', unit: 'g/dL', referenceRangeMale: '6.0 - 8.3', referenceRangeFemale: '6.0 - 8.3', format: 'numeric' },
      { id: 'p-alb', parameterName: 'Albumin', unit: 'g/dL', referenceRangeMale: '3.5 - 5.5', referenceRangeFemale: '3.5 - 5.5', criticalLow: 2.0, format: 'numeric' },
    ],
  },
  {
    id: 'test-kft',
    testCode: 'KFT-03',
    testName: 'Kidney Function Test (KFT / RFT) with Electrolytes',
    category: 'biochemistry',
    department: 'Clinical Biochemistry',
    sampleType: 'Serum',
    containerType: 'SST / Gel (Gold/Yellow Top)',
    sampleVolume: '4.0 ml',
    turnaroundHours: 3,
    price: 650,
    preparationInstructions: 'Fasting preferred.',
    fastingRequired: false,
    isActive: true,
    parameters: [
      { id: 'p-urea', parameterName: 'Blood Urea', unit: 'mg/dL', referenceRangeMale: '15 - 45', referenceRangeFemale: '15 - 45', criticalHigh: 100, format: 'numeric' },
      { id: 'p-creat', parameterName: 'Serum Creatinine', unit: 'mg/dL', referenceRangeMale: '0.7 - 1.3', referenceRangeFemale: '0.6 - 1.1', criticalHigh: 4.0, format: 'numeric' },
      { id: 'p-na', parameterName: 'Sodium (Na+)', unit: 'mEq/L', referenceRangeMale: '135 - 145', referenceRangeFemale: '135 - 145', criticalLow: 120, criticalHigh: 160, format: 'numeric' },
      { id: 'p-k', parameterName: 'Potassium (K+)', unit: 'mEq/L', referenceRangeMale: '3.5 - 5.1', referenceRangeFemale: '3.5 - 5.1', criticalLow: 2.8, criticalHigh: 6.0, format: 'numeric' },
      { id: 'p-cl', parameterName: 'Chloride (Cl-)', unit: 'mEq/L', referenceRangeMale: '96 - 106', referenceRangeFemale: '96 - 106', format: 'numeric' },
    ],
  },
  {
    id: 'test-lipid',
    testCode: 'LIPID-04',
    testName: 'Lipid Profile Screen',
    category: 'biochemistry',
    department: 'Clinical Biochemistry',
    sampleType: 'Serum',
    containerType: 'SST / Gel (Gold/Yellow Top)',
    sampleVolume: '3.5 ml',
    turnaroundHours: 4,
    price: 600,
    preparationInstructions: 'Strict 12-hour fasting mandatory.',
    fastingRequired: true,
    isActive: true,
    parameters: [
      { id: 'p-chol', parameterName: 'Total Cholesterol', unit: 'mg/dL', referenceRangeMale: '< 200', referenceRangeFemale: '< 200', criticalHigh: 300, format: 'numeric' },
      { id: 'p-trig', parameterName: 'Triglycerides', unit: 'mg/dL', referenceRangeMale: '< 150', referenceRangeFemale: '< 150', criticalHigh: 500, format: 'numeric' },
      { id: 'p-hdl', parameterName: 'HDL (Good) Cholesterol', unit: 'mg/dL', referenceRangeMale: '> 40', referenceRangeFemale: '> 50', format: 'numeric' },
      { id: 'p-ldl', parameterName: 'LDL (Bad) Cholesterol', unit: 'mg/dL', referenceRangeMale: '< 100', referenceRangeFemale: '< 100', format: 'numeric' },
      { id: 'p-vldl', parameterName: 'VLDL Cholesterol', unit: 'mg/dL', referenceRangeMale: '< 30', referenceRangeFemale: '< 30', format: 'numeric' },
    ],
  },
  {
    id: 'test-bsf',
    testCode: 'BSF-05',
    testName: 'Blood Glucose Fasting (FBS)',
    category: 'biochemistry',
    department: 'Clinical Biochemistry',
    sampleType: 'Fluoride Plasma',
    containerType: 'Sodium Fluoride (Grey Top)',
    sampleVolume: '2.0 ml',
    turnaroundHours: 1,
    price: 120,
    preparationInstructions: '8-10 hour overnight fasting.',
    fastingRequired: true,
    isActive: true,
    parameters: [
      { id: 'p-fbs', parameterName: 'Fasting Blood Sugar', unit: 'mg/dL', referenceRangeMale: '70 - 99', referenceRangeFemale: '70 - 99', criticalLow: 45, criticalHigh: 450, format: 'numeric' },
    ],
  },
  {
    id: 'test-hba1c',
    testCode: 'HBA1C-06',
    testName: 'Glycated Hemoglobin (HbA1c)',
    category: 'biochemistry',
    department: 'Clinical Biochemistry',
    sampleType: 'Whole Blood',
    containerType: 'EDTA (Lavender Top)',
    sampleVolume: '2.0 ml',
    turnaroundHours: 3,
    price: 500,
    preparationInstructions: 'No fasting required.',
    fastingRequired: false,
    isActive: true,
    parameters: [
      { id: 'p-hba1c-val', parameterName: 'HbA1c Level', unit: '%', referenceRangeMale: '4.0 - 5.6', referenceRangeFemale: '4.0 - 5.6', criticalHigh: 12.0, format: 'numeric' },
      { id: 'p-eag', parameterName: 'Estimated Average Glucose (eAG)', unit: 'mg/dL', referenceRangeMale: '70 - 126', referenceRangeFemale: '70 - 126', format: 'numeric' },
    ],
  },
  {
    id: 'test-tft',
    testCode: 'TFT-07',
    testName: 'Thyroid Function Test (TFT - T3, T4, TSH)',
    category: 'hormones',
    department: 'Endocrinology & Immunoassay',
    sampleType: 'Serum',
    containerType: 'SST / Gel (Gold/Yellow Top)',
    sampleVolume: '3.0 ml',
    turnaroundHours: 6,
    price: 550,
    preparationInstructions: 'Morning sample preferred.',
    fastingRequired: false,
    isActive: true,
    parameters: [
      { id: 'p-t3', parameterName: 'Total T3', unit: 'ng/dL', referenceRangeMale: '80 - 200', referenceRangeFemale: '80 - 200', format: 'numeric' },
      { id: 'p-t4', parameterName: 'Total T4', unit: 'mcg/dL', referenceRangeMale: '4.5 - 12.5', referenceRangeFemale: '4.5 - 12.5', format: 'numeric' },
      { id: 'p-tsh', parameterName: 'TSH (Ultrasensitive)', unit: 'uIU/mL', referenceRangeMale: '0.40 - 4.50', referenceRangeFemale: '0.40 - 4.50', criticalLow: 0.05, criticalHigh: 20.0, format: 'numeric' },
    ],
  },
  {
    id: 'test-urine-re',
    testCode: 'URE-08',
    testName: 'Urine Routine & Microscopic Examination (Urine R/M)',
    category: 'urine',
    department: 'Clinical Pathology',
    sampleType: 'Urine',
    containerType: 'Sterile Urine Container (Yellow Cup)',
    sampleVolume: '20.0 ml',
    turnaroundHours: 2,
    price: 180,
    preparationInstructions: 'Early morning midstream urine specimen.',
    fastingRequired: false,
    isActive: true,
    parameters: [
      { id: 'p-u-color', parameterName: 'Color & Appearance', unit: '', referenceRangeMale: 'Pale Yellow / Clear', referenceRangeFemale: 'Pale Yellow / Clear', defaultValue: 'Pale Yellow, Clear', format: 'selectable', options: ['Pale Yellow, Clear', 'Dark Yellow', 'Turbid / Cloudy', 'Reddish / Hematuria'] },
      { id: 'p-u-ph', parameterName: 'pH', unit: '', referenceRangeMale: '4.5 - 8.0', referenceRangeFemale: '4.5 - 8.0', format: 'numeric' },
      { id: 'p-u-sg', parameterName: 'Specific Gravity', unit: '', referenceRangeMale: '1.005 - 1.030', referenceRangeFemale: '1.005 - 1.030', format: 'numeric' },
      { id: 'p-u-prot', parameterName: 'Protein (Albumin)', unit: '', referenceRangeMale: 'Negative', referenceRangeFemale: 'Negative', defaultValue: 'Negative', format: 'selectable', options: ['Negative', 'Trace', '1+ (30 mg/dL)', '2+ (100 mg/dL)', '3+ (300 mg/dL)'] },
      { id: 'p-u-sug', parameterName: 'Urine Sugar', unit: '', referenceRangeMale: 'Negative', referenceRangeFemale: 'Negative', defaultValue: 'Negative', format: 'selectable', options: ['Negative', 'Trace', '1+', '2+', '3+'] },
      { id: 'p-u-pus', parameterName: 'Pus Cells (WBCs)', unit: '/hpf', referenceRangeMale: '0 - 5', referenceRangeFemale: '0 - 5', format: 'numeric' },
      { id: 'p-u-rbc', parameterName: 'RBCs', unit: '/hpf', referenceRangeMale: '0 - 2', referenceRangeFemale: '0 - 2', format: 'numeric' },
    ],
  },
  {
    id: 'test-trop-i',
    testCode: 'TROP-09',
    testName: 'Troponin I (High Sensitivity Quantitative)',
    category: 'biochemistry',
    department: 'Emergency & Critical Biochemistry',
    sampleType: 'Serum / Plasma',
    containerType: 'Lithium Heparin (Green Top)',
    sampleVolume: '2.5 ml',
    turnaroundHours: 1,
    price: 1200,
    preparationInstructions: 'STAT Emergency cardiac marker.',
    fastingRequired: false,
    isActive: true,
    parameters: [
      { id: 'p-trop-val', parameterName: 'hs-Troponin I', unit: 'ng/L', referenceRangeMale: '< 14.0', referenceRangeFemale: '< 14.0', criticalHigh: 50.0, format: 'numeric' },
    ],
  },
  {
    id: 'test-dengue',
    testCode: 'DENGUE-10',
    testName: 'Dengue Serology (NS1 Antigen, IgM, IgG)',
    category: 'serology',
    department: 'Microbiology & Serology',
    sampleType: 'Serum',
    containerType: 'SST / Gel (Gold/Yellow Top)',
    sampleVolume: '3.0 ml',
    turnaroundHours: 3,
    price: 900,
    preparationInstructions: 'No preparation needed.',
    fastingRequired: false,
    isActive: true,
    parameters: [
      { id: 'p-dengue-ns1', parameterName: 'Dengue NS1 Antigen', unit: '', referenceRangeMale: 'Negative', referenceRangeFemale: 'Negative', defaultValue: 'Negative', format: 'positive_negative' },
      { id: 'p-dengue-igm', parameterName: 'Dengue IgM Antibodies', unit: '', referenceRangeMale: 'Negative', referenceRangeFemale: 'Negative', defaultValue: 'Negative', format: 'positive_negative' },
      { id: 'p-dengue-igg', parameterName: 'Dengue IgG Antibodies', unit: '', referenceRangeMale: 'Negative', referenceRangeFemale: 'Negative', defaultValue: 'Negative', format: 'positive_negative' },
    ],
  },
];

export const INITIAL_LAB_PACKAGES: LabPackageMasterItem[] = [
  {
    id: 'pkg-executive',
    packageCode: 'PKG-EXEC',
    packageName: 'Comprehensive Executive Health Check Panel',
    testIds: ['test-cbc', 'test-lft', 'test-kft', 'test-lipid', 'test-bsf', 'test-hba1c', 'test-tft', 'test-urine-re'],
    price: 3200,
    discountPercentage: 20,
    isActive: true,
    description: 'Complete full-body laboratory evaluation including CBC, Liver, Kidney, Lipid, Sugar, HbA1c, Thyroid, and Urine analysis.',
  },
  {
    id: 'pkg-diabetic',
    packageCode: 'PKG-DIAB',
    packageName: 'Diabetic Health Monitoring Panel',
    testIds: ['test-bsf', 'test-hba1c', 'test-kft', 'test-lipid', 'test-urine-re'],
    price: 1650,
    discountPercentage: 15,
    isActive: true,
    description: 'Comprehensive diabetes screening with glycemic index, renal clearance, and microalbuminuria evaluation.',
  },
  {
    id: 'pkg-fever',
    packageCode: 'PKG-FEVER',
    packageName: 'Acute Fever Profile Panel',
    testIds: ['test-cbc', 'test-dengue', 'test-urine-re'],
    price: 1200,
    discountPercentage: 15,
    isActive: true,
    description: 'Rapid diagnostic panel for acute pyrexia of unknown origin including CBC platelet count, dengue serology, and urine screen.',
  },
  {
    id: 'pkg-preop',
    packageCode: 'PKG-PREOP',
    packageName: 'Pre-Operative Anesthesia Clearance Panel',
    testIds: ['test-cbc', 'test-kft', 'test-bsf', 'test-urine-re'],
    price: 1100,
    discountPercentage: 10,
    isActive: true,
    description: 'Standard surgical fitness panel ensuring coagulation profile, renal baseline, and normal metabolic parameters.',
  },
];

export const INITIAL_LAB_ORDERS: ComprehensiveLabOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'LAB-2026-00041',
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
    orderDate: '2026-09-02 08:30',
    priority: 'routine',
    clinicalNotes: 'Follow-up for acute pyrexia, persistent fatigue, and elevated transaminases.',
    diagnosis: 'Viral Fever with Mild Hepatic Dysfunction',
    fastingRequired: true,
    sampleIds: ['SMP-2026-00101', 'SMP-2026-00102'],
    totalAmount: 1100,
    paymentStatus: 'paid',
    status: 'verified',
    sampleStatus: 'completed',
    pathologistRemarks: 'Results reviewed. Hemoglobin normal. Mild SGPT elevation consistent with viral hepatitis recovery.',
    version: 1,
    items: [
      {
        id: 'item-101',
        testId: 'test-cbc',
        testCode: 'CBC-01',
        testName: 'Complete Blood Count (CBC) with Differential',
        sampleType: 'Whole Blood',
        containerType: 'EDTA (Lavender Top)',
        price: 350,
        status: 'verified',
        technicianName: 'Sanjay Deshmukh, MLT',
        technicianAt: '2026-09-02 10:15',
        verifiedBy: 'Dr. Sunita Rao, MD (Pathology)',
        verifiedAt: '2026-09-02 11:30',
        results: [
          { parameterId: 'p-hb', parameterName: 'Hemoglobin (Hb)', value: 13.5, unit: 'g/dL', referenceRange: '12.0 - 15.0', status: 'normal', isCritical: false },
          { parameterId: 'p-rbc', parameterName: 'RBC Count', value: 4.6, unit: 'million/mcL', referenceRange: '4.0 - 5.2', status: 'normal', isCritical: false },
          { parameterId: 'p-wbc', parameterName: 'Total WBC Count', value: 7800, unit: 'cells/mcL', referenceRange: '4,000 - 11,000', status: 'normal', isCritical: false },
          { parameterId: 'p-plt', parameterName: 'Platelet Count', value: 2.4, unit: 'lakhs/mcL', referenceRange: '1.5 - 4.5', status: 'normal', isCritical: false },
          { parameterId: 'p-neut', parameterName: 'Neutrophils', value: 62, unit: '%', referenceRange: '40 - 75', status: 'normal', isCritical: false },
          { parameterId: 'p-lymph', parameterName: 'Lymphocytes', value: 30, unit: '%', referenceRange: '20 - 45', status: 'normal', isCritical: false },
        ],
      },
      {
        id: 'item-102',
        testId: 'test-lft',
        testCode: 'LFT-02',
        testName: 'Liver Function Test (LFT) Comprehensive',
        sampleType: 'Serum',
        containerType: 'SST / Gel (Gold/Yellow Top)',
        price: 750,
        status: 'verified',
        technicianName: 'Sanjay Deshmukh, MLT',
        technicianAt: '2026-09-02 10:45',
        verifiedBy: 'Dr. Sunita Rao, MD (Pathology)',
        verifiedAt: '2026-09-02 11:30',
        results: [
          { parameterId: 'p-bili-tot', parameterName: 'Bilirubin Total', value: 0.9, unit: 'mg/dL', referenceRange: '0.2 - 1.2', status: 'normal', isCritical: false },
          { parameterId: 'p-bili-dir', parameterName: 'Bilirubin Direct', value: 0.2, unit: 'mg/dL', referenceRange: '0.0 - 0.3', status: 'normal', isCritical: false },
          { parameterId: 'p-sgot', parameterName: 'SGOT (AST)', value: 48, unit: 'U/L', referenceRange: '9 - 32', status: 'high', isCritical: false },
          { parameterId: 'p-sgpt', parameterName: 'SGPT (ALT)', value: 64, unit: 'U/L', referenceRange: '7 - 45', status: 'high', isCritical: false },
          { parameterId: 'p-alp', parameterName: 'Alkaline Phosphatase (ALP)', value: 110, unit: 'U/L', referenceRange: '44 - 147', status: 'normal', isCritical: false },
          { parameterId: 'p-tp', parameterName: 'Total Protein', value: 7.2, unit: 'g/dL', referenceRange: '6.0 - 8.3', status: 'normal', isCritical: false },
          { parameterId: 'p-alb', parameterName: 'Albumin', value: 4.1, unit: 'g/dL', referenceRange: '3.5 - 5.5', status: 'normal', isCritical: false },
        ],
      },
    ],
  },
  {
    id: 'ord-002',
    orderNumber: 'LAB-2026-00042',
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
    department: 'Critical Care & Cardiology',
    orderDate: '2026-09-02 09:15',
    priority: 'stat',
    clinicalNotes: 'ICU Monitoring. Acute chest tightness and electrolyte assessment.',
    diagnosis: 'Acute Coronary Syndrome / Post-PCI Recovery',
    fastingRequired: false,
    sampleIds: ['SMP-2026-00103', 'SMP-2026-00104'],
    totalAmount: 1850,
    paymentStatus: 'paid',
    status: 'completed',
    sampleStatus: 'completed',
    version: 1,
    items: [
      {
        id: 'item-201',
        testId: 'test-kft',
        testCode: 'KFT-03',
        testName: 'Kidney Function Test (KFT / RFT) with Electrolytes',
        sampleType: 'Serum',
        containerType: 'SST / Gel (Gold/Yellow Top)',
        price: 650,
        status: 'completed',
        technicianName: 'Aarti Kulkarni, MLT',
        technicianAt: '2026-09-02 10:50',
        results: [
          { parameterId: 'p-urea', parameterName: 'Blood Urea', value: 52, unit: 'mg/dL', referenceRange: '15 - 45', status: 'high', isCritical: false },
          { parameterId: 'p-creat', parameterName: 'Serum Creatinine', value: 1.6, unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: 'high', isCritical: false },
          { parameterId: 'p-na', parameterName: 'Sodium (Na+)', value: 138, unit: 'mEq/L', referenceRange: '135 - 145', status: 'normal', isCritical: false },
          { parameterId: 'p-k', parameterName: 'Potassium (K+)', value: 6.3, unit: 'mEq/L', referenceRange: '3.5 - 5.1', status: 'critical_high', isCritical: true },
          { parameterId: 'p-cl', parameterName: 'Chloride (Cl-)', value: 102, unit: 'mEq/L', referenceRange: '96 - 106', status: 'normal', isCritical: false },
        ],
      },
      {
        id: 'item-202',
        testId: 'test-trop-i',
        testCode: 'TROP-09',
        testName: 'Troponin I (High Sensitivity Quantitative)',
        sampleType: 'Serum / Plasma',
        containerType: 'Lithium Heparin (Green Top)',
        price: 1200,
        status: 'completed',
        technicianName: 'Aarti Kulkarni, MLT',
        technicianAt: '2026-09-02 10:40',
        results: [
          { parameterId: 'p-trop-val', parameterName: 'hs-Troponin I', value: 68.4, unit: 'ng/L', referenceRange: '< 14.0', status: 'critical_high', isCritical: true },
        ],
      },
    ],
  },
  {
    id: 'ord-003',
    orderNumber: 'LAB-2026-00043',
    patientId: 'ALN-2026-00003',
    patientName: 'Pooja Verma',
    age: 28,
    gender: 'female',
    encounterType: 'opd',
    doctorId: 'doc-003',
    doctorName: 'Dr. Amit Trivedi',
    department: 'Obstetrics & Gynecology',
    orderDate: '2026-09-02 11:00',
    priority: 'routine',
    clinicalNotes: 'Routine antenatal trimester screening.',
    diagnosis: 'First Trimester Pregnancy Screening',
    fastingRequired: true,
    sampleIds: ['SMP-2026-00105'],
    totalAmount: 850,
    paymentStatus: 'paid',
    status: 'sample_collected',
    sampleStatus: 'collected',
    version: 1,
    items: [
      {
        id: 'item-301',
        testId: 'test-cbc',
        testCode: 'CBC-01',
        testName: 'Complete Blood Count (CBC) with Differential',
        sampleType: 'Whole Blood',
        containerType: 'EDTA (Lavender Top)',
        price: 350,
        status: 'sample_collected',
        results: [],
      },
      {
        id: 'item-302',
        testId: 'test-tft',
        testCode: 'TFT-07',
        testName: 'Thyroid Function Test (TFT - T3, T4, TSH)',
        sampleType: 'Serum',
        containerType: 'SST / Gel (Gold/Yellow Top)',
        price: 500,
        status: 'sample_collected',
        results: [],
      },
    ],
  },
  {
    id: 'ord-004',
    orderNumber: 'LAB-2026-00044',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    age: 45,
    gender: 'male',
    encounterType: 'ipd',
    admissionId: 'adm-004',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Sharma',
    department: 'General Medicine',
    orderDate: '2026-09-02 11:30',
    priority: 'urgent',
    clinicalNotes: 'Pre-procedure metabolic screening.',
    diagnosis: 'Type 2 Diabetes Mellitus with Nephropathy Screen',
    fastingRequired: true,
    sampleIds: ['SMP-2026-00106'],
    totalAmount: 1270,
    paymentStatus: 'paid',
    status: 'ordered',
    sampleStatus: 'pending',
    version: 1,
    items: [
      {
        id: 'item-401',
        testId: 'test-bsf',
        testCode: 'BSF-05',
        testName: 'Blood Glucose Fasting (FBS)',
        sampleType: 'Fluoride Plasma',
        containerType: 'Sodium Fluoride (Grey Top)',
        price: 120,
        status: 'ordered',
        results: [],
      },
      {
        id: 'item-402',
        testId: 'test-hba1c',
        testCode: 'HBA1C-06',
        testName: 'Glycated Hemoglobin (HbA1c)',
        sampleType: 'Whole Blood',
        containerType: 'EDTA (Lavender Top)',
        price: 500,
        status: 'ordered',
        results: [],
      },
      {
        id: 'item-403',
        testId: 'test-kft',
        testCode: 'KFT-03',
        testName: 'Kidney Function Test (KFT / RFT) with Electrolytes',
        sampleType: 'Serum',
        containerType: 'SST / Gel (Gold/Yellow Top)',
        price: 650,
        status: 'ordered',
        results: [],
      },
    ],
  },
];

export const INITIAL_LAB_SAMPLES: LabSampleRecord[] = [
  {
    id: 'smp-rec-1',
    sampleId: 'SMP-2026-00101',
    barcode: 'BC890200101',
    orderId: 'ord-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    sampleType: 'Whole Blood',
    containerType: 'EDTA (Lavender Top)',
    priority: 'routine',
    status: 'completed',
    collectedAt: '2026-09-02 09:00',
    collectedBy: 'Phlebotomist Deepa Sen',
    receivedAt: '2026-09-02 09:30',
    receivedBy: 'Lab Tech Sanjay Deshmukh',
  },
  {
    id: 'smp-rec-2',
    sampleId: 'SMP-2026-00102',
    barcode: 'BC890200102',
    orderId: 'ord-001',
    patientId: 'ALN-2026-00001',
    patientName: 'Ananya Sharma',
    bedNumber: 'GW-01',
    ward: 'General Ward A',
    sampleType: 'Serum',
    containerType: 'SST / Gel (Gold/Yellow Top)',
    priority: 'routine',
    status: 'completed',
    collectedAt: '2026-09-02 09:00',
    collectedBy: 'Phlebotomist Deepa Sen',
    receivedAt: '2026-09-02 09:30',
    receivedBy: 'Lab Tech Sanjay Deshmukh',
  },
  {
    id: 'smp-rec-3',
    sampleId: 'SMP-2026-00103',
    barcode: 'BC890200103',
    orderId: 'ord-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    sampleType: 'Serum',
    containerType: 'SST / Gel (Gold/Yellow Top)',
    priority: 'stat',
    status: 'completed',
    collectedAt: '2026-09-02 09:30',
    collectedBy: 'ICU Nurse Kavitha Nair',
    receivedAt: '2026-09-02 09:45',
    receivedBy: 'Lab Tech Aarti Kulkarni',
  },
  {
    id: 'smp-rec-4',
    sampleId: 'SMP-2026-00104',
    barcode: 'BC890200104',
    orderId: 'ord-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    sampleType: 'Serum / Plasma',
    containerType: 'Lithium Heparin (Green Top)',
    priority: 'stat',
    status: 'completed',
    collectedAt: '2026-09-02 09:30',
    collectedBy: 'ICU Nurse Kavitha Nair',
    receivedAt: '2026-09-02 09:45',
    receivedBy: 'Lab Tech Aarti Kulkarni',
  },
  {
    id: 'smp-rec-5',
    sampleId: 'SMP-2026-00105',
    barcode: 'BC890200105',
    orderId: 'ord-003',
    patientId: 'ALN-2026-00003',
    patientName: 'Pooja Verma',
    sampleType: 'Whole Blood & Serum',
    containerType: 'EDTA + SST Gel Tubes',
    priority: 'routine',
    status: 'collected',
    collectedAt: '2026-09-02 11:15',
    collectedBy: 'Phlebotomist Deepa Sen',
  },
  {
    id: 'smp-rec-6',
    sampleId: 'SMP-2026-00106',
    barcode: 'BC890200106',
    orderId: 'ord-004',
    patientId: 'ALN-2026-00004',
    patientName: 'Karan Malhotra',
    bedNumber: 'GW-02',
    ward: 'General Ward A',
    sampleType: 'Fluoride Plasma, EDTA, SST',
    containerType: 'Grey + Lavender + Gold Tops',
    priority: 'urgent',
    status: 'pending',
  },
];

export const INITIAL_CRITICAL_ALERTS: LabCriticalAlert[] = [
  {
    id: 'crit-001',
    orderId: 'ord-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorName: 'Dr. Sarah Khan',
    testName: 'Kidney Function Test (KFT)',
    parameterName: 'Potassium (K+)',
    resultValue: 6.3,
    criticalThreshold: '> 6.0 mEq/L (Severe Hyperkalemia)',
    detectedAt: '2026-09-02 10:52',
    status: 'notified',
    notifiedTo: 'Dr. Sarah Khan (Attending Cardiologist)',
  },
  {
    id: 'crit-002',
    orderId: 'ord-002',
    patientId: 'ALN-2026-00002',
    patientName: 'Vikram Patel',
    bedNumber: 'ICU-01',
    ward: 'Medical ICU',
    doctorName: 'Dr. Sarah Khan',
    testName: 'hs-Troponin I',
    parameterName: 'hs-Troponin I',
    resultValue: 68.4,
    criticalThreshold: '> 50.0 ng/L (Acute Myocardial Injury)',
    detectedAt: '2026-09-02 10:42',
    status: 'acknowledged',
    notifiedTo: 'Dr. Sarah Khan (Attending Cardiologist)',
    acknowledgedBy: 'Dr. Sarah Khan',
    acknowledgedAt: '2026-09-02 10:48',
  },
];

interface LabContextType {
  activeTab: LabTab;
  setActiveTab: (tab: LabTab) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedSampleId: string | null;
  setSelectedSampleId: (id: string | null) => void;
  labOrders: ComprehensiveLabOrder[];
  labSamples: LabSampleRecord[];
  testMaster: LabTestMasterItem[];
  packageMaster: LabPackageMasterItem[];
  criticalAlerts: LabCriticalAlert[];
  reportAmendments: LabReportAmendment[];
  kpis: LabDashboardKPIs;

  // Actions
  createLabOrder: (orderData: Partial<ComprehensiveLabOrder> & { testIds: string[] }) => ComprehensiveLabOrder;
  collectSample: (sampleId: string, collectorName: string) => void;
  receiveSample: (sampleId: string, receiverName: string, status: 'accepted' | 'rejected', rejectionReason?: string, remarks?: string) => void;
  recollectSample: (sampleId: string, reason: string) => void;
  startTestProcessing: (orderId: string, testId: string, technicianName: string) => void;
  enterTestResults: (orderId: string, testId: string, results: LabParameterResult[], technicianName: string, remarks?: string) => void;
  verifyTestResults: (orderId: string, testId: string, pathologistName: string, remarks?: string) => void;
  amendLabReport: (orderId: string, testId: string, amendedResults: LabParameterResult[], reason: string, pathologistName: string) => void;
  cancelLabOrder: (orderId: string, reason: string) => void;
  acknowledgeCriticalAlert: (alertId: string, ackBy: string) => void;
  addLabTestMaster: (test: Omit<LabTestMasterItem, 'id'>) => void;
  updateLabTestMaster: (id: string, test: Partial<LabTestMasterItem>) => void;
  toggleLabTestStatus: (id: string) => void;
  addLabPackage: (pkg: Omit<LabPackageMasterItem, 'id'>) => void;
  updateLabPackage: (id: string, pkg: Partial<LabPackageMasterItem>) => void;
  toggleLabPackageStatus: (id: string) => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<LabTab>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ord-001');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const [labOrders, setLabOrders] = useState<ComprehensiveLabOrder[]>(() => {
    const saved = localStorage.getItem('hms_lab_orders');
    return saved ? JSON.parse(saved) : INITIAL_LAB_ORDERS;
  });

  const [labSamples, setLabSamples] = useState<LabSampleRecord[]>(() => {
    const saved = localStorage.getItem('hms_lab_samples');
    return saved ? JSON.parse(saved) : INITIAL_LAB_SAMPLES;
  });

  const [testMaster, setTestMaster] = useState<LabTestMasterItem[]>(() => {
    const saved = localStorage.getItem('hms_lab_test_master');
    return saved ? JSON.parse(saved) : INITIAL_LAB_TESTS;
  });

  const [packageMaster, setPackageMaster] = useState<LabPackageMasterItem[]>(() => {
    const saved = localStorage.getItem('hms_lab_packages');
    return saved ? JSON.parse(saved) : INITIAL_LAB_PACKAGES;
  });

  const [criticalAlerts, setCriticalAlerts] = useState<LabCriticalAlert[]>(() => {
    const saved = localStorage.getItem('hms_lab_critical_alerts');
    return saved ? JSON.parse(saved) : INITIAL_CRITICAL_ALERTS;
  });

  const [reportAmendments, setReportAmendments] = useState<LabReportAmendment[]>(() => {
    const saved = localStorage.getItem('hms_lab_report_amendments');
    return saved ? JSON.parse(saved) : [];
  });

  // Local Storage Persistence
  useEffect(() => {
    localStorage.setItem('hms_lab_orders', JSON.stringify(labOrders));
  }, [labOrders]);

  useEffect(() => {
    localStorage.setItem('hms_lab_samples', JSON.stringify(labSamples));
  }, [labSamples]);

  useEffect(() => {
    localStorage.setItem('hms_lab_test_master', JSON.stringify(testMaster));
  }, [testMaster]);

  useEffect(() => {
    localStorage.setItem('hms_lab_packages', JSON.stringify(packageMaster));
  }, [packageMaster]);

  useEffect(() => {
    localStorage.setItem('hms_lab_critical_alerts', JSON.stringify(criticalAlerts));
  }, [criticalAlerts]);

  useEffect(() => {
    localStorage.setItem('hms_lab_report_amendments', JSON.stringify(reportAmendments));
  }, [reportAmendments]);

  // Actions
  const createLabOrder = (orderData: Partial<ComprehensiveLabOrder> & { testIds: string[] }): ComprehensiveLabOrder => {
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `LAB-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const selectedTests = testMaster.filter(t => orderData.testIds.includes(t.id));
    const items: ComprehensiveLabOrder['items'] = selectedTests.map((t, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      testId: t.id,
      testCode: t.testCode,
      testName: t.testName,
      sampleType: t.sampleType,
      containerType: t.containerType,
      price: t.price,
      status: 'ordered',
      results: [],
    }));

    const sampleIds: string[] = [];
    const newSamples: LabSampleRecord[] = [];

    // Group containers to avoid redundant phlebotomy punctures
    const containerGroups: Record<string, typeof selectedTests> = {};
    selectedTests.forEach(t => {
      const key = `${t.sampleType}_${t.containerType}`;
      if (!containerGroups[key]) containerGroups[key] = [];
      containerGroups[key].push(t);
    });

    Object.keys(containerGroups).forEach((key, idx) => {
      const group = containerGroups[key];
      const smpId = `SMP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const barcode = `BC${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      sampleIds.push(smpId);

      newSamples.push({
        id: `smp-${Date.now()}-${idx}`,
        sampleId: smpId,
        barcode,
        orderId,
        patientId: orderData.patientId || 'ALN-2026-00001',
        patientName: orderData.patientName || 'Unknown Patient',
        bedNumber: orderData.bedNumber,
        ward: orderData.ward,
        sampleType: group[0].sampleType,
        containerType: group[0].containerType,
        priority: orderData.priority || 'routine',
        status: 'pending',
      });
    });

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    const newOrder: ComprehensiveLabOrder = {
      id: orderId,
      orderNumber,
      patientId: orderData.patientId || 'ALN-2026-00001',
      patientName: orderData.patientName || 'Unknown Patient',
      age: orderData.age || 35,
      gender: orderData.gender || 'male',
      encounterType: orderData.encounterType || 'opd',
      admissionId: orderData.admissionId,
      bedNumber: orderData.bedNumber,
      ward: orderData.ward,
      doctorId: orderData.doctorId || 'doc-001',
      doctorName: orderData.doctorName || 'Dr. Rajesh Sharma',
      department: orderData.department || 'General Medicine',
      orderDate: nowStr,
      priority: orderData.priority || 'routine',
      clinicalNotes: orderData.clinicalNotes,
      diagnosis: orderData.diagnosis,
      fastingRequired: selectedTests.some(t => t.fastingRequired),
      items,
      sampleIds,
      totalAmount,
      paymentStatus: 'paid',
      status: 'ordered',
      sampleStatus: 'pending',
      version: 1,
    };

    setLabOrders(prev => [newOrder, ...prev]);
    setLabSamples(prev => [...newSamples, ...prev]);
    return newOrder;
  };

  const collectSample = (sampleId: string, collectorName: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLabSamples(prev =>
      prev.map(s =>
        s.sampleId === sampleId
          ? { ...s, status: 'collected', collectedAt: nowStr, collectedBy: collectorName }
          : s
      )
    );

    // Update order status if all samples collected
    setLabOrders(prev =>
      prev.map(ord => {
        if (ord.sampleIds.includes(sampleId)) {
          return { ...ord, status: 'sample_collected', sampleStatus: 'collected' };
        }
        return ord;
      })
    );
  };

  const receiveSample = (
    sampleId: string,
    receiverName: string,
    status: 'accepted' | 'rejected',
    rejectionReason?: string,
    remarks?: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLabSamples(prev =>
      prev.map(s =>
        s.sampleId === sampleId
          ? {
              ...s,
              status,
              receivedAt: nowStr,
              receivedBy: receiverName,
              rejectionReason,
              rejectionRemarks: remarks,
            }
          : s
      )
    );

    if (status === 'accepted') {
      setLabOrders(prev =>
        prev.map(ord =>
          ord.sampleIds.includes(sampleId) ? { ...ord, status: 'sample_received', sampleStatus: 'accepted' } : ord
        )
      );
    }
  };

  const recollectSample = (sampleId: string, reason: string) => {
    const oldSample = labSamples.find(s => s.sampleId === sampleId);
    if (!oldSample) return;

    const newSmpId = `SMP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBarcode = `BC${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const replacementSample: LabSampleRecord = {
      ...oldSample,
      id: `smp-${Date.now()}`,
      sampleId: newSmpId,
      barcode: newBarcode,
      status: 'pending',
      collectedAt: undefined,
      collectedBy: undefined,
      receivedAt: undefined,
      receivedBy: undefined,
      rejectionReason: undefined,
      rejectionRemarks: undefined,
      recollectionSampleId: oldSample.sampleId,
    };

    setLabSamples(prev => [
      replacementSample,
      ...prev.map(s => (s.sampleId === sampleId ? { ...s, status: 'recollection_required' as const, rejectionRemarks: reason } : s)),
    ]);

    setLabOrders(prev =>
      prev.map(ord => {
        if (ord.sampleIds.includes(sampleId)) {
          return {
            ...ord,
            sampleIds: [...ord.sampleIds.filter(id => id !== sampleId), newSmpId],
            status: 'sample_pending',
            sampleStatus: 'recollection_required',
          };
        }
        return ord;
      })
    );
  };

  const startTestProcessing = (orderId: string, testId: string, technicianName: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLabOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map(item =>
            item.testId === testId
              ? { ...item, status: 'processing' as const, technicianName, technicianAt: nowStr }
              : item
          );
          return { ...ord, status: 'processing', sampleStatus: 'processing', items: updatedItems };
        }
        return ord;
      })
    );
  };

  const enterTestResults = (
    orderId: string,
    testId: string,
    results: LabParameterResult[],
    technicianName: string,
    remarks?: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const order = labOrders.find(o => o.id === orderId);

    // Check for critical flags and trigger critical alerts
    results.forEach(res => {
      if (res.isCritical && order) {
        const newAlert: LabCriticalAlert = {
          id: `crit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId,
          patientId: order.patientId,
          patientName: order.patientName,
          bedNumber: order.bedNumber,
          ward: order.ward,
          doctorName: order.doctorName,
          testName: testMaster.find(t => t.id === testId)?.testName || 'Laboratory Test',
          parameterName: res.parameterName,
          resultValue: res.value,
          criticalThreshold: `${res.status.toUpperCase()} (${res.unit})`,
          detectedAt: nowStr,
          status: 'new',
        };
        setCriticalAlerts(prev => [newAlert, ...prev]);
      }
    });

    setLabOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map(item =>
            item.testId === testId
              ? {
                  ...item,
                  status: 'completed' as const,
                  results,
                  technicianName,
                  technicianAt: nowStr,
                }
              : item
          );
          const allCompleted = updatedItems.every(i => i.status === 'completed' || i.status === 'verified');
          return {
            ...ord,
            status: allCompleted ? 'completed' : ord.status,
            sampleStatus: 'completed',
            pathologistRemarks: remarks || ord.pathologistRemarks,
            items: updatedItems,
          };
        }
        return ord;
      })
    );
  };

  const verifyTestResults = (orderId: string, testId: string, pathologistName: string, remarks?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLabOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map(item =>
            item.testId === testId
              ? {
                  ...item,
                  status: 'verified' as const,
                  verifiedBy: pathologistName,
                  verifiedAt: nowStr,
                }
              : item
          );
          const allVerified = updatedItems.every(i => i.status === 'verified');
          return {
            ...ord,
            status: allVerified ? 'verified' : ord.status,
            pathologistRemarks: remarks || ord.pathologistRemarks,
            items: updatedItems,
          };
        }
        return ord;
      })
    );
  };

  const amendLabReport = (
    orderId: string,
    testId: string,
    amendedResults: LabParameterResult[],
    reason: string,
    pathologistName: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const order = labOrders.find(o => o.id === orderId);
    if (!order) return;

    const targetItem = order.items.find(i => i.testId === testId);
    if (!targetItem) return;

    const oldValues: Record<string, any> = {};
    targetItem.results.forEach(r => {
      oldValues[r.parameterName] = r.value;
    });

    const newValues: Record<string, any> = {};
    amendedResults.forEach(r => {
      newValues[r.parameterName] = r.value;
    });

    const amendmentRecord: LabReportAmendment = {
      id: `amd-${Date.now()}`,
      orderId,
      orderNumber: order.orderNumber,
      patientName: order.patientName,
      testName: targetItem.testName,
      version: order.version + 1,
      amendmentReason: reason,
      oldValues,
      newValues,
      amendedBy: pathologistName,
      amendedAt: nowStr,
    };

    setReportAmendments(prev => [amendmentRecord, ...prev]);

    setLabOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map(item =>
            item.testId === testId
              ? {
                  ...item,
                  status: 'verified' as const,
                  results: amendedResults,
                  verifiedBy: pathologistName,
                  verifiedAt: nowStr,
                }
              : item
          );
          return {
            ...ord,
            version: ord.version + 1,
            amendmentReason: reason,
            amendedBy: pathologistName,
            amendedAt: nowStr,
            items: updatedItems,
          };
        }
        return ord;
      })
    );
  };

  const cancelLabOrder = (orderId: string, reason: string) => {
    setLabOrders(prev =>
      prev.map(ord =>
        ord.id === orderId
          ? { ...ord, status: 'cancelled', clinicalNotes: `${ord.clinicalNotes || ''} [Cancelled: ${reason}]` }
          : ord
      )
    );
  };

  const acknowledgeCriticalAlert = (alertId: string, ackBy: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setCriticalAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'acknowledged', acknowledgedBy: ackBy, acknowledgedAt: nowStr } : a))
    );
  };

  const addLabTestMaster = (test: Omit<LabTestMasterItem, 'id'>) => {
    const newTest: LabTestMasterItem = {
      ...test,
      id: `test-${Date.now()}`,
      isActive: true,
    };
    setTestMaster(prev => [...prev, newTest]);
  };

  const updateLabTestMaster = (id: string, test: Partial<LabTestMasterItem>) => {
    setTestMaster(prev => prev.map(t => (t.id === id ? { ...t, ...test } : t)));
  };

  const toggleLabTestStatus = (id: string) => {
    setTestMaster(prev => prev.map(t => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  };

  const addLabPackage = (pkg: Omit<LabPackageMasterItem, 'id'>) => {
    const newPkg: LabPackageMasterItem = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      isActive: true,
    };
    setPackageMaster(prev => [...prev, newPkg]);
  };

  const updateLabPackage = (id: string, pkg: Partial<LabPackageMasterItem>) => {
    setPackageMaster(prev => prev.map(p => (p.id === id ? { ...p, ...pkg } : p)));
  };

  const toggleLabPackageStatus = (id: string) => {
    setPackageMaster(prev => prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  // KPIs Computer
  const kpis: LabDashboardKPIs = {
    totalOrdersToday: labOrders.length,
    pendingTests: labOrders.filter(o => o.status !== 'verified' && o.status !== 'cancelled').length,
    sampleCollectionPending: labSamples.filter(s => s.status === 'pending' || s.status === 'recollection_required').length,
    samplesCollected: labSamples.filter(s => s.status === 'collected').length,
    samplesInProcessing: labOrders.filter(o => o.status === 'processing').length,
    testsCompleted: labOrders.filter(o => o.status === 'completed').length,
    reportsPendingVerification: labOrders.filter(o => o.status === 'completed').length,
    reportsVerified: labOrders.filter(o => o.status === 'verified').length,
    criticalResultsCount: criticalAlerts.filter(a => a.status === 'new').length,
    cancelledTestsCount: labOrders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <LabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedOrderId,
        setSelectedOrderId,
        selectedSampleId,
        setSelectedSampleId,
        labOrders,
        labSamples,
        testMaster,
        packageMaster,
        criticalAlerts,
        reportAmendments,
        kpis,
        createLabOrder,
        collectSample,
        receiveSample,
        recollectSample,
        startTestProcessing,
        enterTestResults,
        verifyTestResults,
        amendLabReport,
        cancelLabOrder,
        acknowledgeCriticalAlert,
        addLabTestMaster,
        updateLabTestMaster,
        toggleLabTestStatus,
        addLabPackage,
        updateLabPackage,
        toggleLabPackageStatus,
      }}
    >
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
}
