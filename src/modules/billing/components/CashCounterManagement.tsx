import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Filter, CheckCircle2, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import type { CashCounterSession } from '../../../types';

export default function CashCounterManagement() {
  const { cashSessions, openCashSession, closeCashSession } = useBilling();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [closingSession, setClosingSession] = useState<CashCounterSession | null>(null);

  // Open Form
  const [counterName, setCounterName] = useState('Main OPD Cash Counter 2');
  const [cashierName, setCashierName] = useState('Ananya Deshmukh');
  const [openingCash, setOpeningCash] = useState(5000);

  // Close Form
  const [actualCash, setActualCash] = useState(19050);

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(counterName, Number(openingCash), cashierName);
    alert(`Cash shift session opened for ${counterName}.`);
    setShowOpenModal(false);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingSession) return;

    closeCashSession(closingSession.id, Number(actualCash));
    alert(`Shift session for ${closingSession.counterName} closed successfully.`);
    setClosingSession(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Cash Counter Sessions & Cashier Shift Reconciliation</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Opening cash float logs, daily tender collections, refund balancing, and physical cash variance verification
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowOpenModal(true)}>
          <Plus size={13} /> Open Shift Counter Session
        </button>
      </div>

      {/* Grid of Cash Counter Sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {cashSessions.map(sess => {
          const isOpen = sess.status === 'open';

          return (
            <div
              key={sess.id}
              className="card"
              style={{
                padding: 20,
                borderLeft: `4px solid ${isOpen ? 'var(--color-success)' : 'var(--border-default)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{sess.counterName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      Cashier: <strong>{sess.cashierName}</strong> · Opened: {sess.openedAt}
                    </div>
                  </div>
                  <span className={`badge ${isOpen ? 'badge-success' : 'badge-neutral'}`}>
                    {isOpen ? 'ACTIVE SHIFT' : 'CLOSED'}
                  </span>
                </div>

                {/* Session Balances Breakdown */}
                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 12 }}>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Opening Float:</span>
                    <div>₹{sess.openingCash.toLocaleString()}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Cash Collections:</span>
                    <strong style={{ color: 'var(--color-success)' }}>+₹{sess.cashCollected.toLocaleString()}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>Card POS Receipts:</span>
                    <div>₹{sess.cardCollected.toLocaleString()}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-tertiary)' }}>UPI QR Receipts:</span>
                    <div>₹{sess.upiCollected.toLocaleString()}</div>
                  </div>

                  {sess.refundsDisbursed > 0 && (
                    <div style={{ gridColumn: '1 / -1', color: 'var(--color-danger)' }}>
                      Refunds Disbursed: <strong>-₹{sess.refundsDisbursed.toLocaleString()}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 800, padding: '6px 0' }}>
                  <span>Expected Physical Cash:</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{sess.expectedCash.toLocaleString()}</span>
                </div>

                {!isOpen && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: sess.variance === 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    <span>Actual Cash Verified:</span>
                    <strong>₹{sess.actualCash.toLocaleString()} ({sess.variance === 0 ? 'Balanced' : `Variance: ₹${sess.variance}`})</strong>
                  </div>
                )}
              </div>

              {isOpen && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: 10, marginTop: 12 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setClosingSession(sess);
                      setActualCash(sess.expectedCash);
                    }}
                  >
                    <Clock size={12} /> Close Shift & Reconcile Cash
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Open Session Modal */}
      {showOpenModal && (
        <div className="modal-backdrop" onClick={() => setShowOpenModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Open Cashier Shift Session</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setShowOpenModal(false)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleOpenSubmit}>
              <div className="modal-body">
                <div className="form-grid form-grid-2" style={{ gap: 14 }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Select Cash Counter</label>
                    <select className="form-select" value={counterName} onChange={e => setCounterName(e.target.value)}>
                      <option value="Main OPD Cash Counter 1">Main OPD Cash Counter 1</option>
                      <option value="Main OPD Cash Counter 2">Main OPD Cash Counter 2</option>
                      <option value="IPD Discharge Billing Counter">IPD Discharge Billing Counter</option>
                      <option value="Emergency 24x7 Billing Desk">Emergency 24x7 Billing Desk</option>
                      <option value="Pharmacy Cash Counter">Pharmacy Cash Counter</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cashier Name</label>
                    <input type="text" className="form-input" value={cashierName} onChange={e => setCashierName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Opening Float Cash (₹)</label>
                    <input type="number" step="100" min="0" className="form-input" value={openingCash} onChange={e => setOpeningCash(Number(e.target.value))} required />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowOpenModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Open Counter Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Session Modal */}
      {closingSession && (
        <div className="modal-backdrop" onClick={() => setClosingSession(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div className="modal-title">Close Shift & Reconcile Physical Cash</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{closingSession.counterName} ({closingSession.cashierName})</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={() => setClosingSession(null)} style={{ marginLeft: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleCloseSubmit}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Opening Float:</span>
                    <strong>₹{closingSession.openingCash.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Collected in Shift:</span>
                    <strong style={{ color: 'var(--color-success)' }}>+₹{closingSession.cashCollected.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: 6, marginTop: 4, fontWeight: 800 }}>
                    <span>Expected System Physical Cash:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>₹{closingSession.expectedCash.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Cash Counted in Drawer (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={actualCash}
                    onChange={e => setActualCash(Number(e.target.value))}
                    required
                  />
                </div>

                <div style={{ fontSize: 12, marginTop: 8 }}>
                  Variance: <strong style={{ color: (actualCash - closingSession.expectedCash) === 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    ₹{(actualCash - closingSession.expectedCash).toFixed(2)} {(actualCash - closingSession.expectedCash) === 0 ? '(Balanced)' : (actualCash - closingSession.expectedCash) > 0 ? '(Surplus)' : '(Shortage)'}
                  </strong>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setClosingSession(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={13} /> Finalize & Close Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
