/**
 * ALN Cure HMS — Session-Isolated Speech Recognition Engine
 * 
 * Features:
 * 1. Session Isolation: Every voice recognition invocation uses a unique session token
 *    to prevent stale closures and obsolete callbacks from executing old transcripts.
 * 2. Real-time Interim Streaming: Streams interim transcript for live UI feedback without
 *    prematurely executing commands.
 * 3. Single-Execution Lock: Guarantees that the final transcript is executed strictly once
 *    per session upon speech completion.
 * 4. Automatic State Broadcasting: Broadcasts 'idle' | 'listening' | 'processing' | 'success' | 'error'
 *    for synchronized UI across Header, Floating AI Widget, and AI Assistant Console.
 * 5. Multi-Lingual Acoustics: Uses en-IN acoustic model with support for Telugu script & Tanglish.
 */

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface SpeechSessionOptions {
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string) => void;
  onStateChange?: (state: VoiceState, error?: string | null) => void;
  lang?: string;
}

class SpeechRecognitionService {
  private recognition: any = null;
  private currentSessionId: number = 0;
  private isListening: boolean = false;
  private hasExecutedForSession: boolean = false;
  private activeFinalTranscript: string = '';
  private activeInterimTranscript: string = '';
  private currentOptions: SpeechSessionOptions | null = null;

  constructor() {
    // Check for browser support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = 'en-IN'; // Indian acoustic model captures English, Telugu, and Tanglish

        this.setupListeners();
      }
    }
  }

  public isSupported(): boolean {
    return !!(typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
  }

  public getVoiceState(): VoiceState {
    if (this.isListening) return 'listening';
    return 'idle';
  }

  private broadcastState(state: VoiceState, error: string | null = null) {
    if (this.currentOptions?.onStateChange) {
      this.currentOptions.onStateChange(state, error);
    }
    try {
      window.dispatchEvent(
        new CustomEvent('aln_voice_state_change', {
          detail: { state, error, sessionId: this.currentSessionId }
        })
      );
    } catch {}
  }

  private setupListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.broadcastState('listening');
    };

    this.recognition.onresult = (event: any) => {
      const thisSession = this.currentSessionId;
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Check if session is still valid
      if (thisSession !== this.currentSessionId) return;

      const trimmedFinal = final.trim();
      const trimmedInterim = interim.trim();

      if (trimmedFinal) {
        this.activeFinalTranscript = trimmedFinal;
      }
      if (trimmedInterim) {
        this.activeInterimTranscript = trimmedInterim;
      }

      const displayTranscript = trimmedFinal || trimmedInterim;
      if (displayTranscript && this.currentOptions?.onInterim) {
        this.currentOptions.onInterim(displayTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errorCode = event?.error || 'unknown';
      let errorMsg = 'Voice recognition error. Please try again.';

      if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
        errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (errorCode === 'no-speech') {
        errorMsg = 'No speech detected. Please speak clearly into your microphone.';
      } else if (errorCode === 'network') {
        errorMsg = 'Network error occurred during speech processing.';
      } else if (errorCode === 'aborted') {
        // Ignored as it was intentionally cancelled/aborted
        this.broadcastState('idle');
        return;
      }

      this.broadcastState('error', errorMsg);
    };

    this.recognition.onend = () => {
      const thisSession = this.currentSessionId;
      this.isListening = false;

      // Ensure session is current and has not executed yet
      if (thisSession === this.currentSessionId && !this.hasExecutedForSession) {
        const textToProcess = (this.activeFinalTranscript || this.activeInterimTranscript).trim();

        if (textToProcess && textToProcess.length >= 1) {
          this.hasExecutedForSession = true;
          this.broadcastState('processing');

          if (this.currentOptions?.onFinal) {
            this.currentOptions.onFinal(textToProcess);
          }

          // Transition to success/done state briefly
          setTimeout(() => {
            if (this.currentSessionId === thisSession) {
              this.broadcastState('success');
              setTimeout(() => {
                if (this.currentSessionId === thisSession) {
                  this.broadcastState('idle');
                }
              }, 1200);
            }
          }, 200);
        } else {
          this.broadcastState('idle');
        }
      } else {
        this.broadcastState('idle');
      }
    };
  }

  /**
   * Start a brand new speech session, strictly isolating from any previous transcript.
   */
  public start(options: SpeechSessionOptions) {
    if (!this.isSupported()) {
      options.onStateChange?.('error', 'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // 1. Terminate any previous ongoing session immediately
    this.abort();

    // 2. Initialize a fresh, isolated session
    this.currentSessionId = Date.now() + Math.floor(Math.random() * 1000);
    this.hasExecutedForSession = false;
    this.activeFinalTranscript = '';
    this.activeInterimTranscript = '';
    this.currentOptions = options;

    try {
      this.recognition.lang = options.lang || 'en-IN';
      this.recognition.start();
    } catch (err: any) {
      // If already started, abort and restart cleanly
      try {
        this.recognition.abort();
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (e: any) {
            this.broadcastState('error', e?.message || 'Could not start microphone');
          }
        }, 80);
      } catch (e: any) {
        this.broadcastState('error', e?.message || 'Could not start microphone');
      }
    }
  }

  /**
   * Stop listening naturally and allow final result to process.
   */
  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  /**
   * Immediately cancel speech session and ignore any pending callbacks.
   */
  public abort() {
    // Invalidate session ID so trailing callbacks are dropped
    this.currentSessionId = 0;
    this.isListening = false;
    this.hasExecutedForSession = true;
    this.activeFinalTranscript = '';
    this.activeInterimTranscript = '';

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
    }
    this.broadcastState('idle');
  }
}

export const speechService = new SpeechRecognitionService();
