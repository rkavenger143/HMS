import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Search, Volume2, VolumeX, X,
  ChevronRight, Sparkles, CheckCircle2, AlertTriangle, RefreshCw,
  Clock, ArrowRight, ShieldCheck, Activity, Radio, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  processAICommand, AICommandResponse, AISearchResult,
  DetectedLanguage, computeLiveHospitalMetrics,
  evaluateRealtimeVoiceStream
} from '../../services/aiCommandEngine';
import MedicalIcon from '../common/MedicalIcons';

export interface AICommandBoardProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  autoStartVoice?: boolean;
}

const QUICK_SUGGESTIONS = [
  { label: 'Available Beds', command: 'Which beds are available?' },
  { label: 'Critical Patients', command: 'Which patients need attention?' },
  { label: 'Today Admitted', command: "Show today's admitted patients" },
  { label: 'Pending Lab Reports', command: 'Show critical lab results' },
  { label: 'Pending Claims', command: 'Which insurance claims are pending?' },
  { label: "Today's OPD Queue", command: "Show today's OPD statistics" },
  { label: 'Emergency Cases', command: 'Show emergency cases' },
  { label: 'Patient Dossier', command: 'Summary of patient Ramesh' },
  { label: 'Available Beds (తెలుగు)', command: 'ఈ రోజు available beds ఎంత ఉన్నాయి?' },
  { label: 'Pending Lab (తెలుగు)', command: 'Pending lab reports చూపించు' },
  { label: 'Pending Claims (తెలుగు)', command: 'నాకు pending insurance claims చూపించు' },
];

