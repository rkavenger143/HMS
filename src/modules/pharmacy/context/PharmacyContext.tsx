import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  ComprehensiveMedicineItem,
  MedicineBatchItem,
  StockMovementRecord,
  PharmacySupplierItem,
  PurchaseOrderItem,
  ComprehensivePrescription,
  PharmacySaleRecord,
  MedicineReturnRecord,
  PharmacyDashboardKPIs,
  MedicineCategory,
  DosageForm,
  MedicineClassification,
  BatchStatus,
  DispensingStatus,
  PurchaseOrderStatus,
} from '../../../types';

export type PharmacyTab =
  | 'dashboard'
  | 'medicines'
  | 'search'
  | 'batches'
  | 'stock'
  | 'stock_in'
  | 'purchase_orders'
  | 'suppliers'
  | 'movement_ledger'
  | 'prescriptions'
  | 'dispensing'
  | 'pos'
  | 'billing'
  | 'returns'
  | 'expiry'
  | 'low_stock'
  | 'adjustments'
  | 'recall'
  | 'patient_history'
  | 'analytics'
  | 'reports'
  | 'settings';

interface PharmacyContextType {
  activeTab: PharmacyTab;
  setActiveTab: (tab: PharmacyTab) => void;
  selectedMedicineId: string | null;
  setSelectedMedicineId: (id: string | null) => void;
  selectedPrescriptionId: string | null;
  setSelectedPrescriptionId: (id: string | null) => void;

  // Masters & Data Collections
  medicines: ComprehensiveMedicineItem[];
  batches: MedicineBatchItem[];
  stockMovements: StockMovementRecord[];
  suppliers: PharmacySupplierItem[];
  purchaseOrders: PurchaseOrderItem[];
  prescriptions: ComprehensivePrescription[];
  sales: PharmacySaleRecord[];
  returns: MedicineReturnRecord[];
  kpis: PharmacyDashboardKPIs;

  // Actions
  addMedicineMaster: (med: Omit<ComprehensiveMedicineItem, 'id' | 'totalStock'>) => void;
  updateMedicineMaster: (id: string, med: Partial<ComprehensiveMedicineItem>) => void;
  toggleMedicineStatus: (id: string) => void;

  stockIn: (
    batchData: Omit<MedicineBatchItem, 'id' | 'status' | 'reservedQuantity'>,
    performedBy: string
  ) => void;

  createPurchaseOrder: (po: Omit<PurchaseOrderItem, 'id' | 'poNumber' | 'status'>) => void;
  updatePOStatus: (poId: string, status: PurchaseOrderStatus, approvedBy?: string) => void;

  addSupplier: (supplier: Omit<PharmacySupplierItem, 'id' | 'status'>) => void;
  updateSupplier: (id: string, supplier: Partial<PharmacySupplierItem>) => void;

  dispensePrescription: (
    prescriptionId: string,
    dispensedItems: { medicineId: string; batchNumber: string; dispensedQty: number }[],
    pharmacistName: string
  ) => void;

  processPOSSale: (
    sale: Omit<PharmacySaleRecord, 'id' | 'saleNumber' | 'saleDate'>
  ) => PharmacySaleRecord;

  processMedicineReturn: (
    returnData: Omit<MedicineReturnRecord, 'id' | 'returnNumber' | 'returnDate' | 'status'>
  ) => void;

  recordStockAdjustment: (
    medicineId: string,
    batchNumber: string,
    physicalQty: number,
    reason: string,
    approvedBy: string
  ) => void;

  recordStockTransfer: (
    sourceLoc: string,
    destLoc: string,
    medicineId: string,
    batchNumber: string,
    qty: number,
    transferredBy: string
  ) => void;

  recallBatch: (batchId: string, recallReason: string, recalledBy: string) => void;
  disposeExpiredStock: (batchId: string, disposedBy: string, remarks?: string) => void;
}

const PharmacyContext = createContext<PharmacyContextType | null>(null);

// ==========================================
// SEED DATA
// ==========================================

