import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Send, RefreshCw, Sparkles, AlertCircle, CheckCircle2,
  Mic, Volume2, VolumeX, Activity, ShieldCheck, Clock,
  ArrowRight, Radio, Search, Play, FileText, Check, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  processAICommand, AICommandResponse, AISearchResult,
  DetectedLanguage, computeLiveHospitalMetrics,
  getAIAuditLogs, AIAuditLogEntry, evaluateRealtimeVoiceStream
} from '../../services/aiCommandEngine';
import MedicalIcon from '../../components/common/MedicalIcons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  responsePayload?: AICommandResponse;
  requiresApproval?: boolean;
  approved?: boolean;
}

const COMMAND_MATRIX = {
  english: [
    { cmd: 'Open OPD', desc: 'Navigates to Outpatient Clinic' },
    { cmd: 'Open IPD', desc: 'Navigates to Inpatient & Bed Management' },
    { cmd: 'Show available beds', desc: 'Queries real-time hospital bed vacancy' },
    { cmd: 'Open Pharmacy', desc: 'Opens Pharmacy POS & Drug Inventory' },
    { cmd: 'Show low stock medicines', desc: 'Lists medicines below reorder level' },
    { cmd: 'Open Laboratory', desc: 'Opens Clinical Pathology diagnostics' },
    { cmd: 'Show pending lab tests', desc: 'Shows lab diagnostic orders in queue' },
    { cmd: 'Open Blood Bank', desc: 'Shows verified blood units inventory' },
    { cmd: 'Open Billing', desc: 'Navigates to Central Billing Desk' },
    { cmd: 'Show today\'s revenue', desc: 'Calculates realized hospital revenue' },
  ],
  telugu: [
    { cmd: 'OPD ఓపెన్ చేయి', desc: 'OPD విభాగానికి నావిగేట్ చేస్తుంది' },
    { cmd: 'IPD ఓపెన్ చేయండి', desc: 'ఇన్-పేషెంట్ మరియు బెడ్స్ విభాగానికి వెళ్తుంది' },
    { cmd: 'అందుబాటులో ఉన్న బెడ్స్ చూపించు', desc: 'ఖాళీ బెడ్ల వివరాలను లెక్కిస్తుంది' },
    { cmd: 'ఫార్మసీ ఓపెన్ చేయి', desc: 'ఫార్మసీ ఇన్వెంటరీ ఓపెన్ చేస్తుంది' },
    { cmd: 'ల్యాబ్ ఓపెన్ చేయి', desc: 'ల్యాబొరేటరీ టెస్ట్స్ విభాగాన్ని ఓపెన్ చేస్తుంది' },
    { cmd: 'బ్లడ్ బ్యాంక్ ఓపెన్ చేయి', desc: 'రక్త నిధి వివరాలను ప్రదర్శిస్తుంది' },
    { cmd: 'బిల్లింగ్ ఓపెన్ చేయి', desc: 'సెంట్రల్ బిల్లింగ్ కౌంటర్ ఓపెన్ చేస్తుంది' },
    { cmd: 'ఈరోజు OPD patients చూపించు', desc: 'ఈరోజు OPD క్యూ వివరాలు' },
  ],
  mixed: [
    { cmd: 'OPD section open cheyyi', desc: 'Direct navigation to OPD' },
    { cmd: 'IPD beds chupinchu', desc: 'Shows inpatient admissions & beds' },
    { cmd: 'Available beds chupinchu', desc: 'Live vacancy calculation' },
    { cmd: 'Pharmacy stock chupinchu', desc: 'Opens pharmacy inventory' },
    { cmd: 'Pending lab reports chupinchu', desc: 'Shows active diagnostic worklist' },
    { cmd: 'Blood bank inventory chupinchu', desc: 'Displays blood units' },
    { cmd: 'Billing outstanding chupinchu', desc: 'Shows unpaid hospital dues' },
    { cmd: 'Today OPD queue chupinchu', desc: 'Active triage token flow' },
  ]
};