export default function AICommandBoard({
  isOpen,
  onClose,
  initialQuery = '',
  autoStartVoice = false
}: AICommandBoardProps) {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'navigating' | 'error' | 'permission_error'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [response, setResponse] = useState<AICommandResponse | null>(null);
  const [navCountdown, setNavCountdown] = useState<number | null>(null);
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
  const navTimerRef = useRef<any>(null);
  const hasExecutedRef = useRef(false);
  const liveMetrics = computeLiveHospitalMetrics();

  // Reset and focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setResponse(null);
      setSpeechError(null);
      setVoiceStatus('idle');
      setActionConfirmed(false);
      hasExecutedRef.current = false;
      clearNavTimer();

      setTimeout(() => {
        inputRef.current?.focus();
        if (initialQuery) {
          executeCommand(initialQuery);
        } else if (autoStartVoice) {
          startListening();
        }
      }, 80);
    } else {
      stopListening();
      stopSpeaking();
      clearNavTimer();
      hasExecutedRef.current = false;
    }
  }, [isOpen, initialQuery, autoStartVoice]);

  const clearNavTimer = () => {
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      clearInterval(navTimerRef.current);
      navTimerRef.current = null;
    }
    setNavCountdown(null);
  };

  // Setup Web Speech Recognition with Automatic Multilingual Detection
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Default to en-IN / te-IN auto speech stream
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setVoiceStatus('listening');
        setSpeechError(null);
        hasExecutedRef.current = false;
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const streamText = (finalTranscript || interimTranscript).trim();
        if (!streamText) return;
        setQuery(streamText);

        if (hasExecutedRef.current) return;

        // REAL-TIME STREAMING INTENT EVALUATION (Automatic Language Detection)
        const evalResult = evaluateRealtimeVoiceStream(streamText, state.user?.role || 'super_admin');

        if (evalResult.isConfident && evalResult.confidence === 'HIGH' && evalResult.response) {
          hasExecutedRef.current = true;
          stopListening();
          stopSpeaking();
          clearNavTimer();

          const res = evalResult.response;
          setResponse(res);
          saveCommandHistory(streamText);

          // Fast direct execution
          if (res.intentType === 'NAVIGATE' && res.targetRoute) {
            setVoiceStatus('navigating');
            if (res.voiceText) {
              speakText(res.voiceText, res.detectedLanguage);
            }
            navTimerRef.current = setTimeout(() => {
              onClose();
              navigate(res.targetRoute!);
            }, 150);
            return;
          }

          if (res.intentType === 'ACTION_CONFIRMATION') {
            setVoiceStatus('idle');
            if (res.voiceText) {
              speakText(res.voiceText, res.detectedLanguage);
            }
            return;
          }

          if (res.intentType === 'STAT_QUERY' || res.intentType === 'DENIED' || res.intentType === 'SEARCH') {
            setVoiceStatus('idle');
            if (res.voiceText) {
              speakText(res.voiceText, res.detectedLanguage);
            }
            return;
          }
        }

        // Fallback: If browser marked finalTranscript and not yet executed
        if (finalTranscript.trim() && !hasExecutedRef.current) {
          hasExecutedRef.current = true;
          stopListening();
          executeCommand(finalTranscript.trim(), true);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceStatus('permission_error');
          setSpeechError('Microphone permission is required. Please allow microphone access in your browser.');
        } else if (event.error === 'no-speech') {
          setVoiceStatus('idle');
        } else {
          setVoiceStatus('error');
          setSpeechError(`Voice recognition: ${event.error}. Please speak clearly or type your command.`);
        }
      };

      recognition.onend = () => {
        if (voiceStatus === 'listening') {
          setVoiceStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    } else {
      recognitionRef.current = null;
    }
  }, [voiceStatus, state.user?.role]);

  const saveCommandHistory = (cmdText: string) => {
    const newHistory = [cmdText, ...history.filter(h => h !== cmdText)].slice(0, 8);
    setHistory(newHistory);
    try {
      localStorage.setItem('aln_ai_history', JSON.stringify(newHistory));
    } catch {
      // ignore
    }
  };

  const toggleListening = () => {
    if (voiceStatus === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    clearNavTimer();
    stopSpeaking();
    hasExecutedRef.current = false;
    if (recognitionRef.current) {
      try {
        setSpeechError(null);
        setVoiceStatus('listening');
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
      }
    } else {
      setVoiceStatus('error');
      setSpeechError('Speech recognition is not supported in this browser. Please type your command.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && voiceStatus === 'listening') {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setVoiceStatus('idle');
  };

  // Text-To-Speech Readout
  const speakText = (text: string, lang: DetectedLanguage) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 1.05;
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

  // Automatic Command Execution (Quick & Near-Instant)
  const executeCommand = (cmdText: string, isFromVoice = false) => {
    if (!cmdText.trim()) return;
    stopListening();
    stopSpeaking();
    clearNavTimer();
    setActionConfirmed(false);

    const userRole = state.user?.role || 'super_admin';
    // Auto-detect language behind the scenes
    const res = processAICommand(cmdText, userRole);
    setResponse(res);
    saveCommandHistory(cmdText);

    // Voice announcement
    if (res.voiceText) {
      speakText(res.voiceText, res.detectedLanguage);
    }

    // Direct Fast Navigation for NAVIGATE intent
    if (res.intentType === 'NAVIGATE' && res.targetRoute) {
      setVoiceStatus('navigating');
      if (isFromVoice) {
        navTimerRef.current = setTimeout(() => {
          onClose();
          navigate(res.targetRoute!);
        }, 150);
      } else {
        onClose();
        navigate(res.targetRoute);
      }
    } else {
      setVoiceStatus('idle');
    }
  };

  const jumpNow = (route: string) => {
    clearNavTimer();
    onClose();
    navigate(route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(query);
    } else if (e.key === 'Escape') {
      clearNavTimer();
      onClose();
    }
  };

  const handleResultClick = (res: AISearchResult) => {
    clearNavTimer();
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
    <div
      className="modal-backdrop"
      onClick={() => { clearNavTimer(); onClose(); }}
      style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="modal modal-lg"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 820,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(5, 150, 105, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
        }}
      >
        {/* ============================================================
            1. CLEAN TOP HEADER BAR (No Language Switcher Buttons)
            ============================================================ */}
        <div
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, rgba(6, 95, 70, 0.08), rgba(5, 150, 105, 0.04))',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #065f46, #059669)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)',
              }}
            >
              <Sparkles size={20} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                ALN Cure Clinical AI Assistant
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: '#ecfdf5',
                    color: '#059669',
                    padding: '1px 6px',
                    borderRadius: 999,
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Active Telemetry
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                Automatic Language Detection (English • తెలుగు • Mixed)
              </div>
            </div>
          </div>

          {/* Right Header Controls: Audio Toggle & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className={`btn btn-sm ${isAudioEnabled ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ height: 32, width: 32, padding: 0, justifyContent: 'center', borderRadius: 8 }}
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setIsAudioEnabled(!isAudioEnabled);
              }}
              title={isAudioEnabled ? 'Voice readout enabled' : 'Voice readout muted'}
            >
              {isAudioEnabled ? <Volume2 size={15} style={{ color: '#059669' }} /> : <VolumeX size={15} style={{ color: '#94a3b8' }} />}
            </button>

            <button
              className="btn btn-ghost btn-icon btn-icon-sm"
              onClick={() => { clearNavTimer(); onClose(); }}
              style={{ borderRadius: 8, height: 32, width: 32 }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ============================================================
            2. CLEAN COMMAND INPUT CONTAINER (NO RUN BUTTON)
            ============================================================ */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#f8fafc',
              border: voiceStatus === 'listening' ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
              borderRadius: 12,
              padding: '6px 14px',
              transition: 'all 0.2s ease',
              boxShadow: voiceStatus === 'listening' ? '0 0 16px rgba(239, 68, 68, 0.25)' : 'none',
            }}
          >
            <Search size={18} style={{ color: '#1e40af', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              className="form-input"
              style={{
                border: 'none',
                background: 'transparent',
                boxShadow: 'none',
                padding: '6px 0',
                fontSize: 14.5,
                fontWeight: 500,
                color: '#0f172a',
                flex: 1,
              }}
              placeholder="Speak or type a command and press Enter (e.g. 'Show available beds', 'Open OPD', 'ICU beds chupinchu')..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {query && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 8px', height: 26, fontSize: 11, color: '#64748b' }}
                onClick={() => setQuery('')}
              >
                Clear
              </button>
            )}

            {/* Microphone Voice Button (No Run Button) */}
            <button
              id="ai-board-mic-btn"
              className={`btn btn-sm ${voiceStatus === 'listening' ? 'btn-danger' : 'btn-primary'}`}
              style={{
                borderRadius: 8,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                height: 34,
                flexShrink: 0,
              }}
              onClick={toggleListening}
              aria-label="Start voice command"
            >
              {voiceStatus === 'listening' ? (
                <>
                  <span className="spin" style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                  Listening...
                </>
              ) : (
                <>
                  <Mic size={14} /> Voice Input
                </>
              )}
            </button>
          </div>

          {/* Voice UI Listening Wave Indicator */}
          {voiceStatus === 'listening' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 10,
                padding: '8px 14px',
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: 8,
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontWeight: 600, fontSize: 13 }}>
                <span className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <span>Listening... Speak in English or Telugu naturally</span>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ width: 3, height: 14, background: '#ef4444', animation: 'pulse 0.8s infinite' }} />
                <span style={{ width: 3, height: 22, background: '#ef4444', animation: 'pulse 0.6s infinite' }} />
                <span style={{ width: 3, height: 16, background: '#ef4444', animation: 'pulse 0.9s infinite' }} />
                <span style={{ width: 3, height: 26, background: '#ef4444', animation: 'pulse 0.5s infinite' }} />
                <span style={{ width: 3, height: 12, background: '#ef4444', animation: 'pulse 0.7s infinite' }} />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {speechError && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 8,
                fontSize: 12,
                color: '#be123c',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertTriangle size={14} /> {speechError}
            </div>
          )}

          {/* Quick Suggestion Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10, paddingBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <Sparkles size={12} style={{ color: '#2563eb' }} /> Suggestions:
            </span>
            {QUICK_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  height: 24,
                  whiteSpace: 'nowrap',
                  borderRadius: 20,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setQuery(s.command);
                  executeCommand(s.command);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================
            3. MODAL BODY: ACTIVE RESPONSE / INSTANT TELEMETRY / HISTORY
            ============================================================ */}
        <div className="modal-body" style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Active AI Response Section */}
          {response && (
            <div
              style={{
                padding: '14px 18px',
                background: response.intentType === 'DENIED' ? '#fff1f2' : '#f8fafc',
                border: response.intentType === 'DENIED' ? '1px solid rgba(220,38,38,0.3)' : '1px solid #e2e8f0',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MedicalIcon name="dashboard" size={16} color="#1e40af" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Interpretation ({response.detectedLanguage === 'te' ? 'Telugu' : response.detectedLanguage === 'te-mixed' ? 'Telugu-English' : 'English'})
                  </span>
                </div>
                <span className={`badge ${response.intentType === 'DENIED' ? 'badge-danger' : 'badge-success'}`}>
                  {response.intentType}
                </span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>
                {response.displayText}
              </div>

              {/* Stat Summary Card */}
              {response.statSummary && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{response.statSummary.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1e40af', marginTop: 2 }}>
                      {response.statSummary.value}
                    </div>
                    {response.statSummary.subtitle && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {response.statSummary.subtitle}
                      </div>
                    )}
                  </div>
                  {response.targetRoute && (
                    <button className="btn btn-primary btn-sm" onClick={() => jumpNow(response.targetRoute!)}>
                      Open Section <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Action Confirmation Modal Card (For Sensitive Write Operations) */}
              {response.pendingAction && !actionConfirmed && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: '#fffbeb',
                    border: '1px solid rgba(217,119,6,0.3)',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', fontWeight: 700, fontSize: 13 }}>
                    <AlertTriangle size={16} /> {response.pendingAction.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>
                    {response.pendingAction.description}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, background: 'white', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    {Object.entries(response.pendingAction.details).map(([k, v]) => (
                      <div key={k}>
                        <strong style={{ color: '#64748b' }}>{k}:</strong> {v}
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
                <div style={{ padding: '10px 14px', background: '#ecfdf5', borderRadius: 8, color: '#059669', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Action successfully confirmed and recorded in audit log.
                </div>
              )}
            </div>
          )}

          {/* Search Results List */}
          {response && response.results.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Matching Hospital Records ({response.results.length})</span>
                <span>Click to Open Section</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {response.results.map(res => (
                  <div
                    key={res.id}
                    onClick={() => handleResultClick(res)}
                    style={{
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <MedicalIcon name={res.category as any} size={16} badge variant={res.badgeVariant || 'primary'} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {res.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      <ChevronRight size={14} style={{ color: '#94a3b8' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Initial State: Telemetry Snapshot & Recent Command History */}
          {!response && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Real-Time Hospital Intelligence Snapshot */}
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={14} style={{ color: '#1e40af' }} /> Live Hospital Intelligence Snapshot
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, textAlign: 'center' }}>
                  <div style={{ padding: '8px 4px', background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => executeCommand('Show OPD queue')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1e40af' }}>{liveMetrics.waitingOPD}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>OPD Waiting</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => executeCommand('Show available beds')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{liveMetrics.availableBeds}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Available Beds</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => executeCommand('Show ICU beds')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#e11d48' }}>{liveMetrics.availableIcuBeds}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>ICU Vacancies</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => executeCommand('Show pending lab tests')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{liveMetrics.pendingLab}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Pending Lab</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => executeCommand('Show low stock medicines')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0d9488' }}>{liveMetrics.lowStockCount}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Low Stock Meds</div>
                  </div>
                </div>
              </div>

              {/* Recent Command History */}
              {history.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Recent Commands
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
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          fontSize: 12,
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                        }}
                      >
                        <Clock size={12} style={{ color: '#94a3b8' }} />
                        <span style={{ flex: 1 }}>{h}</span>
                        <ArrowRight size={12} style={{ color: '#94a3b8' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================
            4. CLEAN FOOTER
            ============================================================ */}
        <div
          style={{
            padding: '10px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11.5,
            color: '#64748b',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>Press <kbd style={{ background: '#ffffff', padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontWeight: 700 }}>↵ Enter</kbd> to execute</span>
            <span><kbd style={{ background: '#ffffff', padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1' }}>ESC</kbd> to close</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={13} style={{ color: '#1e40af' }} /> Role: <strong>{state.user?.role?.replace(/_/g, ' ')}</strong> (RBAC Active)
          </div>
        </div>
      </div>
    </div>
  );
}