const SEED_MEDICINES: ComprehensiveMedicineItem[] = [
  {
    id: 'med-pcm-500',
    medicineCode: 'MED-PCM-500',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol',
    category: 'analgesics',
    dosageForm: 'tablet',
    strength: '650mg',
    unit: 'Strip (15 Tab)',
    manufacturer: 'Micro Labs Ltd',
    packSize: 15,
    hsnCode: '30049060',
    gstRate: 12,
    purchasePrice: 22.5,
    sellingPrice: 33.5,
    reorderLevel: 50,
    maxStockLevel: 500,
    classification: 'normal',
    prescriptionRequired: false,
    totalStock: 320,
    isActive: true,
    storageLocation: 'Rack A-01 (Room Temp)',
  },
  {
    id: 'med-amox-cv',
    medicineCode: 'MED-AMOX-625',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    category: 'antibiotics',
    dosageForm: 'tablet',
    strength: '625mg',
    unit: 'Strip (10 Tab)',
    manufacturer: 'GSK Pharmaceuticals',
    packSize: 10,
    hsnCode: '30041090',
    gstRate: 12,
    purchasePrice: 140.0,
    sellingPrice: 201.5,
    reorderLevel: 30,
    maxStockLevel: 250,
    classification: 'schedule_h',
    prescriptionRequired: true,
    totalStock: 185,
    isActive: true,
    storageLocation: 'Rack B-04 (Cool & Dry)',
  },
  {
    id: 'med-pantop-40',
    medicineCode: 'MED-PAN-40',
    brandName: 'Pan 40',
    genericName: 'Pantoprazole Sodium',
    category: 'gastrointestinal',
    dosageForm: 'tablet',
    strength: '40mg',
    unit: 'Strip (15 Tab)',
    manufacturer: 'Alkem Laboratories',
    packSize: 15,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 95.0,
    sellingPrice: 155.0,
    reorderLevel: 40,
    maxStockLevel: 400,
    classification: 'schedule_h',
    prescriptionRequired: true,
    totalStock: 240,
    isActive: true,
    storageLocation: 'Rack A-08',
  },
  {
    id: 'med-metform-500',
    medicineCode: 'MED-GLY-500',
    brandName: 'Glycomet 500 SR',
    genericName: 'Metformin Hydrochloride',
    category: 'antidiabetics',
    dosageForm: 'tablet',
    strength: '500mg',
    unit: 'Strip (20 Tab)',
    manufacturer: 'USV Pvt Ltd',
    packSize: 20,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 38.0,
    sellingPrice: 52.0,
    reorderLevel: 50,
    maxStockLevel: 450,
    classification: 'schedule_h',
    prescriptionRequired: true,
    totalStock: 310,
    isActive: true,
    storageLocation: 'Rack C-02',
  },
  {
    id: 'med-telmi-40',
    medicineCode: 'MED-TEL-40',
    brandName: 'Telma 40',
    genericName: 'Telmisartan',
    category: 'cardiovascular',
    dosageForm: 'tablet',
    strength: '40mg',
    unit: 'Strip (15 Tab)',
    manufacturer: 'Glenmark Pharmaceuticals',
    packSize: 15,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 110.0,
    sellingPrice: 165.0,
    reorderLevel: 30,
    maxStockLevel: 300,
    classification: 'schedule_h',
    prescriptionRequired: true,
    totalStock: 145,
    isActive: true,
    storageLocation: 'Rack C-05',
  },
  {
    id: 'med-azith-500',
    medicineCode: 'MED-AZI-500',
    brandName: 'Azithral 500',
    genericName: 'Azithromycin',
    category: 'antibiotics',
    dosageForm: 'tablet',
    strength: '500mg',
    unit: 'Strip (5 Tab)',
    manufacturer: 'Alembic Pharmaceuticals',
    packSize: 5,
    hsnCode: '30042099',
    gstRate: 12,
    purchasePrice: 82.0,
    sellingPrice: 119.5,
    reorderLevel: 25,
    maxStockLevel: 200,
    classification: 'schedule_h1',
    prescriptionRequired: true,
    totalStock: 95,
    isActive: true,
    storageLocation: 'Schedule H1 Lockbox (Cabinet 2)',
  },
  {
    id: 'med-ceftriax-1g',
    medicineCode: 'MED-MONO-1G',
    brandName: 'Monocef 1g Injection',
    genericName: 'Ceftriaxone Sodium',
    category: 'antibiotics',
    dosageForm: 'injection',
    strength: '1g',
    unit: 'Vial with WFI',
    manufacturer: 'Aristo Pharmaceuticals',
    packSize: 1,
    hsnCode: '30042099',
    gstRate: 12,
    purchasePrice: 42.0,
    sellingPrice: 68.0,
    reorderLevel: 40,
    maxStockLevel: 350,
    classification: 'schedule_h1',
    prescriptionRequired: true,
    totalStock: 120,
    isActive: true,
    storageLocation: 'Injectables Rack D-01',
  },
  {
    id: 'med-ns-500ml',
    medicineCode: 'MED-NS-500',
    brandName: 'Normal Saline 0.9% IV Infusion',
    genericName: 'Sodium Chloride 0.9% w/v',
    category: 'iv_fluids',
    dosageForm: 'iv_infusion',
    strength: '500ml (0.9%)',
    unit: 'FFS Bottle',
    manufacturer: 'Baxter Healthcare',
    packSize: 1,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 28.0,
    sellingPrice: 48.0,
    reorderLevel: 100,
    maxStockLevel: 800,
    classification: 'normal',
    prescriptionRequired: true,
    totalStock: 350,
    isActive: true,
    storageLocation: 'IV Fluids Bay Store E',
  },
  {
    id: 'med-ondan-4mg',
    medicineCode: 'MED-EMES-4',
    brandName: 'Emeset 4mg Injection',
    genericName: 'Ondansetron Hydrochloride',
    category: 'gastrointestinal',
    dosageForm: 'injection',
    strength: '4mg / 2ml',
    unit: 'Ampoule (2ml)',
    manufacturer: 'Cipla Ltd',
    packSize: 1,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 9.5,
    sellingPrice: 18.0,
    reorderLevel: 30,
    maxStockLevel: 250,
    classification: 'schedule_h',
    prescriptionRequired: true,
    totalStock: 80,
    isActive: true,
    storageLocation: 'Injectables Rack D-04',
  },
  {
    id: 'med-salbut-resp',
    medicineCode: 'MED-ASTH-RESP',
    brandName: 'Asthalin Respirator Solution',
    genericName: 'Salbutamol Sulphate',
    category: 'respiratory',
    dosageForm: 'inhaler',
    strength: '5mg/ml (15ml)',
    unit: 'Dropper Bottle',
    manufacturer: 'Cipla Ltd',
    packSize: 1,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 21.0,
    sellingPrice: 34.0,
    reorderLevel: 20,
    maxStockLevel: 150,
    classification: 'schedule_h',
    prescriptionRequired: true,
    totalStock: 45,
    isActive: true,
    storageLocation: 'Rack B-09',
  },
  {
    id: 'med-tramadol-50',
    medicineCode: 'MED-TRAM-50',
    brandName: 'Tramazac 50mg Capsule',
    genericName: 'Tramadol Hydrochloride',
    category: 'analgesics',
    dosageForm: 'capsule',
    strength: '50mg',
    unit: 'Strip (10 Cap)',
    manufacturer: 'Zydus Cadila',
    packSize: 10,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 65.0,
    sellingPrice: 98.0,
    reorderLevel: 15,
    maxStockLevel: 100,
    classification: 'narcotic_controlled',
    prescriptionRequired: true,
    totalStock: 12, // LOW STOCK
    isActive: true,
    storageLocation: 'Controlled Substance Vault (Double Lock)',
  },
  {
    id: 'med-atorva-20',
    medicineCode: 'MED-ATOR-20',
    brandName: 'Atorva 20',
    genericName: 'Atorvastatin Calcium',
    category: 'cardiovascular',
    dosageForm: 'tablet',
    strength: '20mg',
    unit: 'Strip (15 Tab)',
    manufacturer: 'Zydus Healthcare',
    packSize: 15,
    hsnCode: '30049099',
    gstRate: 12,
    purchasePrice: 135.0,
    sellingPrice: 198.0,
    reorderLevel: 25,
    maxStockLevel: 200,
    classification: 'schedule_h',
    prescriptionRequired: true,
    totalStock: 5, // LOW STOCK / NEAR EXPIRY
    isActive: true,
    storageLocation: 'Rack C-08',
  },
];

