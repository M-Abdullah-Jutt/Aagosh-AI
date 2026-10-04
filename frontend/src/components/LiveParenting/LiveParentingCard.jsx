import React, { useState, useEffect } from 'react';
import {
  Mic,
  Sparkles,
  Bot,
  UserCheck,
  Clock,
  ShieldCheck,
  ChevronRight,
  Radio,
  Heart,
  Zap,
  MessageSquare,
  Brain
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import childrenService from '../../services/childrenService';
import LiveParentingStudioModal from './LiveParentingStudioModal';

export const LiveParentingCard = () => {
  const { t } = useLanguage();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedMode, setSelectedMode] = useState('non_human'); // 'non_human' | 'human_like'
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchKids = async () => {
      try {
        setIsLoading(true);
        const data = await childrenService.getChildren();
        setChildren(data || []);
        if (data && data.length > 0) {
          setSelectedChildId(String(data[0].id));
        }
      } catch (err) {
        console.warn('Failed to load children in LiveParentingCard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKids();
  }, []);

  const currentChild = children.find((c) => String(c.id) === String(selectedChildId)) || null;

  return (
    <div className="relative bg-white border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/50 via-teal-50/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

      <div className="relative z-10 space-y-6">
        {/* Top Header: Badge, Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="uppercase tracking-wider text-[11px]">Real-Time Parenting Support</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Live Parenting Guidance</span>
              <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-500/20" />
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Have a conversation with your child while your personal AI coach listens in real time — quietly guiding you with the right words, tone cues, and calm steps to handle any parenting moment with confidence.
            </p>
          </div>

          {/* Child Selector */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 sm:self-start">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              For Which Child?
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition cursor-pointer min-w-[180px]"
            >
              <option value="">General (No child selected)</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.age_years ? `(${c.age_years} yrs)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Text & Voice AI Coach */}
          <div
            onClick={() => setSelectedMode('non_human')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
              selectedMode === 'non_human'
                ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 border-emerald-500 text-white shadow-lg'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            {selectedMode === 'non_human' && (
              <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Selected
              </span>
            )}
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
                  selectedMode === 'non_human'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold text-base ${selectedMode === 'non_human' ? 'text-white' : 'text-slate-900'}`}>
                  AI Text & Voice Coach
                </h3>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Always available • Instant guidance
                </span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed mb-3 ${selectedMode === 'non_human' ? 'text-slate-300' : 'text-slate-600'}`}>
              Your AI coach listens to the conversation and instantly delivers personalized scripts, tone adjustments, and calming techniques — directly to your screen as you talk.
            </p>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className={`px-2 py-0.5 rounded-md font-semibold ${selectedMode === 'non_human' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                Real-Time Listening
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${selectedMode === 'non_human' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                Instant Scripts
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${selectedMode === 'non_human' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700'}`}>
                Unlimited Sessions
              </span>
            </div>
          </div>

          {/* Option 2: Human Avatar Coach */}
          <div
            onClick={() => setSelectedMode('human_like')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
              selectedMode === 'human_like'
                ? 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 border-teal-400 text-white shadow-lg'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            {selectedMode === 'human_like' && (
              <span className="absolute top-3 right-3 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Selected
              </span>
            )}
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
                  selectedMode === 'human_like'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-teal-50 text-teal-700'
                }`}
              >
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold text-base ${selectedMode === 'human_like' ? 'text-white' : 'text-slate-900'}`}>
                  Dr. Sophia — Live Video Coach
                </h3>
                <span className="text-[11px] text-teal-400 font-medium">
                  Face-to-face • 5-minute focused session
                </span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed mb-3 ${selectedMode === 'human_like' ? 'text-teal-100/80' : 'text-slate-600'}`}>
              A dedicated 5-minute focused session with Dr. Sophia, your personal parenting specialist. She listens, understands your child's context, and speaks directly to you with expert human-like guidance.
            </p>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className={`px-2 py-0.5 rounded-md font-semibold ${selectedMode === 'human_like' ? 'bg-teal-900/60 text-teal-200' : 'bg-slate-100 text-slate-600'}`}>
                Face-to-Face Session
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${selectedMode === 'human_like' ? 'bg-teal-900/60 text-teal-200' : 'bg-slate-100 text-slate-600'}`}>
                Natural Voice
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${selectedMode === 'human_like' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : 'bg-teal-50 text-teal-700'}`}>
                5-Min Focused
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Listens in Real Time</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Instant Word Scripts</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Emotion & Tone Cues</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            <Brain className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Child-Aware Advice</span>
          </div>
        </div>

        {/* Action Button & Launch Area */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Powered by Aaghosh AI • Private & secure audio processing
            </span>
          </div>

          <button
            onClick={() => setIsStudioOpen(true)}
            className="inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Start Live Coaching Session</span>
            <ChevronRight className="w-4 h-4 opacity-75" />
          </button>
        </div>
      </div>

      {/* Interactive Studio Modal */}
      {isStudioOpen && (
        <LiveParentingStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          initialChild={currentChild}
          initialMode={selectedMode}
          childrenList={children}
        />
      )}
    </div>
  );
};

export default LiveParentingCard;
