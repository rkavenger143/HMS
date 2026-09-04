import React, { useState } from 'react';
import {
  UtensilsCrossed, Search, Filter, Download, Plus, Eye,
  Printer, CheckCircle2, History, AlertTriangle, Edit
} from 'lucide-react';
import { useDiet } from '../context/DietContext';
import PrintDietChartModal from './modals/PrintDietChartModal';
import PrintBedsideDietCardModal from './modals/PrintBedsideDietCardModal';
import CreateDietChartModal from './modals/CreateDietChartModal';
import type { ComprehensiveDietChart } from '../../../types';

export default function PatientDietList() {
  const {
    admissions,
    dietCharts,
    approveDietChart,
    setSelectedAdmissionId,
    setActiveTab,
  } = useDiet();

  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedDietType, setSelectedDietType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [printChart, setPrintChart] = useState<ComprehensiveDietChart | null>(null);
  const [printBedsideCard, setPrintBedsideCard] = useState<ComprehensiveDietChart | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAdmId, setCreateAdmId] = useState<string | undefined>(undefined);

  const activeAdmissions = admissions.filter(a => a.status === 'active');

  const filteredAdmissions = activeAdmissions.filter(adm => {
    const q = search.toLowerCase();
    const chart = dietCharts.find(c => c.admissionId === adm.id && (c.status === 'active' || c.status === 'approved'));

    const matchesSearch =
      !search ||
      adm.patientName.toLowerCase().includes(q) ||
      adm.patientId.toLowerCase().includes(q) ||
      adm.id.toLowerCase().includes(q) ||
      adm.bedNumber.toLowerCase().includes(q) ||
      adm.admittingDoctorName.toLowerCase().includes(q);

    const matchesWard = selectedWard === 'ALL' || adm.ward === selectedWard;
    const matchesType = selectedDietType === 'ALL' || (chart && chart.dietType === selectedDietType);
    const matchesStatus = selectedStatus === 'ALL' || (chart ? chart.status === selectedStatus : selectedStatus === 'unassigned');

    return matchesSearch && matchesWard && matchesType && matchesStatus;
  });

  const handleOpenEHR = (admId: string) => {
    setSelectedAdmissionId(admId);
    setActiveTab('patient_profile');
  };

  const handleCreateForAdm = (admId: string) => {
    setCreateAdmId(admId);
    setShowCreateModal(true);
  };

  const handleExportCSV = () => {
    const headers = ['Adm ID', 'UHID', 'Patient Name', 'Ward', 'Bed', 'Doctor', 'Diet Type', 'Dietitian', 'Status'];
    const rows = filteredAdmissions.map(adm => {
      const chart = dietCharts.find(c => c.admissionId === adm.id && (c.status === 'active' || c.status === 'approved'));
      return [
        adm.id,
        adm.patientId,
        `"${adm.patientName}"`,
        `"${adm.ward}"`,
        adm.bedNumber,
        `"${adm.admittingDoctorName}"`,
        chart?.dietType || 'None',
        `"${chart?.dietitianName || 'Unassigned'}"`,
        chart?.status || 'No Chart',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `inpatient_diet_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Inpatient Diet Management & Roster</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Ward-wise inpatient census, prescribed diet categories, dietitian approvals, and tray prints
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={13} /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => handleCreateForAdm(activeAdmissions[0]?.id)}>
            <Plus size={13} /> Prescribe Diet Chart
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Name, UHID, Bed #..."
              style={{ paddingLeft: 36 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
            <option value="ALL">All Wards ({activeAdmissions.length})</option>
            <option value="General Ward A">General Ward A</option>
            <option value="Medical ICU">Medical ICU</option>
            <option value="Private Ward">Private Ward</option>
          </select>

          <select className="form-select" value={selectedDietType} onChange={e => setSelectedDietType(e.target.value)}>
            <option value="ALL">All Diet Types</option>
            <option value="regular">Regular Diet</option>
            <option value="diabetic">Diabetic Diet</option>
            <option value="cardiac">Cardiac Diet</option>
            <option value="renal">Renal Diet</option>
            <option value="soft">Soft Diet</option>
            <option value="npo">NPO (Fasting)</option>
          </select>

          <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="active">Active Diets</option>
            <option value="approved">Approved Diets</option>
            <option value="unassigned">No Diet Chart</option>
          </select>
        </div>
      </div>

      {/* Inpatient Diet Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Location</th>
                  <th>Attending Physician</th>
                  <th>Clinical Diagnosis</th>
                  <th>Prescribed Diet Type</th>
                  <th>Dietitian</th>
                  <th>Diet Status</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map(adm => {
                  const chart = dietCharts.find(c => c.admissionId === adm.id && (c.status === 'active' || c.status === 'approved'));

                  return (
                    <tr key={adm.id}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => handleOpenEHR(adm.id)}>
                          {adm.patientName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          UHID: {adm.patientId} · {((adm as any).gender || 'F').toUpperCase()}, {(adm as any).age || 35}y
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700 }}>
                          <span className="badge badge-primary">{adm.bedNumber}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{adm.ward}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{adm.admittingDoctorName}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{adm.diagnosis[0] || 'Inpatient Observation'}</div>
                      </td>

                      <td>
                        {chart ? (
                          <div>
                            <span className="badge badge-primary">{chart.dietType.toUpperCase().replace('_', ' ')}</span>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{chart.estimatedCalories} kcal · {chart.dietConsistency}</div>
                          </div>
                        ) : (
                          <span className="badge badge-warning">NO DIET CHART</span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: 12 }}>{chart?.dietitianName || 'Unassigned'}</div>
                      </td>

                      <td>
                        {chart ? (
                          <span className={`badge ${chart.status === 'active' || chart.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                            {chart.status.toUpperCase()}
                          </span>
                        ) : (
                          <span className="badge badge-neutral">PENDING</span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{chart?.updatedAt || '—'}</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-icon btn-icon-sm"
                            title="Open 6-Tab Nutrition Profile"
                            onClick={() => handleOpenEHR(adm.id)}
                          >
                            <Eye size={13} />
                          </button>

                          {chart ? (
                            <>
                              <button
                                className="btn btn-ghost btn-icon btn-icon-sm"
                                title="Print Bedside Tray Card"
                                onClick={() => setPrintBedsideCard(chart)}
                              >
                                <UtensilsCrossed size={13} />
                              </button>
                              <button
                                className="btn btn-ghost btn-icon btn-icon-sm"
                                title="Print Official Diet Chart"
                                onClick={() => setPrintChart(chart)}
                              >
                                <Printer size={13} />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, height: 28 }}
                              onClick={() => handleCreateForAdm(adm.id)}
                            >
                              <Plus size={11} /> Create
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {printChart && <PrintDietChartModal chart={printChart} onClose={() => setPrintChart(null)} />}
      {printBedsideCard && <PrintBedsideDietCardModal chart={printBedsideCard} onClose={() => setPrintBedsideCard(null)} />}
      {showCreateModal && <CreateDietChartModal initialAdmissionId={createAdmId} onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
