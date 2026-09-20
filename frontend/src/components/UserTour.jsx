import React, { useState, useEffect, useRef } from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns a per-user localStorage key so that the tour is tracked
 * independently for every account on this browser.
 * A generic key ('hasSeenTour') would wrongly hide the tour for a new user
 * who happens to share the browser with someone who already dismissed it.
 */
const getTourKey = (userId) => `aaghosh_tour_seen_${userId}`;

const hasSeenTour = (userId) => {
  if (!userId) return true; // safety: don't show if no user
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

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

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
          <span /> // placeholder for flex layout
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
            {isLastStep ? "Got it, let's start! 🚀" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Tour Steps ───────────────────────────────────────────────────────────────

const TOUR_STEPS = [
  {
    target: 'body',
    content:
      "Welcome to Aaghosh AI! You're in the right place. Let's take 30 seconds to show you around your new parenting companion.",
    placement: 'center',
    disableBeacon: true,
    title: '👋 Welcome!',
  },
  {
    target: '.tour-dashboard',
    content:
      'Your Dashboard gives you a high-level overview — active goals, recent activity, and a quick view of your family profiles.',
    title: '🏠 Dashboard',
  },
  {
    target: '.tour-children',
    content:
      "Add your children's profiles here. The more context you add (age, goals, observations), the more personalised the AI Coach's guidance becomes.",
    title: '👶 Children & Profiles',
  },
  {
    target: '.tour-knowledge',
    content:
      'Our AI Coach draws from a curated, evidence-based parenting knowledge base. You can explore and search it here — full transparency, always.',
    title: '📚 Knowledge Base',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const UserTour = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [run, setRun] = useState(false);

  // Keep a ref to the current user ID so the Joyride callback closure always
  // reads the latest value — even if the component re-renders between mount
  // and when the user dismisses/skips the tour.
  const userIdRef = useRef(user?.id);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    // Show the tour only when:
    //  1. Auth state has fully resolved (not still validating session)
    //  2. The user is authenticated
    //  3. We have a user ID to scope the key
    //  4. This specific user has never seen the tour before
    if (!isLoading && isAuthenticated && user?.id && !hasSeenTour(user.id)) {
      // Small delay so the DOM is fully rendered before Joyride tries to attach tooltips
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user?.id]);

  const handleJoyrideCallback = (data) => {
    const { status, action } = data;
    // Mark tour as seen when finished, skipped, or dismissed via the ✕ button.
    const isDone =
      [STATUS.FINISHED, STATUS.SKIPPED].includes(status) ||
      action === ACTIONS.CLOSE;
    if (isDone) {
      setRun(false);
      // Use the ref so we always have the current ID regardless of closure age.
      markTourSeen(userIdRef.current);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
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
          arrowColor: '#ecfdf5', // emerald-50 — matches the tooltip gradient start
        },
      }}
    />
  );
};

export default UserTour;
