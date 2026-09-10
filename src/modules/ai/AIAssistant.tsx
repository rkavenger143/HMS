import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Send, RefreshCw, Sparkles, AlertCircle, CheckCircle2,
  Mic, Volume2, VolumeX, Activity, ShieldCheck, Clock,
  ArrowRight, Radio, Search, Play, FileText, Check, AlertTriangle, ChevronRight, Square
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  processAICommand, AICommandResponse, AISearchResult,
  DetectedLanguage, computeLiveHospitalMetrics,
  getAIAuditLogs, AIAuditLogEntry, evaluateRealtimeVoiceStream,
  getProactiveAIAlerts, ProactiveAIAlert
} from '../../services/aiCommandEngine';
import { speechService } from '../../services/speechRecognitionService';
import { ttsService } from '../../services/textToSpeechService';
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

const QUICK_PROMPT_CHIPS = [
  'OPD ఓపెన్ చేయి',
  'అపాయింట్మెంట్స్ ఓపెన్ చేయి',
  'అందుబాటులో ఉన్న బెడ్స్ చూపించు',
  'క్రిటికల్ పేషెంట్స్ చూపించు',
  'ఈరోజు అడ్మిట్ అయిన పేషెంట్స్ చూపించు',
  'ల్యాబొరేటరీ ఓపెన్ చేయి',
  'రేడియాలజీ ఓపెన్ చేయి',
  'ఫార్మసీ ఓపెన్ చేయి',
  'బిల్లింగ్ ఓపెన్ చేయి',
  'Available beds chupinchu',
];

