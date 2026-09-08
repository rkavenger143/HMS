// ============================================================
// ALN Cure HMS — Insurance Management Module Context & State Engine
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  InsuranceProvider,
  InsurancePlan,
  InsuranceAuditLog,
  ProviderStatus,
  PlanStatus,
  PatientInsurancePolicy,
  EligibilityVerificationRecord,
  PreAuthRequest,
  InsuranceClaimRecord,
  SettlementRecord,
  InsuranceDashboardStats,
  ClaimDocument,
  PreAuthStatus,
  ClaimStatus,
  SettlementStatus,
  PlanCoverageRule
} from '../../../types/insurance';
import { storageService } from '../../../services/storageService';
import { DEFAULT_PLAN_COVERAGE_RULES } from '../../../data/insuranceSeedData';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export type InsuranceTab =
  | 'dashboard'
  | 'providers'
  | 'plans'
  | 'patient-insurance'
  | 'patient-registration'
  | 'patient-policies'
  | 'policy-verification'
  | 'coverage-eligibility'
  | 'pre-auth'
  | 'claims'
  | 'claim-documents'
  | 'processing-settlement'
  | 'tracking'
  | 'settlements'
  | 'reports-history'
  | 'reports'
  | 'history'
  | 'eligibility';

interface InsuranceContextType {
  activeTab: InsuranceTab;
  setActiveTab: (tab: InsuranceTab) => void;

  // Data Collections
  providers: InsuranceProvider[];
  plans: InsurancePlan[];
  auditLogs: InsuranceAuditLog[];
  policies: PatientInsurancePolicy[];
  eligibilityRecords: EligibilityVerificationRecord[];
  preAuthRequests: PreAuthRequest[];
  claims: InsuranceClaimRecord[];
  settlements: SettlementRecord[];
  coverageRules: PlanCoverageRule[];
  stats: InsuranceDashboardStats;

  // Provider CRUD
  addProvider: (provider: Omit<InsuranceProvider, 'id'>) => InsuranceProvider;
  updateProvider: (id: string, updates: Partial<InsuranceProvider>) => void;
  toggleProviderStatus: (id: string) => void;

  // Insurance Plans CRUD
  addPlan: (plan: Omit<InsurancePlan, 'id' | 'createdAt' | 'updatedAt'>) => InsurancePlan;
  updatePlan: (id: string, updates: Partial<InsurancePlan>) => void;
  togglePlanStatus: (id: string) => void;

  // Audit Logs
  logAuditAction: (
    action: string,
    module: InsuranceAuditLog['module'],
    referenceId: string,
    previousStatus?: string,
    newStatus?: string,
    remarks?: string
  ) => void;

  // Patient Insurance Policies
  registerPolicy: (policy: Omit<PatientInsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>) => PatientInsurancePolicy;
  updatePolicy: (id: string, updates: Partial<PatientInsurancePolicy>) => void;
  verifyPolicy: (id: string, verifiedBy: string, notes?: string) => void;
  expirePolicy: (id: string) => void;

  // Eligibility Verification
  runEligibilityCheck: (
    patientId: string,
    policyId: string,
    serviceCategory?: string
  ) => EligibilityVerificationRecord;

