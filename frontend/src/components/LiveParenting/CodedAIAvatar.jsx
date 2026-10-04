import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Activity, ShieldCheck } from 'lucide-react';

/**
 * CodedAIAvatar - Pure code-rendered Non-Human AI Companion ("Spark")
 * Built with SVG, CSS keyframe animations, and reactive state.
 *
 * Characteristics:
 * - 100% Free / Zero paid tools.
 * - Stays calm & static when idle or listening.
 * - Becomes vibrant and energetic when speaking guidance.
 */
export const CodedAIAvatar = ({
  isSpeaking = false,
  isListening = false,
  guidanceText = '',
  onSpeechComplete = () => {},
  muted = false,
  onToggleMute = () => {},
  language = 'en'
}) => {
  // Never show speaking animations or state if we are still actively listening
  const actuallySpeaking = isSpeaking && !isListening;

  const [blink, setBlink] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);

  // Natural periodic blinking when not in intense speaking mode
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  // Animate mouth equalizer frequencies when speaking
  useEffect(() => {
    if (!actuallySpeaking) {
      setMouthPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setMouthPhase((prev) => (prev + 1) % 6);
    }, 90);
    return () => clearInterval(interval);
  }, [actuallySpeaking]);

  // Audio Speech synthesis using Web Speech API (100% free, non-human companion pitch)
  useEffect(() => {
    if (!guidanceText || !actuallySpeaking || muted || isListening) {
      window.speechSynthesis?.cancel();
      return;
    }

    if (!('speechSynthesis' in window)) {
      onSpeechComplete();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(guidanceText);
    utterance.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    // Slightly elevated pitch and crisp pace for distinct non-human companion character
    utterance.pitch = 1.22;
    utterance.rate = 1.06;

    utterance.onend = () => {
      onSpeechComplete();
    };
    utterance.onerror = () => {
      onSpeechComplete();
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [guidanceText, actuallySpeaking, muted, language, onSpeechComplete, isListening]);

  // Dynamic waveform bars for mouth
  const barHeights = actuallySpeaking
    ? [
        8 + ((mouthPhase * 3) % 14),
        16 + ((mouthPhase * 5) % 18),
        26 + ((mouthPhase * 7) % 22),
        18 + ((mouthPhase * 4) % 16),
        10 + ((mouthPhase * 2) % 12),
      ]
    : [4, 6, 8, 6, 4];

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden text-white select-none">
      {/* Background Energy Matrix & Glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          actuallySpeaking
            ? 'opacity-40 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.35),transparent_70%)]'
            : isListening
            ? 'opacity-25 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.25),transparent_70%)]'
            : 'opacity-10 bg-[radial-gradient(circle_at_50%_40%,rgba(148,163,184,0.15),transparent_70%)]'
        }`}
      />

      {/* Orbiting Energetic Particle Rings (Burst when speaking) */}
      {actuallySpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 rounded-full border border-emerald-400/30 animate-ping opacity-25" />
          <div className="w-48 h-48 rounded-full border border-teal-300/40 animate-pulse opacity-40" />
          <div className="w-64 h-64 rounded-full border border-cyan-400/20 animate-spin opacity-30" style={{ animationDuration: '6s' }} />
        </div>
      )}

      {/* Top Header Badge */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
            Kiko • AI Coach
          </span>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Always Available
          </span>
        </div>

        <button
          onClick={onToggleMute}
          title={muted ? 'Unmute coach' : 'Mute coach'}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Avatar Head SVG Container */}
      <div className="relative my-2 z-10 flex items-center justify-center">
        <div
          className={`relative transition-transform duration-300 ${
            actuallySpeaking ? 'scale-105' : 'scale-100'
          }`}
          style={{ animationDuration: actuallySpeaking ? '1.4s' : '0s' }}
        >
          <svg
            width="170"
            height="170"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          >
            <defs>
              <linearGradient id="bodyGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1E293B" />
                <stop offset="0.5" stopColor="#0F172A" />
                <stop offset="1" stopColor="#020617" />
              </linearGradient>

              <linearGradient id="screenGrad" x1="40" y1="50" x2="160" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#022C22" />
                <stop offset="0.6" stopColor="#064E3B" />
                <stop offset="1" stopColor="#022C22" />
              </linearGradient>

              <linearGradient id="eyeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Antenna with Live Radar Pulse */}
            <path d="M100 35 L100 15" stroke={actuallySpeaking ? '#34D399' : '#64748B'} strokeWidth="4" strokeLinecap="round" />
            <circle
              cx="100"
              cy="12"
              r={actuallySpeaking ? 7 : 5}
              fill={actuallySpeaking ? '#10B981' : isListening ? '#38BDF8' : '#64748B'}
              filter="url(#glow)"
              className={actuallySpeaking ? 'animate-ping' : ''}
            />

            {/* Robot Head Frame */}
            <rect
              x="30"
              y="35"
              width="140"
              height="130"
              rx="36"
              fill="url(#bodyGrad)"
              stroke={actuallySpeaking ? '#10B981' : '#334155'}
              strokeWidth="4"
            />

            {/* Ear Sensory Pods */}
            <rect x="18" y="75" width="12" height="40" rx="6" fill={actuallySpeaking ? '#059669' : '#1E293B'} stroke="#334155" strokeWidth="2" />
            <rect x="170" y="75" width="12" height="40" rx="6" fill={actuallySpeaking ? '#059669' : '#1E293B'} stroke="#334155" strokeWidth="2" />

            {/* Face Screen Visor */}
            <rect
              x="45"
              y="52"
              width="110"
              height="96"
              rx="24"
              fill="url(#screenGrad)"
              stroke="#047857"
              strokeWidth="2"
            />

            {/* Glowing Digital Eyes */}
            {blink ? (
              // Blinking line
              <>
                <line x1="65" y1="85" x2="85" y2="85" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
                <line x1="115" y1="85" x2="135" y2="85" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : (
              // Open glowing digital eyes
              <>
                {/* Left Eye */}
                <circle
                  cx="75"
                  cy="85"
                  r={actuallySpeaking ? 12 : 10}
                  fill="url(#eyeGrad)"
                  filter="url(#glow)"
                />
                <circle cx="78" cy="82" r="3.5" fill="#FFFFFF" />

                {/* Right Eye */}
                <circle
                  cx="125"
                  cy="85"
                  r={actuallySpeaking ? 12 : 10}
                  fill="url(#eyeGrad)"
                  filter="url(#glow)"
                />
                <circle cx="128" cy="82" r="3.5" fill="#FFFFFF" />
              </>
            )}

            {/* Rosy Cheeks when Speaking */}
            {actuallySpeaking && (
              <>
                <ellipse cx="62" cy="104" rx="7" ry="4" fill="#34D399" opacity="0.45" filter="url(#glow)" />
                <ellipse cx="138" cy="104" rx="7" ry="4" fill="#34D399" opacity="0.45" filter="url(#glow)" />
              </>
            )}

            {/* Digital Equalizer Mouth */}
            <g transform="translate(72, 114)">
              <rect x="0" y={14 - barHeights[0] / 2} width="5" height={barHeights[0]} rx="2.5" fill="#34D399" />
              <rect x="13" y={14 - barHeights[1] / 2} width="5" height={barHeights[1]} rx="2.5" fill="#34D399" />
              <rect x="26" y={14 - barHeights[2] / 2} width="5" height={barHeights[2]} rx="2.5" fill="#10B981" />
              <rect x="39" y={14 - barHeights[3] / 2} width="5" height={barHeights[3]} rx="2.5" fill="#34D399" />
              <rect x="52" y={14 - barHeights[4] / 2} width="5" height={barHeights[4]} rx="2.5" fill="#34D399" />
            </g>
          </svg>
        </div>
      </div>

      {/* Dynamic Status Bar */}
      <div className="mt-3 flex items-center space-x-2 z-10">
        {isSpeaking ? (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
            <span>Delivering guidance to you…</span>
          </div>
        ) : isListening ? (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Listening to the conversation…</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready to help whenever you need</span>
          </div>
        )}
      </div>

      {/* Subtext info */}
      <p className="mt-2 text-[11px] text-slate-400 text-center max-w-xs z-10">
        {isSpeaking
          ? 'Sending you live guidance right now — just follow the script.'
          : 'Listening to your conversation and ready to coach you in real time.'}
      </p>
    </div>
  );
};

export default CodedAIAvatar;
