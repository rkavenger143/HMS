// ============================================================
// ALN Cure HMS — Insurance Management Module TypeScript Definitions
// ============================================================

export type InsuranceProviderType = 'private' | 'government' | 'corporate' | 'tpa';
export type ProviderStatus = 'active' | 'inactive';

export interface InsuranceProvider {
  id: string; // e.g. PROV-001
  companyName: string;
  providerType: InsuranceProviderType;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  status: ProviderStatus;
  tollFree?: string;
  claimEmail?: string;
  portalUrl?: string;
  code: string;
  discountPercent?: number;
  empanelledDate: string;
  tpaId?: string; // If private provider uses a specific TPA
  tpaName?: string;
}

export type InsurancePlanType =
  | 'individual'
  | 'family'
  | 'corporate'
  | 'government'
  | 'employee'
  | 'other';

export type PlanStatus = 'active' | 'inactive';

export interface InsurancePlan {
  id: string; // PLAN-001
  providerId: string;
  providerName: string;
  planName: string;
  planCode: string;
  insuranceType: InsurancePlanType;
  coverageDetails: string;
  maxCoverageAmount: number;
  coPaymentPercentage: number;
  deductibleAmount: number;
  validityPeriodMonths: number;
  eligibleServices: string[];
  excludedServices: string[];
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export type PolicyStatus = 'active' | 'expired' | 'suspended' | 'pending_verification' | 'cancelled';

export interface PatientInsurancePolicy {
  id: string; // POL-001
  patientId: string; // ALN-2026-00001
  patientName: string;
  uhid: string;
  providerId: string;
  providerName: string;
  planId?: string;
  tpaId?: string;
  tpaName?: string;
  policyNumber: string;
  memberId: string;
  policyHolderName: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
  planName: string;
  policyType: 'individual' | 'family_floater' | 'group_corporate' | 'government_scheme';

  startDate: string;
  endDate: string;
  sumInsured: number;
  remainingCoverage: number;
  coPayPercentage: number; // e.g. 10%
  deductible: number; // e.g. 2500
  roomRentLimitPerDay?: number; // e.g. 5000 or 1% of sum insured
  icuLimitPerDay?: number;
  status: PolicyStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
  documents?: {
    insuranceCard?: string;
    policyDoc?: string;
    idProof?: string;
  };
}

export type ServiceCategory =
  | 'opd_consultation'
  | 'ipd_admission'
  | 'room_charges'
  | 'doctor_charges'
  | 'surgery'
  | 'laboratory'
  | 'radiology'
  | 'pharmacy'
  | 'emergency'
  | 'icu_charges'
  | 'implants_prosthetics';

export interface PlanCoverageRule {
  category: ServiceCategory;
  categoryLabel: string;
  isCovered: boolean;
  coverageLimit?: number; // max covered amount per incident or policy
  coPayPercentage: number;
  deductible: number;
  requiresPreAuth: boolean;
  waitingPeriodDays?: number;
  remarks?: string;
}

export type EligibilityStatus = 'verified' | 'pending' | 'not_eligible' | 'expired' | 'verification_failed';

export interface EligibilityVerificationRecord {
  id: string;
  verificationNumber: string;
  patientId: string;
  patientName: string;
  policyId: string;
  policyNumber: string;
  providerName: string;
  verificationDate: string;
  verifiedBy: string;
  status: EligibilityStatus;
  policyValid: boolean;
  sumInsuredAvailable: number;
  coverageDetails: {
    service: string;
    covered: boolean;
    limit: number;
    copay: number;
  }[];
  notes: string;
  createdAt: string;
}

export type PreAuthStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'expired';

export interface PreAuthRequest {
  id: string;
  requestNumber: string; // e.g. PA-2026-00101
  patientId: string;
  patientName: string;
  uhid: string;
  policyId: string;
  policyNumber: string;
  providerId: string;
  providerName: string;
  tpaName?: string;
  memberId: string;
  admissionId?: string;
  doctorName: string;
  doctorId: string;
  department: string;
  diagnosis: string;
  icdCode?: string;
  proposedTreatment: string;
  treatmentType: 'medical_management' | 'surgical' | 'day_care' | 'icu_care' | 'emergency';
  estimatedCost: number;
  requestedAmount: number;
  approvedAmount: number;
  coPayAmount: number;
  patientPayableAmount: number;
  status: PreAuthStatus;
  submissionDate: string;
  approvalDate?: string;
  approvalNumber?: string;
  validUntil?: string;
  approvedServices: string[];
  rejectedServices: string[];
  reviewerNotes?: string;
  denialReason?: string;
  supportingDocs: string[];
  claimType: 'cashless' | 'reimbursement';
  createdAt: string;
  updatedAt: string;
}

export type ClaimType = 'cashless' | 'reimbursement';
export type ClaimStatus =
  | 'draft'
  | 'pending_documents'
  | 'ready_for_submission'
  | 'submitted'
  | 'under_review'
  | 'additional_info_required'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'settled'
  | 'closed';

export interface ClaimDocument {
  id: string;
  documentName: string;
  documentType:
    | 'policy_copy'
    | 'patient_id'
    | 'doctor_prescription'
    | 'consultation_notes'
    | 'diagnosis_docs'
    | 'admission_docs'
    | 'discharge_summary'
    | 'final_hospital_bill'
    | 'itemized_bill'
    | 'lab_report'
    | 'radiology_report'
    | 'pharmacy_bills'
    | 'procedure_docs'
    | 'pre_auth_letter'
    | 'payment_receipt'
    | 'insurance_card'
    | 'id_proof'
    | 'medical_reports'
    | 'treatment_details'
    | 'other';
  fileSize?: string;
  fileType?: string; // MIME type e.g. application/pdf, image/png, image/jpeg
  fileData?: string; // Base64 data URL for real storage, preview & download
  uploadDate: string;
  uploadedBy: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  rejectionNote?: string;
  remarks?: string;
}

export interface InsuranceAuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  module: 'provider' | 'plan' | 'policy' | 'verification' | 'pre_auth' | 'claim' | 'document' | 'settlement';
  referenceId: string; // e.g. POL-001, CLM-2026-8801
  date: string;
  time: string;
  previousStatus?: string;
  newStatus?: string;
  remarks?: string;
  timestamp: string;
}