const SEED_BATCHES: MedicineBatchItem[] = [
  {
    id: 'batch-pcm-1',
    medicineId: 'med-pcm-500',
    medicineName: 'Dolo 650 (Paracetamol 650mg)',
    batchNumber: 'LOT-DL-9821',
    manufacturingDate: '2026-01-10',
    expiryDate: '2027-12-31',
    purchasePrice: 22.5,
    sellingPrice: 33.5,
    quantity: 200,
    availableQuantity: 200,
    reservedQuantity: 0,
    supplierId: 'sup-sun',
    supplierName: 'Sun Pharma Distributors',
    purchaseInvoiceNo: 'INV-SP-2026-4412',
    receivedDate: '2026-01-20',
    status: 'available',
  },
  {
    id: 'batch-pcm-2',
    medicineId: 'med-pcm-500',
    medicineName: 'Dolo 650 (Paracetamol 650mg)',
    batchNumber: 'LOT-DL-9104',
    manufacturingDate: '2025-11-05',
    expiryDate: '2027-10-31',
    purchasePrice: 22.0,
    sellingPrice: 33.5,
    quantity: 120,
    availableQuantity: 120,
    reservedQuantity: 0,
    supplierId: 'sup-sun',
    supplierName: 'Sun Pharma Distributors',
    purchaseInvoiceNo: 'INV-SP-2025-8812',
    receivedDate: '2025-11-18',
    status: 'available',
  },
  {
    id: 'batch-amox-1',
    medicineId: 'med-amox-cv',
    medicineName: 'Augmentin 625 Duo',
    batchNumber: 'LOT-AUG-4421',
    manufacturingDate: '2026-02-14',
    expiryDate: '2027-08-31',
    purchasePrice: 140.0,
    sellingPrice: 201.5,
    quantity: 185,
    availableQuantity: 185,
    reservedQuantity: 0,
    supplierId: 'sup-gsk',
    supplierName: 'MedPlus Wholesale Agency',
    purchaseInvoiceNo: 'INV-MP-2026-1029',
    receivedDate: '2026-02-22',
    status: 'available',
  },
  {
    id: 'batch-pantop-1',
    medicineId: 'med-pantop-40',
    medicineName: 'Pan 40 (Pantoprazole 40mg)',
    batchNumber: 'LOT-PN-8872',
    manufacturingDate: '2026-01-05',
    expiryDate: '2028-01-31',
    purchasePrice: 95.0,
    sellingPrice: 155.0,
    quantity: 240,
    availableQuantity: 240,
    reservedQuantity: 0,
    supplierId: 'sup-cipla',
    supplierName: 'Cipla Logistics Hub',
    purchaseInvoiceNo: 'INV-CP-2026-0044',
    receivedDate: '2026-01-15',
    status: 'available',
  },
  {
    id: 'batch-metform-1',
    medicineId: 'med-metform-500',
    medicineName: 'Glycomet 500 SR',
    batchNumber: 'LOT-GLY-3310',
    manufacturingDate: '2025-12-01',
    expiryDate: '2027-11-30',
    purchasePrice: 38.0,
    sellingPrice: 52.0,
    quantity: 310,
    availableQuantity: 310,
    reservedQuantity: 0,
    supplierId: 'sup-apollo',
    supplierName: 'Apollo Pharma Wholesale',
    purchaseInvoiceNo: 'INV-AP-2025-9921',
    receivedDate: '2025-12-10',
    status: 'available',
  },
  {
    id: 'batch-azith-1',
    medicineId: 'med-azith-500',
    medicineName: 'Azithral 500',
    batchNumber: 'LOT-AZ-1189',
    manufacturingDate: '2026-03-01',
    expiryDate: '2028-02-28',
    purchasePrice: 82.0,
    sellingPrice: 119.5,
    quantity: 95,
    availableQuantity: 95,
    reservedQuantity: 0,
    supplierId: 'sup-sun',
    supplierName: 'Sun Pharma Distributors',
    purchaseInvoiceNo: 'INV-SP-2026-5510',
    receivedDate: '2026-03-08',
    status: 'available',
  },
  {
    id: 'batch-ceft-1',
    medicineId: 'med-ceftriax-1g',
    medicineName: 'Monocef 1g Injection',
    batchNumber: 'LOT-MN-7714',
    manufacturingDate: '2026-01-18',
    expiryDate: '2027-06-30',
    purchasePrice: 42.0,
    sellingPrice: 68.0,
    quantity: 120,
    availableQuantity: 120,
    reservedQuantity: 0,
    supplierId: 'sup-cipla',
    supplierName: 'Cipla Logistics Hub',
    purchaseInvoiceNo: 'INV-CP-2026-1120',
    receivedDate: '2026-01-25',
    status: 'available',
  },
  {
    id: 'batch-ns-1',
    medicineId: 'med-ns-500ml',
    medicineName: 'Normal Saline 0.9% IV Infusion',
    batchNumber: 'LOT-NS-4490',
    manufacturingDate: '2026-02-01',
    expiryDate: '2028-01-31',
    purchasePrice: 28.0,
    sellingPrice: 48.0,
    quantity: 350,
    availableQuantity: 350,
    reservedQuantity: 0,
    supplierId: 'sup-apollo',
    supplierName: 'Apollo Pharma Wholesale',
    purchaseInvoiceNo: 'INV-AP-2026-3310',
    receivedDate: '2026-02-10',
    status: 'available',
  },
  {
    id: 'batch-tramadol-1',
    medicineId: 'med-tramadol-50',
    medicineName: 'Tramazac 50mg Capsule',
    batchNumber: 'LOT-TZ-5501',
    manufacturingDate: '2025-08-10',
    expiryDate: '2026-11-30',
    purchasePrice: 65.0,
    sellingPrice: 98.0,
    quantity: 12,
    availableQuantity: 12,
    reservedQuantity: 0,
    supplierId: 'sup-sun',
    supplierName: 'Sun Pharma Distributors',
    purchaseInvoiceNo: 'INV-SP-2025-6612',
    receivedDate: '2025-08-20',
    status: 'low_stock',
  },
  {
    id: 'batch-atorva-exp',
    medicineId: 'med-atorva-20',
    medicineName: 'Atorva 20 (Atorvastatin 20mg)',
    batchNumber: 'LOT-AT-2209',
    manufacturingDate: '2024-10-01',
    expiryDate: '2026-09-25', // Expiring in < 30 days
    purchasePrice: 135.0,
    sellingPrice: 198.0,
    quantity: 5,
    availableQuantity: 5,
    reservedQuantity: 0,
    supplierId: 'sup-gsk',
    supplierName: 'MedPlus Wholesale Agency',
    purchaseInvoiceNo: 'INV-MP-2024-8840',
    receivedDate: '2024-10-15',
    status: 'expiring_soon',
  },
];