export default function AIAssistant() {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = state.user?.role || 'super_admin';

  const [activeTab, setActiveTab] = useState<'console' | 'chat' | 'matrix' | 'audit'>('console');
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'navigating'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [autoNavEnabled, setAutoNavEnabled] = useState(true);
  const [commandResponse, setCommandResponse] = useState<AICommandResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AIAuditLogEntry[]>(() => getAIAuditLogs());
  const [proactiveAlerts, setProactiveAlerts] = useState<ProactiveAIAlert[]>(() => getProactiveAIAlerts(userRole, location.pathname));
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello **${state.user?.name || 'Administrator'}**! I am the **ALN Cure Central AI Command Center**.\n\nI automatically understand **English**, **తెలుగు (Telugu)**, and **Tanglish (Telugu-English Mixed)**. You can ask me to navigate modules, check live bed vacancies, review panic laboratory results, synthesize patient longitudinal dossiers, or monitor emergency trauma cases.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const isCancelledRef = useRef(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const metrics = computeLiveHospitalMetrics();

  useEffect(() => {
    setProactiveAlerts(getProactiveAIAlerts(userRole, location.pathname));
  }, [userRole, location.pathname]);

  // Clean up voice recognition and TTS on unmount
  useEffect(() => {
    return () => {
      speechService.abort();
      ttsService.stop();
    };
  }, []);

  // Synchronize TTS state across components
  useEffect(() => {
    const handleTTSStateChange = (e: any) => {
      const isSpeaking = e?.detail?.isSpeaking;
      const id = e?.detail?.id;
      if (isSpeaking && id) {
        setCurrentlySpeakingId(id);
      } else if (!isSpeaking) {
        setCurrentlySpeakingId(null);
      }
    };
    window.addEventListener('aln_tts_state_change', (handleTTSStateChange as EventListener));
    return () => window.removeEventListener('aln_tts_state_change', (handleTTSStateChange as EventListener));
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Voice output using centralized ttsService with strict Telugu isolation
  const speak = (text: string, lang: DetectedLanguage, id?: string) => {
    const msgId = id || `tts-${Date.now()}`;
    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      return;
    }
    ttsService.speak({
      id: msgId,
      text,
      lang,
      onStart: () => setCurrentlySpeakingId(msgId),
      onEnd: () => setCurrentlySpeakingId(null),
      onError: () => setCurrentlySpeakingId(null),
    });
  };

  const stopSpeaking = () => {
    ttsService.stop();
    setCurrentlySpeakingId(null);
  };

  const startVoice = () => {
    if (!speechService.isSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    setSpeechError(null);
    stopSpeaking();
    speechService.start({
      lang: 'en-IN',
      onInterim: (text) => {
        setVoiceQuery(text);
      },
      onFinal: (text) => {
        setVoiceQuery(text);
        handleRunCommand(text);
      },
      onStateChange: (state, error) => {
        if (state === 'listening') setVoiceStatus('listening');
        else if (state === 'processing') setVoiceStatus('processing');
        else setVoiceStatus('idle');

        if (error) {
          setSpeechError(error);
        } else if (state === 'listening' || state === 'processing') {
          setSpeechError(null);
        }
      }
    });
  };

  const stopVoice = () => {
    speechService.abort();
    setVoiceStatus('idle');
  };

  const handleRunCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;
    stopVoice();
    stopSpeaking();

    const res = processAICommand(cmdText, userRole, location.pathname);
    setCommandResponse(res);
    setAuditLogs(getAIAuditLogs());

    if (res.voiceText && isAudioEnabled) {
      speak(res.voiceText, res.detectedLanguage, 'live-response');
    }

    if (res.intentType === 'NAVIGATE' && res.targetRoute && autoNavEnabled) {
      setVoiceStatus('navigating');
      navigate(res.targetRoute!);
    } else {
      setVoiceStatus('idle');
    }
  };

  const stopGenerating = () => {
    isCancelledRef.current = true;
    setIsThinking(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Conversation history cleared. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const sendChatMessage = async (queryText?: string) => {
    const text = queryText || chatInput.trim();
    if (!text || isThinking) return;

    isCancelledRef.current = false;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    const res = processAICommand(text, userRole, location.pathname);
    setAuditLogs(getAIAuditLogs());

    // Instant/near-instant AI response (<150ms)
    await new Promise(r => setTimeout(r, 120));

    if (isCancelledRef.current) return;

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

  useEffect(() => {
    const passedQuery = (location.state as any)?.query;
    if (passedQuery) {
      setActiveTab('console');
      handleRunCommand(passedQuery);
    }
  }, [location.state]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-content">
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
              }}
            >
              <Sparkles size={22} style={{ color: 'white' }} />
            </div>
            <div>
              <div>ALN Cure Central AI Assistant</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Active Operations Intelligence · Proactive Triage · Multilingual NLP (English · తెలుగు · Tanglish)
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
              <Sparkles size={13} /> AI Chat
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

      {/* Proactive AI Alarms Banner */}
      {proactiveAlerts.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> Proactive AI Clinical & Operational Alerts ({proactiveAlerts.length} Actionable Events)
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>Zero-Latency Real-Time Monitoring</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {proactiveAlerts.slice(0, 3).map(pa => (
              <div
                key={pa.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pa.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {pa.description}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: 11, padding: '4px 10px', height: 28, flexShrink: 0 }}
                  onClick={() => navigate(pa.actionRoute)}
                >
                  {pa.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Suggested Question Chips Ribbon */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {QUICK_PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            className="btn btn-sm btn-ghost"
            style={{
              whiteSpace: 'nowrap',
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: 20,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
            onClick={() => {
              if (activeTab === 'chat') {
                sendChatMessage(chip);
              } else {
                setVoiceQuery(chip);
                handleRunCommand(chip);
              }
            }}
          >
            ✦ {chip}
          </button>
        ))}
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

              {/* Automatic Language Detection Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: 'var(--color-primary-muted)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Sparkles size={12} /> Auto-Detect Active (English · తెలుగు · Tanglish)
                </span>
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
                  Examples: "Which beds are available?", "Critical patients ఎవరు?", "Show today's admitted patients", "Pending lab reports చూపించు"
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
                placeholder="Type command or query in English, Telugu, or Tanglish..."
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
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {commandResponse.displayText.split('\n').map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--border-default)' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: 11, padding: '4px 10px', height: 26, gap: 5 }}
                      onClick={() => {
                        const textToSpeak = commandResponse.voiceText || commandResponse.displayText;
                        speak(textToSpeak, commandResponse.detectedLanguage, 'live-response');
                      }}
                    >
                      {currentlySpeakingId === 'live-response' ? (
                        <>
                          <Square size={10} style={{ fill: '#dc2626', color: '#dc2626' }} /> Stop Voice
                        </>
                      ) : (
                        <>
                          <Volume2 size={11} /> Play Voice
                        </>
                      )}
                    </button>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {commandResponse.detectedLanguage === 'te' ? 'తెలుగు (te-IN)' : commandResponse.detectedLanguage === 'te-mixed' ? 'తెలుగు / English' : 'English (en-IN)'}
                    </span>
                  </div>
                </div>

                {commandResponse.statSummary && (
                  <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{commandResponse.statSummary.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>
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
                <Sparkles size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div>No command executed yet.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Speak or click a prompt on the left to see live neural execution.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI CHAT */}
      {activeTab === 'chat' && (
        <div style={{ height: 'calc(100vh - 280px)', display: 'flex', gap: 16 }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border-default)', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} style={{ color: 'var(--color-primary)' }} /> Live Hospital Assistant
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {isThinking && (
                  <button className="btn btn-sm btn-ghost" style={{ fontSize: 11, color: 'var(--color-danger)' }} onClick={stopGenerating}>
                    Stop Generating
                  </button>
                )}
                <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }} onClick={clearChat}>
                  Clear Chat
                </button>
              </div>
            </div>

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

                      {msg.role === 'assistant' && (
                        <div style={{ marginTop: 10, paddingTop: 6, borderTop: '1px dashed var(--border-default)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ fontSize: 10, padding: '2px 8px', height: 24, borderRadius: 6, border: '1px solid var(--border-default)', gap: 4 }}
                            onClick={() => {
                              const textToSpeak = msg.responsePayload?.voiceText || msg.content;
                              const lang = msg.responsePayload?.detectedLanguage || 'en';
                              speak(textToSpeak, lang, msg.id);
                            }}
                          >
                            {currentlySpeakingId === msg.id ? (
                              <>
                                <Square size={10} style={{ fill: '#dc2626', color: '#dc2626' }} /> Stop Voice
                              </>
                            ) : (
                              <>
                                <Volume2 size={11} /> Play Voice
                              </>
                            )}
                          </button>
                          {msg.responsePayload?.detectedLanguage && (
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                              {msg.responsePayload.detectedLanguage === 'te' ? 'తెలుగు (te-IN)' : msg.responsePayload.detectedLanguage === 'te-mixed' ? 'తెలుగు / English' : 'English'}
                            </span>
                          )}
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

      {/* TAB 3: AUDIT LOGS */}
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

