import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send, Sparkles, X, Volume2, VolumeX, Mic, MicOff,
  Square, Trash2, ArrowRight, CheckCircle2, AlertTriangle,
  RefreshCw, ShieldCheck, Activity, Layers, CornerDownLeft, Play
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  processAICommand, AICommandResponse,
  MODULE_DISPLAY_NAMES, MODULE_SUGGESTIONS,
  getProactiveAIAlerts, ProactiveAIAlert, DetectedLanguage
} from '../../services/aiCommandEngine';
import MedicalIcon from '../common/MedicalIcons';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responsePayload?: AICommandResponse;
  timestamp: string;
}

export default function GlobalAIFloatingWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useAuth();
  const userRole = state.user?.role || 'super_admin';

  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activePayload, setActivePayload] = useState<AICommandResponse | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Active module information
  const currentPath = location.pathname;
  const matchedRouteKey = Object.keys(MODULE_DISPLAY_NAMES).find(k => k === currentPath || (k !== '/' && currentPath.startsWith(k))) || '/dashboard';
  const currentModuleInfo = MODULE_DISPLAY_NAMES[matchedRouteKey] || { name: 'Hospital Management', iconName: 'dashboard', dept: 'Clinical Operations' };
  const currentSuggestions = MODULE_SUGGESTIONS[matchedRouteKey] || MODULE_SUGGESTIONS['/dashboard'] || [];

  // Proactive alerts for current module
  const [alerts, setAlerts] = useState<ProactiveAIAlert[]>([]);
  useEffect(() => {
    setAlerts(getProactiveAIAlerts(userRole, currentPath));
  }, [userRole, currentPath]);

  // Load voices when available
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Initial welcome message per session
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-0',
          sender: 'assistant',
          text: `Hello **${state.user?.name || 'Staff'}**! I am your **ALN Cure Context-Aware AI Assistant**.\n\n📍 Active Module: **${currentModuleInfo.name}**\nAuto-Detect: **English** · **తెలుగు (Telugu)** · **Tanglish**.\nSpeak or type any command to automatically navigate modules and query live hospital data.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [currentModuleInfo.name, state.user?.name]);

  // Global custom event listener so Header or other components can open this AI widget
  useEffect(() => {
    const handleOpenAI = (e: any) => {
      const q = e?.detail?.query || '';
      const voice = e?.detail?.voice || false;
      setIsOpen(true);
      if (q) {
        handleExecute(q, false);
      } else if (voice) {
        setTimeout(() => startSpeechRecognition(), 150);
      }
    };
    window.addEventListener('aln_open_ai_assistant', handleOpenAI);
    return () => window.removeEventListener('aln_open_ai_assistant', handleOpenAI);
  }, [currentPath, userRole]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll to bottom of message list
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      stopStreaming();
      stopSpeechRecognition();
      stopSpeaking();
    }
  }, [isOpen]);

  // Speech Recognition with auto-detection for English / Telugu
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-IN'; // Multi-lingual Indian acoustics (English & Telugu)

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        stopSpeaking();
        try { window.dispatchEvent(new CustomEvent('aln_voice_listening_start')); } catch {}
      };

      let finalCaptured = '';

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = final || interim;
        setInputQuery(text);
        if (final && final.trim().length > 1) {
          finalCaptured = final.trim();
        }
      };

      rec.onerror = (e: any) => {
        setIsListening(false);
        try { window.dispatchEvent(new CustomEvent('aln_voice_listening_end')); } catch {}
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser.');
        } else if (e.error === 'no-speech') {
          setSpeechError("Sorry, I didn't understand. Please try again.");
        } else if (e.error !== 'aborted') {
          setSpeechError(`Voice input error (${e.error}). Please try again.`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        try { window.dispatchEvent(new CustomEvent('aln_voice_listening_end')); } catch {}
        if (finalCaptured && finalCaptured.trim().length > 1) {
          handleExecute(finalCaptured.trim(), true);
          finalCaptured = '';
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError(err.message || 'Could not start microphone');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Helper to find best matching TTS voice for language
  const getVoiceForLanguage = (lang: DetectedLanguage) => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'te' || lang === 'te-mixed') {
      // 1. Look for explicit Telugu voices
      const teluguVoice = voices.find(v =>
        v.lang.toLowerCase().startsWith('te') ||
        v.lang.toLowerCase().includes('te-in') ||
        v.name.toLowerCase().includes('telugu') ||
        v.name.toLowerCase().includes('mohan') ||
        v.name.toLowerCase().includes('shruti') ||
        v.name.toLowerCase().includes('kavya')
      );
      if (teluguVoice) return teluguVoice;

      // 2. Fallback to Indian English voice which handles Indian phonetics smoothly
      const indianVoice = voices.find(v =>
        v.lang.toLowerCase().includes('en-in') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('neerja') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('ravi')
      );
      if (indianVoice) return indianVoice;
    }

    // Default to Indian English / English voice
    const englishVoice = voices.find(v =>
      v.lang.toLowerCase().includes('en-in') ||
      v.lang.toLowerCase().startsWith('en')
    );
    return englishVoice || voices[0] || null;
  };

  // Text to Speech
  const speakMessage = (msgId: string, text: string, lang: DetectedLanguage = 'en') => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (currentlySpeakingId === msgId) {
        setCurrentlySpeakingId(null);
        return;
      }

      const clean = text.replace(/[*_#`~•]/g, '').replace(/\[.*?\]/g, '').trim();
      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      const voice = getVoiceForLanguage(lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || (lang === 'te' ? 'te-IN' : 'en-IN');
      } else {
        utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
      }

      utterance.rate = (lang === 'te' || lang === 'te-mixed') ? 0.92 : 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setCurrentlySpeakingId(msgId);
      };
      utterance.onend = () => {
        setCurrentlySpeakingId(null);
      };
      utterance.onerror = () => {
        setCurrentlySpeakingId(null);
      };

      setCurrentlySpeakingId(msgId);
      window.speechSynthesis.speak(utterance);
    } catch {
      setCurrentlySpeakingId(null);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  // Execute Query with Automatic Phase Detection, Auto-Navigation & Fast Progressive Display
  const handleExecute = (raw: string, isVoiceInput = false) => {
    const q = raw.trim();
    if (!q || isStreaming) return;

    setInputQuery('');
    stopSpeechRecognition();
    stopSpeaking();
    setSpeechError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingText('');

    // 1. Fast synchronous context-aware query processing & phase detection (0ms)
    const result = processAICommand(q, userRole, currentPath);
    setActivePayload(result);

    // 2. AUTOMATIC PHASE NAVIGATION: Navigate to the detected module immediately
    if (result.targetRoute && result.targetRoute !== location.pathname) {
      navigate(result.targetRoute);
    }

    const fullText = result.displayText || result.voiceText || 'Operation completed successfully.';
    const assistantMsgId = `ai-${Date.now()}`;

    // For direct navigation commands, render instantly with zero lag
    if (result.intentType === 'NAVIGATE') {
      setIsStreaming(false);
      setStreamingText('');
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: fullText,
        responsePayload: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (isVoiceInput || isAudioEnabled) {
        speakMessage(assistantMsgId, result.voiceText || fullText, result.detectedLanguage);
      }
      return;
    }

    // Ultra-rapid streaming simulation (8ms per chunk) for stat queries
    let currentIndex = 0;
    const chunkSize = 6;
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);

    streamTimerRef.current = setInterval(() => {
      currentIndex += chunkSize;
      if (currentIndex >= fullText.length) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setStreamingText('');
        setIsStreaming(false);

        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          sender: 'assistant',
          text: fullText,
          responsePayload: result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);

        // 3. Auto-play voice response if user spoke via microphone OR auto-voice is enabled
        if (isVoiceInput || isAudioEnabled) {
          speakMessage(assistantMsgId, result.voiceText || fullText, result.detectedLanguage);
        }
      } else {
        setStreamingText(fullText.slice(0, currentIndex));
      }
    }, 8);
  };

  const stopStreaming = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    if (isStreaming && streamingText) {
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: streamingText + ' _[Response stopped by user]_',
        responsePayload: activePayload || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
    setIsStreaming(false);
    setStreamingText('');
    stopSpeaking();
  };

  const clearChat = () => {
    stopStreaming();
    stopSpeaking();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Ready to assist in **${currentModuleInfo.name}**.\nSpeak or type anything in **English**, **తెలుగు**, or **Tanglish**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const handleActionRoute = (route?: string) => {
    if (route) {
      navigate(route);
      setIsOpen(false);
    }
  };

  const criticalAlertCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <>
      {/* 1. Global Floating Trigger Button in Bottom-Right */}
      <div className="global-ai-fab-container">
        {!isOpen && (
          <button
            id="global-ai-trigger-fab"
            className="global-ai-fab"
            onClick={() => setIsOpen(true)}
            title={`Ask ALN Cure AI (Active: ${currentModuleInfo.name}) — Press Ctrl+K`}
            aria-label="Open AI Assistant"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={17} />
              {criticalAlertCount > 0 && <span className="global-ai-fab-pulse" />}
            </div>
            <span>AI Assistant</span>
            <span
              style={{
                fontSize: '11px',
                background: 'rgba(255, 255, 255, 0.22)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 600,
                letterSpacing: '0.2px',
              }}
            >
              {currentModuleInfo.name.split(' ')[0]}
            </span>
          </button>
        )}
      </div>

      {/* 2. Sleek Floating AI Assistant Drawer */}
      {isOpen && (
        <div className="global-ai-drawer" role="dialog" aria-modal="true" aria-label="ALN Cure AI Assistant">
          {/* Header */}
          <div className="global-ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px' }}>
                    AI Assistant
                  </span>
                  <span className="global-ai-context-pill">
                    📍 {currentModuleInfo.name}
                  </span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9, marginTop: 2 }}>
                  Voice Command & Auto-Phase Navigation (English · తెలుగు)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Active Voice Speaking Indicator & Stop Button */}
              {currentlySpeakingId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(255, 255, 255, 0.22)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#ffffff',
                      fontWeight: 600,
                    }}
                  >
                    <Volume2 size={13} />
                    <span>Speaking...</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={stopSpeaking}
                    title="Stop voice output"
                    style={{
                      color: '#ffffff',
                      background: 'rgba(220, 38, 38, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Square size={10} fill="#ffffff" /> Stop
                  </button>
                </div>
              )}

              {/* Audio Auto-Play Toggle */}
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-icon-sm"
                onClick={() => {
                  if (isAudioEnabled) stopSpeaking();
                  setIsAudioEnabled(!isAudioEnabled);
                }}
                title={isAudioEnabled ? 'Auto-voice response enabled (Click to mute)' : 'Auto-voice response muted (Click to enable)'}
                style={{ color: '#ffffff', opacity: isAudioEnabled ? 1 : 0.6 }}
              >
                {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Clear Chat */}
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-icon-sm"
                onClick={clearChat}
                title="Clear conversation"
                style={{ color: '#ffffff', opacity: 0.9 }}
              >
                <Trash2 size={15} />
              </button>

              {/* Close Drawer */}
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-icon-sm"
                onClick={() => setIsOpen(false)}
                title="Close AI panel (Esc)"
                style={{ color: '#ffffff' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Module Context Alert / Proactive Bar */}
          {criticalAlertCount > 0 ? (
            <div
              style={{
                background: '#fee2e2',
                borderBottom: '1px solid #fca5a5',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                color: '#991b1b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <AlertTriangle size={13} style={{ color: '#dc2626' }} />
                <span>{criticalAlertCount} critical condition{criticalAlertCount > 1 ? 's' : ''} identified in {currentModuleInfo.name}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#dc2626', fontWeight: 800, padding: '2px 8px', fontSize: '11px', background: 'rgba(220, 38, 38, 0.1)', borderRadius: '4px' }}
                onClick={() => handleExecute(`Show critical alerts in ${currentModuleInfo.name}`, false)}
              >
                Inspect →
              </button>
            </div>
          ) : (
            <div
              style={{
                background: '#f0fdf4',
                borderBottom: '1px solid #bbf7d0',
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#166534',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                <span>No critical conditions identified in {currentModuleInfo.name}</span>
              </div>
            </div>
          )}

          {/* Body / Conversation Stream */}
          <div className="global-ai-body">
            {messages.map(msg => (
              <div key={msg.id} className={`ai-message-bubble ${msg.sender}`}>
                <div className={msg.sender === 'user' ? 'ai-bubble-content-user' : 'ai-bubble-content-assistant'}>
                  {/* Text Formatting */}
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('• ') || line.startsWith('- ')) {
                        return (
                          <div key={lIdx} style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                            <span style={{ color: '#059669', fontWeight: 700 }}>•</span>
                            <span>{line.replace(/^[•\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={lIdx} style={{ marginTop: lIdx > 0 ? 4 : 0 }}>
                          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </div>
                      );
                    })}
                  </div>

                  {/* Stat Summary Box if available */}
                  {msg.responsePayload?.statSummary && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          {msg.responsePayload.statSummary.label}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                          {msg.responsePayload.statSummary.value}
                        </div>
                        {msg.responsePayload.statSummary.subtitle && (
                          <div style={{ fontSize: '11px', color: '#475569', marginTop: 2 }}>
                            {msg.responsePayload.statSummary.subtitle}
                          </div>
                        )}
                      </div>
                      {msg.responsePayload.targetRoute && (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 6 }}
                          onClick={() => handleActionRoute(msg.responsePayload?.targetRoute)}
                        >
                          Open View →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Direct Nav Action Button */}
                  {msg.responsePayload?.targetRoute && !msg.responsePayload?.statSummary && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: '11.5px', padding: '5px 12px', borderRadius: 6 }}
                        onClick={() => handleActionRoute(msg.responsePayload?.targetRoute)}
                      >
                        Active Phase: {msg.responsePayload.targetRoute} <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                  {/* Voice Play / Stop Controls on Assistant Messages */}
                  {msg.sender === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: currentlySpeakingId === msg.id ? '#dc2626' : '#059669',
                          background: currentlySpeakingId === msg.id ? '#fee2e2' : 'rgba(5, 150, 105, 0.08)',
                          fontWeight: 600,
                        }}
                        onClick={() => {
                          if (currentlySpeakingId === msg.id) {
                            stopSpeaking();
                          } else {
                            const lang = msg.responsePayload?.detectedLanguage || 'en';
                            const voiceText = msg.responsePayload?.voiceText || msg.text;
                            speakMessage(msg.id, voiceText, lang);
                          }
                        }}
                        title={currentlySpeakingId === msg.id ? 'Stop voice output' : 'Play voice response'}
                      >
                        {currentlySpeakingId === msg.id ? (
                          <>
                            <Square size={11} fill="#dc2626" /> Stop Voice
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} /> Play Voice
                          </>
                        )}
                      </button>

                      {msg.responsePayload?.detectedLanguage && (
                        <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>
                          {msg.responsePayload.detectedLanguage === 'te' ? 'తెలుగు (Telugu)' : msg.responsePayload.detectedLanguage === 'te-mixed' ? 'తెలుగు / English' : 'English'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '10px', color: '#94a3b8', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', margin: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Live Streaming Response Text */}
            {isStreaming && (
              <div className="ai-message-bubble assistant">
                <div className="ai-bubble-content-assistant" style={{ borderLeft: '3px solid #059669' }}>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {streamingText}
                    <span className="spin" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#059669', marginLeft: 4 }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Contextual Suggestions Bar */}
          <div style={{ padding: '6px 14px 2px 14px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
              💡 Suggestions for {currentModuleInfo.name}:
            </div>
            <div className="ai-chips-scroll">
              {currentSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  className="ai-suggested-chip"
                  onClick={() => handleExecute(s.query, false)}
                  disabled={isStreaming}
                >
                  <span>⚡</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer & Input Controls */}
          <div className="global-ai-footer">
            {speechError && (
              <div style={{ fontSize: '11px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', padding: '6px 10px', borderRadius: '6px' }}>
                <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                <span>{speechError}</span>
              </div>
            )}

            {isListening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px', color: '#059669', fontWeight: 700, padding: '2px 4px' }}>
                <span className="spin" style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />
                <span>Listening... Speak naturally in English or తెలుగు (Telugu)</span>
              </div>
            )}

            <form
              onSubmit={e => {
                e.preventDefault();
                handleExecute(inputQuery, false);
              }}
              className="global-ai-input-row"
            >
              {/* Voice Mic Button */}
              <button
                id="ai-mic-btn"
                type="button"
                className="btn btn-ghost btn-icon btn-icon-sm"
                onClick={() => {
                  if (isListening) {
                    stopSpeechRecognition();
                  } else {
                    startSpeechRecognition();
                  }
                }}
                title={isListening ? 'Click to stop listening' : 'Start AI Voice Command (Auto-detects English / Telugu)'}
                style={{
                  color: isListening ? '#dc2626' : '#059669',
                  background: isListening ? '#fee2e2' : 'rgba(5, 150, 105, 0.08)',
                  boxShadow: isListening ? '0 0 0 2px rgba(220, 38, 38, 0.3)' : 'none',
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <input
                ref={inputRef}
                type="text"
                className="global-ai-input"
                placeholder={isListening ? 'Listening (English / తెలుగు)...' : `Ask or speak (e.g. show available beds, pending lab)...`}
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                disabled={isStreaming}
              />

              {/* Streaming Stop Button vs Send Button */}
              {isStreaming ? (
                <button
                  type="button"
                  className="global-ai-stop-btn"
                  onClick={stopStreaming}
                  title="Stop generating response"
                >
                  <Square size={11} fill="#dc2626" /> Stop
                </button>
              ) : (
                <button
                  type="submit"
                  className="global-ai-send-btn"
                  disabled={!inputQuery.trim()}
                  title="Send message (Enter)"
                >
                  <CornerDownLeft size={14} />
                </button>
              )}
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: '#94a3b8' }}>
              <span>NABH Verified Clinician AI · Press <strong>Ctrl+K</strong> to toggle</span>
              <span>v2.6 Enterprise</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
