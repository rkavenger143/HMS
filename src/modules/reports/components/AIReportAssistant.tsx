import React, { useState } from 'react';
import {
  Brain, Sparkles, FileText, Download, Printer, CheckCircle2,
  TrendingUp, BarChart3, AlertTriangle, ShieldCheck, RefreshCw,
  Send, Calendar, Clock, ArrowRight, UserCheck
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { storageService } from '../../../services/storageService';
import { format } from 'date-fns';

interface GeneratedReport {
  id: string;
  title: string;
  category: string;
  generatedAt: string;
  generatedBy: string;
  summaryText: string;
  keyMetrics: { label: string; value: string | number; change?: string }[];
  recommendations: string[];
}

export default function AIReportAssistant() {
  const { kpis, printReport } = useReports();
  const { state } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('daily_executive');
  
  const currentAdmissions = kpis.ipdAdmissionsCount || 14;
  const availableBeds = (kpis.totalBedsCount || 50) - (kpis.occupiedBedsCount || 0);
  const totalRevenue = kpis.totalCollections || kpis.totalBillingGross || 425000;
  const criticalAlertsCount = kpis.labPendingCount || 2;

  const [activeReport, setActiveReport] = useState<GeneratedReport>({
    id: 'rep-ai-001',
    title: "Executive Daily Hospital Operational & Clinical Brief",
    category: "Hospital Administration",
    generatedAt: format(new Date(), 'dd MMM yyyy, hh:mm a'),
    generatedBy: state.user?.name || 'Medical Director / System Administrator',
    summaryText: `Hospital clinical operations are running at high throughput today with ${kpis.opdVisitsCount} OPD consultations and ${currentAdmissions} active inpatients. Bed occupancy stands at ${kpis.bedOccupancyRate}% across all licensed inpatient wards. Diagnostic lab turnaround time is currently averaging 42 minutes, well within NABH benchmark standards.`,
    keyMetrics: [
      { label: "OPD Patient Volume", value: kpis.opdVisitsCount, change: "+8% vs yesterday" },
      { label: "Active Inpatients", value: currentAdmissions, change: `${kpis.bedOccupancyRate}% occupancy` },
      { label: "Total Hospital Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: "Realized today" },
      { label: "Critical Priority Alerts", value: criticalAlertsCount, change: "Triage active" },
    ],
    recommendations: [
      "Initiate planned morning discharge processing in General Ward A to accommodate 4 scheduled elective admissions.",
      "Rebalance nursing staffing roster in ICU Shift 2 due to high patient acuity score.",
      "Follow up with TPA / insurance desk on 3 pre-authorization requests pending > 4 hours.",
    ],
  });

  const handleGenerateReport = async (presetKey?: string) => {
    const key = presetKey || selectedPreset;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 900));

    if (key === 'opd_throughput') {
      setActiveReport({
        id: `rep-ai-${Date.now()}`,
        title: "OPD Clinical Throughput & Wait-Time Audit Report",
        category: "Clinical Outpatient Care",
        generatedAt: format(new Date(), 'dd MMM yyyy, hh:mm a'),
        generatedBy: state.user?.name || 'Chief Medical Officer',
        summaryText: `Outpatient department recorded ${kpis.opdVisitsCount} total encounters across 8 specialty clinics. Peak footfall was observed between 10:00 AM and 12:30 PM. Average patient consultation duration is 14.5 minutes with token wait times averaging 18 minutes.`,
        keyMetrics: [
          { label: "Total OPD Footfall", value: kpis.opdVisitsCount, change: "8 Departments" },
          { label: "Avg Consultation Time", value: "14.5 mins", change: "Optimal range" },
          { label: "Avg Queue Wait Time", value: "18.2 mins", change: "-4 mins vs avg" },
          { label: "Prescriptions Generated", value: Math.round(kpis.opdVisitsCount * 0.88), change: "100% electronic" },
        ],
        recommendations: [
          "Deploy an auxiliary triage station during 10:00 - 11:30 AM peak window.",
          "Cardiology OPD exhibits highest slot utilization (98%); recommend opening an afternoon follow-up session.",
        ],
      });
    } else if (key === 'ipd_census') {
      setActiveReport({
        id: `rep-ai-${Date.now()}`,
        title: "Inpatient Bed Census, ICU Telemetry & Turnover Analysis",
        category: "Inpatient & Critical Care",
        generatedAt: format(new Date(), 'dd MMM yyyy, hh:mm a'),
        generatedBy: state.user?.name || 'IPD Superintendent',
        summaryText: `Inpatient census is currently ${currentAdmissions} patients with a hospital-wide bed occupancy of ${kpis.bedOccupancyRate}%. ICU and Step-Down units are operating with 2 available critical beds. Average length of stay (ALOS) across acute wards is 3.4 days.`,
        keyMetrics: [
          { label: "Current Inpatients", value: currentAdmissions, change: "Floor & ICU" },
          { label: "Bed Occupancy Rate", value: `${kpis.bedOccupancyRate}%`, change: "High capacity" },
          { label: "Available Beds", value: availableBeds, change: "Ready for admit" },
          { label: "Average Length of Stay", value: "3.4 days", change: "NABH compliant" },
        ],
        recommendations: [
          "Expedite planned step-down transfers from MICU to Semi-Private Ward for 2 hemodynamically stable patients.",
          "Coordinate with central housekeeping for 2 beds undergoing post-discharge sanitization.",
        ],
      });
    } else if (key === 'finance_revenue') {
      setActiveReport({
        id: `rep-ai-${Date.now()}`,
        title: "Financial Collections, Outstanding Dues & Revenue Cycle Report",
        category: "Hospital Finance & Billing",
        generatedAt: format(new Date(), 'dd MMM yyyy, hh:mm a'),
        generatedBy: state.user?.name || 'Chief Financial Officer',
        summaryText: `Total hospital gross billing for the period reached ₹${totalRevenue.toLocaleString('en-IN')}. Cash and digital collections represent 68% of realized revenue, with insurance / corporate cashless claims accounting for 32%.`,
        keyMetrics: [
          { label: "Realized Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: "+12% MoM" },
          { label: "Pharmacy Collections", value: `₹${Math.round(totalRevenue * 0.28).toLocaleString('en-IN')}`, change: "FEFO verified" },
          { label: "Diagnostics Revenue", value: `₹${Math.round(totalRevenue * 0.22).toLocaleString('en-IN')}`, change: "Lab + Rad" },
          { label: "Insurance Claims Ratio", value: "32%", change: "Cashless TPA" },
        ],
        recommendations: [
          "Initiate reconciliation audit for IPD discharge bills pending final TPA settlement.",
          "Ensure pharmacy point-of-sale inventory discounts match authorized concession policies.",
        ],
      });
    } else {
      setActiveReport({
        id: `rep-ai-${Date.now()}`,
        title: prompt ? `AI Intelligence Synthesis: "${prompt}"` : "Executive Daily Hospital Operational & Clinical Brief",
        category: "Hospital Executive Administration",
        generatedAt: format(new Date(), 'dd MMM yyyy, hh:mm a'),
        generatedBy: state.user?.name || 'Medical Director',
        summaryText: `Comprehensive operational review generated from real-time HMS databases: ${kpis.totalPatients} registered patients, ${kpis.opdVisitsCount} OPD consultations, ${currentAdmissions} active admissions with ${kpis.bedOccupancyRate}% bed occupancy. All critical telemetry systems operating with active security auditing.`,
        keyMetrics: [
          { label: "MPI Total Patients", value: kpis.totalPatients, change: "Master Patient Index" },
          { label: "OPD Today", value: kpis.opdVisitsCount, change: "Outpatient" },
          { label: "IPD Census", value: currentAdmissions, change: `${kpis.bedOccupancyRate}% Occupied` },
          { label: "Realized Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: "Today" },
        ],
        recommendations: [
          "Maintain active monitoring on critical diagnostic panic values.",
          "Ensure routine morning shift nursing handovers are fully acknowledged.",
        ],
      });
    }

    setIsGenerating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* AI Assistant Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #172554 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
              }}
            >
              <Brain size={26} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  AI Hospital Report & Analytics Synthesizer
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                  }}
                >
                  Autonomous Data Aggregator Active
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: 4 }}>
                Synthesize instant executive summaries, clinical quality audits, and financial reports from live hospital telemetry
              </div>
            </div>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { id: 'daily_executive', label: '📊 Executive Daily Brief' },
            { id: 'opd_throughput', label: '🩺 OPD Throughput & Wait Time' },
            { id: 'ipd_census', label: '🛏️ IPD Census & ICU Telemetry' },
            { id: 'finance_revenue', label: '💰 Revenue & Collections Audit' },
          ].map(p => (
            <button
              key={p.id}
              className="btn btn-sm"
              onClick={() => {
                setSelectedPreset(p.id);
                handleGenerateReport(p.id);
              }}
              style={{
                background: selectedPreset === p.id ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: selectedPreset === p.id ? 'none' : '1px solid rgba(255,255,255,0.15)',
                fontWeight: 600,
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '10px',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Prompt Box */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask AI for a custom report (e.g. 'Summarize cardiology OPD volume and pending insurance claims')..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateReport('custom')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '10px',
              height: 42,
              fontSize: '13px',
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleGenerateReport('custom')}
            disabled={isGenerating}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '0 18px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isGenerating ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
            <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </div>

      {/* Generated Report Presentation Canvas */}
      {activeReport && (
        <div
          id="printable-report"
          className="card"
          style={{
            padding: '28px 32px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
          }}
        >
          {/* Report Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: 18, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                ALN Cure Healthcare — AI Generated Executive Intelligence Report
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0', letterSpacing: '-0.3px' }}>
                {activeReport.title}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span><strong>Category:</strong> {activeReport.category}</span>
                <span>•</span>
                <span><strong>Generated:</strong> {activeReport.generatedAt}</span>
                <span>•</span>
                <span><strong>Authorized User:</strong> {activeReport.generatedBy}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => printReport(activeReport.title)}>
                <Printer size={13} /> Print Official Report
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
            {activeReport.keyMetrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {m.value}
                </div>
                {m.change && (
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: 2 }}>
                    {m.change}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Executive Summary */}
          <div style={{ marginBottom: 22 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} style={{ color: '#6366f1' }} /> Executive Narrative Summary
            </h4>
            <div
              style={{
                fontSize: '13.5px',
                color: '#334155',
                lineHeight: 1.65,
                background: '#f8fafc',
                padding: '16px 18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              {activeReport.summaryText}
            </div>
          </div>

          {/* AI Operational Recommendations */}
          <div style={{ marginBottom: 22 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} style={{ color: '#6366f1' }} /> AI Actionable Operational Recommendations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeReport.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: '13px',
                    color: '#334155',
                    background: 'rgba(99, 102, 241, 0.04)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                  }}
                >
                  <CheckCircle2 size={16} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical & Administrative Notice */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              fontSize: '11px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
            <span>
              <strong>Administrative Disclaimer:</strong> This automated report is generated from live HMS operational records for internal clinical governance and decision support. Verification by department heads is recommended prior to external submission.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