export default function AIAssistant() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const userRole = state.user?.role || 'super_admin';

  const [activeTab, setActiveTab] = useState<'console' | 'chat' | 'matrix' | 'audit'>('console');
  const [selectedLang, setSelectedLang] = useState<'auto' | 'en' | 'te'>('auto');
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'navigating'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [autoNavEnabled, setAutoNavEnabled] = useState(true);
  const [commandResponse, setCommandResponse] = useState<AICommandResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AIAuditLogEntry[]>(() => getAIAuditLogs());

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello **${state.user?.name || 'Administrator'}**! I am the **ALN Cure Central AI Command Center**.\n\nYou can speak or type natural language commands in **English**, **తెలుగు (Telugu)**, or **Tanglish (Telugu-English Mixed)** to navigate modules, search hospital records, check live ICU/bed availability, or review clinical operations.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const hasExecutedRef = useRef(false);
  const metrics = computeLiveHospitalMetrics();

  // Web Speech API Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setVoiceStatus('listening');
        setSpeechError(null);
        hasExecutedRef.current = false;
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        const streamText = (final || interim).trim();
        if (!streamText) return;
        setVoiceQuery(streamText);

        if (hasExecutedRef.current) return;

        // REAL-TIME STREAMING EVALUATION (0ms lag)
        const evalResult = evaluateRealtimeVoiceStream(streamText, state.user?.role || 'super_admin', selectedLang);
        if (evalResult.isConfident && evalResult.confidence === 'HIGH' && evalResult.response) {
          hasExecutedRef.current = true;
          stopVoice();
          handleRunCommand(streamText);
          return;
        }

        if (final.trim() && !hasExecutedRef.current) {
          hasExecutedRef.current = true;
          stopVoice();
          handleRunCommand(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          setVoiceStatus('idle');
        } else {
          setSpeechError(`Voice error: ${event.error}. Please try again.`);
        }
        setVoiceStatus('idle');
      };

      recognition.onend = () => {
        if (voiceStatus === 'listening') {
          setVoiceStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang, voiceStatus, state.user?.role]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Voice output
  const speak = (text: string, lang: DetectedLanguage) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  const startVoice = () => {
    hasExecutedRef.current = false;
    if (recognitionRef.current) {
      try {
        setSpeechError(null);
        setVoiceStatus('listening');
        recognitionRef.current.lang = selectedLang === 'te' ? 'te-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Start voice failed:', e);
      }
    } else {
      setSpeechError('Speech recognition is not supported in this browser.');
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current && voiceStatus === 'listening') {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setVoiceStatus('idle');
  };

  const handleRunCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;
    stopVoice();

    const res = processAICommand(cmdText, userRole, selectedLang);
    setCommandResponse(res);
    setAuditLogs(getAIAuditLogs());

    if (res.voiceText) {
      speak(res.voiceText, res.detectedLanguage);
    }

    if (res.intentType === 'NAVIGATE' && res.targetRoute && autoNavEnabled) {
      setVoiceStatus('navigating');
      setTimeout(() => {
        navigate(res.targetRoute!);
      }, 1800);
    } else {
      setVoiceStatus('idle');
    }
  };

  const sendChatMessage = async (queryText?: string) => {
    const text = queryText || chatInput.trim();
    if (!text || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    const res = processAICommand(text, userRole, selectedLang);
    setAuditLogs(getAIAuditLogs());

    await new Promise(r => setTimeout(r, 600));

    let content = res.displayText;
    if (res.statSummary) {
      content += `\n\n📊 **${res.statSummary.label}**: **${res.statSummary.value}** (${res.statSummary.subtitle || ''})`;
    }
    if (res.results && res.results.length > 0) {
      content += `\n\n🔍 Found **${res.results.length}** related records in hospital database.`;
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      responsePayload: res,
      requiresApproval: text.toLowerCase().includes('prescription') || text.toLowerCase().includes('discharge'),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-content">
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, var(--color-primary), #10b981)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
              }}
            >
              <Brain size={22} style={{ color: 'white' }} />
            </div>
            <div>
              <div>ALN Cure AI Command Center</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Centralized Voice Control · Global Search · Operations Intelligence · Multilingual NLP
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls & Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 3, borderRadius: 8, border: '1px solid var(--border-default)' }}>
            <button
              className={`btn btn-sm ${activeTab === 'console' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('console')}
            >
              <Mic size={13} /> Voice Console
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('chat')}
            >
              <Brain size={13} /> AI Chat
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'matrix' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('matrix')}
            >
              <Sparkles size={13} /> Command Matrix
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('audit')}
            >
              <ShieldCheck size={13} /> Audit Logs ({auditLogs.length})
            </button>
          </div>

          {/* Audio Toggle */}
          <button
            className={`btn btn-sm ${isAudioEnabled ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ height: 32, width: 32, padding: 0, justifyContent: 'center' }}
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            title={isAudioEnabled ? 'Voice readout active' : 'Voice readout muted'}
          >
            {isAudioEnabled ? <Volume2 size={15} style={{ color: 'var(--color-primary)' }} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      {/* Live Operational Metrics Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <MedicalIcon name="opd" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>OPD WAITING</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{metrics.waitingOPD} Patients</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <MedicalIcon name="ipd" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>AVAILABLE BEDS</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{metrics.availableBeds} / {metrics.totalBeds}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(220, 38, 38, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>ICU VACANCIES</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{metrics.availableIcuBeds} Beds</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <MedicalIcon name="laboratory" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>PENDING LAB</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#7c3aed' }}>{metrics.pendingLab} Orders</div>
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(13, 148, 136, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
            <MedicalIcon name="pharmacy" size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>LOW STOCK MEDS</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0d9488' }}>{metrics.lowStockCount} Items</div>
          </div>
        </div>
      </div>

      {/* TAB 1: VOICE CONSOLE */}
      {activeTab === 'console' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          {/* Main Voice Command Console */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mic size={18} style={{ color: 'var(--color-primary)' }} /> Live Multilingual Voice Console
              </div>

              {/* Language Switcher */}
              <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 2, borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <button
                  className={`btn btn-sm ${selectedLang === 'auto' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '2px 8px', height: 24 }}
                  onClick={() => setSelectedLang('auto')}
                >
                  Auto Detect
                </button>
                <button
                  className={`btn btn-sm ${selectedLang === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '2px 8px', height: 24 }}
                  onClick={() => setSelectedLang('en')}
                >
                  English
                </button>
                <button
                  className={`btn btn-sm ${selectedLang === 'te' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 11, padding: '2px 8px', height: 24 }}
                  onClick={() => setSelectedLang('te')}
                >
                  తెలుగు
                </button>
              </div>
            </div>

            {/* Big Interactive Mic Button & Wave Animation */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 20px',
                background: voiceStatus === 'listening' ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-surface)',
                borderRadius: 16,
                border: voiceStatus === 'listening' ? '2px solid #ef4444' : '1px dashed var(--border-default)',
                transition: 'all 0.2s ease',
              }}
            >
              <button
                id="console-mic-trigger"
                onClick={voiceStatus === 'listening' ? stopVoice : startVoice}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: voiceStatus === 'listening' ? '#ef4444' : 'linear-gradient(135deg, var(--color-primary), #10b981)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: voiceStatus === 'listening' ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 10px 25px rgba(5, 150, 105, 0.35)',
                  transition: 'transform 0.2s ease',
                  transform: voiceStatus === 'listening' ? 'scale(1.08)' : 'scale(1)',
                }}
                aria-label="Start Voice Control"
              >
                <Mic size={34} />
              </button>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {voiceStatus === 'listening'
                    ? '🔴 Listening... Speak command in English or Telugu'
                    : voiceStatus === 'processing'
                    ? '⚡ Understanding your command...'
                    : voiceStatus === 'navigating'
                    ? '🚀 Navigating to destination...'
                    : 'Click microphone to speak'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Examples: "Open OPD", "IPD beds chupinchu", "ఫార్మసీ ఓపెన్ చేయి", "Available beds"
                </div>
              </div>

              {/* Auto Navigation Switch */}
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  id="auto-nav-toggle"
                  checked={autoNavEnabled}
                  onChange={e => setAutoNavEnabled(e.target.checked)}
                />
                <label htmlFor="auto-nav-toggle" style={{ cursor: 'pointer' }}>
                  Automatically navigate to section after command recognition
                </label>
              </div>
            </div>

            {/* Manual Command Input Form */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Type command here (English, Telugu, Tanglish)..."
                value={voiceQuery}
                onChange={e => setVoiceQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRunCommand(voiceQuery)}
              />
              <button className="btn btn-primary" onClick={() => handleRunCommand(voiceQuery)}>
                <Play size={14} /> Execute
              </button>
            </div>

            {speechError && (
              <div style={{ padding: '8px 12px', background: 'var(--color-danger-muted)', borderRadius: 8, color: 'var(--color-danger)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> {speechError}
              </div>
            )}
          </div>

          {/* Real-Time Command Interpretation & Action Card */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: 'var(--color-primary)' }} /> Live Response & Action Execution
            </div>

            {commandResponse ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Detected: {commandResponse.detectedLanguage.toUpperCase()} · Intent: {commandResponse.intentType}
                    </span>
                    <span className={`badge ${commandResponse.intentType === 'DENIED' ? 'badge-danger' : 'badge-success'}`}>
                      {commandResponse.intentType}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {commandResponse.displayText}
                  </div>
                </div>

                {commandResponse.statSummary && (
                  <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{commandResponse.statSummary.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>
                      {commandResponse.statSummary.value}
                    </div>
                    {commandResponse.statSummary.subtitle && (
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {commandResponse.statSummary.subtitle}
                      </div>
                    )}
                  </div>
                )}

                {commandResponse.targetRoute && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => navigate(commandResponse.targetRoute!)}
                  >
                    Open Destination ({commandResponse.targetRoute}) <ArrowRight size={14} />
                  </button>
                )}

                {commandResponse.results && commandResponse.results.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Matching Records ({commandResponse.results.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                      {commandResponse.results.map(r => (
                        <div
                          key={r.id}
                          onClick={() => navigate(r.route)}
                          style={{
                            padding: '8px 12px',
                            background: 'var(--bg-surface)',
                            borderRadius: 6,
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.subtitle}</div>
                          </div>
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                <Brain size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div>No command executed yet.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Speak or click a prompt on the left to see live neural execution.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI CHAT */}
      {activeTab === 'chat' && (
        <div style={{ height: 'calc(100vh - 300px)', display: 'flex', gap: 16 }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 6 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'user' ? 'var(--color-primary)' : 'linear-gradient(135deg, var(--color-primary), #10b981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700
                  }}>
                    {msg.role === 'user' ? state.user?.name?.[0] || 'U' : '✦'}
                  </div>
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      padding: '12px 16px',
                      background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--bg-surface)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      border: msg.role === 'assistant' ? '1px solid var(--border-default)' : 'none',
                      fontSize: 13, lineHeight: 1.6
                    }}>
                      {msg.content.split('\n').map((line, i) => {
                        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return <div key={i} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
                      })}

                      {msg.responsePayload?.targetRoute && (
                        <div style={{ marginTop: 10 }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'white', color: 'var(--color-primary)', border: '1px solid var(--border-default)', fontSize: 11 }}
                            onClick={() => navigate(msg.responsePayload!.targetRoute!)}
                          >
                            Open {msg.responsePayload.targetRoute} <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {isThinking && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                  <span className="spin" style={{ width: 14, height: 14, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  Processing operations data...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Box */}
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Ask about hospital data, OPD load, ICU beds, revenue in English, Telugu, or Tanglish..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
              />
              <button className="btn btn-primary" onClick={() => sendChatMessage()} disabled={!chatInput.trim() || isThinking}>
                <Send size={14} /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMAND MATRIX */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* English Matrix */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              🇬🇧 English Voice Commands
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COMMAND_MATRIX.english.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab('console');
                    setVoiceQuery(item.cmd);
                    handleRunCommand(item.cmd);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 6,
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>"{item.cmd}"</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.desc}</div>
                  </div>
                  <Play size={12} style={{ color: 'var(--color-primary)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Telugu Matrix */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              🇮🇳 Telugu Voice Commands (తెలుగు)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COMMAND_MATRIX.telugu.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab('console');
                    setVoiceQuery(item.cmd);
                    handleRunCommand(item.cmd);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 6,
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>"{item.cmd}"</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.desc}</div>
                  </div>
                  <Play size={12} style={{ color: 'var(--color-primary)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Mixed Tanglish Matrix */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚡ Telugu-English Mixed (Tanglish)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COMMAND_MATRIX.mixed.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab('console');
                    setVoiceQuery(item.cmd);
                    handleRunCommand(item.cmd);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 6,
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>"{item.cmd}"</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{item.desc}</div>
                  </div>
                  <Play size={12} style={{ color: 'var(--color-primary)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} /> AI Command Audit Trail
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Total Executions: <strong>{auditLogs.length}</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Role</th>
                  <th>Command / Query</th>
                  <th>Language</th>
                  <th>Intent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {log.userRole?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.query}
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>
                        {log.language?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {log.intent}
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : log.status === 'DENIED' ? 'badge-danger' : 'badge-warning'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

