import React, { useEffect, useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Video,
  HeartHandshake,
  Loader2,
  WifiOff
} from 'lucide-react';
import { SimliClient, generateSimliSessionToken, generateIceServers } from 'simli-client';
import liveParentingService from '../../services/liveParentingService';

const SIMLI_API_KEY  = import.meta.env.VITE_SIMLI_API_KEY  || '';
const SIMLI_FACE_ID  = import.meta.env.VITE_SIMLI_FACE_ID  || 'f0ba4efe-7946-45de-9955-c04a04c367b9';

/**
 * SimliHumanCoach — Dr. Sophia, your real-time AI parenting coach.
 * Uses the simli-client SDK (correct constructor API) to stream a live video avatar.
 *
 * SimliClient constructor signature:
 *   new SimliClient(session_token, videoElement, audioElement, iceServers, logLevel?, transport?, signaling?)
 */
export const SimliHumanCoach = ({
  isSpeaking = false,
  isListening = false,
  guidanceText = '',
  onSpeechComplete = () => {},
  muted = false,
  onToggleMute = () => {},
  language = 'en',
  sessionTimeRemaining = 300,
  onSessionTimeUp = () => {},
  onConfigureKeys = () => {}
}) => {
  const videoRef      = useRef(null);
  const audioRef      = useRef(null);
  const clientRef     = useRef(null);
  const ttsAudioRef   = useRef(null); // Used for Simli lip sync (muted by SDK)
  const localAudioRef = useRef(null); // Used for actual local playback

  const [connectionState, setConnectionState] = useState('idle'); // idle | connecting | connected | error
  const [coachStatus,     setCoachStatus]     = useState('Preparing your coaching session…');
  const [voiceActive,     setVoiceActive]     = useState(false);

  /* ── Initialise Simli WebRTC session ── */
  useEffect(() => {
    let isMounted = true;

    const initSimli = async () => {
      if (!videoRef.current || !audioRef.current) return;

      setConnectionState('connecting');
      setCoachStatus('Connecting to Dr. Sophia…');

      try {
        /* 1. Fetch ICE servers (required for P2P WebRTC transport) */
        const iceServers = await generateIceServers(SIMLI_API_KEY);
        if (!isMounted) return;

        /* 2. Generate session token via the simli-client helper */
        const { session_token } = await generateSimliSessionToken({
          apiKey: SIMLI_API_KEY,
          config: {
            faceId:           SIMLI_FACE_ID,
            handleSilence:    true,
            maxSessionLength: 300,
            maxIdleTime:      60
          }
        });

        if (!isMounted) return;
        if (!session_token) throw new Error('No session token received from Simli.');

        /* 3. Construct SimliClient — positional args: token, video, audio, iceServers */
        const client = new SimliClient(
          session_token,       // session_token: string
          videoRef.current,    // videoElement: HTMLVideoElement
          audioRef.current,    // audioElement: HTMLAudioElement
          iceServers           // RTCIceServer[] — required for P2P mode
        );
        clientRef.current = client;

        /* 4. Attach event listeners with correct event names */
        client.on('start', () => {
          if (!isMounted) return;
          setConnectionState('connected');
          setCoachStatus('Dr. Sophia is ready for your session');
        });

        client.on('stop', () => {
          if (!isMounted) return;
          setConnectionState('idle');
          setCoachStatus('Session ended');
        });

        client.on('speaking', () => {
          if (!isMounted) return;
          setCoachStatus('Dr. Sophia is speaking…');
        });

        client.on('silent', () => {
          if (!isMounted) return;
          setCoachStatus('Dr. Sophia is listening…');
        });

        client.on('startup_error', (msg) => {
          console.warn('[SimliHumanCoach] Startup error:', msg);
          if (!isMounted) return;
          setConnectionState('error');
          setCoachStatus('Could not start session. Please try again.');
        });

        client.on('error', (detail) => {
          console.warn('[SimliHumanCoach] Session error:', detail);
        });

        /* 4. Start the WebRTC connection */
        await client.start();
        
        /* 5. Enable Lip Sync by routing our TTS audio element to the Simli SDK */
        if (ttsAudioRef.current) {
          client.listenToAudioElement(ttsAudioRef.current);
        }

      } catch (err) {
        console.warn('[SimliHumanCoach] Init error:', err?.message || err);
        if (!isMounted) return;
        setConnectionState('error');
        setCoachStatus(
          err?.message?.includes('401') || err?.message?.includes('403')
            ? 'Invalid API key — check your Simli credentials.'
            : err?.message?.includes('404')
            ? 'Face ID not found — verify your Simli face ID.'
            : 'Dr. Sophia is unavailable. Check your connection.'
        );
      }
    };

    initSimli();

    return () => {
      isMounted = false;
      if (clientRef.current) {
        try { clientRef.current.stop?.(); } catch { /* ignore */ }
        clientRef.current = null;
      }
    };
  }, []);

  /* ── Mute / unmute the Simli avatar audio element ── */
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    if (localAudioRef.current) localAudioRef.current.muted = muted;
  }, [muted]);

  /* ── Play TTS guidance audio (Cartesia → Web Speech fallback) ── */
  useEffect(() => {
    if (!guidanceText || !isSpeaking || muted) return;
    let cancelled = false;

    const playVoice = async () => {
      try {
        setVoiceActive(true);
        const blob = await liveParentingService.getCartesiaTTS({ transcript: guidanceText, language });
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (ttsAudioRef.current && localAudioRef.current) {
          // 1. Simli listens to this one (SDK mutes it internally)
          ttsAudioRef.current.src = url;
          // 2. The user hears this one
          localAudioRef.current.src = url;
          
          localAudioRef.current.onended = () => { setVoiceActive(false); onSpeechComplete(); };
          localAudioRef.current.onerror = () => fallbackSpeech();
          
          // Play both synchronously
          await Promise.all([
            ttsAudioRef.current.play(),
            localAudioRef.current.play()
          ]);
        }
      } catch {
        fallbackSpeech();
      }
    };

    const fallbackSpeech = () => {
      if (cancelled || !('speechSynthesis' in window)) { onSpeechComplete(); return; }
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(guidanceText);
      utt.lang  = language === 'ur' ? 'ur-PK' : 'en-US';
      utt.pitch = 1.0; utt.rate = 0.95;
      utt.onend = utt.onerror = () => { setVoiceActive(false); onSpeechComplete(); };
      window.speechSynthesis.speak(utt);
    };

    playVoice();
    return () => {
      cancelled = true;
      ttsAudioRef.current?.pause();
      localAudioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, [guidanceText, isSpeaking, muted, language, onSpeechComplete]);

  /* ── Timer display ── */
  const mins      = Math.floor(sessionTimeRemaining / 60);
  const secs      = sessionTimeRemaining % 60;
  const timeStr   = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  const critical  = sessionTimeRemaining <= 60;
  const ending    = sessionTimeRemaining <= 15;
  const progress  = Math.max(0, (sessionTimeRemaining / 300) * 100);

  const isConnected  = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-b from-slate-900 via-emerald-950/30 to-slate-900 rounded-3xl border border-emerald-800/40 shadow-2xl overflow-hidden text-white p-5 select-none">

      {/* Hidden TTS audio elements */}
      <audio ref={ttsAudioRef} className="hidden" />
      <audio ref={localAudioRef} className="hidden" />

      {/* ── Top bar: name + timer ── */}
      <div className="w-full flex items-center justify-between z-20 mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
            isConnected  ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400'
            : isConnecting ? 'bg-amber-400 animate-pulse'
            : 'bg-slate-500'
          }`} />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-100">Dr. Sophia Vance</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase border ${
                isConnected  ? 'bg-emerald-900/60 text-emerald-200 border-emerald-600/40'
                : isConnecting ? 'bg-amber-900/60 text-amber-200 border-amber-600/40'
                : 'bg-slate-800 text-slate-400 border-slate-700/40'
              }`}>
                {isConnected ? 'Live Coach' : isConnecting ? 'Connecting…' : 'Offline'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Child Psychologist & Parenting Specialist</p>
          </div>
        </div>

        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
          ending   ? 'bg-red-500/20 text-red-300 border-red-500/60 animate-bounce'
          : critical ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
          : 'bg-emerald-950/60 text-emerald-200 border-emerald-700/60'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${critical ? 'text-amber-400' : 'text-emerald-400'}`} />
          <span className="font-mono tracking-wider">{timeStr}</span>
          <span className="text-[9px] opacity-75 font-normal">/ 05:00</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3 border border-emerald-900/30">
        <div
          className={`h-full transition-all duration-1000 ${
            ending   ? 'bg-red-500'
            : critical ? 'bg-gradient-to-r from-amber-500 to-red-500'
            : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Critical time warning */}
      {critical && sessionTimeRemaining > 0 && (
        <div className="w-full mb-2 bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-1 text-[11px] text-amber-200 flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {ending
              ? 'Wrapping up your session. Preparing your action summary…'
              : 'Less than 1 minute remaining in this session.'}
          </span>
        </div>
      )}

      {/* ── Live avatar video panel ── */}
      <div className="relative w-full aspect-[4/3] max-w-sm rounded-2xl overflow-hidden bg-slate-950 border border-emerald-800/50 shadow-inner">

        {/* Real Simli WebRTC video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover rounded-2xl transition-opacity duration-700 ${isConnected ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Simli WebRTC audio (separate element, SDK writes to it) */}
        <audio ref={audioRef} autoPlay className="hidden" />

        {/* Overlay: loading / error */}
        {!isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-emerald-950/40 rounded-2xl gap-3">
            {isConnecting ? (
              <>
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                <div className="text-center">
                  <p className="text-xs text-emerald-300 font-semibold">Connecting to Dr. Sophia…</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Establishing live video session</p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-10 h-10 text-slate-500" />
                <div className="text-center px-4">
                  <p className="text-xs text-slate-300 font-semibold">Connection unavailable</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{coachStatus}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* LIVE badge */}
        {isConnected && (
          <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-emerald-700/30 text-[10px] text-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <Video className="w-3 h-3 text-emerald-400" />
            <span>Live Session</span>
          </div>
        )}

        {/* Speaking indicator */}
        {voiceActive && isConnected && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-900/80 border border-emerald-600/40 text-[10px] text-emerald-200 animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>Speaking…</span>
          </div>
        )}

        {/* Mute button */}
        <div className="absolute bottom-2 right-2 z-20">
          <button
            onClick={onToggleMute}
            title={muted ? 'Unmute Dr. Sophia' : 'Mute Dr. Sophia'}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 transition"
          >
            {muted
              ? <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* ── Status footer ── */}
      <div className="w-full mt-3 flex items-center justify-between text-xs z-10">
        <div className="flex items-center space-x-1.5 text-slate-300">
          {isConnected
            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            : isConnecting
            ? <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            : <WifiOff className="w-3.5 h-3.5 text-slate-500" />}
          <span className="text-[11px] truncate max-w-[220px]">{coachStatus}</span>
        </div>
        <div className="flex items-center space-x-1 text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
          <HeartHandshake className="w-3 h-3" />
          <span>Focused 5-Min Session</span>
        </div>
      </div>
    </div>
  );
};

export default SimliHumanCoach;