const SEED_SUPPLIERS: PharmacySupplierItem[] = [
  {
    id: 'sup-sun',
    supplierCode: 'SUP-SUN-01',
    supplierName: 'Sun Pharma Distributors',
    contactPerson: 'Anand Verma',
    phone: '+91 98450 11223',
    email: 'orders@sunpharmadist.com',
    address: 'Plot 44, Peenya Industrial Area 2nd Stage, Bangalore 560058',
    gstin: '29AAACS8819Q1ZN',
    drugLicenseNo: 'KA-B1-20B-18842',
    paymentTerms: 'Net 30 Days',
    status: 'active',
  },
  {
    id: 'sup-cipla',
    supplierCode: 'SUP-CIP-02',
    supplierName: 'Cipla Logistics Hub',
    contactPerson: 'Ramesh Shenoy',
    phone: '+91 98860 44556',
    email: 'blrhub@ciplalogistics.in',
    address: 'Warehouse Complex 12, Bommasandra Link Road, Bangalore 560099',
    gstin: '29AABCC4420R1ZM',
    drugLicenseNo: 'KA-B2-20B-24901',
    paymentTerms: 'Net 45 Days',
    status: 'active',
  },
  {
    id: 'sup-gsk',
    supplierCode: 'SUP-MED-03',
    supplierName: 'MedPlus Wholesale Agency',
    contactPerson: 'Karthik Rao',
    phone: '+91 97400 99881',
    email: 'wholesale@medplusindia.com',
    address: 'No. 88, Rajajinagar Industrial Town, Bangalore 560010',
    gstin: '29AAGCM1109P1ZK',
    drugLicenseNo: 'KA-B1-20B-99120',
    paymentTerms: 'Net 15 Days',
    status: 'active',
  },
  {
    id: 'sup-apollo',
    supplierCode: 'SUP-APO-04',
    supplierName: 'Apollo Pharma Wholesale',
    contactPerson: 'Deepak Nair',
    phone: '+91 99000 33221',
    email: 'supply@apollopharmawholesale.com',
    address: 'Hosur Main Road, Electronics City Phase 1, Bangalore 560100',
    gstin: '29AAACA5512K1ZL',
    drugLicenseNo: 'KA-B2-20B-33419',
    paymentTerms: 'Net 30 Days',
    status: 'active',
  },
];

const SEED_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  {
    id: 'po-2026-001',
    poNumber: 'PO-2026-00142',
    supplierId: 'sup-sun',
    supplierName: 'Sun Pharma Distributors',
    orderDate: '2026-08-25',
    expectedDeliveryDate: '2026-09-05',
    items: [
      {
        medicineId: 'med-pcm-500',
        medicineName: 'Dolo 650 (Paracetamol 650mg)',
        quantity: 500,
        unitPrice: 22.5,
        taxRate: 12,
        totalAmount: 12600,
      },
      {
        medicineId: 'med-azith-500',
        medicineName: 'Azithral 500',
        quantity: 150,
        unitPrice: 82.0,
        taxRate: 12,
        totalAmount: 13776,
      },
    ],
    totalAmount: 26376,
    status: 'ordered',
    createdBy: 'Praveen Nair (Chief Pharmacist)',
    approvedBy: 'Dr. S. K. Narayan (Medical Superintendent)',
  },
  {
    id: 'po-2026-002',
    poNumber: 'PO-2026-00143',
    supplierId: 'sup-cipla',
    supplierName: 'Cipla Logistics Hub',
    orderDate: '2026-08-28',
    expectedDeliveryDate: '2026-09-08',
    items: [
      {
        medicineId: 'med-ceftriax-1g',
        medicineName: 'Monocef 1g Injection',
        quantity: 300,
        unitPrice: 42.0,
        taxRate: 12,
        totalAmount: 14112,
      },
    ],
    totalAmount: 14112,
    status: 'approved',
    createdBy: 'Praveen Nair (Chief Pharmacist)',
    approvedBy: 'Dr. S. K. Narayan (Medical Superintendent)',
  },
];