export interface ClaimAuditLog {
  id: string;
  action: string;
  statusFrom?: string;
  statusTo?: string;
  performedBy: string;
  role: string;
  timestamp: string;
  notes?: string;
}

export interface InsuranceClaimRecord {
  id: string;
  claimNumber?: string; // e.g. CLM-2026-8801
  claimType?: ClaimType;
  patientId: string;
  patientName?: string;
  uhid?: string;
  policyId?: string;
  policyNumber: string;
  providerId?: string;
  providerName?: string;
  tpaName?: string;
  memberId?: string;
  preAuthId?: string;
  preAuthNumber?: string;
  admissionId?: string;
  consultationId?: string;
  billId?: string;
  billNumber?: string;
  admissionDate?: string;
  dischargeDate?: string;
  diagnosis?: string;
  treatmentDetails?: string;
  totalHospitalBill?: number;
  claimAmount?: number;
  claimedAmount: number;
  approvedAmount: number;
  coPayAmount?: number;
  deductibleAmount?: number;
  patientPayableAmount?: number;
  pendingInsuranceAmount?: number;
  settledAmount?: number;
  disallowedAmount?: number;
  disallowanceReason?: string;
  status?: ClaimStatus;
  claimDate?: string;
  submissionDate?: string;
  approvalDate?: string;
  settledDate?: string;
  rejectionDate?: string;
  rejectionReason?: string;
  resubmissionCount?: number;
  resubmissionDate?: string;
  documents?: ClaimDocument[];
  timeline?: ClaimAuditLog[];
  reviewerNotes?: string;
  createdAt?: string;
  updatedAt?: string;

  // Legacy module compatibility aliases
  insuranceProvider?: string;
  authorizationNumber?: string;
  preAuthAmount?: number;
  copayAmount?: number;
  approvalStatus?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'settled';
  claimStatus?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'settled' | 'denied';
  denialReason?: string;
}

export type SettlementStatus = 'pending' | 'partially_settled' | 'settled';

export interface SettlementRecord {
  id: string;
  settlementNumber: string; // e.g. SET-2026-4401
  claimId: string;
  claimNumber: string;
  patientId: string;
  patientName: string;
  providerName: string;
  tpaName?: string;
  totalClaimAmount: number;
  approvedAmount: number;
  receivedAmount?: number;
  settledAmount: number;
  disallowedAmount: number;
  tdsDeducted: number;
  netDisbursedAmount: number;
  settlementDate: string;
  paymentReference: string; // UTR Number / Cheque No
  paymentMode: 'neft' | 'rtgs' | 'cheque' | 'online_portal';
  status: SettlementStatus;
  outstandingAmount?: number;
  outstandingBalance: number;
  reconciledBy: string;
  notes?: string;
  createdAt: string;
}

export interface InsuranceDashboardStats {
  totalInsuredPatients: number;
  activePolicies: number;
  pendingVerifications: number;
  pendingPreAuths: number;
  approvedPreAuths: number;
  pendingClaims: number;
  submittedClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  partiallyApprovedClaims: number;
  settledClaims: number;
  totalClaimAmount: number;
  totalApprovedAmount: number;
  totalPendingAmount: number;
  totalSettledAmount: number;
  pendingSettlementAmount: number;
  approvalRate: number; // percentage
  averageProcessingDays: number;
}
