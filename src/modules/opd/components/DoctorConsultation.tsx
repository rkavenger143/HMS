import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Brain, CheckCircle2, FileText, Plus, Trash2, Printer,
  FlaskConical, Scan, Pill, AlertTriangle, Activity, Calendar, Save,
  RotateCcw, Sparkles, ChevronRight, User, HeartPulse, Scale, Info, ReceiptText
} from 'lucide-react';
import { useOPD, STANDARD_ICD_DIAGNOSES } from '../context/OPDContext';
import type { Consultation, OPDVisit, Patient, OPDDiagnosisItem, Vitals } from '../../../types';
import PrintConsultationModal from './modals/PrintConsultationModal';
import PrintPrescriptionModal from './modals/PrintPrescriptionModal';
import OrderLabRequisitionModal from './modals/OrderLabRequisitionModal';
import OrderDiagnosticRequisitionModal from './modals/OrderDiagnosticRequisitionModal';
import AppointmentBillingModal from './modals/AppointmentBillingModal';

export default function DoctorConsultation() {
  const {
    visits,
    patients,
    doctors,
    appointments,
    selectedVisit,
    setSelectedVisit,
    completeConsultation,
    updateVisitVitals,
    createLabOrder,
    createDiagnosticOrder,
    setActiveTab,
  } = useOPD();

  // Active visit to consult
  const activeVisit = selectedVisit || visits.find(v => v.status === 'in_consultation' || v.status === 'called') || visits[0];
  const activePatient = activeVisit ? patients.find(p => p.id === activeVisit.patientId) : null;

  // Modals for clinical investigation requisitions
  const [showLabModal, setShowLabModal] = useState(false);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);

  // Vitals State
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('76');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('98');
  const [respiratoryRate, setRespiratoryRate] = useState('18');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');

  // Clinical Information State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [hpi, setHpi] = useState('');
  const [pastHistory, setPastHistory] = useState('');
  const [surgicalHistory, setSurgicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  // Examination State
  const [generalExam, setGeneralExam] = useState('');
  const [systemicExam, setSystemicExam] = useState('');
  const [clinicalFindings, setClinicalFindings] = useState('');

  // Diagnosis State
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<OPDDiagnosisItem[]>([]);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');

  // Treatment & Follow-up State
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [adviceNotes, setAdviceNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-09-07');
  const [followUpInstructions, setFollowUpInstructions] = useState('Return if symptoms worsen');

  // AI DDx state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Sync state when active visit changes
  useEffect(() => {
    if (activeVisit) {
      setChiefComplaint(activeVisit.reasonForVisit || '');
      if (activeVisit.vitals) {
        if (activeVisit.vitals.bloodPressure) {
          const [sys, dia] = activeVisit.vitals.bloodPressure.split('/');
          setSystolic(sys || '120');
          setDiastolic(dia || '80');
        }
        if (activeVisit.vitals.pulse) setPulse(activeVisit.vitals.pulse.toString());
        if (activeVisit.vitals.temperature) setTemperature(activeVisit.vitals.temperature.toString());
        if (activeVisit.vitals.spo2) setSpo2(activeVisit.vitals.spo2.toString());
        if (activeVisit.vitals.respiratoryRate) setRespiratoryRate(activeVisit.vitals.respiratoryRate.toString());
        if (activeVisit.vitals.height) setHeight(activeVisit.vitals.height.toString());
        if (activeVisit.vitals.weight) setWeight(activeVisit.vitals.weight.toString());
      }
    }
  }, [activeVisit]);

  // Calculate BMI
  const hM = parseFloat(height) / 100;
  const wKg = parseFloat(weight);
  const bmi = hM > 0 && wKg > 0 ? parseFloat((wKg / (hM * hM)).toFixed(1)) : undefined;

  // Diagnosis search filter
  const matchingDiagnoses = STANDARD_ICD_DIAGNOSES.filter(d => {
    if (!diagnosisSearch) return false;
    const q = diagnosisSearch.toLowerCase();
    return d.name.toLowerCase().includes(q) || (d.code && d.code.toLowerCase().includes(q));
  });

  const handleAddDiagnosis = (diag: OPDDiagnosisItem) => {
    if (!selectedDiagnoses.some(d => d.id === diag.id)) {
      setSelectedDiagnoses(prev => [...prev, diag]);
    }
    setDiagnosisSearch('');
  };

  const handleRemoveDiagnosis = (id: string) => {
    setSelectedDiagnoses(prev => prev.filter(d => d.id !== id));
  };

  const handleAddCustomDiagnosis = () => {
    if (!diagnosisSearch) return;
    const customItem: OPDDiagnosisItem = {
      id: `custom-diag-${Date.now()}`,
      name: diagnosisSearch,
      type: selectedDiagnoses.length === 0 ? 'primary' : 'secondary',
    };
    setSelectedDiagnoses(prev => [...prev, customItem]);
    setDiagnosisSearch('');
  };

  // AI Assist Simulation
  const generateAIDDx = async () => {
    if (!chiefComplaint) return;
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const promptText = chiefComplaint.toLowerCase();
    let ddxResults = '';

    if (promptText.includes('chest') || promptText.includes('heart') || promptText.includes('breath')) {
      ddxResults = `**AI Differential Diagnosis Analysis**\n\nSymptoms: "${chiefComplaint}"\n\n**Probable Diagnoses:**\n1. Acute Coronary Syndrome / Angina Pectoris (I20.9) - High Risk\n2. Gastro-esophageal Reflux Disease (K21.9)\n3. Musculoskeletal Chest Wall Strain (M79.1)\n\n**Suggested Diagnostic Workup:**\n- 12-lead Electrocardiogram (ECG) stat\n- Serial Troponin I (High Sensitivity) at 0h and 3h\n- Chest X-Ray PA View\n- Lipid Profile & Fasting Blood Sugar\n\n**Recommended Clinical Interventions:**\n- Aspirin 150mg + Atorvastatin 40mg stat if ischemic origin suspected\n- Monitor BP & SpO2 closely. Advise immediate admission if enzymes elevate.`;
    } else if (promptText.includes('fever') || promptText.includes('cough') || promptText.includes('cold')) {
      ddxResults = `**AI Differential Diagnosis Analysis**\n\nSymptoms: "${chiefComplaint}"\n\n**Probable Diagnoses:**\n1. Acute Viral Upper Respiratory Tract Infection (J06.9)\n2. Acute Bronchitis / Viral Pharyngitis\n3. Enteric Fever (Typhoid) if high persistent pyrexia > 3 days\n\n**Suggested Diagnostic Workup:**\n- Complete Blood Count (CBC) with differential\n- C-Reactive Protein (CRP)\n- Widal test / Dengue NS1 if febrile spike continues\n\n**Recommended Clinical Interventions:**\n- Paracetamol 500mg or 650mg TDS\n- Antihistamine / Steam inhalation\n- Amoxicillin-Clavulanate if bacterial consolidation identified`;
    } else {
      ddxResults = `**AI Differential Diagnosis Analysis**\n\nSymptoms: "${chiefComplaint}"\n\n**Probable Diagnoses:**\n1. Primary Clinical Evaluation required for: ${chiefComplaint}\n2. Rule out metabolic or systemic inflammatory etiologies\n\n**Suggested Investigations:**\n- Baseline Routine Hemogram (CBC)\n- Kidney & Liver Function Panels (KFT / LFT)\n\n**Note:** AI differential is assistive only. Clinical judgment governs patient management.`;
    }

    setAiSuggestion(ddxResults);
    setAiLoading(false);
  };

  const handleApplyAIDiagnosis = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.includes('Acute Coronary Syndrome')) {
      handleAddDiagnosis({ id: 'icd-4', code: 'I20.9', name: 'Angina pectoris / Acute Coronary Syndrome', type: 'primary' });
    } else if (aiSuggestion.includes('Upper Respiratory')) {
      handleAddDiagnosis({ id: 'icd-3', code: 'J06.9', name: 'Acute upper respiratory infection', type: 'primary' });
    }
  };

  // Save Consultation
  const handleSaveConsultation = () => {
    if (!activeVisit) return;

    const vitalsObj: Vitals = {
      bloodPressure: `${systolic}/${diastolic}`,
      pulse: parseInt(pulse, 10) || undefined,
      temperature: parseFloat(temperature) || undefined,
      spo2: parseInt(spo2, 10) || undefined,
      respiratoryRate: parseInt(respiratoryRate, 10) || undefined,
      height: parseFloat(height) || undefined,
      weight: parseFloat(weight) || undefined,
      bmi,
    };

    updateVisitVitals(activeVisit.id, vitalsObj);

    completeConsultation(activeVisit.id, {
      patientId: activeVisit.patientId,
      doctorId: activeVisit.doctorId,
      chiefComplaint,
      history: `${hpi}\n${pastHistory ? `Past: ${pastHistory}` : ''}\n${familyHistory ? `Family: ${familyHistory}` : ''}`.trim(),
      examination: `${generalExam}\n${systemicExam}\n${clinicalFindings}`.trim(),
      diagnosis: selectedDiagnoses.map(d => d.name),
      icdCodes: selectedDiagnoses.map(d => d.code || '').filter(Boolean),
      notes: `${treatmentPlan}\n${adviceNotes}`.trim(),
      followUpDate,
      followUpInstructions,
      vitals: vitalsObj,
    });
  };

  if (!activeVisit) {
    return (
      <div className="empty-state card">
        <div className="empty-state-icon"><Stethoscope size={36} /></div>
        <div className="empty-state-title">No Active Patient in Queue</div>
        <div className="empty-state-desc">Select a patient from today's queue or register a new patient visit to start consultation.</div>
        <button className="btn btn-primary mt-4" onClick={() => setActiveTab('queue')}>
          Go to Queue
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Patient Profile Header Banner */}
      <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Patient Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #0A84FF, #00D4AA)', fontWeight: 800, fontSize: 16 }}>
              {activeVisit.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeVisit.patientName}
                </span>
                <span className="patient-id">{activeVisit.patientId}</span>
                <span className="badge badge-primary">Token #{activeVisit.tokenNumber}</span>
              </div>

              <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, flexWrap: 'wrap' }}>
                <span>{activeVisit.patientAge || 45} Yrs · {activeVisit.patientGender || 'male'}</span>
                <span>·</span>
                <span>Blood: <strong style={{ color: 'var(--color-danger)' }}>{activeVisit.patientBloodGroup || 'O+'}</strong></span>
                <span>·</span>
                <span>OPD Visit: <strong>{activeVisit.id}</strong></span>
                <span>·</span>
                <span>Doctor: <strong>{activeVisit.doctorName}</strong> ({activeVisit.department})</span>
              </div>
            </div>
          </div>

          {/* Allergies / Action shortcuts */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {activePatient?.allergies && activePatient.allergies.length > 0 ? (
              <div style={{ padding: '6px 12px', background: 'var(--color-danger-muted)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--color-danger)', fontWeight: 600 }}>
                ⚠ Allergies: {activePatient.allergies.join(', ')}
              </div>
            ) : (
              <span className="badge badge-success" style={{ fontSize: 11 }}>No Known Drug Allergies (NKDA)</span>
            )}

            <button className="btn btn-secondary btn-sm" onClick={() => setShowPrintModal(true)}>
              <Printer size={13} /> Print Case Note
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Clinical Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Left Column: Vitals, Clinical Notes, Examination, Diagnoses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Section 1: Vital Signs */}
          <div className="card">
            <div className="card-header">
              <Activity size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">1. Patient Vital Signs</span>
              {bmi && (
                <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>
                  BMI: {bmi} kg/m²
                </span>
              )}
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                {/* BP */}
                <div className="form-group">
                  <label className="form-label">BP (mmHg)</label>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="120"
                      value={systolic}
                      onChange={e => setSystolic(e.target.value)}
                    />
                    <span>/</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="80"
                      value={diastolic}
                      onChange={e => setDiastolic(e.target.value)}
                    />
                  </div>
                </div>

                {/* Pulse */}
                <div className="form-group">
                  <label className="form-label">Pulse (bpm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={pulse}
                    onChange={e => setPulse(e.target.value)}
                  />
                </div>

                {/* Temp */}
                <div className="form-group">
                  <label className="form-label">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={temperature}
                    onChange={e => setTemperature(e.target.value)}
                  />
                </div>

                {/* SpO2 */}
                <div className="form-group">
                  <label className="form-label">SpO2 (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={spo2}
                    onChange={e => setSpo2(e.target.value)}
                  />
                </div>

                {/* RR */}
                <div className="form-group">
                  <label className="form-label">RR (/min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={respiratoryRate}
                    onChange={e => setRespiratoryRate(e.target.value)}
                  />
                </div>

                {/* Height */}
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                  />
                </div>

                {/* Weight */}
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Information & History */}
          <div className="card">
            <div className="card-header">
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">2. Clinical History & Chief Complaints</span>
              <button
                type="button"
                className="btn btn-ai btn-sm"
                onClick={generateAIDDx}
                disabled={aiLoading || !chiefComplaint}
                style={{ marginLeft: 'auto' }}
              >
                <Brain size={13} /> {aiLoading ? 'Analyzing...' : 'AI DDx Assist'}
              </button>
            </div>
            <div className="card-body">
              {/* AI Suggestion Banner */}
              {aiSuggestion && (
                <div className="ai-panel mb-4">
                  <div className="ai-panel-header">
                    <span className="ai-badge">ALN Cure AI Clinical Co-Pilot</span>
                    <button className="btn btn-ghost btn-icon btn-icon-sm" style={{ marginLeft: 'auto' }} onClick={() => setAiSuggestion(null)}>
                      ✕
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {aiSuggestion}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-success btn-sm" onClick={handleApplyAIDiagnosis}>
                      <CheckCircle2 size={12} /> Apply Suggested Diagnosis
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setAiSuggestion(null)}>
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div className="form-grid" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Chief Complaint <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Patient presenting symptoms and complaints..."
                    value={chiefComplaint}
                    onChange={e => setChiefComplaint(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">History of Present Illness (HPI)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Onset, duration, character, radiation, aggravating/relieving factors..."
                    value={hpi}
                    onChange={e => setHpi(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Past Medical & Surgical History</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Known chronic illnesses, previous surgeries..."
                      value={pastHistory}
                      onChange={e => setPastHistory(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Medications & Family History</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Ongoing drugs, family history of HTN/DM/CAD..."
                      value={currentMedications}
                      onChange={e => setCurrentMedications(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Physical Examination */}
          <div className="card">
            <div className="card-header">
              <HeartPulse size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">3. Examination & Clinical Findings</span>
            </div>
            <div className="card-body">
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">General Physical Examination</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema (P/I/C/C/L/E)"
                    value={generalExam}
                    onChange={e => setGeneralExam(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Systemic Examination (CVS / RS / CNS / P/A)</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="CVS: S1 S2 heard | RS: B/L clear | CNS: Conscious, oriented | P/A: Soft, non-tender"
                    value={systemicExam}
                    onChange={e => setSystemicExam(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Diagnoses (ICD-10 Search & Tags) */}
          <div className="card">
            <div className="card-header">
              <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">4. Diagnosis (ICD-10 Coded) <span className="required">*</span></span>
            </div>
            <div className="card-body">
              {/* Diagnosis Search Bar */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search standard ICD-10 diagnoses (e.g. Hypertension, Diabetes, Asthma, URI)..."
                  value={diagnosisSearch}
                  onChange={e => setDiagnosisSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDiagnosis();
                    }
                  }}
                />

                {matchingDiagnoses.length > 0 && (
                  <div className="search-results" style={{ width: '100%', position: 'absolute', top: '100%', zIndex: 100 }}>
                    {matchingDiagnoses.map(d => (
                      <div
                        key={d.id}
                        className="search-result-item"
                        onClick={() => handleAddDiagnosis(d)}
                      >
                        <span className="badge badge-primary">{d.code}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{d.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Diagnoses Badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 40, padding: 8, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                {selectedDiagnoses.length > 0 ? (
                  selectedDiagnoses.map(d => (
                    <div
                      key={d.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--color-primary-muted)',
                        border: '1px solid var(--color-primary-border)',
                        color: 'var(--color-primary)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {d.code && <span style={{ opacity: 0.8, fontFamily: 'monospace' }}>[{d.code}]</span>}
                      <span>{d.name}</span>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 2px' }}
                        onClick={() => handleRemoveDiagnosis(d.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', alignSelf: 'center' }}>
                    No diagnosis added yet. Type above to search or press Enter to add custom diagnosis.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Treatment Plan, Follow-up, Order Requisitions & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Treatment Plan & Advice */}
          <div className="card">
            <div className="card-header">
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">5. Treatment Plan & Advice</span>
            </div>
            <div className="card-body">
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Doctor's Clinical Notes & Treatment</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Treatment regimen, supportive measures, fluid therapy..."
                    value={treatmentPlan}
                    onChange={e => setTreatmentPlan(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Advice & Lifestyle / Diet</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Dietary precautions, activity guidelines, rest..."
                    value={adviceNotes}
                    onChange={e => setAdviceNotes(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Review / Follow-up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Follow-up Instructions</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Return in 7 days with fasting blood sugar report"
                    value={followUpInstructions}
                    onChange={e => setFollowUpInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Investigation / Prescription Shortcuts */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>
              CONNECTED ORDER REQUISITIONS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', height: 42 }}
                onClick={() => setShowRxModal(true)}
              >
                <Pill size={15} style={{ color: 'var(--color-primary)' }} /> Prescribe Rx
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', height: 42 }}
                onClick={() => setShowLabModal(true)}
              >
                <FlaskConical size={15} style={{ color: 'var(--color-info)' }} /> Order Lab Tests
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', height: 42 }}
                onClick={() => setShowDiagModal(true)}
              >
                <Scan size={15} style={{ color: 'var(--color-ai)' }} /> Order Radiology
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', height: 42 }}
                onClick={() => setShowBillingModal(true)}
              >
                <ReceiptText size={15} style={{ color: 'var(--color-success)' }} /> Central Billing
              </button>
            </div>
          </div>

          {/* Save & Complete Consultation Actions */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ justifyContent: 'center', height: 44, fontSize: 15 }}
                onClick={handleSaveConsultation}
              >
                <CheckCircle2 size={16} /> Complete Consultation
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowPrintModal(true)}
                >
                  <Printer size={14} /> Print Summary
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setActiveTab('queue')}
                >
                  Back to Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Order Requisition Modal */}
      {showLabModal && activeVisit && (
        <OrderLabRequisitionModal
          visit={activeVisit}
          patient={activePatient}
          onClose={() => setShowLabModal(false)}
          onSubmit={(data) => {
            createLabOrder({
              patientId: activeVisit.patientId,
              patientName: activeVisit.patientName,
              doctorId: activeVisit.doctorId,
              doctorName: activeVisit.doctorName,
              department: activeVisit.department,
              priority: data.priority,
              tests: data.tests,
              clinicalNotes: data.clinicalNotes,
            });
          }}
        />
      )}

      {/* Diagnostic / Radiology Requisition Modal */}
      {showDiagModal && activeVisit && (
        <OrderDiagnosticRequisitionModal
          visit={activeVisit}
          patient={activePatient}
          onClose={() => setShowDiagModal(false)}
          onSubmit={(data) => {
            createDiagnosticOrder({
              patientId: activeVisit.patientId,
              patientName: activeVisit.patientName,
              doctorId: activeVisit.doctorId,
              doctorName: activeVisit.doctorName,
              department: activeVisit.department,
              modalityType: data.modalityType,
              procedureName: data.procedureName,
              bodyPart: data.bodyPart,
              priority: data.priority,
              clinicalIndication: data.clinicalIndication,
              specialInstructions: data.specialInstructions,
            });
          }}
        />
      )}

      {/* Print Consultation Summary Modal */}
      {showPrintModal && (
        <PrintConsultationModal
          visit={activeVisit}
          patient={activePatient}
          consultation={{
            id: 'cons-current',
            appointmentId: activeVisit.id,
            patientId: activeVisit.patientId,
            doctorId: activeVisit.doctorId,
            date: activeVisit.visitDate,
            chiefComplaint,
            history: hpi,
            examination: `${generalExam} ${systemicExam}`,
            diagnosis: selectedDiagnoses.map(d => d.name),
            prescription: [],
            labOrders: [],
            radiologyOrders: [],
            notes: treatmentPlan,
            followUpDate,
            followUpInstructions,
            vitals: {
              bloodPressure: `${systolic}/${diastolic}`,
              pulse: parseInt(pulse, 10),
              temperature: parseFloat(temperature),
              spo2: parseInt(spo2, 10),
              respiratoryRate: parseInt(respiratoryRate, 10),
              bmi,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Appointment Billing Modal */}
      {showBillingModal && (
        <AppointmentBillingModal
          appointment={appointments.find(a => a.patientId === activeVisit.patientId) || {
            id: `apt-${activeVisit.id}`,
            patientId: activeVisit.patientId,
            patientName: activeVisit.patientName,
            doctorId: activeVisit.doctorId,
            doctorName: activeVisit.doctorName,
            department: activeVisit.department,
            date: activeVisit.visitDate,
            time: activeVisit.visitTime,
            consultationFee: activeVisit.consultationFee || 600,
            type: activeVisit.visitType === 'follow_up' ? 'follow_up' : 'opd',
            status: activeVisit.status === 'completed' ? 'completed' : 'waiting',
            tokenNumber: activeVisit.tokenNumber,
            createdAt: activeVisit.createdAt,
          }}
          onClose={() => setShowBillingModal(false)}
          onPaymentComplete={() => setShowBillingModal(false)}
        />
      )}

      {/* Print Prescription Modal */}
      {showRxModal && activeVisit && (
        <PrintPrescriptionModal
          visit={activeVisit}
          patient={activePatient}
          consultation={{
            id: `rx-${activeVisit.id}`,
            patientId: activeVisit.patientId,
            doctorId: activeVisit.doctorId,
            date: activeVisit.visitDate,
            diagnosis: selectedDiagnoses.map(d => d.name),
            prescription: [
              {
                id: '1',
                medicineName: 'Amoxicillin + Clavulanic Acid 625mg',
                dosage: '625mg',
                frequency: '1-0-1',
                duration: '5 days',
                route: 'Oral',
                instructions: 'After food',
                quantity: 10,
              },
              {
                id: '2',
                medicineName: 'Paracetamol 650mg',
                dosage: '650mg',
                frequency: '1-1-1 (SOS)',
                duration: '3 days',
                route: 'Oral',
                instructions: 'When fever > 100°F',
                quantity: 10,
              },
            ],
            notes: adviceNotes || 'Drink plenty of warm fluids, rest well.',
          }}
          onClose={() => setShowRxModal(false)}
        />
      )}
    </div>
  );
}