const SEED_PRESCRIPTIONS: ComprehensivePrescription[] = [
  {
    id: 'rx-2026-001',
    prescriptionNumber: 'RX-2026-0892',
    patientId: 'ALN-2026-00001',
    patientName: 'Aarav Sharma',
    age: 34,
    gender: 'male',
    encounterType: 'opd',
    doctorId: 'doc-001',
    doctorName: 'Dr. Arvind Sharma',
    department: 'Cardiology',
    diagnosis: 'Essential Hypertension Grade 1',
    date: '2026-09-02',
    priority: 'routine',
    medicines: [
      {
        id: 'rxm-1',
        medicineId: 'med-telmi-40',
        medicineName: 'Telma 40 (Telmisartan 40mg)',
        dosage: '1 Tab',
        route: 'Oral',
        frequency: 'Once Daily (Morning after breakfast)',
        duration: '30 Days',
        prescribedQty: 2, // 2 strips = 30 tabs
        dispensedQty: 0,
        instructions: 'Monitor BP weekly; take after breakfast.',
      },
      {
        id: 'rxm-2',
        medicineId: 'med-pantop-40',
        medicineName: 'Pan 40 (Pantoprazole 40mg)',
        dosage: '1 Tab',
        route: 'Oral',
        frequency: 'Once Daily (Empty stomach)',
        duration: '15 Days',
        prescribedQty: 1,
        dispensedQty: 0,
        instructions: 'Take 30 mins before breakfast with water.',
      },
    ],
    dispensingStatus: 'pending',
    paymentStatus: 'pending',
  },
  {
    id: 'rx-2026-002',
    prescriptionNumber: 'RX-2026-0893',
    patientId: 'ALN-2026-00002',
    patientName: 'Priya Patel',
    age: 28,
    gender: 'female',
    encounterType: 'ipd',
    admissionId: 'adm-001',
    bedNumber: 'ICU-02',
    ward: 'Intensive Care Unit (ICU)',
    doctorId: 'doc-002',
    doctorName: 'Dr. Priya Nair',
    department: 'Pulmonology',
    diagnosis: 'Acute Bacterial Pneumonia',
    date: '2026-09-02',
    priority: 'stat',
    medicines: [
      {
        id: 'rxm-3',
        medicineId: 'med-ceftriax-1g',
        medicineName: 'Monocef 1g Injection',
        dosage: '1g IV',
        route: 'Intravenous',
        frequency: 'BD (Every 12 Hours)',
        duration: '5 Days',
        prescribedQty: 10,
        dispensedQty: 4,
        instructions: 'Dilute in 100ml NS; infuse over 30 mins.',
      },
      {
        id: 'rxm-4',
        medicineId: 'med-ns-500ml',
        medicineName: 'Normal Saline 0.9% IV Infusion',
        dosage: '500ml',
        route: 'Intravenous',
        frequency: 'TDS (8-Hourly)',
        duration: '2 Days',
        prescribedQty: 6,
        dispensedQty: 6,
        instructions: 'Maintain IV hydration at 75ml/hr.',
      },
    ],
    dispensingStatus: 'partially_dispensed',
    paymentStatus: 'paid',
  },
  {
    id: 'rx-2026-003',
    prescriptionNumber: 'RX-2026-0894',
    patientId: 'ALN-2026-00003',
    patientName: 'Rohan Verma',
    age: 45,
    gender: 'male',
    encounterType: 'emergency',
    doctorId: 'doc-003',
    doctorName: 'Dr. Rajesh Gupta',
    department: 'Orthopedics',
    diagnosis: 'Acute Right Ankle Fracture with Severe Pain',
    date: '2026-09-02',
    priority: 'urgent',
    medicines: [
      {
        id: 'rxm-5',
        medicineId: 'med-pcm-500',
        medicineName: 'Dolo 650 (Paracetamol 650mg)',
        dosage: '1 Tab',
        route: 'Oral',
        frequency: 'TDS (Post meals)',
        duration: '5 Days',
        prescribedQty: 1,
        dispensedQty: 1,
        instructions: 'Take with food for pain relief.',
      },
      {
        id: 'rxm-6',
        medicineId: 'med-tramadol-50',
        medicineName: 'Tramazac 50mg Capsule',
        dosage: '1 Cap',
        route: 'Oral',
        frequency: 'SOS for breakthrough severe pain',
        duration: '3 Days',
        prescribedQty: 1,
        dispensedQty: 1,
        instructions: 'Do not drive after taking; Schedule narcotic record.',
      },
    ],
    dispensingStatus: 'dispensed',
    paymentStatus: 'paid',
    dispensedAt: '2026-09-02 11:20 AM',
    dispensedBy: 'Praveen Nair (Pharmacist)',
  },
];

const SEED_SALES: PharmacySaleRecord[] = [
  {
    id: 'sale-2026-001',
    saleNumber: 'POS-2026-00441',
    patientId: 'ALN-2026-00003',
    patientName: 'Rohan Verma',
    prescriptionId: 'rx-2026-003',
    items: [
      {
        medicineId: 'med-pcm-500',
        medicineName: 'Dolo 650 (Paracetamol 650mg)',
        batchNumber: 'LOT-DL-9821',
        expiryDate: '2027-12-31',
        quantity: 1,
        unitPrice: 33.5,
        discount: 0,
        tax: 4.02,
        total: 33.5,
      },
      {
        medicineId: 'med-tramadol-50',
        medicineName: 'Tramazac 50mg Capsule',
        batchNumber: 'LOT-TZ-5501',
        expiryDate: '2026-11-30',
        quantity: 1,
        unitPrice: 98.0,
        discount: 0,
        tax: 11.76,
        total: 98.0,
      },
    ],
    subtotal: 131.5,
    discountAmount: 0,
    taxAmount: 15.78,
    grandTotal: 131.5,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    saleDate: '2026-09-02 11:22 AM',
    pharmacistName: 'Praveen Nair (Pharmacist)',
  },
];

const SEED_RETURNS: MedicineReturnRecord[] = [
  {
    id: 'ret-2026-001',
    returnNumber: 'RET-2026-00021',
    returnType: 'patient',
    patientId: 'ALN-2026-00001',
    patientName: 'Aarav Sharma',
    referenceSaleOrInvoiceId: 'POS-2026-00388',
    items: [
      {
        medicineId: 'med-pcm-500',
        medicineName: 'Dolo 650 (Paracetamol 650mg)',
        batchNumber: 'LOT-DL-9821',
        quantity: 1,
        unitPrice: 33.5,
        refundAmount: 33.5,
        returnCondition: 'sealed_good',
        returnReason: 'Medication dose adjusted by attending physician',
      },
    ],
    totalRefundAmount: 33.5,
    returnDate: '2026-09-01 04:15 PM',
    processedBy: 'Praveen Nair (Pharmacist)',
    status: 'completed',
  },
];

