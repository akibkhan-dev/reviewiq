import React, { useEffect, useState } from 'react';
import { VoiceState } from '../hooks/useVoiceAssistant';
import { Mic, Volume2, Brain, AlertCircle, Sparkles } from 'lucide-react';

interface VoiceWaveformProps {
  state: VoiceState;
  audioLevel?: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  onMicClick?: () => void;
  isMuted?: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  state,
  audioLevel = 0,
  size = 'md',
  onMicClick,
  isMuted = false,
}) => {
  const [wavePhase, setWavePhase] = useState(0);

  // Smooth wave animation loop
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setWavePhase((prev) => (prev + 0.08) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute waveform bar heights
  const numBars = 16;
  const bars = Array.from({ length: numBars }, (_, i) => {
    if (state === 'listening') {
      const base = 0.25;
      const dynamic = (audioLevel / 100) * 0.75;
      const wave = Math.sin(wavePhase * 2 + i * 0.5) * 0.2;
      return Math.max(0.15, Math.min(1.0, base + dynamic + wave));
    }
    if (state === 'speaking') {
      const wave = Math.sin(wavePhase * 3 + i * 0.45) * 0.4 + 0.5;
      const secondWave = Math.cos(wavePhase * 2 + i * 0.3) * 0.2;
      return Math.max(0.2, Math.min(0.95, wave + secondWave));
    }
    if (state === 'thinking') {
      const wave = Math.sin(wavePhase * 1.5 + i * 0.35) * 0.25 + 0.35;
      return Math.max(0.2, Math.min(0.7, wave));
    }
    // Idle
    return Math.max(0.12, Math.sin(wavePhase + i * 0.4) * 0.08 + 0.16);
  });

  const getStatusLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening to your voice...';
      case 'thinking':
        return 'Analyzing customer reviews...';
      case 'speaking':
        return isMuted ? 'Speaking (Muted)' : 'Speaking response...';
      case 'error':
        return 'Attention needed';
      default:
        return 'Ready to assist';
    }
  };

  const getStatusBadgeClass = () => {
    switch (state) {
      case 'listening':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'thinking':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'speaking':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'error':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-5">
      {/* Visualizer Orb & Waveform Container */}
      <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
        {/* Outer concentric pulsing rings */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            state === 'listening'
              ? 'scale-110 border-2 border-violet-400/40 animate-ping opacity-30'
              : state === 'speaking'
              ? 'scale-105 border border-cyan-400/40 animate-pulse'
              : state === 'thinking'
              ? 'border border-violet-300/30 animate-spin'
              : 'border border-slate-200/60'
          }`}
          style={{ animationDuration: state === 'thinking' ? '6s' : '2.5s' }}
        />

        <div
          className={`absolute inset-3 rounded-full transition-all duration-500 pointer-events-none ${
            state === 'listening'
              ? 'bg-violet-500/10 border border-violet-400/40'
              : state === 'speaking'
              ? 'bg-cyan-500/10 border border-cyan-400/40'
              : state === 'thinking'
              ? 'bg-indigo-500/5 border border-indigo-300/30'
              : 'bg-slate-50/80 border border-slate-100'
          }`}
        />

        {/* Central Interactive Core Sphere */}
        <button
          type="button"
          onClick={onMicClick}
          aria-label={state === 'listening' ? 'Stop listening' : 'Start listening'}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-[#635BFF] to-[#06B6D4] text-white scale-105 ring-4 ring-violet-200 shadow-violet-500/25'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white shadow-cyan-500/20'
              : state === 'thinking'
              ? 'bg-gradient-to-tr from-indigo-600 to-violet-700 text-white animate-pulse'
              : state === 'error'
              ? 'bg-rose-50 border-2 border-rose-300 text-rose-600'
              : 'bg-white hover:bg-slate-50 border-2 border-slate-200/80 hover:border-violet-300 text-slate-800 hover:scale-105'
          }`}
        >
          {state === 'listening' ? (
            <Mic className="w-8 h-8 text-white animate-bounce" />
          ) : state === 'speaking' ? (
            <Volume2 className="w-8 h-8 text-cyan-300 animate-pulse" />
          ) : state === 'thinking' ? (
            <Brain className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '4s' }} />
          ) : state === 'error' ? (
            <AlertCircle className="w-8 h-8 text-rose-600" />
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-7 h-7 text-[#635BFF] transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                Tap to Speak
              </span>
            </div>
          )}
        </button>

        {/* Dynamic Waveform Bars around the core */}
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1 h-12 z-20 pointer-events-none px-4">
          {bars.map((heightFactor, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-100 ${
                state === 'listening'
                  ? 'bg-gradient-to-t from-[#635BFF] to-[#06B6D4]'
                  : state === 'speaking'
                  ? 'bg-gradient-to-t from-[#06B6D4] to-[#635BFF]'
                  : state === 'thinking'
                  ? 'bg-violet-400'
                  : 'bg-slate-300'
              }`}
              style={{
                height: `${Math.round(heightFactor * 36)}px`,
                opacity: state === 'idle' ? 0.4 : 0.9,
              }}
            />
          ))}
        </div>
      </div>

      {/* Status Pill */}
      <div className="flex flex-col items-center space-y-1.5 text-center">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${getStatusBadgeClass()}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'listening'
                ? 'bg-violet-600 animate-ping'
                : state === 'thinking'
                ? 'bg-cyan-600 animate-pulse'
                : state === 'speaking'
                ? 'bg-emerald-600 animate-pulse'
                : state === 'error'
                ? 'bg-rose-500'
                : 'bg-slate-400'
            }`}
          />
          <span>{getStatusLabel()}</span>
        </div>

        <p className="text-xs text-slate-500 max-w-xs">
          {state === 'listening'
            ? 'Speak clearly into your microphone'
            : state === 'speaking'
            ? 'Speaking response aloud • Tap to interrupt'
            : state === 'thinking'
            ? 'Grounding answer with real customer reviews'
            : 'Ask any question about sentiment, products, or customer complaints'}
        </p>
      </div>
    </div>
  );
};
