import React, { useState, useEffect, useRef } from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles } from 'lucide-react';

const getTourKey = (userId) => `aaghosh_child_tour_seen_${userId}`;

const hasSeenTour = (userId) => {
  if (!userId) return true;
  try {
    return localStorage.getItem(getTourKey(userId)) === 'true';
  } catch {
    return true;
  }
};

const markTourSeen = (userId) => {
  if (!userId) return;
  try {
    localStorage.setItem(getTourKey(userId), 'true');
  } catch { /* ignore */ }
};

const CustomTooltip = ({
  index,
  isLastStep,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  return (
    <div
      {...tooltipProps}
      className="bg-white rounded-2xl shadow-xl w-80 max-w-[90vw] border border-slate-100/60 font-sans overflow-hidden"
    >
      <div className="flex flex-col bg-gradient-to-br from-emerald-50 to-white pt-5 pb-3 px-5">
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <button
            {...closeProps}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-lg font-bold text-slate-800 m-0">{step.title}</h3>
      </div>

      <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed font-medium">
        {step.content}
      </div>

      <div className="bg-slate-50 border-t border-slate-100 px-5 py-4 flex items-center justify-between">
        {!isLastStep ? (
          <button
            {...skipProps}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
          >
            Skip
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            {isLastStep ? "Got it! 🚀" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TOUR_STEPS = [
  {
    target: 'body',
    content: "Welcome to your child's profile! Let's quickly show you the key tools available to help you track progress and get AI-powered parenting advice.",
    placement: 'center',
    disableBeacon: true,
    title: '🧒 Child Profile Tour',
  },
  {
    target: '.tour-ask-ai',
    content: "Need advice for a specific situation? The 'Ask AI Coach' tab connects you with an intelligent assistant trained in evidence-based parenting strategies.",
    title: '🤖 Ask AI Coach',
  },
  {
    target: '.tour-live-parenting',
    content: "Experience real-time support! Use the 'Live Parenting' feature to have a voice conversation with Dr. Sophia for immediate guidance during stressful moments.",
    title: '🎙️ Live AI Coach',
  },
  {
    target: '.tour-insights',
    content: "The 'Insights' tab analyzes all your logged behavior events and check-ins to provide actionable trends, highlighting common triggers and emotional patterns.",
    title: '📊 Insights',
  },
  {
    target: '.tour-check-ins',
    content: "Log daily moods and specific behavioral events in 'Check-Ins'. Consistent tracking helps the AI give you much better, personalized advice.",
    title: '📝 Check-Ins',
  },
];

const ChildDetailsTour = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [run, setRun] = useState(false);

  const userIdRef = useRef(user?.id);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id && !hasSeenTour(user.id)) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user?.id]);

  const handleJoyrideCallback = (data) => {
    const { status, action } = data;
    const isDone = [STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE;
    if (isDone) {
      setRun(false);
      markTourSeen(userIdRef.current);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      tooltipComponent={CustomTooltip}
      hideCloseButton={false}
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={TOUR_STEPS}
      styles={{
        options: {
          zIndex: 100000,
          arrowColor: '#ecfdf5',
        },
      }}
    />
  );
};

export default ChildDetailsTour;