const SEED_STOCK_MOVEMENTS: StockMovementRecord[] = [
  {
    id: 'mov-1',
    medicineId: 'med-pcm-500',
    medicineName: 'Dolo 650',
    batchNumber: 'LOT-DL-9821',
    quantity: 200,
    previousStock: 120,
    newStock: 320,
    movementType: 'stock_in',
    referenceId: 'INV-SP-2026-4412',
    performedBy: 'Praveen Nair',
    performedAt: '2026-01-20 10:30 AM',
    remarks: 'Goods Inward Receipt from Sun Pharma',
  },
  {
    id: 'mov-2',
    medicineId: 'med-pcm-500',
    medicineName: 'Dolo 650',
    batchNumber: 'LOT-DL-9821',
    quantity: -1,
    previousStock: 321,
    newStock: 320,
    movementType: 'dispense',
    referenceId: 'RX-2026-0894',
    performedBy: 'Praveen Nair',
    performedAt: '2026-09-02 11:22 AM',
    remarks: 'Dispensed for Emergency Encounter (Rohan Verma)',
  },
];

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<PharmacyTab>('dashboard');
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const [medicines, setMedicines] = useState<ComprehensiveMedicineItem[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_medicines');
    return saved ? JSON.parse(saved) : SEED_MEDICINES;
  });

  const [batches, setBatches] = useState<MedicineBatchItem[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_batches');
    return saved ? JSON.parse(saved) : SEED_BATCHES;
  });

  const [suppliers, setSuppliers] = useState<PharmacySupplierItem[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_suppliers');
    return saved ? JSON.parse(saved) : SEED_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_purchase_orders');
    return saved ? JSON.parse(saved) : SEED_PURCHASE_ORDERS;
  });

  const [prescriptions, setPrescriptions] = useState<ComprehensivePrescription[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_prescriptions');
    return saved ? JSON.parse(saved) : SEED_PRESCRIPTIONS;
  });

  const [sales, setSales] = useState<PharmacySaleRecord[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_sales');
    return saved ? JSON.parse(saved) : SEED_SALES;
  });

  const [returns, setReturns] = useState<MedicineReturnRecord[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_returns');
    return saved ? JSON.parse(saved) : SEED_RETURNS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovementRecord[]>(() => {
    const saved = localStorage.getItem('hms_pharmacy_movements');
    return saved ? JSON.parse(saved) : SEED_STOCK_MOVEMENTS;
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('hms_pharmacy_medicines', JSON.stringify(medicines));
    window.dispatchEvent(new CustomEvent('hms_storage_updated'));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('hms_pharmacy_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('hms_pharmacy_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('hms_pharmacy_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('hms_pharmacy_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('hms_pharmacy_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('hms_pharmacy_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('hms_pharmacy_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  // Compute Master KPIs
  const kpis: PharmacyDashboardKPIs = useMemo(() => {
    const totalPrescriptionsToday = prescriptions.length;
    const pendingPrescriptions = prescriptions.filter(p => p.dispensingStatus === 'pending').length;
    const dispensedPrescriptions = prescriptions.filter(p => p.dispensingStatus === 'dispensed').length;
    const pendingDispensing = prescriptions.filter(p => p.dispensingStatus === 'partially_dispensed' || p.dispensingStatus === 'pending').length;

    const totalMedicines = medicines.length;
    const lowStockMedicines = medicines.filter(m => m.totalStock <= m.reorderLevel && m.totalStock > 0).length;
    const outOfStockMedicines = medicines.filter(m => m.totalStock === 0).length;

    const now = new Date();
    const ninetyDays = new Date();
    ninetyDays.setDate(now.getDate() + 90);

    const nearExpiryMedicines = batches.filter(b => {
      const exp = new Date(b.expiryDate);
      return exp > now && exp <= ninetyDays && b.availableQuantity > 0;
    }).length;

    const expiredMedicines = batches.filter(b => {
      const exp = new Date(b.expiryDate);
      return exp <= now && b.availableQuantity > 0;
    }).length;

    const todaySalesAmount = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const pendingPurchaseOrders = purchaseOrders.filter(po => po.status === 'ordered' || po.status === 'approved' || po.status === 'pending_approval').length;
    const totalReturnsCount = returns.length;

    return {
      totalPrescriptionsToday,
      pendingPrescriptions,
      dispensedPrescriptions,
      pendingDispensing,
      totalMedicines,
      lowStockMedicines,
      outOfStockMedicines,
      nearExpiryMedicines,
      expiredMedicines,
      todaySalesAmount,
      pendingPurchaseOrders,
      totalReturnsCount,
    };
  }, [prescriptions, medicines, batches, sales, purchaseOrders, returns]);

  // Actions
  const addMedicineMaster = (med: Omit<ComprehensiveMedicineItem, 'id' | 'totalStock'>) => {
    const newMed: ComprehensiveMedicineItem = {
      ...med,
      id: `med-${Date.now()}`,
      totalStock: 0,
    };
    setMedicines(prev => [newMed, ...prev]);
  };

  const updateMedicineMaster = (id: string, med: Partial<ComprehensiveMedicineItem>) => {
    setMedicines(prev => prev.map(m => (m.id === id ? { ...m, ...med } : m)));
  };

  const toggleMedicineStatus = (id: string) => {
    setMedicines(prev => prev.map(m => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  };

  const stockIn = (
    batchData: Omit<MedicineBatchItem, 'id' | 'status' | 'reservedQuantity'>,
    performedBy: string
  ) => {
    const newBatchId = `batch-${Date.now()}`;
    const newBatch: MedicineBatchItem = {
      ...batchData,
      id: newBatchId,
      reservedQuantity: 0,
      status: 'available',
    };

    setBatches(prev => [newBatch, ...prev]);

    // Update Medicine Stock
    setMedicines(prev =>
      prev.map(m => {
        if (m.id === batchData.medicineId) {
          const updatedStock = m.totalStock + batchData.availableQuantity;
          // Record Stock Movement
          const newMovement: StockMovementRecord = {
            id: `mov-${Date.now()}`,
            medicineId: m.id,
            medicineName: m.brandName,
            batchNumber: batchData.batchNumber,
            quantity: batchData.availableQuantity,
            previousStock: m.totalStock,
            newStock: updatedStock,
            movementType: 'stock_in',
            referenceId: batchData.purchaseInvoiceNo || 'DIRECT_GRN',
            performedBy,
            performedAt: new Date().toLocaleString(),
            remarks: `Inward Stock GRN from ${batchData.supplierName}`,
          };
          setStockMovements(mPrev => [newMovement, ...mPrev]);
          return { ...m, totalStock: updatedStock };
        }
        return m;
      })
    );
  };

  const createPurchaseOrder = (po: Omit<PurchaseOrderItem, 'id' | 'poNumber' | 'status'>) => {
    const seq = Math.floor(100 + Math.random() * 900);
    const newPO: PurchaseOrderItem = {
      ...po,
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-00${seq}`,
      status: 'ordered',
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  const updatePOStatus = (poId: string, status: PurchaseOrderStatus, approvedBy?: string) => {
    setPurchaseOrders(prev =>
      prev.map(po => (po.id === poId ? { ...po, status, approvedBy: approvedBy || po.approvedBy } : po))
    );
  };

  const addSupplier = (supplier: Omit<PharmacySupplierItem, 'id' | 'status'>) => {
    const newSupplier: PharmacySupplierItem = {
      ...supplier,
      id: `sup-${Date.now()}`,
      status: 'active',
    };
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  const updateSupplier = (id: string, supplier: Partial<PharmacySupplierItem>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...supplier } : s)));
  };

  const dispensePrescription = (
    prescriptionId: string,
    dispensedItems: { medicineId: string; batchNumber: string; dispensedQty: number }[],
    pharmacistName: string
  ) => {
    setPrescriptions(prev =>
      prev.map(rx => {
        if (rx.id === prescriptionId) {
          const updatedMeds = rx.medicines.map(m => {
            const item = dispensedItems.find(d => d.medicineId === m.medicineId);
            if (item) {
              const newDispensed = m.dispensedQty + item.dispensedQty;
              return { ...m, dispensedQty: newDispensed };
            }
            return m;
          });

          const isAllDispensed = updatedMeds.every(m => m.dispensedQty >= m.prescribedQty);
          const isAnyDispensed = updatedMeds.some(m => m.dispensedQty > 0);

          return {
            ...rx,
            medicines: updatedMeds,
            dispensingStatus: isAllDispensed ? 'dispensed' : isAnyDispensed ? 'partially_dispensed' : 'pending',
            dispensedAt: new Date().toLocaleString(),
            dispensedBy: pharmacistName,
            paymentStatus: 'paid',
          };
        }
        return rx;
      })
    );

    // Deduct stock per batch and medicine
    dispensedItems.forEach(item => {
      setBatches(prev =>
        prev.map(b => {
          if (b.batchNumber === item.batchNumber && b.medicineId === item.medicineId) {
            const remaining = Math.max(0, b.availableQuantity - item.dispensedQty);
            return {
              ...b,
              availableQuantity: remaining,
              status: remaining === 0 ? 'low_stock' : b.status,
            };
          }
          return b;
        })
      );

      setMedicines(prev =>
        prev.map(m => {
          if (m.id === item.medicineId) {
            const newStock = Math.max(0, m.totalStock - item.dispensedQty);
            // Record Stock Movement
            const movement: StockMovementRecord = {
              id: `mov-${Date.now()}-${Math.random()}`,
              medicineId: m.id,
              medicineName: m.brandName,
              batchNumber: item.batchNumber,
              quantity: -item.dispensedQty,
              previousStock: m.totalStock,
              newStock,
              movementType: 'dispense',
              referenceId: prescriptionId,
              performedBy: pharmacistName,
              performedAt: new Date().toLocaleString(),
              remarks: `Dispensed for Prescription ${prescriptionId}`,
            };
            setStockMovements(mPrev => [movement, ...mPrev]);
            return { ...m, totalStock: newStock };
          }
          return m;
        })
      );
    });
  };

  const processPOSSale = (
    sale: Omit<PharmacySaleRecord, 'id' | 'saleNumber' | 'saleDate'>
  ): PharmacySaleRecord => {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const newSale: PharmacySaleRecord = {
      ...sale,
      id: `sale-${Date.now()}`,
      saleNumber: `POS-2026-00${seq}`,
      saleDate: new Date().toLocaleString(),
    };

    setSales(prev => [newSale, ...prev]);

    // Deduct Batch & Stock
    sale.items.forEach(item => {
      setBatches(prev =>
        prev.map(b => {
          if (b.batchNumber === item.batchNumber && b.medicineId === item.medicineId) {
            const remaining = Math.max(0, b.availableQuantity - item.quantity);
            return { ...b, availableQuantity: remaining };
          }
          return b;
        })
      );

      setMedicines(prev =>
        prev.map(m => {
          if (m.id === item.medicineId) {
            const newStock = Math.max(0, m.totalStock - item.quantity);
            const movement: StockMovementRecord = {
              id: `mov-${Date.now()}-${Math.random()}`,
              medicineId: m.id,
              medicineName: m.brandName,
              batchNumber: item.batchNumber,
              quantity: -item.quantity,
              previousStock: m.totalStock,
              newStock,
              movementType: 'sale',
              referenceId: newSale.saleNumber,
              performedBy: sale.pharmacistName,
              performedAt: new Date().toLocaleString(),
              remarks: `Pharmacy Counter Sale (${newSale.saleNumber})`,
            };
            setStockMovements(mPrev => [movement, ...mPrev]);
            return { ...m, totalStock: newStock };
          }
          return m;
        })
      );
    });

    return newSale;
  };

  const processMedicineReturn = (
    returnData: Omit<MedicineReturnRecord, 'id' | 'returnNumber' | 'returnDate' | 'status'>
  ) => {
    const seq = Math.floor(10 + Math.random() * 90);
    const newReturn: MedicineReturnRecord = {
      ...returnData,
      id: `ret-${Date.now()}`,
      returnNumber: `RET-2026-000${seq}`,
      returnDate: new Date().toLocaleString(),
      status: 'completed',
    };

    setReturns(prev => [newReturn, ...prev]);

    // If sealed good return, restore stock
    returnData.items.forEach(item => {
      if (item.returnCondition === 'sealed_good') {
        setBatches(prev =>
          prev.map(b => {
            if (b.batchNumber === item.batchNumber && b.medicineId === item.medicineId) {
              return { ...b, availableQuantity: b.availableQuantity + item.quantity };
            }
            return b;
          })
        );

        setMedicines(prev =>
          prev.map(m => {
            if (m.id === item.medicineId) {
              const newStock = m.totalStock + item.quantity;
              const movement: StockMovementRecord = {
                id: `mov-${Date.now()}-${Math.random()}`,
                medicineId: m.id,
                medicineName: m.brandName,
                batchNumber: item.batchNumber,
                quantity: item.quantity,
                previousStock: m.totalStock,
                newStock,
                movementType: returnData.returnType === 'patient' ? 'patient_return' : 'supplier_return',
                referenceId: newReturn.returnNumber,
                performedBy: returnData.processedBy,
                performedAt: new Date().toLocaleString(),
                remarks: `Stock reinstated from ${returnData.returnType} return: ${item.returnReason}`,
              };
              setStockMovements(mPrev => [movement, ...mPrev]);
              return { ...m, totalStock: newStock };
            }
            return m;
          })
        );
      }
    });
  };

  const recordStockAdjustment = (
    medicineId: string,
    batchNumber: string,
    physicalQty: number,
    reason: string,
    approvedBy: string
  ) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.batchNumber === batchNumber && b.medicineId === medicineId) {
          return { ...b, availableQuantity: physicalQty };
        }
        return b;
      })
    );

    setMedicines(prev =>
      prev.map(m => {
        if (m.id === medicineId) {
          const diff = physicalQty - m.totalStock;
          const movement: StockMovementRecord = {
            id: `mov-${Date.now()}`,
            medicineId: m.id,
            medicineName: m.brandName,
            batchNumber,
            quantity: diff,
            previousStock: m.totalStock,
            newStock: physicalQty,
            movementType: 'adjustment',
            performedBy: approvedBy,
            performedAt: new Date().toLocaleString(),
            remarks: `Physical stock count adjustment: ${reason}`,
          };
          setStockMovements(mPrev => [movement, ...mPrev]);
          return { ...m, totalStock: physicalQty };
        }
        return m;
      })
    );
  };

  const recordStockTransfer = (
    sourceLoc: string,
    destLoc: string,
    medicineId: string,
    batchNumber: string,
    qty: number,
    transferredBy: string
  ) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    const movement: StockMovementRecord = {
      id: `mov-${Date.now()}`,
      medicineId,
      medicineName: med.brandName,
      batchNumber,
      quantity: 0,
      previousStock: med.totalStock,
      newStock: med.totalStock,
      movementType: 'transfer',
      performedBy: transferredBy,
      performedAt: new Date().toLocaleString(),
      remarks: `Inter-store transfer of ${qty} ${med.unit} from ${sourceLoc} to ${destLoc}`,
    };
    setStockMovements(mPrev => [movement, ...mPrev]);
  };

  const recallBatch = (batchId: string, recallReason: string, recalledBy: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id === batchId) {
          return { ...b, status: 'recalled' };
        }
        return b;
      })
    );

    const b = batches.find(item => item.id === batchId);
    if (b) {
      const movement: StockMovementRecord = {
        id: `mov-${Date.now()}`,
        medicineId: b.medicineId,
        medicineName: b.medicineName,
        batchNumber: b.batchNumber,
        quantity: -b.availableQuantity,
        previousStock: b.availableQuantity,
        newStock: 0,
        movementType: 'recall',
        performedBy: recalledBy,
        performedAt: new Date().toLocaleString(),
        remarks: `EMERGENCY BATCH RECALL: ${recallReason}`,
      };
      setStockMovements(mPrev => [movement, ...mPrev]);
    }
  };

  const disposeExpiredStock = (batchId: string, disposedBy: string, remarks?: string) => {
    const b = batches.find(item => item.id === batchId);
    if (!b) return;

    setBatches(prev =>
      prev.map(item => {
        if (item.id === batchId) {
          return { ...item, availableQuantity: 0, status: 'expired' };
        }
        return item;
      })
    );

    setMedicines(prev =>
      prev.map(m => {
        if (m.id === b.medicineId) {
          const newStock = Math.max(0, m.totalStock - b.availableQuantity);
          const movement: StockMovementRecord = {
            id: `mov-${Date.now()}`,
            medicineId: m.id,
            medicineName: m.brandName,
            batchNumber: b.batchNumber,
            quantity: -b.availableQuantity,
            previousStock: m.totalStock,
            newStock,
            movementType: 'disposal',
            performedBy: disposedBy,
            performedAt: new Date().toLocaleString(),
            remarks: remarks || `Quarantine & Bio-medical disposal of expired batch (${b.batchNumber})`,
          };
          setStockMovements(mPrev => [movement, ...mPrev]);
          return { ...m, totalStock: newStock };
        }
        return m;
      })
    );
  };

  return (
    <PharmacyContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedMedicineId,
        setSelectedMedicineId,
        selectedPrescriptionId,
        setSelectedPrescriptionId,
        medicines,
        batches,
        stockMovements,
        suppliers,
        purchaseOrders,
        prescriptions,
        sales,
        returns,
        kpis,
        addMedicineMaster,
        updateMedicineMaster,
        toggleMedicineStatus,
        stockIn,
        createPurchaseOrder,
        updatePOStatus,
        addSupplier,
        updateSupplier,
        dispensePrescription,
        processPOSSale,
        processMedicineReturn,
        recordStockAdjustment,
        recordStockTransfer,
        recallBatch,
        disposeExpiredStock,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
