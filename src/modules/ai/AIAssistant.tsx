import React, { useState } from 'react';
import { Brain, Send, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  requiresApproval?: boolean;
  approved?: boolean;
}

const SUGGESTED_QUERIES = [
  'Summarize today\'s hospital operations',
  'Which ICU beds are available right now?',
  'List patients with critical lab values today',
  'What medicines are at reorder level?',
  'Show pending radiology reports',
  'Generate discharge summary for a patient',
  'What is the OPD load for next week?',
  'AI-drafted prescription for fever with cough',
];

const AI_RESPONSES: Record<string, string> = {
  'icu': `**ICU & Critical Care — Bed Status (as of now)**\n\nTotal ICU Beds: 18\n- MICU: 6 occupied / 8 total (2 available)\n- SICU: 4 occupied / 4 total (FULL — 0 available)\n- CTICU: 4 occupied / 4 total (FULL — 0 available)\n- NICU: 1 occupied / 2 total (1 available)\n\n⚠️ SICU and CTICU are at 100% capacity. MICU-01 has 2 available beds.\n\n*For real-time bed allocation, contact the ICU charge nurse or bed coordinator.*`,
  'critical': `**Critical Lab Values — Today (2026-08-31)**\n\n🔴 **Ramesh Yadav (ALN-2026-00001)** — MICU\n- Troponin I: 2.45 ng/mL (Critical High > 1.2)\n- BNP: 1,850 pg/mL (Critical High > 900)\n- Creatinine: 2.4 mg/dL (High)\n\nStatus: Dr. Rajesh Kumar (Cardiologist) has been notified. MICU monitoring active.\n\n⚠️ Action Required: Cardiology team review and treatment plan update needed.\n\n*This is AI-compiled summary from lab data. Verify with laboratory directly.*`,
  'default': `I'm ALN Cure AI, your hospital operations assistant. I can help you with:\n\n📊 **Analytics**: Daily summaries, occupancy, revenue\n🏥 **Operations**: Bed management, OPD queue, ward status\n🔬 **Clinical Support**: Lab value summaries, pending reports (AI-assisted only)\n📋 **Documentation**: Draft discharge summaries, operation notes (requires clinician approval)\n💊 **Pharmacy**: Stock alerts, prescription tracking\n\nPlease ask me anything about hospital operations. For clinical decisions, all AI suggestions require review and approval by authorized medical staff.\n\n*Reminder: ALN Cure AI is an assistive tool. All clinical decisions must be made by qualified healthcare professionals.*`,
};

function getAIResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('icu') || q.includes('bed')) return AI_RESPONSES['icu'];
  if (q.includes('critical') || q.includes('lab')) return AI_RESPONSES['critical'];
  if (q.includes('summarize') || q.includes('operations')) return AI_RESPONSES['default'];
  return `I understand you're asking about: **"${query}"**\n\nBased on current hospital data:\n- Today's appointments: 12 scheduled, 3 completed, 4 waiting\n- Bed occupancy: 52.5% (42/80 beds)\n- Pending lab tests: 8\n- Pharmacy alerts: 4 low stock items\n\nFor specific detailed analysis, please provide more context or navigate to the relevant module.\n\n*ALN Cure AI provides operational assistance. Clinical decisions require qualified professional review.*`;
}

export default function AIAssistant() {
  const { state } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello, ${state.user?.name?.split(' ')[0]}! I'm **ALN Cure AI**, your hospital operations assistant.\n\nI can help you with operational summaries, data analysis, draft reports, and clinical support. All clinical suggestions require authorized medical staff review and approval.\n\nHow can I assist you today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = async (query?: string) => {
    const text = query || input.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(text),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      requiresApproval: text.toLowerCase().includes('prescription') || text.toLowerCase().includes('discharge'),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);
  };

  return (
    <div style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--color-ai), #64D2FF)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} style={{ color: 'white' }} />
            </div>
            ALN Cure AI
          </div>
          <div className="page-subtitle">AI-powered hospital operations assistant — All clinical suggestions require authorized staff review</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setMessages(messages.slice(0, 1))}>
          <RefreshCw size={13} /> Clear Chat
        </button>
      </div>

      {/* Disclaimer Banner */}
      <div style={{
        padding: '10px 16px', background: 'linear-gradient(135deg, var(--color-ai-muted), rgba(100,210,255,0.05))',
        border: '1px solid var(--color-ai-border)', borderRadius: 'var(--radius-md)', marginBottom: 16,
        display: 'flex', gap: 10, alignItems: 'center', fontSize: 13
      }}>
        <AlertCircle size={16} style={{ color: 'var(--color-ai)', flexShrink: 0 }} />
        <span style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--color-ai)' }}>AI Assistance Mode</strong> — ALN Cure AI provides operational insights and drafts. All clinical outputs (prescriptions, diagnoses, reports) must be reviewed, edited, and approved by a qualified healthcare professional before use.
        </span>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 16 }}>
        {/* Messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--color-primary)' : 'linear-gradient(135deg, var(--color-ai), #64D2FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700
                }}>
                  {msg.role === 'user' ? state.user?.name?.[0] || 'U' : '✦'}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '12px 16px',
                    background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--bg-card)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    border: msg.role === 'assistant' ? '1px solid var(--border-default)' : 'none',
                    fontSize: 13, lineHeight: 1.7
                  }}>
                    {msg.content.split('\n').map((line, i) => {
                      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return <div key={i} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
                    })}
                    {msg.requiresApproval && !msg.approved && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--color-warning-muted)', borderRadius: 8, fontSize: 12, color: 'var(--color-warning)' }}>
                        ⚠️ This AI-generated content requires approval by an authorized clinician before use.
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <button className="btn btn-success btn-sm"><CheckCircle2 size={10} /> Approve</button>
                          <button className="btn btn-secondary btn-sm">Request Edit</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-ai), #64D2FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>✦</div>
                <div className="ai-thinking" style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '4px 16px 16px 16px' }}>
                  <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                  <span>Analyzing hospital data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <input
              id="ai-chat-input"
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Ask ALN Cure AI about operations, data, reports... (AI cannot diagnose or prescribe independently)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <button className="btn btn-ai" onClick={() => sendMessage()} disabled={!input.trim() || isThinking}>
              <Send size={15} /> Send
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div className="card">
            <div className="card-header" style={{ padding: '12px 16px' }}>
              <Sparkles size={14} style={{ color: 'var(--color-ai)' }} />
              <span className="card-title" style={{ fontSize: 13 }}>Suggested Queries</span>
            </div>
            <div style={{ padding: '8px' }}>
              {SUGGESTED_QUERIES.map((q, i) => (
                <button key={i}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '8px 10px', textAlign: 'left', whiteSpace: 'normal' }}
                  onClick={() => sendMessage(q)}
                >
                  <span style={{ color: 'var(--color-ai)', marginRight: 6 }}>✦</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
