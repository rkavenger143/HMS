/**
 * ALN Cure HMS — High-Performance Multilingual Text-to-Speech (TTS) Engine
 * 
 * Features:
 * 1. Native Multilingual Routing: Automatically handles English ('en-IN' / 'en-US') and Telugu ('te-IN').
 * 2. Strict Voice Isolation: Telugu responses are exclusively mapped to Telugu TTS voices or 'te-IN' locale;
 *    never forced to an unrelated English voice object.
 * 3. Asynchronous Voice Readiness: Detects voices when browser triggers 'onvoiceschanged' or immediately if ready.
 * 4. Zero-Lag Fast Execution: Instant playback with queue clearing and cancellation of previous audio.
 * 5. State Synchronization: Coordinates with Speech Recognition so microphone is never active during TTS readout.
 */

import type { DetectedLanguage } from './aiCommandEngine';

export interface TTSOptions {
  text: string;
  lang?: DetectedLanguage | 'en' | 'te' | 'te-mixed';
  id?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

class TextToSpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private currentUtteranceId: string | null = null;
  private isCurrentlySpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      try {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      } catch {}
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        this.voices = v;
        this.voicesLoaded = true;
      }
    } catch {
      this.voices = [];
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.initVoices();
    }
    return this.voices;
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return this.isCurrentlySpeaking || window.speechSynthesis.speaking;
  }

  public getCurrentlySpeakingId(): string | null {
    return this.currentUtteranceId;
  }

  /**
   * Finds the best matching voice for the target language.
   * If lang is 'te' / 'te-mixed':
   *   1. Look for genuine Telugu voices (e.g. te-IN, Mohan, Shruti, Kavya, Chitra, Telugu).
   *   2. If NO Telugu voice is available in the browser voice list, return NULL.
   *      CRITICAL: We do NOT return an English voice for Telugu text, as that causes
   *      garbled ASCII synthesis. Instead, we let the browser synthesize using utterance.lang = 'te-IN'.
   */
  public getBestVoiceForLanguage(lang: DetectedLanguage | 'en' | 'te' | 'te-mixed'): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'te' || lang === 'te-mixed') {
      // Look for Telugu voices
      const teluguVoice = voices.find(v => {
        const vLang = (v.lang || '').toLowerCase();
        const vName = (v.name || '').toLowerCase();
        return (
          vLang.startsWith('te') ||
          vLang.includes('te-in') ||
          vLang.includes('telugu') ||
          vName.includes('telugu') ||
          vName.includes('mohan') ||
          vName.includes('shruti') ||
          vName.includes('kavya') ||
          vName.includes('chitra')
        );
      });

      if (teluguVoice) return teluguVoice;

      // DO NOT fallback to English voice for Telugu text
      return null;
    }

    // For English: prioritize Indian English (en-IN) then standard English
    const indianEnglish = voices.find(v => {
      const vLang = (v.lang || '').toLowerCase();
      const vName = (v.name || '').toLowerCase();
      return (
        vLang.includes('en-in') ||
        vName.includes('india') ||
        vName.includes('neerja') ||
        vName.includes('heera') ||
        vName.includes('ravi')
      );
    });

    if (indianEnglish) return indianEnglish;

    const anyEnglish = voices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
    return anyEnglish || voices[0] || null;
  }

  /**
   * Cleans text from Markdown, emoji characters, and UI markup for crisp, natural TTS pronunciation.
   */
  public cleanTextForSpeech(input: string): string {
    if (!input) return '';
    return input
      .replace(/[*_#`~•]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link text](url) -> link text
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Synthesizes and speaks the given text aloud.
   */
  public speak(options: TTSOptions): void {
    if (!this.isSupported()) {
      options.onError?.(new Error('Speech synthesis not supported in this browser.'));
      return;
    }

    const { text, lang = 'en', id, rate, pitch, onStart, onEnd, onError } = options;
    const clean = this.cleanTextForSpeech(text);
    if (!clean) {
      options.onEnd?.();
      return;
    }

    // 1. Immediately cancel any currently active speech synthesis
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(clean);
      const isTelugu = lang === 'te' || lang === 'te-mixed';
      const matchedVoice = this.getBestVoiceForLanguage(lang);

      if (isTelugu) {
        utterance.lang = 'te-IN';
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
        // Smooth and natural articulation speed for Telugu
        utterance.rate = rate || 0.94;
        utterance.pitch = pitch || 1.0;
      } else {
        utterance.lang = matchedVoice?.lang || 'en-IN';
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
        utterance.rate = rate || 1.0;
        utterance.pitch = pitch || 1.0;
      }

      this.currentUtteranceId = id || `tts-${Date.now()}`;
      this.isCurrentlySpeaking = true;

      utterance.onstart = () => {
        this.isCurrentlySpeaking = true;
        this.broadcastTTSState(true, this.currentUtteranceId);
        onStart?.();
      };

      utterance.onend = () => {
        this.isCurrentlySpeaking = false;
        this.currentUtteranceId = null;
        this.broadcastTTSState(false, null);
        onEnd?.();
      };

      utterance.onerror = (event: any) => {
        this.isCurrentlySpeaking = false;
        this.currentUtteranceId = null;
        this.broadcastTTSState(false, null);
        // Ignore aborted error from intentional cancellation
        if (event?.error !== 'canceled' && event?.error !== 'interrupted') {
          onError?.(event);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.isCurrentlySpeaking = false;
      this.currentUtteranceId = null;
      this.broadcastTTSState(false, null);
      onError?.(err);
    }
  }

  /**
   * Immediately stops any active TTS readout.
   */
  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.isCurrentlySpeaking = false;
    const prevId = this.currentUtteranceId;
    this.currentUtteranceId = null;
    if (prevId) {
      this.broadcastTTSState(false, null);
    }
  }

  private broadcastTTSState(isSpeaking: boolean, id: string | null) {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('aln_tts_state_change', {
            detail: { isSpeaking, id }
          })
        );
      } catch {}
    }
  }
}

export const ttsService = new TextToSpeechService();
