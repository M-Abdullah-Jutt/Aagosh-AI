import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Heart,
  Brain,
  MessageCircle,
  HelpCircle,
  User,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import parentPracticeService from '../../services/parentPracticeService';

export const VirtualChildSessionModal = ({
  scenario,
  isOpen,
  onClose,
  onSessionComplete
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  // Conversation history
  const [transcript, setTranscript] = useState([]);
  const [parentInput, setParentInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [childEmotion, setChildEmotion] = useState(scenario?.emotional_state || 'Upset');
  const [childBodyLanguage, setChildBodyLanguage] = useState('');
  const [coachWhisper, setCoachWhisper] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  // Audio / Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize session with the scenario's initial child action
  useEffect(() => {
    if (isOpen && scenario) {
      const initialText = isUrdu
        ? (scenario.initial_child_message_ur || scenario.initial_child_message)
        : scenario.initial_child_message;

      setTranscript([
        {
          speaker: 'child',
          text: initialText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setChildEmotion(scenario.emotional_state || 'Upset');
      setChildBodyLanguage(isUrdu ? 'غصے اور ضد کے ساتھ سامنے کھڑا ہے' : 'Crossing arms, resisting defiance');
      setCoachWhisper(
        isUrdu
          ? 'بچے سے بات کرنے کا وقت ہے! چیخنے یا الزام دینے کے بجائے پرسکون انداز میں جواب دیں۔'
          : 'Your move! Respond as a parent. Remember to validate feelings first before holding boundaries.'
      );
      setSecondsElapsed(0);
      setIsResolving(false);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);

      // Read initial child speech if TTS enabled
      if (ttsEnabled) {
        speakText(initialText, isUrdu ? 'ur-PK' : 'en-US');
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, scenario, isUrdu]);

  // Scroll to bottom on conversation update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isSending]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isUrdu ? 'ur-PK' : 'en-US';

      recognition.onresult = (event) => {
        let transcriptText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcriptText += event.results[i][0].transcript;
        }
        setParentInput(transcriptText);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isUrdu]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setParentInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const speakText = (text, lang) => {
    if (!window.speechSynthesis || !ttsEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || (isUrdu ? 'ur-PK' : 'en-US');
      utterance.pitch = 1.25; // Higher pitch for child voice
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  const handleSendResponse = async (e) => {
    if (e) e.preventDefault();
    const textToSend = parentInput.trim();
    if (!textToSend || isSending) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch {
        // ignore
      }
    }

    const parentTurn = {
      speaker: 'parent',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTranscript = [...transcript, parentTurn];
    setTranscript(updatedTranscript);
    setParentInput('');
    setIsSending(true);

    try {
      const data = await parentPracticeService.sendTurn({
        scenarioId: scenario.id,
        childName: scenario.child_name,
        childAge: scenario.child_age,
        behaviorType: scenario.behavior_type,
        transcript: updatedTranscript,
        parentResponse: textToSend,
        language: isUrdu ? 'ur' : 'en',
      });

      const childTurn = {
        speaker: 'child',
        text: data.child_reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscript((prev) => [...prev, childTurn]);
      setChildEmotion(data.child_emotion || 'Listening');
      if (data.child_body_language) setChildBodyLanguage(data.child_body_language);
      if (data.coach_whisper_feedback) setCoachWhisper(data.coach_whisper_feedback);
      if (data.is_scenario_resolving) setIsResolving(true);

      if (ttsEnabled) {
        speakText(data.child_reply, isUrdu ? 'ur-PK' : 'en-US');
      }
    } catch (err) {
      console.error('Failed to get child response:', err);
      const fallbackChild = {
        speaker: 'child',
        text: isUrdu
          ? 'لیکن میں ابھی بہت غصے میں ہوں، آپ میری بات کیوں نہیں سنتے؟'
          : 'I still do not want to! Why do you always say that?!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscript((prev) => [...prev, fallbackChild]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    onSessionComplete({
      scenario,
      transcript,
      durationSeconds: secondsElapsed,
    });
  };

  if (!isOpen || !scenario) return null;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in ${
        isUrdu ? 'font-urdu' : ''
      }`}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[92vh] sm:h-[88vh] flex flex-col overflow-hidden border border-stone-200">
        
        {/* Header: Scenario details, child status, live timer */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white/20">
                {scenario.child_name[0]}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-stone-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isUrdu ? (scenario.title_ur || scenario.title) : scenario.title}
                </h2>
                <span className="text-[11px] bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold px-2 py-0.5 rounded-full">
                  {scenario.child_name} • {scenario.child_age} yrs
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-stone-300 mt-0.5">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>State: <strong>{childEmotion}</strong></span>
                </span>
                {isResolving && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    Softening & Regulating ✨
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 bg-stone-800 text-amber-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-stone-700">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? 'Mute Child Voice' : 'Unmute Child Voice'}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition"
            >
              {ttsEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-stone-500" />}
            </button>

            <button
              onClick={handleFinishSession}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Award className="w-4 h-4" />
              <span>{isUrdu ? 'سیشن ختم کریں اور رپورٹ دیکھیں' : 'End & Get AI Debrief'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Coach Live Whisper Bar */}
        {coachWhisper && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-b border-emerald-100 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-950 shrink-0">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <p className="font-medium truncate">
                <span className="font-bold text-emerald-800">AI Coach Whisper: </span>
                {coachWhisper}
              </p>
            </div>
            {childBodyLanguage && (
              <span className="hidden md:inline-block text-[11px] text-stone-600 bg-white/80 border border-stone-200 px-2.5 py-0.5 rounded-full shrink-0 font-medium">
                👀 {childBodyLanguage}
              </span>
            )}
          </div>
        )}

        {/* Conversation Dialogue Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/70">
          {/* Mission goal card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-700 shadow-sm flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">
                {isUrdu ? 'مشق کا مقصد (Practice Goal):' : 'Session Learning Goal:'}
              </span>
              <p className="text-stone-600 mt-0.5">
                {isUrdu ? (scenario.learning_goal_ur || scenario.learning_goal) : scenario.learning_goal}
              </p>
            </div>
          </div>

          {transcript.map((msg, index) => {
            const isChild = msg.speaker === 'child';
            return (
              <div
                key={index}
                className={`flex items-end gap-2.5 ${isChild ? 'justify-start' : 'justify-end'}`}
              >
                {isChild && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {scenario.child_name[0]}
                  </div>
                )}

                <div
                  className={`max-w-[82%] sm:max-w-[70%] rounded-2xl p-3.5 sm:p-4 text-sm shadow-sm transition-all ${
                    isChild
                      ? 'bg-white border border-stone-200/90 text-stone-900 rounded-bl-sm'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-br-sm shadow-orange-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-2 text-[10px] mb-1 opacity-70">
                    <span className="font-semibold uppercase tracking-wider">
                      {isChild ? `${scenario.child_name} (Virtual Child)` : (isUrdu ? 'آپ (والد / والدہ)' : 'You (Parent)')}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>

                {!isChild && (
                  <div className="w-8 h-8 rounded-full bg-stone-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-orange-300" />
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center space-x-2 text-stone-400 text-xs italic pl-10">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              <span>{scenario.child_name} {isUrdu ? 'ردعمل دے رہا ہے...' : 'is reacting...'}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar: Parent Voice or Text */}
        <div className="bg-white border-t border-stone-200 p-3 sm:p-4 shrink-0">
          {isListening && (
            <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between animate-pulse">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>{isUrdu ? 'آپ کی آواز ریکارڈ ہو رہی ہے، بچے سے بات کریں...' : 'Listening to your voice... Speak directly to the virtual child.'}</span>
              </span>
              <button
                type="button"
                onClick={toggleMic}
                className="text-red-600 font-bold hover:underline"
              >
                Stop
              </button>
            </div>
          )}

          <form onSubmit={handleSendResponse} className="flex items-center gap-2">
            {speechSupported && (
              <button
                type="button"
                onClick={toggleMic}
                title={isListening ? 'Stop Listening' : 'Speak to Child'}
                className={`p-3 rounded-2xl transition font-medium flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-orange-600" />}
              </button>
            )}

            <div className="relative flex-1">
              <input
                type="text"
                value={parentInput}
                onChange={(e) => setParentInput(e.target.value)}
                placeholder={
                  isUrdu
                    ? `بچے کو جواب دیں (جیسے: "${scenario.child_name}، میں سمجھتا ہوں کہ آپ غصے میں ہیں...")`
                    : `Respond to ${scenario.child_name} as you would in real life...`
                }
                disabled={isSending}
                className="w-full bg-stone-50 border border-stone-200 focus:border-orange-500 focus:bg-white text-stone-900 text-sm rounded-2xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={!parentInput.trim() || isSending}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white p-3 rounded-2xl shadow-md transition flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span>
              💡 {isUrdu ? 'ٹپ: اپنے جذبات قابو میں رکھیں اور حدود واضح رکھیں۔' : 'Tip: Practice calm validation before setting boundaries.'}
            </span>
            <button
              type="button"
              onClick={handleFinishSession}
              className="text-orange-600 hover:underline font-semibold"
            >
              {isUrdu ? 'سیشن مکمل ہوا؟ رپورٹ دیکھیں →' : 'Done practicing? See debrief →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualChildSessionModal;
