import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface UseVoiceAssistantOptions {
  onTranscriptComplete?: (transcript: string) => void;
  isMutedDefault?: boolean;
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const { onTranscriptComplete, isMutedDefault = false } = options;

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(isMutedDefault);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Clean Markdown characters for smooth vocal synthesis
  const cleanTextForSpeech = useCallback((raw: string): string => {
    return raw
      .replace(/\[ID:[^\]]+\]/g, '') // remove IDs
      .replace(/[*_#`~>]/g, '') // remove markdown symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace markdown links with text
      .replace(/\n+/g, '. ') // convert linebreaks to pauses
      .replace(/https?:\/\/\S+/g, '') // remove URLs
      .trim();
  }, []);

  // Stop active speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore already stopped
      }
    }

    // Clean up mic stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAudioLevel(0);
    setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
  }, []);

  // Stop speech synthesis (TTS interruption)
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
    setVoiceState((prev) => (prev === 'speaking' ? 'idle' : prev));
  }, []);

  // Full interrupt (stops speaking or listening immediately)
  const interrupt = useCallback(() => {
    stopSpeaking();
    stopListening();
    setVoiceState('idle');
  }, [stopSpeaking, stopListening]);

  // Start audio waveform analyzer
  const startAudioAnalyzer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      // If mic stream is denied or fails, fallback to animated waveform
      console.warn('Microphone stream access denied or unavailable, using simulated wave:', err);
    }
  };

  // Start speech recognition
  const startListening = useCallback(() => {
    // If speaking, interrupt first
    stopSpeaking();
    setErrorMessage(null);
    setInterimTranscript('');
    setFinalTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage('Speech recognition is not supported in this browser. Please use keyboard text input.');
      setVoiceState('error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState('listening');
        startAudioAnalyzer();
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }
        if (currentFinal) {
          setFinalTranscript(currentFinal);
          setInterimTranscript('');
          stopListening();
          if (onTranscriptComplete) {
            onTranscriptComplete(currentFinal.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        stopListening();
        if (event.error === 'no-speech') {
          // User paused without talking; return to idle gently
          setVoiceState('idle');
        } else if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or type your question.');
          setVoiceState('error');
        } else if (event.error === 'audio-capture') {
          setErrorMessage('No microphone device detected. Please connect an audio input.');
          setVoiceState('error');
        } else {
          setErrorMessage(`Speech recognition error (${event.error}). Please try again or type.`);
          setVoiceState('error');
        }
      };

      recognition.onend = () => {
        stopListening();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage('Could not initialize microphone. Please check permissions.');
      setVoiceState('error');
    }
  }, [stopSpeaking, stopListening, onTranscriptComplete]);

  // Speak AI response with SpeechSynthesis
  const speakText = useCallback(
    (textToSpeak: string, onEndCallback?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      // If muted, skip speaking
      if (isMuted) {
        setVoiceState('idle');
        if (onEndCallback) onEndCallback();
        return;
      }

      // Interrupt any current speech
      window.speechSynthesis.cancel();

      const cleaned = cleanTextForSpeech(textToSpeak);
      if (!cleaned) {
        setVoiceState('idle');
        return;
      }

      // Break long speech into natural sentence chunks if needed to avoid browser timeout bugs
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05; // natural executive pace
      utterance.pitch = 1.0;

      // Select high quality English voice
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen') ||
              v.name.includes('Daniel') ||
              v.name.includes('Moira'))
        ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setVoiceState('speaking');
      };

      utterance.onend = () => {
        currentUtteranceRef.current = null;
        setVoiceState('idle');
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        currentUtteranceRef.current = null;
        setVoiceState('idle');
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted, cleanTextForSpeech]
  );

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    voiceState,
    setVoiceState,
    isListening: voiceState === 'listening',
    isSpeaking: voiceState === 'speaking',
    isThinking: voiceState === 'thinking',
    interimTranscript,
    finalTranscript,
    audioLevel,
    isMuted,
    toggleMute,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    interrupt,
    clearError: () => setErrorMessage(null),
  };
}
