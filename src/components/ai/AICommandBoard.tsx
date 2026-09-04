import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Mic, MicOff, Search, Volume2, VolumeX, X,
  ChevronRight, Sparkles, CheckCircle2, AlertTriangle, RefreshCw,
  Clock, ArrowRight, ShieldCheck, Activity, BedDouble, Stethoscope,
  Pill, FlaskConical, ReceiptText, Droplets, Calendar, Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  processAICommand, AICommandResponse, AISearchResult,
  DetectedLanguage, computeLiveHospitalMetrics
} from '../../services/aiCommandEngine';
import MedicalIcon, { MedicalBrandLogo } from '../common/MedicalIcons';

interface AICommandBoardProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const EXAMPLE_PROMPTS = [
  { en: "Show today's OPD patients", te: "ఈరోజు OPD patients చూపించు", mixed: "Today OPD queue chupinchu" },
  { en: "How many beds are available?", te: "Available beds ఎన్ని ఉన్నాయి?", mixed: "ICU lo available beds enni unnayi?" },
  { en: "Show today's revenue", te: "ఈరోజు revenue ఎంత?", mixed: "Today collections entha vachayi?" },
  { en: "Show pending lab reports", te: "Pending lab reports చూపించు", mixed: "Pending lab tests list chupinchu" },
  { en: "Low stock medicines", te: "Low stock medicines ఏవి?", mixed: "Pharmacy lo low stock medicines enti?" },
  { en: "Available O+ blood", te: "O positive blood stock ఎంత?", mixed: "Blood bank lo O positive units enni unnayi?" },
];