  // Pre-Authorization
  createPreAuth: (request: Omit<PreAuthRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'>) => PreAuthRequest;
  updatePreAuth: (id: string, updates: Partial<PreAuthRequest>) => void;
  adjudicatePreAuth: (
    id: string,
    status: PreAuthStatus,
    approvedAmount: number,
    reviewerNotes: string,
    approvalNumber?: string,
    approvedServices?: string[],
    rejectedServices?: string[]
  ) => void;

  // Claims Management
  createClaim: (claim: Omit<InsuranceClaimRecord, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt' | 'timeline' | 'resubmissionCount'>) => InsuranceClaimRecord;
  updateClaim: (id: string, updates: Partial<InsuranceClaimRecord>) => void;
  submitClaim: (id: string) => void;
  uploadClaimDocument: (claimId: string, doc: Omit<ClaimDocument, 'id' | 'uploadDate'>) => void;
  replaceClaimDocument: (claimId: string, docId: string, updates: Partial<ClaimDocument>) => void;
  deleteClaimDocument: (claimId: string, docId: string) => void;
  verifyClaimDocument: (claimId: string, docId: string, status: 'verified' | 'rejected', note?: string) => void;
  rejectClaim: (claimId: string, rejectionReason: string, rejectedAmount: number, notes?: string) => void;
  resubmitClaim: (claimId: string, correctionNotes: string, updatedAmount?: number) => void;

  // Settlements
  recordSettlement: (settlement: Omit<SettlementRecord, 'id' | 'settlementNumber' | 'createdAt'>) => SettlementRecord;

  // Calculation Utilities
  calculateCopaySplit: (totalBill: number, policy: PatientInsurancePolicy) => {
    coveredAmount: number;
    copayAmount: number;
    deductibleAmount: number;
    patientPayable: number;
    insurancePayable: number;
  };

  // Selected item inspection
  selectedClaimId: string | null;
  setSelectedClaimId: (id: string | null) => void;
  selectedPreAuthId: string | null;
  setSelectedPreAuthId: (id: string | null) => void;
  refreshAll: () => void;
}

const InsuranceContext = createContext<InsuranceContextType | undefined>(undefined);

export function InsuranceProviderComponent({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<InsuranceTab>('dashboard');
  const [providers, setProviders] = useState<InsuranceProvider[]>(() => storageService.getInsuranceProviders());
  const [plans, setPlans] = useState<InsurancePlan[]>(() => storageService.getInsurancePlans());
  const [auditLogs, setAuditLogs] = useState<InsuranceAuditLog[]>(() => storageService.getInsuranceAuditLogs());
  const [policies, setPolicies] = useState<PatientInsurancePolicy[]>(() => storageService.getPatientPolicies());
  const [eligibilityRecords, setEligibilityRecords] = useState<EligibilityVerificationRecord[]>(() => storageService.getEligibilityRecords());
  const [preAuthRequests, setPreAuthRequests] = useState<PreAuthRequest[]>(() => storageService.getPreAuthRequests());
  const [claims, setClaims] = useState<InsuranceClaimRecord[]>(() => storageService.getInsuranceClaims());
  const [settlements, setSettlements] = useState<SettlementRecord[]>(() => storageService.getSettlementRecords());
  const [coverageRules] = useState<PlanCoverageRule[]>(DEFAULT_PLAN_COVERAGE_RULES);
  const [stats, setStats] = useState<InsuranceDashboardStats>(() => storageService.getInsuranceMetrics());

  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedPreAuthId, setSelectedPreAuthId] = useState<string | null>(null);

  const refreshAll = useCallback(() => {
    setProviders(storageService.getInsuranceProviders());
    setPlans(storageService.getInsurancePlans());
    setAuditLogs(storageService.getInsuranceAuditLogs());
    setPolicies(storageService.getPatientPolicies());
    setEligibilityRecords(storageService.getEligibilityRecords());
    setPreAuthRequests(storageService.getPreAuthRequests());
    setClaims(storageService.getInsuranceClaims());
    setSettlements(storageService.getSettlementRecords());
    setStats(storageService.getInsuranceMetrics());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => refreshAll();
    window.addEventListener('hms_storage_updated', handleStorageChange);
    return () => window.removeEventListener('hms_storage_updated', handleStorageChange);
  }, [refreshAll]);

  // ---- AUDIT LOGGING HELPER ----
  const logAuditAction = useCallback((
    action: string,
    module: InsuranceAuditLog['module'],
    referenceId: string,
    previousStatus?: string,
    newStatus?: string,
    remarks?: string
  ) => {
    const current = storageService.getInsuranceAuditLogs();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: InsuranceAuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      userName: authState.user?.name || 'Authorized Staff',
      userRole: authState.user?.role || 'Staff',
      action,
      module,
      referenceId,
      date: dateStr,
      time: timeStr,
      previousStatus,
      newStatus,
      remarks,
      timestamp: now.toISOString()
    };
    const updated = [newLog, ...current];
    storageService.saveInsuranceAuditLogs(updated);
    setAuditLogs(updated);
  }, [authState.user?.name, authState.user?.role]);

  // ---- PROVIDER METHODS ----
  const addProvider = useCallback((data: Omit<InsuranceProvider, 'id'>) => {
    const current = storageService.getInsuranceProviders();
    const newId = `PROV-${String(current.length + 1).padStart(3, '0')}`;
    const newProv: InsuranceProvider = { ...data, id: newId };
    const updated = [newProv, ...current];
    storageService.saveInsuranceProviders(updated);
    setProviders(updated);
    setStats(storageService.getInsuranceMetrics());
    logAuditAction('New Provider Empanelled', 'provider', newProv.id, undefined, newProv.status, `Empanelled ${newProv.companyName} (${newProv.code})`);
    storageService.logActivity({
      type: 'insurance',
      title: 'New Insurance Provider Empanelled',
      description: `${newProv.companyName} (${newProv.providerType}) empanelled with code ${newProv.code}`,
      department: 'Insurance Desk',
      priority: 'normal'
    });
    toast.success(`Insurance Provider "${newProv.companyName}" registered successfully.`);
    return newProv;
  }, [logAuditAction, toast]);

  const updateProvider = useCallback((id: string, updates: Partial<InsuranceProvider>) => {
    const current = storageService.getInsuranceProviders();
    const target = current.find(p => p.id === id);
    const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
    storageService.saveInsuranceProviders(updated);
    setProviders(updated);
    logAuditAction('Provider Updated', 'provider', id, target?.status, updates.status || target?.status, `Updated provider details for ${target?.companyName}`);
    toast.success('Provider details updated successfully.');
  }, [logAuditAction, toast]);

  const toggleProviderStatus = useCallback((id: string) => {
    const current = storageService.getInsuranceProviders();
    const target = current.find(p => p.id === id);
    if (!target) return;
    const newStatus: ProviderStatus = target.status === 'active' ? 'inactive' : 'active';
    const updated = current.map(p => p.id === id ? { ...p, status: newStatus } : p);
    storageService.saveInsuranceProviders(updated);
    setProviders(updated);
    logAuditAction('Provider Status Toggled', 'provider', id, target.status, newStatus, `Provider status changed to ${newStatus}`);
    toast.info(`Provider status changed to ${newStatus}.`);
  }, [logAuditAction, toast]);

  // ---- INSURANCE PLAN METHODS ----
  const addPlan = useCallback((data: Omit<InsurancePlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const current = storageService.getInsurancePlans();
    const newId = `PLAN-${String(current.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newPlan: InsurancePlan = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    const updated = [newPlan, ...current];
    storageService.saveInsurancePlans(updated);
    setPlans(updated);
    logAuditAction('New Plan Registered', 'plan', newPlan.id, undefined, newPlan.status, `Plan ${newPlan.planName} created for ${newPlan.providerName}`);
    toast.success(`Insurance Plan "${newPlan.planName}" added successfully.`);
    return newPlan;
  }, [logAuditAction, toast]);

  const updatePlan = useCallback((id: string, updates: Partial<InsurancePlan>) => {
    const current = storageService.getInsurancePlans();
    const now = new Date().toISOString();
    const target = current.find(p => p.id === id);
    const updated = current.map(p => p.id === id ? { ...p, ...updates, updatedAt: now } : p);
    storageService.saveInsurancePlans(updated);
    setPlans(updated);
    logAuditAction('Plan Updated', 'plan', id, target?.status, updates.status || target?.status, `Updated parameters for plan ${target?.planName}`);
    toast.success('Insurance Plan updated successfully.');
  }, [logAuditAction, toast]);

  const togglePlanStatus = useCallback((id: string) => {
    const current = storageService.getInsurancePlans();
    const target = current.find(p => p.id === id);
    if (!target) return;
    const newStatus: PlanStatus = target.status === 'active' ? 'inactive' : 'active';
    const now = new Date().toISOString();
    const updated = current.map(p => p.id === id ? { ...p, status: newStatus, updatedAt: now } : p);
    storageService.saveInsurancePlans(updated);
    setPlans(updated);
    logAuditAction('Plan Status Toggled', 'plan', id, target.status, newStatus, `Plan status toggled to ${newStatus}`);
    toast.info(`Plan "${target.planName}" status changed to ${newStatus}.`);
  }, [logAuditAction, toast]);

  // ---- PATIENT POLICIES METHODS ----
  const registerPolicy = useCallback((data: Omit<PatientInsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    const current = storageService.getPatientPolicies();
    const newId = `POL-${String(current.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newPolicy: PatientInsurancePolicy = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    const updated = [newPolicy, ...current];
    storageService.savePatientPolicies(updated);
    setPolicies(updated);
    setStats(storageService.getInsuranceMetrics());
    storageService.logActivity({
      type: 'insurance',
      title: 'New Patient Policy Registered',
      description: `${newPolicy.patientName} insured with ${newPolicy.providerName} (Policy: ${newPolicy.policyNumber})`,
      patientId: newPolicy.patientId,
      patientName: newPolicy.patientName,
      department: 'Insurance Desk',
      priority: 'normal'
    });
    toast.success(`Policy #${newPolicy.policyNumber} linked to ${newPolicy.patientName}.`);
    return newPolicy;
  }, [toast]);

  const updatePolicy = useCallback((id: string, updates: Partial<PatientInsurancePolicy>) => {
    const current = storageService.getPatientPolicies();
    const now = new Date().toISOString();
    const updated = current.map(p => p.id === id ? { ...p, ...updates, updatedAt: now } : p);
    storageService.savePatientPolicies(updated);
    setPolicies(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.success('Patient insurance policy updated.');
  }, [toast]);

  const verifyPolicy = useCallback((id: string, verifiedBy: string, notes?: string) => {
    const current = storageService.getPatientPolicies();
    const now = new Date().toISOString();
    const updated = current.map(p => p.id === id ? {
      ...p,
      status: 'active' as const,
      verifiedAt: now,
      verifiedBy,
      verificationNotes: notes || p.verificationNotes || 'Verified policy details and coverage eligibility.',
      updatedAt: now
    } : p);
    storageService.savePatientPolicies(updated);
    setPolicies(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.success('Policy successfully verified and activated.');
  }, [toast]);

  const expirePolicy = useCallback((id: string) => {
    const current = storageService.getPatientPolicies();
    const now = new Date().toISOString();
    const updated = current.map(p => p.id === id ? {
      ...p,
      status: 'expired' as const,
      updatedAt: now
    } : p);
    storageService.savePatientPolicies(updated);
    setPolicies(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.warning('Policy marked as expired.');
  }, [toast]);

  // ---- ELIGIBILITY CHECK METHODS ----
  const runEligibilityCheck = useCallback((patientId: string, policyId: string, serviceCategory?: string): EligibilityVerificationRecord => {
    const policy = storageService.getPatientPolicies().find(p => p.id === policyId || p.patientId === patientId);
    const patientName = policy?.patientName || 'Patient';
    const policyNumber = policy?.policyNumber || 'N/A';
    const providerName = policy?.providerName || 'Insurance Provider';
    const isValid = policy?.status === 'active' && new Date(policy.endDate) > new Date();

    const currentRecords = storageService.getEligibilityRecords();
    const newVerNumber = `VER-2026-${String(currentRecords.length + 1).padStart(3, '0')}`;
    const verifiedBy = authState.user?.name || 'Insurance Desk Coordinator';

    const coverageDetails = DEFAULT_PLAN_COVERAGE_RULES.map(rule => ({
      service: rule.categoryLabel,
      covered: rule.isCovered && isValid,
      limit: rule.coverageLimit || (policy?.sumInsured || 500000),
      copay: policy?.coPayPercentage || rule.coPayPercentage
    }));

    const newRecord: EligibilityVerificationRecord = {
      id: `ELG-${String(currentRecords.length + 1).padStart(3, '0')}`,
      verificationNumber: newVerNumber,
      patientId,
      patientName,
      policyId: policy?.id || policyId,
      policyNumber,
      providerName,
      verificationDate: new Date().toISOString(),
      verifiedBy,
      status: isValid ? 'verified' : policy?.status === 'expired' ? 'expired' : 'not_eligible',
      policyValid: !!isValid,
      sumInsuredAvailable: policy ? policy.remainingCoverage : 0,
      coverageDetails,
      notes: isValid
        ? `Eligibility verified for ${serviceCategory || 'All Medical & Surgical Services'}. Active Sum Insured: ₹${(policy?.remainingCoverage || 0).toLocaleString()}.`
        : 'Policy check indicated inactive coverage or expired validity.',
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...currentRecords];
    storageService.saveEligibilityRecords(updated);
    setEligibilityRecords(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.success(`Eligibility check completed: ${isValid ? 'VERIFIED' : 'NOT ELIGIBLE'}`);
    return newRecord;
  }, [authState.user?.name, toast]);

  // ---- PRE-AUTHORIZATION METHODS ----
  const createPreAuth = useCallback((data: Omit<PreAuthRequest, 'id' | 'requestNumber' | 'createdAt' | 'updatedAt'>) => {
    const current = storageService.getPreAuthRequests();
    const num = String(current.length + 101);
    const newId = `PA-${num}`;
    const newReqNumber = `PA-2026-${num}`;
    const now = new Date().toISOString();

    const newReq: PreAuthRequest = {
      ...data,
      id: newId,
      requestNumber: newReqNumber,
      createdAt: now,
      updatedAt: now
    };

    const updated = [newReq, ...current];
    storageService.savePreAuthRequests(updated);
    setPreAuthRequests(updated);
    setStats(storageService.getInsuranceMetrics());

    storageService.logActivity({
      type: 'insurance',
      title: 'Pre-Authorization Request Raised',
      description: `${newReq.patientName} — ${newReq.diagnosis} (Requested: ₹${newReq.requestedAmount.toLocaleString()} to ${newReq.providerName})`,
      patientId: newReq.patientId,
      patientName: newReq.patientName,
      department: newReq.department,
      priority: newReq.treatmentType === 'emergency' ? 'critical' : 'normal'
    });

    toast.success(`Pre-Authorization Request ${newReqNumber} created.`);
    return newReq;
  }, [toast]);

  const updatePreAuth = useCallback((id: string, updates: Partial<PreAuthRequest>) => {
    const current = storageService.getPreAuthRequests();
    const now = new Date().toISOString();
    const updated = current.map(r => r.id === id ? { ...r, ...updates, updatedAt: now } : r);
    storageService.savePreAuthRequests(updated);
    setPreAuthRequests(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.success('Pre-authorization request updated.');
  }, [toast]);

  const adjudicatePreAuth = useCallback((
    id: string,
    status: PreAuthStatus,
    approvedAmount: number,
    reviewerNotes: string,
    approvalNumber?: string,
    approvedServices?: string[],
    rejectedServices?: string[]
  ) => {
    const current = storageService.getPreAuthRequests();
    const now = new Date().toISOString();
    const target = current.find(r => r.id === id);
    if (!target) return;

    const patientPayable = Math.max(0, target.estimatedCost - approvedAmount);
    const appNum = approvalNumber || (status === 'approved' || status === 'partially_approved' ? `APP-${Date.now().toString().slice(-6)}` : undefined);

    const updated = current.map(r => r.id === id ? {
      ...r,
      status,
      approvedAmount,
      patientPayableAmount: patientPayable,
      reviewerNotes,
      approvalNumber: appNum,
      approvalDate: status === 'approved' || status === 'partially_approved' ? now.split('T')[0] : undefined,
      approvedServices: approvedServices || r.approvedServices,
      rejectedServices: rejectedServices || r.rejectedServices,
      updatedAt: now
    } : r);

    storageService.savePreAuthRequests(updated);
    setPreAuthRequests(updated);
    setStats(storageService.getInsuranceMetrics());

    storageService.logActivity({
      type: 'insurance',
      title: `Pre-Auth ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
      description: `${target.patientName}: Approved ₹${approvedAmount.toLocaleString()} of ₹${target.requestedAmount.toLocaleString()}`,
      patientId: target.patientId,
      patientName: target.patientName,
      department: target.department,
      priority: status === 'approved' ? 'normal' : 'high'
    });

    toast.info(`Pre-Auth status updated to ${status.toUpperCase()} (₹${approvedAmount.toLocaleString()}).`);
  }, [toast]);

  // ---- CLAIMS METHODS ----
  const createClaim = useCallback((data: Omit<InsuranceClaimRecord, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt' | 'timeline' | 'resubmissionCount'>) => {
    const current = storageService.getInsuranceClaims();
    const num = String(current.length + 8801);
    const newId = `CLM-${String(current.length + 1).padStart(3, '0')}`;
    const newClaimNumber = `CLM-2026-${num}`;
    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newClaim: InsuranceClaimRecord = {
      ...data,
      id: newId,
      claimNumber: newClaimNumber,
      resubmissionCount: 0,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `TL-${Date.now()}`,
          action: 'Claim Created in HMS',
          performedBy: authState.user?.name || 'Insurance Coordinator',
          role: authState.user?.role || 'insurance_coordinator',
          timestamp: `${now.split('T')[0]} ${timeStr}`,
          notes: 'Claim initiated from hospital service billing dossier.'
        }
      ]
    };

    const updated = [newClaim, ...current];
    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    setStats(storageService.getInsuranceMetrics());

    storageService.logActivity({
      type: 'insurance',
      title: 'Insurance Claim Created',
      description: `${newClaim.patientName} — Claim #${newClaimNumber} for ₹${newClaim.claimedAmount.toLocaleString()} (${newClaim.providerName})`,
      patientId: newClaim.patientId,
      patientName: newClaim.patientName,
      department: 'Billing & Insurance',
      priority: 'normal'
    });

    toast.success(`Claim #${newClaimNumber} generated.`);
    return newClaim;
  }, [authState.user?.name, authState.user?.role, toast]);

  const updateClaim = useCallback((id: string, updates: Partial<InsuranceClaimRecord>) => {
    const current = storageService.getInsuranceClaims();
    const now = new Date().toISOString();
    const updated = current.map(c => c.id === id ? { ...c, ...updates, updatedAt: now } : c);
    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.success('Claim record updated.');
  }, [toast]);

  const submitClaim = useCallback((id: string) => {
    const current = storageService.getInsuranceClaims();
    const target = current.find(c => c.id === id);
    if (!target) return;

    // Validate required documents
    const hasDischargeOrBill = target.documents.some(d =>
      d.documentType === 'final_hospital_bill' || d.documentType === 'discharge_summary' || d.documentType === 'doctor_prescription'
    );
    if (!hasDischargeOrBill && target.documents.length === 0) {
      toast.error('Cannot submit claim without minimum required medical records or hospital bills.');
      return;
    }

    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = current.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        status: 'submitted' as ClaimStatus,
        submissionDate: now.split('T')[0],
        updatedAt: now,
        timeline: [
          ...c.timeline,
          {
            id: `TL-${Date.now()}`,
            action: 'Claim Submitted to Insurer / TPA Gateway',
            statusFrom: c.status,
            statusTo: 'submitted',
            performedBy: authState.user?.name || 'Insurance Coordinator',
            role: authState.user?.role || 'insurance_coordinator',
            timestamp: `${now.split('T')[0]} ${timeStr}`,
            notes: 'Verified all attached bills, prescriptions, and diagnostics before submission.'
          }
        ]
      };
    });

    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.success(`Claim #${target.claimNumber} dispatched to ${target.providerName}.`);
  }, [authState.user?.name, authState.user?.role, toast]);

  const uploadClaimDocument = useCallback((claimId: string, docData: Omit<ClaimDocument, 'id' | 'uploadDate'>) => {
    const current = storageService.getInsuranceClaims();
    const target = current.find(c => c.id === claimId);
    if (!target) return;

    const newDoc: ClaimDocument = {
      ...docData,
      id: `DOC-${Date.now().toString().slice(-4)}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    const updated = current.map(c => c.id === claimId ? {
      ...c,
      documents: [...(c.documents || []), newDoc],
      updatedAt: new Date().toISOString()
    } : c);

    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    logAuditAction('Document Uploaded', 'document', claimId, undefined, newDoc.status, `File "${newDoc.documentName}" uploaded to Claim #${target.claimNumber}`);
    toast.success(`Document "${newDoc.documentName}" uploaded.`);
  }, [logAuditAction, toast]);

  const replaceClaimDocument = useCallback((claimId: string, docId: string, updates: Partial<ClaimDocument>) => {
    const current = storageService.getInsuranceClaims();
    const target = current.find(c => c.id === claimId);
    if (!target) return;

    const updated = current.map(c => {
      if (c.id !== claimId) return c;
      return {
        ...c,
        documents: (c.documents || []).map(d => d.id === docId ? { ...d, ...updates, uploadDate: new Date().toISOString().split('T')[0] } : d),
        updatedAt: new Date().toISOString()
      };
    });

    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    logAuditAction('Document Replaced', 'document', claimId, undefined, 'uploaded', `Replaced document on Claim #${target.claimNumber}`);
    toast.success('Document updated successfully.');
  }, [logAuditAction, toast]);

  const deleteClaimDocument = useCallback((claimId: string, docId: string) => {
    const current = storageService.getInsuranceClaims();
    const target = current.find(c => c.id === claimId);
    if (!target) return;

    const targetDoc = (target.documents || []).find(d => d.id === docId);
    const updated = current.map(c => {
      if (c.id !== claimId) return c;
      return {
        ...c,
        documents: (c.documents || []).filter(d => d.id !== docId),
        updatedAt: new Date().toISOString()
      };
    });

    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    logAuditAction('Document Deleted', 'document', claimId, undefined, undefined, `Removed document "${targetDoc?.documentName || docId}" from Claim #${target.claimNumber}`);
    toast.info('Document deleted from claim.');
  }, [logAuditAction, toast]);

  const verifyClaimDocument = useCallback((claimId: string, docId: string, status: 'verified' | 'rejected', note?: string) => {
    const current = storageService.getInsuranceClaims();
    const target = current.find(c => c.id === claimId);
    const updated = current.map(c => {
      if (c.id !== claimId) return c;
      return {
        ...c,
        documents: (c.documents || []).map(d => d.id === docId ? { ...d, status, rejectionNote: note } : d),
        updatedAt: new Date().toISOString()
      };
    });
    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    logAuditAction(`Document ${status.toUpperCase()}`, 'document', claimId, undefined, status, note || `Marked document status as ${status} on Claim #${target?.claimNumber}`);
    toast.info(`Document status set to ${status}.`);
  }, [logAuditAction, toast]);

  const rejectClaim = useCallback((claimId: string, rejectionReason: string, rejectedAmount: number, notes?: string) => {
    const current = storageService.getInsuranceClaims();
    const target = current.find(c => c.id === claimId);
    if (!target) return;

    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = current.map(c => {
      if (c.id !== claimId) return c;
      return {
        ...c,
        status: 'rejected' as ClaimStatus,
        rejectionReason,
        rejectionDate: now.split('T')[0],
        disallowedAmount: rejectedAmount,
        approvedAmount: 0,
        pendingInsuranceAmount: 0,
        patientPayableAmount: c.totalHospitalBill,
        reviewerNotes: notes || rejectionReason,
        updatedAt: now,
        timeline: [
          ...c.timeline,
          {
            id: `TL-${Date.now()}`,
            action: 'Claim Repudiated / Rejected by Insurer',
            statusFrom: c.status,
            statusTo: 'rejected',
            performedBy: 'Insurance Adjudication Desk',
            role: 'external_adjudicator',
            timestamp: `${now.split('T')[0]} ${timeStr}`,
            notes: rejectionReason
          }
        ]
      };
    });

    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    setStats(storageService.getInsuranceMetrics());

    storageService.logActivity({
      type: 'insurance',
      title: 'Insurance Claim Rejected',
      description: `Claim #${target.claimNumber} (${target.patientName}) rejected: ${rejectionReason}`,
      patientId: target.patientId,
      patientName: target.patientName,
      department: 'Insurance Desk',
      priority: 'high'
    });

    toast.warning(`Claim #${target.claimNumber} marked as REJECTED.`);
  }, [toast]);

  const resubmitClaim = useCallback((claimId: string, correctionNotes: string, updatedAmount?: number) => {
    const current = storageService.getInsuranceClaims();
    const target = current.find(c => c.id === claimId);
    if (!target) return;

    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = current.map(c => {
      if (c.id !== claimId) return c;
      return {
        ...c,
        status: 'additional_info_required' as ClaimStatus,
        claimedAmount: updatedAmount !== undefined ? updatedAmount : c.claimedAmount,
        resubmissionCount: (c.resubmissionCount || 0) + 1,
        resubmissionDate: now.split('T')[0],
        reviewerNotes: `Resubmission #${(c.resubmissionCount || 0) + 1}: ${correctionNotes}`,
        updatedAt: now,
        timeline: [
          ...c.timeline,
          {
            id: `TL-${Date.now()}`,
            action: `Claim Resubmission Filed (Attempt #${(c.resubmissionCount || 0) + 1})`,
            statusFrom: c.status,
            statusTo: 'additional_info_required',
            performedBy: authState.user?.name || 'Insurance Coordinator',
            role: authState.user?.role || 'insurance_coordinator',
            timestamp: `${now.split('T')[0]} ${timeStr}`,
            notes: correctionNotes
          }
        ]
      };
    });

    storageService.saveInsuranceClaims(updated);
    setClaims(updated);
    setStats(storageService.getInsuranceMetrics());
    toast.success(`Claim #${target.claimNumber} resubmitted with corrections.`);
  }, [authState.user?.name, authState.user?.role, toast]);

  // ---- SETTLEMENT METHODS ----
  const recordSettlement = useCallback((data: Omit<SettlementRecord, 'id' | 'settlementNumber' | 'createdAt'>) => {
    const currentSettlements = storageService.getSettlementRecords();
    const newId = `SET-${String(currentSettlements.length + 1).padStart(3, '0')}`;
    const newSettlementNum = `SET-2026-${String(currentSettlements.length + 4401)}`;
    const now = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: SettlementRecord = {
      ...data,
      id: newId,
      settlementNumber: newSettlementNum,
      createdAt: now
    };

    const updatedSettlements = [newRecord, ...currentSettlements];
    storageService.saveSettlementRecords(updatedSettlements);
    setSettlements(updatedSettlements);

    // Update the parent claim status
    const currentClaims = storageService.getInsuranceClaims();
    const updatedClaims = currentClaims.map(c => {
      if (c.id === data.claimId || c.claimNumber === data.claimNumber) {
        return {
          ...c,
          status: 'settled' as ClaimStatus,
          settledAmount: (c.settledAmount || 0) + data.settledAmount,
          settledDate: data.settlementDate,
          pendingInsuranceAmount: Math.max(0, c.approvedAmount - ((c.settledAmount || 0) + data.settledAmount)),
          updatedAt: now,
          timeline: [
            ...c.timeline,
            {
              id: `TL-${Date.now()}`,
              action: `Settlement Disbursed (Ref: ${data.paymentReference})`,
              statusFrom: c.status,
              statusTo: 'settled',
              performedBy: authState.user?.name || 'Accounts Desk',
              role: 'billing_staff',
              timestamp: `${now.split('T')[0]} ${timeStr}`,
              notes: `Net Disbursed: ₹${data.netDisbursedAmount.toLocaleString()} via ${data.paymentMode.toUpperCase()}.`
            }
          ]
        };
      }
      return c;
    });

    storageService.saveInsuranceClaims(updatedClaims);
    setClaims(updatedClaims);
    setStats(storageService.getInsuranceMetrics());

    storageService.logActivity({
      type: 'insurance',
      title: 'Insurance Settlement Received',
      description: `Settlement #${newSettlementNum} for ${data.patientName}: ₹${data.settledAmount.toLocaleString()} (Ref: ${data.paymentReference})`,
      patientId: data.patientId,
      patientName: data.patientName,
      department: 'Accounts & Billing',
      priority: 'normal'
    });

    toast.success(`Settlement recorded: ₹${data.settledAmount.toLocaleString()} (Ref: ${data.paymentReference}).`);
    return newRecord;
  }, [authState.user?.name, toast]);

  // ---- SPLIT UTILITY ----
  const calculateCopaySplit = useCallback((totalBill: number, policy: PatientInsurancePolicy) => {
    const copayPct = policy.coPayPercentage || 0;
    const deductible = policy.deductible || 0;
    const availableSum = policy.remainingCoverage || 0;

    const afterDeductible = Math.max(0, totalBill - deductible);
    const calculatedCopay = Math.round((afterDeductible * copayPct) / 100);
    const netInsuranceAttempt = afterDeductible - calculatedCopay;
    const insurancePayable = Math.min(netInsuranceAttempt, availableSum);
    const patientPayable = Math.max(0, totalBill - insurancePayable);

    return {
      coveredAmount: insurancePayable,
      copayAmount: calculatedCopay,
      deductibleAmount: deductible,
      patientPayable,
      insurancePayable
    };
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    providers,
    plans,
    auditLogs,
    policies,
    eligibilityRecords,
    preAuthRequests,
    claims,
    settlements,
    coverageRules,
    stats,
    addProvider,
    updateProvider,
    toggleProviderStatus,
    addPlan,
    updatePlan,
    togglePlanStatus,
    logAuditAction,
    registerPolicy,
    updatePolicy,
    verifyPolicy,
    expirePolicy,
    runEligibilityCheck,
    createPreAuth,
    updatePreAuth,
    adjudicatePreAuth,
    createClaim,
    updateClaim,
    submitClaim,
    uploadClaimDocument,
    replaceClaimDocument,
    deleteClaimDocument,
    verifyClaimDocument,
    rejectClaim,
    resubmitClaim,
    recordSettlement,
    calculateCopaySplit,
    selectedClaimId,
    setSelectedClaimId,
    selectedPreAuthId,
    setSelectedPreAuthId,
    refreshAll
  };

  return <InsuranceContext.Provider value={value}>{children}</InsuranceContext.Provider>;
}

export function useInsurance() {
  const ctx = useContext(InsuranceContext);
  if (!ctx) {
    throw new Error('useInsurance must be used within an InsuranceProviderComponent');
  }
  return ctx;
}
