/**
 * Centralized API Service for ALN Cure Hospital Management System
 * Connects frontend to Express Node.js backend and Supabase
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`[API] Network call to ${endpoint} failed, continuing with fallback:`, error);
    throw error;
  }
}

export const api = {
  // Health
  checkHealth: () => fetchJson<{ status: string; service: string }>('/health'),

  // Auth
  login: (email: string, password: string) =>
    fetchJson<{ success: boolean; user?: any; error?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginWithOtp: (phone: string, otp: string) =>
    fetchJson<{ success: boolean; user?: any; error?: string }>('/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  // Patients
  getPatients: () => fetchJson<{ success: boolean; data: any[] }>('/patients'),
  getPatientById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/patients/${id}`),
  createPatient: (patient: any) =>
    fetchJson<{ success: boolean; data: any }>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    }),
  updatePatient: (id: string, updates: any) =>
    fetchJson<{ success: boolean; data: any }>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Doctors
  getDoctors: () => fetchJson<{ success: boolean; data: any[] }>('/doctors'),
  toggleDoctorAvailability: (id: string, isAvailable: boolean) =>
    fetchJson<{ success: boolean; data: any }>(`/doctors/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    }),

  // Appointments
  getAppointments: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchJson<{ success: boolean; data: any[] }>(`/appointments${query}`);
  },
  createAppointment: (apt: any) =>
    fetchJson<{ success: boolean; data: any }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(apt),
    }),
  updateAppointmentStatus: (id: string, status: string) =>
    fetchJson<{ success: boolean; data: any }>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // OPD Consultations & Visits
  getConsultations: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchJson<{ success: boolean; data: any[] }>(`/opd${query}`);
  },
  createConsultation: (consultation: any) =>
    fetchJson<{ success: boolean; data: any }>('/opd', {
      method: 'POST',
      body: JSON.stringify(consultation),
    }),
  getOPDVisits: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchJson<{ success: boolean; data: any[] }>(`/opd/visits${query}`);
  },
  createOPDVisit: (visit: any) =>
    fetchJson<{ success: boolean; data: any }>('/opd/visits', {
      method: 'POST',
      body: JSON.stringify(visit),
    }),
  updateOPDVisitStatus: (id: string, status: string) =>
    fetchJson<{ success: boolean; data: any }>(`/opd/visits/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // IPD & Beds
  getAdmissions: (status?: string) =>
    fetchJson<{ success: boolean; data: any[] }>(`/ipd/admissions${status ? `?status=${status}` : ''}`),
  getBeds: () => fetchJson<{ success: boolean; data: any[]; wards?: any[] }>('/ipd/beds'),
  updateBedStatus: (id: string, status: string, currentPatientId?: string, currentAdmissionId?: string) =>
    fetchJson<{ success: boolean; data: any }>(`/ipd/beds/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, currentPatientId, currentAdmissionId }),
    }),
  createAdmission: (admission: any) =>
    fetchJson<{ success: boolean; data: any }>('/ipd/admissions', {
      method: 'POST',
      body: JSON.stringify(admission),
    }),
  createTransfer: (transfer: any) =>
    fetchJson<{ success: boolean; data: any }>('/ipd/transfers', {
      method: 'POST',
      body: JSON.stringify(transfer),
    }),
  createDoctorRound: (round: any) =>
    fetchJson<{ success: boolean; data: any }>('/ipd/rounds', {
      method: 'POST',
      body: JSON.stringify(round),
    }),
  createDischarge: (discharge: any) =>
    fetchJson<{ success: boolean; data: any }>('/ipd/discharges', {
      method: 'POST',
      body: JSON.stringify(discharge),
    }),

  // Nursing
  getNursingTasks: (status?: string) =>
    fetchJson<{ success: boolean; data: any[] }>(`/nursing/tasks${status ? `?status=${status}` : ''}`),
  createNursingTask: (task: any) =>
    fetchJson<{ success: boolean; data: any }>('/nursing/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  recordNursingVitals: (vitals: any) =>
    fetchJson<{ success: boolean; data: any }>('/nursing/vitals', {
      method: 'POST',
      body: JSON.stringify(vitals),
    }),
  recordNursingNote: (note: any) =>
    fetchJson<{ success: boolean; data: any }>('/nursing/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    }),
  recordMARAdministration: (mar: any) =>
    fetchJson<{ success: boolean; data: any }>('/nursing/mar', {
      method: 'POST',
      body: JSON.stringify(mar),
    }),
  reportIncident: (incident: any) =>
    fetchJson<{ success: boolean; data: any }>('/nursing/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    }),

  // Diet & Nutrition
  getDietCharts: (patientId?: string) =>
    fetchJson<{ success: boolean; data: any[] }>(`/diet/charts${patientId ? `?patientId=${patientId}` : ''}`),
  createDietChart: (chart: any) =>
    fetchJson<{ success: boolean; data: any }>('/diet/charts', {
      method: 'POST',
      body: JSON.stringify(chart),
    }),
  approveDietChart: (id: string, approvedBy: string) =>
    fetchJson<{ success: boolean; message: string }>(`/diet/charts/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approvedBy }),
    }),
  recordNutritionAssessment: (assessment: any) =>
    fetchJson<{ success: boolean; data: any }>('/diet/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment),
    }),
  createDoctorDietOrder: (order: any) =>
    fetchJson<{ success: boolean; data: any }>('/diet/doctor-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateMealDeliveryStatus: (id: string, updates: any) =>
    fetchJson<{ success: boolean; message: string }>(`/diet/meals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  setNPOStatus: (npo: any) =>
    fetchJson<{ success: boolean; data: any }>('/diet/npo', {
      method: 'POST',
      body: JSON.stringify(npo),
    }),

  // Laboratory & LIS
  getLabTests: () => fetchJson<{ success: boolean; data: any[] }>('/laboratory/tests'),
  getLabOrders: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchJson<{ success: boolean; data: any[] }>(`/laboratory/orders${query}`);
  },
  createLabOrder: (order: any) =>
    fetchJson<{ success: boolean; data: any }>('/laboratory/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  collectLabSample: (id: string, collectorName: string) =>
    fetchJson<{ success: boolean; message: string }>(`/laboratory/samples/${id}/collect`, {
      method: 'PATCH',
      body: JSON.stringify({ collectorName }),
    }),
  receiveLabSample: (id: string, details: any) =>
    fetchJson<{ success: boolean; message: string }>(`/laboratory/samples/${id}/receive`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    }),
  enterLabResults: (id: string, details: any) =>
    fetchJson<{ success: boolean; message: string }>(`/laboratory/orders/${id}/results`, {
      method: 'POST',
      body: JSON.stringify(details),
    }),
  verifyLabResults: (id: string, details: any) =>
    fetchJson<{ success: boolean; message: string }>(`/laboratory/orders/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    }),
  amendLabReport: (id: string, details: any) =>
    fetchJson<{ success: boolean; message: string }>(`/laboratory/orders/${id}/amend`, {
      method: 'POST',
      body: JSON.stringify(details),
    }),
  acknowledgeCriticalAlert: (id: string, acknowledgedBy: string) =>
    fetchJson<{ success: boolean; message: string }>(`/laboratory/critical-alerts/${id}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ acknowledgedBy }),
    }),

  // Radiology & Diagnostic Imaging (RIS)
  getRadiologyOrders: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchJson<{ success: boolean; data: any[] }>(`/radiology/orders${query}`);
  },
  createRadiologyOrder: (order: any) =>
    fetchJson<{ success: boolean; data: any }>('/radiology/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  scheduleRadiologyExam: (id: string, schedule: any) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/schedule`, {
      method: 'PATCH',
      body: JSON.stringify(schedule),
    }),
  checkInRadiologyPatient: (id: string, details: any) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/check-in`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    }),
  recordRadiologyContrast: (id: string, contrast: any) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/contrast`, {
      method: 'POST',
      body: JSON.stringify(contrast),
    }),
  startRadiologyExam: (id: string, technicianName: string) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/start`, {
      method: 'PATCH',
      body: JSON.stringify({ technicianName }),
    }),
  completeRadiologyExam: (id: string, details: any) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(details),
    }),
  saveRadiologyReportDraft: (id: string, report: any) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/report-draft`, {
      method: 'POST',
      body: JSON.stringify(report),
    }),
  verifyRadiologyReport: (id: string, report: any) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(report),
    }),
  amendRadiologyReport: (id: string, report: any) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/orders/${id}/amend`, {
      method: 'POST',
      body: JSON.stringify(report),
    }),
  acknowledgeRadiologyCriticalAlert: (id: string, acknowledgedBy: string) =>
    fetchJson<{ success: boolean; message: string }>(`/radiology/critical-alerts/${id}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ acknowledgedBy }),
    }),

  // Pharmacy & Medication Management (PIS)
  getMedicines: () => fetchJson<{ success: boolean; data: any[] }>('/pharmacy/medicines'),
  createMedicine: (med: any) =>
    fetchJson<{ success: boolean; data: any }>('/pharmacy/medicines', {
      method: 'POST',
      body: JSON.stringify(med),
    }),
  getBatches: () => fetchJson<{ success: boolean; data: any[] }>('/pharmacy/batches'),
  stockInMedicine: (batch: any) =>
    fetchJson<{ success: boolean; data: any }>('/pharmacy/stock-in', {
      method: 'POST',
      body: JSON.stringify(batch),
    }),
  createPharmacyPO: (po: any) =>
    fetchJson<{ success: boolean; data: any }>('/pharmacy/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(po),
    }),
  getDispensings: () => fetchJson<{ success: boolean; data: any[] }>('/pharmacy/dispensings'),
  createDispensing: (dispensing: any) =>
    fetchJson<{ success: boolean; data: any }>('/pharmacy/dispensings', {
      method: 'POST',
      body: JSON.stringify(dispensing),
    }),
  createPOSSale: (sale: any) =>
    fetchJson<{ success: boolean; data: any }>('/pharmacy/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    }),
  createMedicineReturn: (returnData: any) =>
    fetchJson<{ success: boolean; data: any }>('/pharmacy/returns', {
      method: 'POST',
      body: JSON.stringify(returnData),
    }),

  // Central Billing & Payment Management (PIS)
  getInvoices: (status?: string) =>
    fetchJson<{ success: boolean; data: any[] }>(`/billing${status ? `?status=${status}` : ''}`),
  createInvoice: (invoice: any) =>
    fetchJson<{ success: boolean; data: any }>('/billing', {
      method: 'POST',
      body: JSON.stringify(invoice),
    }),
  recordPayment: (invoiceId: string, payment: any) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/billing/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(payment),
    }),
  recordAdvance: (advance: any) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/billing/advances', {
      method: 'POST',
      body: JSON.stringify(advance),
    }),
  processRefund: (refund: any) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/billing/refunds', {
      method: 'POST',
      body: JSON.stringify(refund),
    }),
  ingestDepartmentCharge: (charge: any) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/billing/charges', {
      method: 'POST',
      body: JSON.stringify(charge),
    }),

  // Blood Bank
  getBloodStock: () => fetchJson<{ success: boolean; data: any[] }>('/blood-bank/stock'),
  getBloodDonors: () => fetchJson<{ success: boolean; data: any[] }>('/blood-bank/donors'),
  createBloodDonor: (donor: any) =>
    fetchJson<{ success: boolean; data: any }>('/blood-bank/donors', {
      method: 'POST',
      body: JSON.stringify(donor),
    }),

  // Ambulance
  getAmbulanceRequests: () => fetchJson<{ success: boolean; data: any[] }>('/ambulance/requests'),
  dispatchAmbulance: (req: any) =>
    fetchJson<{ success: boolean; data: any }>('/ambulance/dispatch', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  // Dashboard Live Stats
  getDashboardStats: () => fetchJson<{ success: boolean; data: any }>('/dashboard/stats'),

  // AI Assistant
  generateClinicalDraft: (prompt: string, context?: string, patientId?: string) =>
    fetchJson<{ success: boolean; data: any }>('/ai/clinical-assist', {
      method: 'POST',
      body: JSON.stringify({ prompt, context, patientId }),
    }),
};
