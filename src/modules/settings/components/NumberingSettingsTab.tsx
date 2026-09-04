import React, { useState } from 'react';
import {
  Hash, Save, RotateCcw, CheckCircle2, FileText,
  HelpCircle, Sparkles, Eye
} from 'lucide-react';
import { useSettings, NumberingConfig, DocumentNumberFormat } from '../context/SettingsContext';
import ResetConfirmationModal from './modals/ResetConfirmationModal';

interface NumberingRow {
  key: keyof NumberingConfig;
  title: string;
  category: string;
}

const NUMBERING_DOCUMENTS: NumberingRow[] = [
  { key: 'patientId', title: 'Patient MRN ID', category: 'Patient Demographics' },
  { key: 'appointmentNumber', title: 'Appointment Booking #', category: 'Scheduling' },
  { key: 'opdToken', title: 'OPD Queue Token #', category: 'Outpatient (OPD)' },
  { key: 'admissionNumber', title: 'IPD Admission Form #', category: 'Inpatient (IPD)' },
  { key: 'ipdNumber', title: 'IPD Inpatient Case #', category: 'Inpatient (IPD)' },
  { key: 'dischargeNumber', title: 'Discharge Summary Certificate #', category: 'Inpatient (IPD)' },
  { key: 'invoiceNumber', title: 'Tax Invoice Number', category: 'Central Billing' },
  { key: 'paymentNumber', title: 'Payment Transaction Ref #', category: 'Central Billing' },
  { key: 'receiptNumber', title: 'Payment Receipt Voucher #', category: 'Central Billing' },
  { key: 'refundNumber', title: 'Financial Refund Voucher #', category: 'Central Billing' },
  { key: 'labOrderNumber', title: 'Laboratory Test Order #', category: 'Diagnostics Lab' },
  { key: 'labReportNumber', title: 'Authorized Lab Report #', category: 'Diagnostics Lab' },
  { key: 'radiologyOrderNumber', title: 'Radiology Imaging Study #', category: 'Diagnostics Rad' },
  { key: 'pharmacyInvoiceNumber', title: 'Pharmacy Retail Invoice #', category: 'Pharmacy' },
  { key: 'bloodRequestNumber', title: 'Blood Transfusion Requisition #', category: 'Blood Bank' },
  { key: 'bloodBagNumber', title: 'Blood Bag Unit Barcode #', category: 'Blood Bank' },
  { key: 'purchaseOrderNumber', title: 'Pharmacy Purchase Order (PO) #', category: 'Procurement' },
];

export default function NumberingSettingsTab() {
  const { numbering, updateNumbering, resetToDefaults } = useSettings();
  const [formData, setFormData] = useState<NumberingConfig>(numbering);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const generatePreview = (fmt: DocumentNumberFormat): string => {
    const yearStr = fmt.includeYear ? (fmt.yearFormat === 'YYYY' ? '2026' : '26') : '';
    const numStr = String(fmt.startingNumber).padStart(fmt.digits, '0');
    if (yearStr) {
      return `${fmt.prefix}${fmt.separator}${yearStr}${fmt.separator}${numStr}`;
    }
    return `${fmt.prefix}${fmt.separator}${numStr}`;
  };

  const handleRowChange = (key: keyof NumberingConfig, field: keyof DocumentNumberFormat, val: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(formData).forEach(([k, v]) => {
      updateNumbering(k as keyof NumberingConfig, v);
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hash size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Central Document Numbering & Sequence Prefixes</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Configure standardized numbering formats, digit padding, year tags, and starting sequences across all hospital documents
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsResetOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveAll}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={13} /> Save Numbering Rules
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: '#059669' }} />
          All 17 document numbering schemas successfully updated and active!
        </div>
      )}

      {/* Numbering Table */}
      <form onSubmit={handleSaveAll}>
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span className="card-title">Hospital Document Sequences Master</span>
            <span className="badge badge-primary">17 Document Types</span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Type & Domain</th>
                    <th>Prefix</th>
                    <th>Separator</th>
                    <th>Include Year</th>
                    <th>Digits Padding</th>
                    <th>Next Sequence #</th>
                    <th>Live Example Format</th>
                  </tr>
                </thead>
                <tbody>
                  {NUMBERING_DOCUMENTS.map(row => {
                    const fmt = formData[row.key];
                    const preview = generatePreview(fmt);

                    return (
                      <tr key={row.key}>
                        <td>
                          <div>
                            <span className="badge badge-neutral" style={{ fontSize: 10, marginBottom: 2 }}>{row.category}</span>
                          </div>
                          <strong style={{ fontSize: 13 }}>{row.title}</strong>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={fmt.prefix}
                            onChange={e => handleRowChange(row.key, 'prefix', e.target.value.toUpperCase())}
                            style={{ width: 80, fontFamily: 'monospace', fontWeight: 600 }}
                            required
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={fmt.separator}
                            onChange={e => handleRowChange(row.key, 'separator', e.target.value as any)}
                            style={{ width: 65, fontFamily: 'monospace' }}
                          >
                            <option value="-">- (Hyphen)</option>
                            <option value="/">/ (Slash)</option>
                            <option value="_">_ (Underscore)</option>
                          </select>
                        </td>
                        <td>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={fmt.includeYear}
                              onChange={e => handleRowChange(row.key, 'includeYear', e.target.checked)}
                            />
                            <span>{fmt.includeYear ? 'YYYY (2026)' : 'No Year'}</span>
                          </label>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={fmt.digits}
                            onChange={e => handleRowChange(row.key, 'digits', Number(e.target.value))}
                            style={{ width: 95 }}
                          >
                            <option value={3}>3 Digits</option>
                            <option value={4}>4 Digits</option>
                            <option value={5}>5 Digits</option>
                            <option value={6}>6 Digits</option>
                            <option value={7}>7 Digits</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            value={fmt.startingNumber}
                            onChange={e => handleRowChange(row.key, 'startingNumber', Number(e.target.value))}
                            style={{ width: 100, fontFamily: 'monospace' }}
                            required
                          />
                        </td>
                        <td>
                          <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: 13, background: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: 4 }}>
                            {preview}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={15} /> Save All Document Numbering Schemes
          </button>
        </div>
      </form>

      <ResetConfirmationModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={() => {
          resetToDefaults('numbering');
          setFormData(numbering);
        }}
        categoryName="Document Numbering & Sequences"
      />
    </div>
  );
}
