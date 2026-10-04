import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Send,
  User,
  Heart,
  Volume2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Award,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import liveParentingService from '../../services/liveParentingService';
import CodedAIAvatar from './CodedAIAvatar';
import SimliHumanCoach from './SimliHumanCoach';


export const LiveParentingStudioModal = ({
  isOpen,
  onClose,
  initialChild = null,
  initialMode = 'non_human',
  childrenList = []
}) => {
  const { t, language } = useLanguage();

  // Session configuration
  const [selectedChild, setSelectedChild] = useState(initialChild);
  const [mode, setMode] = useState(initialMode); // 'non_human' | 'human_like'
  const [isSessionActive, setIsSessionActive] = useState(false);


  // Audio / Mic state
  const [isRecording, setIsRecording] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [currentUtterance, setCurrentUtterance] = useState('');
  const [speakerTurn, setSpeakerTurn] = useState('child'); // 'child' | 'parent'

  // Coach guidance & speaking state
  const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
  const [isCoachMuted, setIsCoachMuted] = useState(false);
  const [latestGuidance, setLatestGuidance] = useState(null);
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Conversation history
  const [transcript, setTranscript] = useState([]);
  const transcriptRef = useRef([]);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const transcriptEndRef = useRef(null);
  const committedTextRef = useRef(''); // Buffer to hold finalized text during a recording session

  const speakerTurnRef = useRef(speakerTurn);
  useEffect(() => {
    speakerTurnRef.current = speakerTurn;
  }, [speakerTurn]);

  // 5-Minute Timer for Human-like mode (300 seconds)
  const [timerRemaining, setTimerRemaining] = useState(300);
  const timerIntervalRef = useRef(null);

  // Session Summary
  const [sessionSummary, setSessionSummary] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Custom API Keys Drawer
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [customSimliKey, setCustomSimliKey] = useState('');
  const [customFaceId, setCustomFaceId] = useState('');
  const [customCartesiaKey, setCustomCartesiaKey] = useState('');

  // Speech recognition ref (Web Speech API)
  const recognitionRef = useRef(null);

  // Sync initial child & mode
  useEffect(() => {
    if (initialChild) setSelectedChild(initialChild);
    if (initialMode) setMode(initialMode);
  }, [initialChild, initialMode]);

  // When 5 minutes expire in Human-Like mode
  const handleTimeUp = async () => {
    setIsRecording(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    await finishSessionAndGenerateSummary();
  };

  // Handle 5-Minute Timer for Human-Like mode
  useEffect(() => {
    if (isSessionActive && mode === 'human_like') {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isSessionActive, mode]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Initialize Speech Recognition for continuous live listening
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalText = event.results[i][0].transcript.trim();
            if (finalText) {
              appendTranscript(finalText, speakerTurnRef.current);
            }
          } else {
            interimText += event.results[i][0].transcript;
          }
        }
        setCurrentUtterance(interimText);
      };

      recognition.onerror = (e) => {
        console.warn('SpeechRecognition notice:', e.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [language]);

  // Toggle Microphone
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.warn(err);
      }
    } else {
      // Start recording
      setIsRecording(true);
      setIsSessionActive(true);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Add new utterance to transcript and trigger live AI guidance
  const appendTranscript = (text, speaker) => {
    if (!text || !text.trim()) return transcriptRef.current;

    let updatedTranscript = [...transcriptRef.current];
    const lastTurn = updatedTranscript[updatedTranscript.length - 1];

    if (lastTurn && lastTurn.speaker === speaker) {
      // Append to the last turn if it's the same speaker
      const updatedLastTurn = {
        ...lastTurn,
        text: lastTurn.text + ' ' + text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      updatedTranscript[updatedTranscript.length - 1] = updatedLastTurn;
    } else {
      // Create a new turn for a new speaker
      const newTurn = {
        speaker,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      updatedTranscript.push(newTurn);
    }

    // Update ref synchronously to prevent race conditions during rapid speech recognition
    transcriptRef.current = updatedTranscript;
    setTranscript(updatedTranscript);
    
    return updatedTranscript;
  };

  // Request AI Guidance
  const requestLiveGuidance = async (currentTranscript, latestText, latestSpk) => {
    try {
      setIsLoadingGuidance(true);
      const data = await liveParentingService.getGuidance({
        childId: selectedChild?.id || null,
        transcript: currentTranscript,
        latestUtterance: latestText,
        latestSpeaker: latestSpk,
        mode,
        language
      });

      setLatestGuidance(data);
      // Only start speaking automatically if we are NOT actively recording
      setIsCoachSpeaking((prev) => {
        // We can't access current state of isRecording directly if it's stale in closure,
        // but we can check if it's true via a ref, OR just rely on the toggleRecording to trigger it.
        // Actually, if we just set it true, it will talk. Let's just set it true if the recognition is stopped.
        // Or better yet, we just set a state variable `hasPendingSpeech` which is handled in an effect.
        return true; 
      });
    } catch (err) {
      console.error('Failed to get live guidance:', err);
    } finally {
      setIsLoadingGuidance(false);
    }
  };

  const updateTranscriptText = (index, newText) => {
    let updatedTranscript = [...transcriptRef.current];
    updatedTranscript[index] = { ...updatedTranscript[index], text: newText };
    transcriptRef.current = updatedTranscript;
    setTranscript(updatedTranscript);
  };

  const handleSendToCoach = async () => {
    const currentTranscript = transcriptRef.current;
    if (currentTranscript.length === 0) return;

    // Send the latest turn to request guidance based on the whole transcript
    const latestTurn = currentTranscript[currentTranscript.length - 1];
    await requestLiveGuidance(currentTranscript, latestTurn.text, latestTurn.speaker);
  };

  // End session and get structured summary
  const finishSessionAndGenerateSummary = async () => {
    setIsSessionActive(false);
    setIsGeneratingSummary(true);
    setShowSummaryModal(true);

    try {
      const summaryRes = await liveParentingService.getSessionSummary({
        childId: selectedChild?.id || null,
        durationSeconds: 300 - timerRemaining,
        transcript,
        guidanceHistory: latestGuidance ? [latestGuidance] : [],
        mode,
        language
      });
      setSessionSummary(summaryRes);
    } catch (err) {
      console.error('Error generating summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const copyGuidanceScript = () => {
    if (!latestGuidance?.immediate_response) return;
    navigator.clipboard.writeText(latestGuidance.immediate_response);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
      <div className="flex min-h-full items-start justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{minHeight: '85vh'}}>
        {/* Top Header / Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900/90 border-b border-slate-800 z-30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Live Parenting Studio
                </h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-Time Listening & Instant Guidance
              </p>
            </div>
          </div>

          {/* Child & Mode Selectors */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Child Selector */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white">
              <User className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const found = childrenList.find((c) => String(c.id) === e.target.value);
                  setSelectedChild(found || null);
                }}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-300">
                  General Parenting (No Child Selected)
                </option>
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.first_name} {c.age_years ? `(${c.age_years} yrs)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Switcher Toggle */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 text-xs font-semibold">
              <button
                onClick={() => setMode('non_human')}
                className={`px-3 py-1 rounded-lg transition ${
                  mode === 'non_human'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AI Text & Voice Coach
              </button>
              <button
                onClick={() => setMode('human_like')}
                className={`px-3 py-1 rounded-lg transition flex items-center space-x-1.5 ${
                  mode === 'human_like'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Dr. Sophia (Live Video)</span>
                <span className="text-[10px] bg-teal-950 px-1.5 rounded-full border border-teal-400/40">5m</span>
              </button>
            </div>

            {/* Close Studio */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close Live Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Studio Body Grid */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-y-auto">
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {mode === 'non_human' ? (
              <CodedAIAvatar
                isSpeaking={isCoachSpeaking}
                isListening={isRecording}
                guidanceText={latestGuidance?.immediate_response || ''}
                onSpeechComplete={() => setIsCoachSpeaking(false)}
                muted={isCoachMuted}
                onToggleMute={() => setIsCoachMuted(!isCoachMuted)}
                language={language}
              />
            ) : (
              <SimliHumanCoach
                isSpeaking={isCoachSpeaking}
                isListening={isRecording}
                guidanceText={latestGuidance?.immediate_response || ''}
                onSpeechComplete={() => setIsCoachSpeaking(false)}
                muted={isCoachMuted}
                onToggleMute={() => setIsCoachMuted(!isCoachMuted)}
                language={language}
                sessionTimeRemaining={timerRemaining}
                onSessionTimeUp={handleTimeUp}
                onConfigureKeys={() => setShowSettingsDrawer(true)}
              />
            )}

            {/* Microphone Listening Hub */}
            <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Live Microphone</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isRecording
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isRecording ? 'LIVE LISTENING' : 'PAUSED'}
                </span>
              </div>

              {/* Big Mic Button */}
              <div className="relative my-2">
                {isRecording && (
                  <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
                )}
                <button
                  onClick={toggleRecording}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30'
                  }`}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
              </div>

              <p className="text-xs text-slate-300 text-center font-medium">
                {isRecording
                  ? 'Listening to parent & child conversation...'
                  : 'Tap microphone to start live conversation listening'}
              </p>

              {/* Speaker Turn Toggle for live speech */}
              <div className="w-full flex items-center justify-center pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 mr-2">Speaking now:</span>
                <div className="inline-flex rounded-xl bg-slate-800 p-0.5 border border-slate-700 text-xs">
                  <button
                    onClick={() => setSpeakerTurn('child')}
                    className={`px-3 py-1 rounded-lg transition font-semibold ${
                      speakerTurn === 'child'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Child
                  </button>
                  <button
                    onClick={() => setSpeakerTurn('parent')}
                    className={`px-3 py-1 rounded-lg transition font-semibold ${
                      speakerTurn === 'parent'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Parent
                  </button>
                </div>
              </div>
            </div>

            {/* End Session Button */}
            {isSessionActive && (
              <button
                onClick={finishSessionAndGenerateSummary}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-2xl text-xs font-semibold flex items-center justify-center space-x-2 transition"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Finish Session & View Action Plan</span>
              </button>
            )}
          </div>

          {/* Right Column: Live Guidance & Dialogue Feed (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Live Guidance Card (The Prompter) */}
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Coach Whisper
                  </span>
                </div>

                {latestGuidance && (
                  <button
                    onClick={copyGuidanceScript}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-emerald-400 transition"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {/* Guidance Content */}
              {isLoadingGuidance ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-emerald-400">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Formulating empathetic response script...</span>
                </div>
              ) : latestGuidance ? (
                <div className="space-y-4">
                  {/* Immediate Response Box */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block mb-1.5">
                      Say this to {latestGuidance.child_name || 'your child'} right now:
                    </span>
                    <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                      "{latestGuidance.immediate_response}"
                    </p>
                  </div>

                  {/* Tone & Emotion Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide block mb-1">
                        Tone & Delivery
                      </span>
                      <p className="text-slate-200 font-medium">{latestGuidance.tone_guidance}</p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block mb-1">
                        Child's Need / State
                      </span>
                      <p className="text-slate-200 font-medium">{latestGuidance.child_emotion_detected}</p>
                    </div>
                  </div>

                  {/* Micro Action Steps */}
                  {latestGuidance.action_steps && latestGuidance.action_steps.length > 0 && (
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide block mb-1.5">
                        Body Language & Physical Steps
                      </span>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {latestGuidance.action_steps.map((st, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What to Avoid */}
                  {latestGuidance.what_to_avoid && (
                    <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-2.5 text-xs text-rose-200 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-rose-300">Avoid right now: </strong>
                        <span>{latestGuidance.what_to_avoid}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <Heart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="font-semibold text-slate-300 text-sm">Waiting for live conversation to begin</p>
                  <p className="max-w-md mx-auto mt-1">
                    Start speaking or tap the microphone. The AI Coach will listen to both parent and child turns and provide real-time words to say.
                  </p>
                </div>
              )}
            </div>

            {/* Conversation Transcript Feed */}
            <div className="flex-1 min-h-[220px] max-h-[340px] bg-slate-800 border border-slate-700 rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="text-xs font-semibold text-slate-300">
                  Live Transcript Stream ({transcript.length} turns)
                </span>
                {transcript.length > 0 && (
                  <button
                    onClick={() => {
                      setTranscript([]);
                      transcriptRef.current = [];
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Dialogue Scroll area */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500">
                {transcript.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs text-center py-8">
                    Transcript will appear here as you and your child talk.
                  </div>
                ) : (
                  transcript.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        item.speaker === 'parent' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-0.5 px-1">
                        <span className="font-semibold capitalize">
                          {item.speaker === 'child'
                            ? selectedChild?.first_name || 'Child'
                            : 'Parent'}
                        </span>
                        <span>• {item.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed transition-colors ${
                          item.speaker === 'parent'
                            ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-tr-sm'
                            : 'bg-amber-600/90 hover:bg-amber-600 text-white rounded-tl-sm'
                        }`}
                      >
                        <textarea
                          value={item.text}
                          onChange={(e) => updateTranscriptText(idx, e.target.value)}
                          className="w-full bg-transparent resize-none outline-none overflow-hidden placeholder-white/60"
                          rows={Math.max(1, Math.ceil((item.text?.length || 1) / 35))}
                          placeholder="Type message..."
                        />
                      </div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>

              {/* Send entire conversation to AI Coach */}
              {transcript.length > 0 && (
                <div className="pt-3 border-t border-slate-700 flex justify-center">
                  <button
                    onClick={handleSendToCoach}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-lg shadow-indigo-900/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Get AI Guidance</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Full Screen "Coming Soon" Overlay for Dr Sophia Mode */}
          {mode === 'human_like' && (
            <div className="absolute inset-0 z-[100] backdrop-blur-xl bg-slate-950/70 flex flex-col items-center justify-center p-4">
              <div className="bg-slate-900/90 border border-emerald-500/30 px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-md transform hover:scale-105 transition-transform duration-500">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Feature is Coming Soon</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Dr. Sophia's real-time video coaching experience is currently in development. You will be able to talk to a live video AI coach very soon!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Settings Drawer / Modal for Simli & Cartesia Keys */}
        {showSettingsDrawer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-sm">Simli & Cartesia Configuration</h3>
                </div>
                <button onClick={() => setShowSettingsDrawer(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Provide custom API credentials to connect directly to your own Simli AI avatar or Cartesia Sonic voice account. (Optional; defaults work in live preview mode).
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Simli API Key</label>
                  <input
                    type="password"
                    value={customSimliKey}
                    onChange={(e) => setCustomSimliKey(e.target.value)}
                    placeholder="simli_key_..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Simli Face ID</label>
                  <input
                    type="text"
                    value={customFaceId}
                    onChange={(e) => setCustomFaceId(e.target.value)}
                    placeholder="tmp999481c2-c2c3-4d43-9828-403d3c8c7c91"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cartesia API Key</label>
                  <input
                    type="password"
                    value={customCartesiaKey}
                    onChange={(e) => setCustomCartesiaKey(e.target.value)}
                    placeholder="cartesia_key_..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Summary Modal Dialog */}
        {showSummaryModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Live Parenting Session Debrief</h3>
                    <p className="text-xs text-slate-400">5-Minute Actionable Summary</p>
                  </div>
                </div>
                <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isGeneratingSummary ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-emerald-400">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold">Synthesizing session takeaways...</span>
                </div>
              ) : sessionSummary ? (
                <div className="space-y-4 text-xs">
                  {/* Overview */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block mb-1">
                      Session Overview
                    </span>
                    <p className="text-slate-200 leading-relaxed">{sessionSummary.summary}</p>
                    <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px]">
                      Climate: {sessionSummary.emotional_climate}
                    </div>
                  </div>

                  {/* Breakthroughs */}
                  {sessionSummary.key_breakthroughs?.length > 0 && (
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide block mb-1.5">
                        Key Breakthroughs Noticed
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {sessionSummary.key_breakthroughs.map((b, i) => (
                          <li key={i} className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Takeaways */}
                  {sessionSummary.actionable_takeaways?.length > 0 && (
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block mb-1.5">
                        Actionable Takeaways For Today
                      </span>
                      <ul className="space-y-1.5 text-slate-200">
                        {sessionSummary.actionable_takeaways.map((a, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setShowSummaryModal(false);
                        onClose();
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Done & Return to Dashboard
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default LiveParentingStudioModal;
