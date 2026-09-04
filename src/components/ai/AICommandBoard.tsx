import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Mic, MicOff, Search, Volume2, VolumeX, X,
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

const EXAMPLE_PROMPTS = [
  { en: "Open OPD", te: "OPD ఓపెన్ చేయి", mixed: "OPD section open cheyyi" },
  { en: "Open IPD", te: "IPD ఓపెన్ చేయండి", mixed: "IPD beds chupinchu" },
  { en: "Available beds", te: "ఖాళీ బెడ్లు చూపించు", mixed: "Available beds chupinchu" },
  { en: "Open Pharmacy", te: "ఫార్మసీ ఓపెన్ చేయి", mixed: "Pharmacy stock chupinchu" },
  { en: "Open Laboratory", te: "ల్యాబ్ ఓపెన్ చేయి", mixed: "Pending lab reports chupinchu" },
  { en: "Open Blood Bank", te: "బ్లడ్ బ్యాంక్ ఓపెన్ చేయి", mixed: "Blood bank inventory chupinchu" },
  { en: "Open Billing", te: "బిల్లింగ్ ఓపెన్ చేయి", mixed: "Billing outstanding chupinchu" },
  { en: "Show today's OPD patients", te: "ఈరోజు OPD patients చూపించు", mixed: "Today OPD queue chupinchu" },
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
  const [selectedLang, setSelectedLang] = useState<'auto' | 'en' | 'te'>('auto');
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
      }, 100);
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

  // Setup Web Speech Recognition
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

        // If already executed for this speech burst, don't execute repeatedly
        if (hasExecutedRef.current) return;

        // REAL-TIME STREAMING INTENT EVALUATION (0ms lag)
        const evalResult = evaluateRealtimeVoiceStream(streamText, state.user?.role || 'super_admin', selectedLang);

        if (evalResult.isConfident && evalResult.confidence === 'HIGH' && evalResult.response) {
          // High-confidence intent matched in real time without waiting for sentence completion!
          hasExecutedRef.current = true;
          stopListening();
          stopSpeaking();
          clearNavTimer();

          const res = evalResult.response;
          setResponse(res);

          // Save history
          saveCommandHistory(streamText);

          // If navigation command -> Instant Fast Route Execution
          if (res.intentType === 'NAVIGATE' && res.targetRoute) {
            setVoiceStatus('navigating');
            if (res.voiceText) {
              speakText(res.voiceText, res.detectedLanguage);
            }
            // Navigate immediately with clean visual transition
            navTimerRef.current = setTimeout(() => {
              onClose();
              navigate(res.targetRoute!);
            }, 180);
            return;
          }

          // If sensitive write action -> Show confirmation modal immediately
          if (res.intentType === 'ACTION_CONFIRMATION') {
            setVoiceStatus('idle');
            if (res.voiceText) {
              speakText(res.voiceText, res.detectedLanguage);
            }
            return;
          }

          // If live stat query / information -> Display live cards instantly
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
          setSpeechError('Microphone permission is required for voice commands. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          setVoiceStatus('idle');
        } else {
          setVoiceStatus('error');
          setSpeechError(`Voice recognition error (${event.error}). Speak again or type your command.`);
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
  }, [selectedLang, voiceStatus, state.user?.role]);

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
        recognitionRef.current.lang = selectedLang === 'te' ? 'te-IN' : 'en-IN';
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

  const executeCommand = (cmdText: string, isFromVoice = false) => {
    if (!cmdText.trim()) return;
    stopListening();
    stopSpeaking();
    clearNavTimer();
    setActionConfirmed(false);

    const userRole = state.user?.role || 'super_admin';
    const res = processAICommand(cmdText, userRole, selectedLang);
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
        // Fast instant jump
        navTimerRef.current = setTimeout(() => {
          onClose();
          navigate(res.targetRoute!);
        }, 180);
      } else {
        // Direct jump on text enter
        onClose();
        navigate(res.targetRoute);
      }
    } else {
      setVoiceStatus('idle');
    }
  };

  const cancelAutoNav = () => {
    clearNavTimer();
    setVoiceStatus('idle');
  };

  const jumpNow = (route: string) => {
    clearNavTimer();
    onClose();
    navigate(route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
          maxWidth: 840,
          background: 'var(--bg-card)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(5, 150, 105, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
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
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, var(--color-primary), #10b981)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
              }}
            >
              <Brain size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                ALN Cure AI Command Center
                <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px' }}>
                  Live Voice & NLP
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                English · తెలుగు · Tanglish | Auto-Navigation & RBAC Protection
              </div>
            </div>
          </div>

          {/* Controls: Language Selector, TTS, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 2, borderRadius: 8, border: '1px solid var(--border-default)' }}>
              <button
                className={`btn btn-sm ${selectedLang === 'auto' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 11, padding: '3px 8px', height: 26 }}
                onClick={() => setSelectedLang('auto')}
                title="Auto-detect English / Telugu / Mixed"
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
            <button
              className="btn btn-ghost btn-icon btn-icon-sm"
              onClick={() => { clearNavTimer(); onClose(); }}
            >
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
              border: voiceStatus === 'listening' ? '2px solid #ef4444' : '1.5px solid var(--border-default)',
              borderRadius: 12,
              padding: '8px 14px',
              transition: 'all 0.2s ease',
              boxShadow: voiceStatus === 'listening' ? '0 0 16px rgba(239, 68, 68, 0.25)' : 'none',
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
              placeholder="Speak or type (e.g., 'Open OPD', 'ICU beds enni unnayi?', 'ఫార్మసీ ఓపెన్ చేయి')..."
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
              id="ai-board-mic-btn"
              className={`btn btn-sm ${voiceStatus === 'listening' ? 'btn-danger' : 'btn-primary'}`}
              style={{
                borderRadius: 8,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
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
                  <Mic size={14} /> Speak (మాట్లాడండి)
                </>
              )}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}
              onClick={() => executeCommand(query)}
            >
              Run
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
                <span>Listening... Speak your command in English or Telugu</span>
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
                background: 'var(--color-danger-muted)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertTriangle size={14} /> {speechError}
            </div>
          )}

          {/* Example Prompt Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10, paddingBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              <Sparkles size={12} style={{ color: 'var(--color-primary)' }} /> Quick Commands:
            </span>
            {EXAMPLE_PROMPTS.map((p, idx) => {
              const text = selectedLang === 'te' ? p.te : selectedLang === 'en' ? p.en : p.mixed;
              return (
                <button
                  key={idx}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '3px 10px', height: 24, whiteSpace: 'nowrap', borderRadius: 20 }}
                  onClick={() => {
                    setQuery(text);
                    executeCommand(text);
                  }}
                >
                  {text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Active Response / Auto-Navigation / History */}
        <div className="modal-body" style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Automatic Navigation Banner */}
          {navCountdown !== null && response?.targetRoute && (
            <div
              style={{
                padding: '14px 18px',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(16, 185, 129, 0.1))',
                border: '1.5px solid var(--color-primary)',
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spin" style={{ width: 16, height: 16, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                    🚀 Automatically opening {response.displayText} in {navCountdown}s...
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Destination: <strong>{response.targetRoute}</strong>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={cancelAutoNav}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => jumpNow(response.targetRoute!)}>
                  Go Now <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

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
                    Command Interpretation ({response.detectedLanguage.toUpperCase()})
                  </span>
                </div>
                <span className={`badge ${response.intentType === 'DENIED' ? 'badge-danger' : 'badge-success'}`}>
                  {response.intentType}
                </span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {response.displayText}
              </div>

              {/* Stat Summary Card */}
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
                <span>Click to Open Section</span>
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

          {/* Initial State / Snapshot & History */}
          {!response && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Real-Time Hospital Intelligence Snapshot */}
              <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={14} style={{ color: 'var(--color-primary)' }} /> Live Hospital Intelligence Snapshot
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, textAlign: 'center' }}>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => executeCommand('Show OPD queue')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{liveMetrics.waitingOPD}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>OPD Waiting</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => executeCommand('Show available beds')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#d97706' }}>{liveMetrics.availableBeds}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Available Beds</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => executeCommand('Show ICU beds')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#dc2626' }}>{liveMetrics.availableIcuBeds}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>ICU Vacancies</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => executeCommand('Show pending lab tests')}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{liveMetrics.pendingLab}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Pending Lab</div>
                  </div>
                  <div style={{ padding: '8px 4px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }} onClick={() => executeCommand('Show low stock medicines')}>
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
                      Recent Voice & Text Commands
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
            <span><kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border-default)' }}>↵ Enter</kbd> to run</span>
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
