import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope, User, Calendar, Clock, Activity, HeartPulse,
  Pill, FlaskConical, Scan, CheckCircle2, AlertCircle, Plus,
  Trash2, Printer, FileText, Sparkles, DollarSign, ShieldCheck
} from 'lucide-react';
import { useDoctor } from '../context/DoctorContext';
import { useBilling } from '../../billing/context/BillingContext';
import PrintPrescriptionModal from './modals/PrintPrescriptionModal';
import PrintConsultationSummaryModal from './modals/PrintConsultationSummaryModal';
import type { DepartmentChargeItem } from '../../../types';

export default function DoctorConsultationDesk() {
  const {
    doctors,
    patients,
    selectedDoctorId,
    selectedPatientId,
    setSelectedPatientId,
    saveConsultation,
    setActiveTab,
  } = useDoctor();

  const { createInvoice } = useBilling();

  const [activeDoctorId, setActiveDoctorId] = useState<string>(selectedDoctorId || doctors[0]?.id || 'doc-1');
  const [activePatientId, setActivePatientId] = useState<string>(selectedPatientId || patients[0]?.id || 'pat-001');

  // Consultation Clinical Fields
  const [chiefComplaint, setChiefComplaint] = useState('Chest tightness on exertion and shortness of breath for 1 week.');
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState('Patient has a known history of hypertension for 5 years on irregular treatment. Experiencing intermittent retrosternal pain on walking.');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('Hypertension (5 yrs), Type 2 Diabetes Mellitus (3 yrs). No known drug allergies.');
  const [examinationFindings, setExaminationFindings] = useState('Conscious, oriented. Bilateral clear air entry. Normal S1 S2, no murmur or gallop. No pedal edema.');

  // Vitals
  const [bp, setBp] = useState('134/86');
  const [pulse, setPulse] = useState(76);
  const [temp, setTemp] = useState(98.4);
  const [spo2, setSpo2] = useState(98);
  const [weight, setWeight] = useState(72);
  const [sugar, setSugar] = useState(142);

  // Diagnosis
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('Hypertensive Heart Disease / Exertional Angina');
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState('Type 2 Diabetes Mellitus');
  const [icdCode, setIcdCode] = useState('I11.9');

  // Prescriptions
  const [medicines, setMedicines] = useState<{ name: string; dosage: string; frequency: string; duration: string; instructions: string }[]>([
    { name: 'Tab. Aspirin 75mg', dosage: '75mg', frequency: '0-1-0', duration: '30 Days', instructions: 'After lunch' },
    { name: 'Tab. Atorvastatin 20mg', dosage: '20mg', frequency: '0-0-1', duration: '30 Days', instructions: 'At bedtime' },
    { name: 'Tab. Telmisartan 40mg', dosage: '40mg', frequency: '1-0-0', duration: '30 Days', instructions: 'Morning after breakfast' },
  ]);

  // Diagnostic Orders
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>(['Lipid Profile', 'Serum Creatinine', 'HbA1c']);
  const [selectedRadScans, setSelectedRadScans] = useState<string[]>(['ECG 12-Lead', '2D Echocardiography']);

  // Follow-up
  const [followUpDate, setFollowUpDate] = useState('2026-09-16');
  const [followUpInstructions, setFollowUpInstructions] = useState('Review with fasting lipid profile and echo report in 2 weeks.');

  // Modals state
  const [printRxData, setPrintRxData] = useState<any | null>(null);
  const [printSummaryData, setPrintSummaryData] = useState<any | null>(null);

  const activeDoctor = doctors.find(d => d.id === activeDoctorId) || doctors[0];
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  useEffect(() => {
    if (selectedPatientId) setActivePatientId(selectedPatientId);
  }, [selectedPatientId]);

  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }
    ]);
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const getAge = (dob?: string) => {
    if (!dob) return 45;
    try {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear || 45;
    } catch {
      return 45;
    }
  };

  const handleCompleteConsultation = () => {
    if (!primaryDiagnosis.trim()) {
      alert('Please enter a Primary Diagnosis before completing consultation.');
      return;
    }

    const newConsult = saveConsultation({
      patientId: activePatient.id,
      patientName: `${activePatient.firstName} ${activePatient.lastName}`,
      age: getAge(activePatient.dateOfBirth),
      gender: activePatient.gender || 'male',
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      department: activeDoctor.department,
      consultationDate: new Date().toISOString().slice(0, 10),
      chiefComplaint,
      historyOfPresentIllness,
      pastMedicalHistory,
      examinationFindings,
      vitals: { bp, pulse, temp, spo2, weight, sugar },
      primaryDiagnosis,
      secondaryDiagnosis,
      icdCode,
      medicines,
      labOrders: selectedLabTests,
      radiologyOrders: selectedRadScans,
      followUpDate,
      followUpInstructions,
      consultationFee: activeDoctor.consultationFee || 750,
      paymentStatus: 'paid',
      status: 'completed',
    });

    // Automatically create consultation charge in Central Billing
    const chargeItem: DepartmentChargeItem = {
      id: `chg-doc-${Date.now()}`,
      patientId: activePatient.id,
      department: 'opd' as const,
      sourceModule: 'doctor_consultation',
      sourceRecordId: newConsult.id,
      serviceCode: 'OPD-CONSULT',
      description: `Doctor OPD Consultation: ${activeDoctor.name} (${activeDoctor.specialization})`,
      quantity: 1,
      unitPrice: activeDoctor.consultationFee || 750,
      discountAmount: 0,
      taxRate: 0,
      totalAmount: activeDoctor.consultationFee || 750,
      chargeDate: new Date().toISOString().slice(0, 10),
      createdBy: activeDoctor.name,
      isBilled: true,
    };

    createInvoice({
      patientId: activePatient.id,
      patientName: `${activePatient.firstName} ${activePatient.lastName}`,
      uhid: activePatient.id,
      encounterType: 'opd',
      doctorName: activeDoctor.name,
      department: activeDoctor.department,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: [chargeItem],
      grossAmount: activeDoctor.consultationFee || 750,
      discountAmount: 0,
      taxAmount: 0,
      insuranceAmount: 0,
      advanceAdjusted: 0,
      netPayable: activeDoctor.consultationFee || 750,
      paidAmount: activeDoctor.consultationFee || 750,
      outstandingBalance: 0,
      status: 'paid',
      createdBy: 'Doctor Chamber',
    });

    alert(`Consultation successfully recorded for ${activePatient.firstName} ${activePatient.lastName}.\nPrescriptions and diagnostic requests dispatched.`);
    setPrintRxData(newConsult);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Bar: Doctor & Patient Selector */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Doctor Clinical Consultation Workspace</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Consulting as <strong>{activeDoctor.name}</strong> ({activeDoctor.specialization})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 220, fontSize: 12 }}
            value={activeDoctorId}
            onChange={e => setActiveDoctorId(e.target.value)}
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 240, fontSize: 12 }}
            value={activePatientId}
            onChange={e => setActivePatientId(e.target.value)}
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</option>
            ))}
          </select>

          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('opd_queue')}>
            View Queue
          </button>
        </div>
      </div>

      {/* Patient Demographic & Vitals Banner */}
      <div className="card" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--color-primary-muted)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18
            }}>
              {activePatient.firstName?.[0]}{activePatient.lastName?.[0]}
            </div>

            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                {activePatient.firstName} {activePatient.lastName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                UHID: <strong style={{ fontFamily: 'monospace' }}>{activePatient.id}</strong> · {getAge(activePatient.dateOfBirth)}y / {activePatient.gender} · Blood: <strong>{activePatient.bloodGroup || 'O+'}</strong>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-danger)', fontWeight: 600, marginTop: 2 }}>
                ⚠️ Known Allergies: None recorded · Chronic: Hypertension, T2DM
              </div>
            </div>
          </div>

          {/* Real-time Recorded Vitals */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Blood Pressure</div>
              <strong style={{ fontSize: 13, color: 'var(--color-primary)' }}>{bp} mmHg</strong>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Pulse</div>
              <strong style={{ fontSize: 13 }}>{pulse} bpm</strong>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>SpO2</div>
              <strong style={{ fontSize: 13, color: 'var(--color-success)' }}>{spo2}%</strong>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Temp</div>
              <strong style={{ fontSize: 13 }}>{temp}°F</strong>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Blood Sugar</div>
              <strong style={{ fontSize: 13, color: '#d97706' }}>{sugar} mg/dL</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Workspace Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        {/* Left Column: Complaints, History & Examination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Chief Complaint & HPI */}
          <div className="card">
            <div className="card-header">
              <Activity size={17} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Chief Complaint & History of Present Illness</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Chief Complaint <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">History of Present Illness (HPI)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={historyOfPresentIllness}
                  onChange={e => setHistoryOfPresentIllness(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Past Medical & Surgical History</label>
                <input
                  type="text"
                  className="form-input"
                  value={pastMedicalHistory}
                  onChange={e => setPastMedicalHistory(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Examination Findings & Vitals Update */}
          <div className="card">
            <div className="card-header">
              <HeartPulse size={17} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Physical Examination & Clinical Findings</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Clinical Examination Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={examinationFindings}
                  onChange={e => setExaminationFindings(e.target.value)}
                />
              </div>

              <div className="form-grid form-grid-3" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">BP (mmHg)</label>
                  <input type="text" className="form-input" value={bp} onChange={e => setBp(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pulse (bpm)</label>
                  <input type="number" className="form-input" value={pulse} onChange={e => setPulse(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">SpO2 (%)</label>
                  <input type="number" className="form-input" value={spo2} onChange={e => setSpo2(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          <div className="card">
            <div className="card-header">
              <ShieldCheck size={17} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Clinical Diagnosis & ICD Coding</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Primary Diagnosis <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hypertensive Heart Disease"
                  value={primaryDiagnosis}
                  onChange={e => setPrimaryDiagnosis(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid form-grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Secondary / Differential Diagnosis</label>
                  <input
                    type="text"
                    className="form-input"
                    value={secondaryDiagnosis}
                    onChange={e => setSecondaryDiagnosis(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ICD-10 Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={icdCode}
                    onChange={e => setIcdCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Rx Prescription Writer & Diagnostic Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Rx Prescription Writer */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill size={17} style={{ color: 'var(--color-primary)' }} />
                <span className="card-title">Electronic Prescription (Rx)</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleAddMedicine}>
                <Plus size={12} /> Add Drug
              </button>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {medicines.map((med, idx) => (
                <div key={idx} style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Medicine Name (e.g. Tab. Aspirin 75mg)"
                      style={{ flex: 2, height: 32, fontSize: 12, fontWeight: 600 }}
                      value={med.name}
                      onChange={e => {
                        const updated = [...medicines];
                        updated[idx].name = e.target.value;
                        setMedicines(updated);
                      }}
                    />

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Frequency (1-0-1)"
                      style={{ flex: 1, height: 32, fontSize: 11 }}
                      value={med.frequency}
                      onChange={e => {
                        const updated = [...medicines];
                        updated[idx].frequency = e.target.value;
                        setMedicines(updated);
                      }}
                    />

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Duration (5d)"
                      style={{ flex: 1, height: 32, fontSize: 11 }}
                      value={med.duration}
                      onChange={e => {
                        const updated = [...medicines];
                        updated[idx].duration = e.target.value;
                        setMedicines(updated);
                      }}
                    />

                    <button
                      className="btn btn-ghost btn-icon btn-icon-sm"
                      onClick={() => handleRemoveMedicine(idx)}
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Instructions (e.g. After lunch with warm water)"
                    style={{ height: 28, fontSize: 11 }}
                    value={med.instructions}
                    onChange={e => {
                      const updated = [...medicines];
                      updated[idx].instructions = e.target.value;
                      setMedicines(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Investigations Ordering */}
          <div className="card">
            <div className="card-header">
              <FlaskConical size={17} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Order Laboratory & Radiology Diagnostics</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Recommended Lab Tests:</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {['CBC with Differential', 'Lipid Profile', 'HbA1c', 'LFT', 'KFT', 'Thyroid Profile (T3/T4/TSH)', 'Serum Electrolytes'].map(test => {
                    const isSelected = selectedLabTests.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => {
                          if (isSelected) setSelectedLabTests(selectedLabTests.filter(t => t !== test));
                          else setSelectedLabTests([...selectedLabTests, test]);
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {test}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Recommended Radiology Imaging:</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {['ECG 12-Lead', '2D Echocardiography', 'Chest X-Ray PA View', 'USG Whole Abdomen', 'CT Head Plain', 'MRI Lumbar Spine'].map(scan => {
                    const isSelected = selectedRadScans.includes(scan);
                    return (
                      <button
                        key={scan}
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => {
                          if (isSelected) setSelectedRadScans(selectedRadScans.filter(s => s !== scan));
                          else setSelectedRadScans([...selectedRadScans, scan]);
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '} {scan}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up & Discharge Instructions */}
          <div className="card">
            <div className="card-header">
              <Calendar size={17} style={{ color: 'var(--color-primary)' }} />
              <span className="card-title">Follow-up Scheduling & Dietary Advice</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-grid form-grid-2" style={{ gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee Adjustment</label>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: 'var(--color-primary)' }}>
                    ₹{activeDoctor.consultationFee} (Billed via Central Billing)
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dietary & Lifestyle Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  value={followUpInstructions}
                  onChange={e => setFollowUpInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setPrintSummaryData({
              patientName: `${activePatient.firstName} ${activePatient.lastName}`,
              patientId: activePatient.id,
              doctorName: activeDoctor.name,
              department: activeDoctor.department,
              date: new Date().toISOString().slice(0, 10),
              chiefComplaint,
              examinationFindings,
              primaryDiagnosis,
              medicines,
              labOrders: selectedLabTests,
              radiologyOrders: selectedRadScans,
              followUpDate,
            })}
          >
            <Printer size={14} /> Preview Clinical Summary
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
            onClick={handleCompleteConsultation}
          >
            <CheckCircle2 size={16} /> Complete Consultation & Prescribe
          </button>
        </div>
      </div>

      {/* Modals Suite */}
      {printRxData && (
        <PrintPrescriptionModal
          consultation={printRxData}
          doctor={activeDoctor}
          onClose={() => setPrintRxData(null)}
        />
      )}

      {printSummaryData && (
        <PrintConsultationSummaryModal
          summary={printSummaryData}
          onClose={() => setPrintSummaryData(null)}
        />
      )}
    </div>
  );
}
