import React, { useState, useEffect, useRef } from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Sparkles } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getTourKey = (userId) => `aaghosh_tour_seen_${userId}`;

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

// ─── Custom Tooltip Factory ──────────────────────────────────────────────────

const makeCustomTooltip = (t) => {
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
        className="bg-white rounded-2xl shadow-2xl w-[320px] max-w-[92vw] border border-slate-100/60 font-sans overflow-hidden"
        style={{ zIndex: 100001 }}
      >
        {/* Header */}
        <div className="flex flex-col bg-gradient-to-br from-amber-50 to-white pt-5 pb-3 px-5">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shadow-sm border border-brand-200">
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

        {/* Content */}
        <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed">
          {step.content}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 py-4 flex items-center justify-between">
          {!isLastStep ? (
            <button
              {...skipProps}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
            >
              {t('tour.skip')}
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                {...backProps}
                className="px-4 py-2 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200"
              >
                {t('tour.back')}
              </button>
            )}
            <button
              {...primaryProps}
              className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm"
            >
              {isLastStep ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  return CustomTooltip;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserTour = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();
  const [run, setRun] = useState(false);

  // Build tour steps using current language translations
  const TOUR_STEPS = [
    {
      target: 'body',
      content: t('tour.welcome.content'),
      placement: 'center',
      disableBeacon: true,
      title: t('tour.welcome.title'),
    },
    {
      target: '.tour-dashboard',
      content: t('tour.dashboard.content'),
      title: t('tour.dashboard.title'),
      disableBeacon: true,
    },
    {
      target: '.tour-children',
      content: t('tour.children.content'),
      title: t('tour.children.title'),
      disableBeacon: true,
    },
    {
      target: '.tour-knowledge',
      content: t('tour.knowledge.content'),
      title: t('tour.knowledge.title'),
      disableBeacon: true,
    },
  ];

  const CustomTooltip = makeCustomTooltip(t);

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
    const isDone =
      [STATUS.FINISHED, STATUS.SKIPPED].includes(status) ||
      action === ACTIONS.CLOSE;
    if (isDone) {
      setRun(false);
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
      spotlightPadding={6}
      styles={{
        options: {
          zIndex: 100000,
          arrowColor: '#fff8f0',
          overlayColor: 'rgba(0,0,0,0.55)',
          spotlightShadow: '0 0 0 4px rgba(230, 96, 0, 0.35)',
        },
        spotlight: {
          borderRadius: '12px',
        },
      }}
    />
  );
};

export default UserTour;
