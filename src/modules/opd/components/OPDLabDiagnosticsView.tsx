import React, { useState } from 'react';
import {
  FlaskConical, Scan, Plus, Search, Filter, Clock, CheckCircle2,
  AlertCircle, Printer, Eye, FileText, ArrowRight
} from 'lucide-react';
import { useOPD } from '../context/OPDContext';
import OrderLabRequisitionModal from './modals/OrderLabRequisitionModal';
import OrderDiagnosticRequisitionModal from './modals/OrderDiagnosticRequisitionModal';

export default function OPDLabDiagnosticsView() {
  const { visits, patients, labRequests, radiologyOrders, createLabOrder, createDiagnosticOrder } = useOPD();
  const [activeSubTab, setActiveSubTab] = useState<'lab' | 'radiology'>('lab');
  const [search, setSearch] = useState('');
  const [showLabModal, setShowLabModal] = useState(false);
  const [showRadModal, setShowRadModal] = useState(false);

  const activeVisit = visits.find(v => v.status === 'in_consultation') || visits[0];
  const activePatient = activeVisit ? patients.find(p => p.id === activeVisit.patientId) || null : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Banner */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
            OPD Clinical Requisitions — Laboratory & Diagnostics
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Doctor consultation investigation orders dispatched to Central Laboratory and Radiology worklists
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowLabModal(true)}>
            <FlaskConical size={13} style={{ color: 'var(--color-info)' }} /> + Order Lab Test
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowRadModal(true)}>
            <Scan size={13} /> + Order Radiology Study
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeSubTab === 'lab' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('lab')}
        >
          <FlaskConical size={13} /> Pathology & Lab Orders ({labRequests.length})
        </button>
        <button
          className={`tab ${activeSubTab === 'radiology' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('radiology')}
        >
          <Scan size={13} /> Radiology & Imaging Orders ({radiologyOrders.length})
        </button>
      </div>

      {/* Content Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient Details</th>
                <th>Investigation Requested</th>
                <th>Prescribing Doctor</th>
                <th>Date & Time</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeSubTab === 'lab' ? (
                labRequests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {req.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{req.patientId}</div>
                    </td>
                    <td>
                      <strong>{req.tests?.[0]?.testName || 'Laboratory Test'}</strong>
                      {req.tests?.length > 1 && (
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>+{req.tests.length - 1} other tests</div>
                      )}
                    </td>
                    <td>Dr. {req.doctorName}</td>
                    <td>{req.requestDate}</td>
                    <td>
                      <span className={`badge ${req.priority === 'stat' ? 'badge-danger' : req.priority === 'urgent' ? 'badge-warning' : 'badge-neutral'}`} style={{ textTransform: 'uppercase', fontSize: 10 }}>
                        {req.priority || 'Routine'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${req.status === 'completed' ? 'badge-success' : req.status === 'processing' ? 'badge-primary' : 'badge-warning'}`}>
                        {(req.status || 'Pending').replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                radiologyOrders.map(study => (
                  <tr key={study.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {study.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{study.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{study.patientId}</div>
                    </td>
                    <td>
                      <strong style={{ textTransform: 'uppercase' }}>{study.modality} ({study.bodyPart})</strong>
                    </td>
                    <td>Dr. {study.doctorName}</td>
                    <td>{study.scheduledDate} {study.scheduledTime}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                        Routine
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${study.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {(study.status || 'Scheduled').replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requisition Modals */}
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
              tests: data.tests,
              priority: data.priority,
              clinicalNotes: data.clinicalNotes,
            });
            setShowLabModal(false);
          }}
        />
      )}

      {showRadModal && activeVisit && (
        <OrderDiagnosticRequisitionModal
          visit={activeVisit}
          patient={activePatient}
          onClose={() => setShowRadModal(false)}
          onSubmit={(data) => {
            createDiagnosticOrder({
              patientId: activeVisit.patientId,
              patientName: activeVisit.patientName,
              doctorId: activeVisit.doctorId,
              doctorName: activeVisit.doctorName,
              modalityType: data.modalityType,
              procedureName: data.procedureName,
              bodyPart: data.bodyPart,
              priority: data.priority,
              clinicalIndication: data.clinicalIndication,
              specialInstructions: data.specialInstructions,
            });
            setShowRadModal(false);
          }}
        />
      )}
    </div>
  );
}