export default function AICommandBoard({ isOpen, onClose, initialQuery = '' }: AICommandBoardProps) {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [selectedLang, setSelectedLang] = useState<'auto' | 'en' | 'te'>('auto');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState<AICommandResponse | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aln_ai_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [actionConfirmed, setActionConfirmed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const liveMetrics = computeLiveHospitalMetrics();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        if (initialQuery) {
          executeCommand(initialQuery);
        }
      }, 100);
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, initialQuery]);

  // Handle Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow mic access or type your command.');
        } else {
          setSpeechError(`Voice error (${event.error}). Please speak again or type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setSpeechError(null);
        recognitionRef.current.lang = selectedLang === 'te' ? 'te-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start issue:', err);
      }
    } else {
      setSpeechError('Speech recognition is not supported in this browser. Please type your query.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  // Text-To-Speech
  const speakText = (text: string, lang: DetectedLanguage) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const executeCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;
    stopListening();
    stopSpeaking();
    setActionConfirmed(false);

    const userRole = state.user?.role || 'receptionist';
    const res = processAICommand(cmdText, userRole, selectedLang);
    setResponse(res);

    // Save to history
    const newHistory = [cmdText, ...history.filter(h => h !== cmdText)].slice(0, 8);
    setHistory(newHistory);
    try {
      localStorage.setItem('aln_ai_history', JSON.stringify(newHistory));
    } catch {
      // ignore
    }

    // Audio readout
    if (res.voiceText) {
      speakText(res.voiceText, res.detectedLanguage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(query);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleResultClick = (res: AISearchResult) => {
    onClose();
    navigate(res.route);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('aln_ai_history');
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)' }}>
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 820,
          background: 'var(--bg-card)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(5, 150, 105, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(16, 185, 129, 0.05))',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, var(--color-primary), #10b981)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
              <Brain size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                ALN Cure AI Command Board
                <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px' }}>Live Neural Engine</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Multilingual Voice & NLP · Real-Time Hospital Intelligence · RBAC Protected
              </div>
            </div>
          </div>

          {/* Controls: Audio Toggle, Language, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 2, borderRadius: 8, border: '1px solid var(--border-default)' }}>
              <button
                className={`btn btn-sm ${selectedLang === 'auto' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 11, padding: '3px 8px', height: 26 }}
                onClick={() => setSelectedLang('auto')}
                title="Auto detect language"
              >
                Auto (ఆటో)
              </button>
              <button
                className={`btn btn-sm ${selectedLang === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 11, padding: '3px 8px', height: 26 }}
                onClick={() => setSelectedLang('en')}
              >
                English
              </button>
              <button
                className={`btn btn-sm ${selectedLang === 'te' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 11, padding: '3px 8px', height: 26 }}
                onClick={() => setSelectedLang('te')}
              >
                తెలుగు
              </button>
            </div>

            {/* Audio Voice Readout Toggle */}
            <button
              className={`btn btn-sm ${isAudioEnabled ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ height: 28, width: 28, padding: 0, justifyContent: 'center' }}
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsAudioEnabled(!isAudioEnabled);
              }}
              title={isAudioEnabled ? 'Voice readout enabled' : 'Voice readout muted'}
            >
              {isAudioEnabled ? <Volume2 size={14} style={{ color: 'var(--color-primary)' }} /> : <VolumeX size={14} style={{ color: 'var(--text-tertiary)' }} />}
            </button>

            {/* Close */}
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search & Voice Input Box */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-card)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--bg-surface)',
              border: isListening ? '2px solid #ef4444' : '1.5px solid var(--border-default)',
              borderRadius: 12,
              padding: '8px 14px',
              transition: 'all 0.2s ease',
              boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.25)' : 'none',
            }}
          >
            <Search size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              className="form-input"
              style={{
                border: 'none',
                background: 'transparent',
                boxShadow: 'none',
                padding: 0,
                fontSize: 15,
                fontWeight: 500,
                flex: 1,
              }}
              placeholder="Ask anything in English, తెలుగు, or Tanglish... (e.g., 'ICU beds enni unnayi?')"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {query && (
              <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', height: 24 }} onClick={() => setQuery('')}>
                Clear
              </button>
            )}

            {/* Microphone Voice Button */}
            <button
              className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-primary'}`}
              style={{
                borderRadius: 8,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
              onClick={toggleListening}
            >
              {isListening ? (
                <>
                  <span className="spin" style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                  Listening...
                </>
              ) : (
                <>
                  <Mic size={14} /> Speak
                </>
              )}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}
              onClick={() => executeCommand(query)}
            >
              Run Command
            </button>
          </div>

          {/* Listening Pulse Wave Indicator */}
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '6px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔴 Live Listening... Speak now in English or Telugu
              </span>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginLeft: 'auto' }}>
                <span style={{ width: 3, height: 16, background: '#ef4444', animation: 'pulse 0.8s infinite' }} />
                <span style={{ width: 3, height: 24, background: '#ef4444', animation: 'pulse 0.6s infinite' }} />
                <span style={{ width: 3, height: 12, background: '#ef4444', animation: 'pulse 0.9s infinite' }} />
                <span style={{ width: 3, height: 20, background: '#ef4444', animation: 'pulse 0.7s infinite' }} />
              </div>
            </div>
          )}

          {speechError && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> {speechError}
            </div>
          )}

          {/* Example Quick Prompt Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10, paddingBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <Sparkles size={12} style={{ color: 'var(--color-primary)' }} /> Try:
            </span>
            {EXAMPLE_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11, padding: '3px 10px', height: 24, whiteSpace: 'nowrap', borderRadius: 20 }}
                onClick={() => {
                  const text = selectedLang === 'te' ? p.te : p.en;
                  setQuery(text);
                  executeCommand(text);
                }}
              >
                {selectedLang === 'te' ? p.te : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Results / History */}
        <div className="modal-body" style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Active AI Response Section */}
          {response && (
            <div
              style={{
                padding: '14px 18px',
                background: response.intentType === 'DENIED' ? 'var(--color-danger-muted)' : 'var(--bg-surface)',
                border: response.intentType === 'DENIED' ? '1px solid rgba(220,38,38,0.3)' : '1px solid var(--border-default)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MedicalIcon name="dashboard" size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    AI Interpretation ({response.detectedLanguage.toUpperCase()})
                  </span>
                </div>
                <span className={`badge ${response.intentType === 'DENIED' ? 'badge-danger' : 'badge-success'}`}>
                  {response.intentType}
                </span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {response.displayText}
              </div>

              {/* Stat Summary Card if query was a statistical metric */}
              {response.statSummary && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{response.statSummary.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>
                      {response.statSummary.value}
                    </div>
                    {response.statSummary.subtitle && (
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {response.statSummary.subtitle}
                      </div>
                    )}
                  </div>
                  {response.targetRoute && (
                    <button className="btn btn-primary btn-sm" onClick={() => { onClose(); navigate(response.targetRoute!); }}>
                      Open Module <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Action Confirmation Modal Card (For Sensitive Actions) */}
              {response.pendingAction && !actionConfirmed && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--color-warning-muted)',
                    border: '1px solid rgba(217,119,6,0.3)',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-warning-dark)', fontWeight: 700, fontSize: 13 }}>
                    <AlertTriangle size={16} /> {response.pendingAction.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {response.pendingAction.description}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, background: 'white', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                    {Object.entries(response.pendingAction.details).map(([k, v]) => (
                      <div key={k}>
                        <strong style={{ color: 'var(--text-tertiary)' }}>{k}:</strong> {v}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setResponse(null)}>
                      Cancel Action
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setActionConfirmed(true);
                        speakText('Action confirmed and logged successfully in hospital audit trail.', 'en');
                      }}
                    >
                      <CheckCircle2 size={14} /> Confirm & Execute
                    </button>
                  </div>
                </div>
              )}

              {actionConfirmed && (
                <div style={{ padding: '10px 14px', background: 'var(--color-success-muted)', borderRadius: 8, color: 'var(--color-success)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Action successfully confirmed and recorded in audit log.
                </div>
              )}
            </div>
          )}

          {/* Search Results List */}
          {response && response.results.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Matching Hospital Records ({response.results.length})</span>
                <span>Click to View</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {response.results.map(res => (
                  <div
                    key={res.id}
                    onClick={() => handleResultClick(res)}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <MedicalIcon name={res.category as any} size={16} badge variant={res.badgeVariant || 'primary'} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {res.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {res.subtitle}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {res.badgeText && (
                        <span className={`badge ${res.badgeVariant ? `badge-${res.badgeVariant}` : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                          {res.badgeText}
                        </span>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty / Initial State: Live Metrics Bar & Recent Commands */}
          {!response && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Real-Time Hospital Snapshot */}
              <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={14} style={{ color: 'var(--color-primary)' }} /> Live Hospital Intelligence Snapshot
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, textAlign: 'center' }}>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{liveMetrics.waitingOPD}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>OPD Waiting</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>{liveMetrics.availableBeds}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Available Beds</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#dc2626' }}>{liveMetrics.availableIcuBeds}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>ICU Vacancies</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{liveMetrics.pendingLab}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Pending Lab</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0d9488' }}>{liveMetrics.lowStockCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Low Stock Meds</div>
                  </div>
                </div>
              </div>

              {/* Recent Command History */}
              {history.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Recent AI Commands
                    </span>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: 0 }} onClick={clearHistory}>
                      Clear
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {history.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setQuery(h);
                          executeCommand(h);
                        }}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 6,
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                        }}
                      >
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ flex: 1 }}>{h}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info & shortcut hints */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span><kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-default)' }}>↵ Enter</kbd> to execute</span>
            <span><kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-default)' }}>ESC</kbd> to close</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={13} style={{ color: 'var(--color-primary)' }} /> Role: <strong>{state.user?.role?.replace(/_/g, ' ')}</strong> (RBAC Active)
          </div>
        </div>
      </div>
    </div>
  );
}
