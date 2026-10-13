import React, { useState, useEffect, useRef } from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
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

// Custom tooltip component — receives t() via a closure prop
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
              {t('childTour.skip')}
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
                {t('childTour.back')}
              </button>
            )}
            <button
              {...primaryProps}
              className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm"
            >
              {isLastStep ? t('childTour.finish') : t('childTour.next')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  return CustomTooltip;
};

const ChildDetailsTour = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();
  const [run, setRun] = useState(false);

  // Build tour steps using current translations
  const TOUR_STEPS = [
    {
      target: 'body',
      content: t('childTour.welcome.content'),
      placement: 'center',
      disableBeacon: true,
      title: t('childTour.welcome.title'),
    },
    {
      target: '.tour-ask-ai',
      content: t('childTour.askAi.content'),
      title: t('childTour.askAi.title'),
      placement: 'bottom',
      disableBeacon: true,
      // Keep page from scrolling away — the tab bar is always visible
      disableScrolling: true,
    },
    {
      target: '.tour-parent-practice',
      content: t('childTour.live.content'),
      title: t('childTour.live.title'),
      placement: 'bottom',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.tour-insights',
      content: t('childTour.insights.content'),
      title: t('childTour.insights.title'),
      placement: 'bottom',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.tour-check-ins',
      content: t('childTour.checkIns.content'),
      title: t('childTour.checkIns.title'),
      placement: 'bottom',
      disableBeacon: true,
      disableScrolling: true,
    },
  ];

  const CustomTooltip = makeCustomTooltip(t);

  const userIdRef = useRef(user?.id);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id && !hasSeenTour(user.id)) {
      // Scroll to top first so the tabs are visible, THEN start the tour
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => setRun(true), 900);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user?.id]);

  const handleJoyrideCallback = (data) => {
    const { status, action, index, type } = data;

    // When moving to a tab-bar step, scroll to top so the user can see the highlighted tab
    if (type === 'step:before' && index > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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
      // Disable automatic scrolling — we handle it manually above
      disableScrolling={false}
      scrollToFirstStep={false}
      scrollOffset={80}
      showProgress
      showSkipButton
      steps={TOUR_STEPS}
      spotlightPadding={6}
      styles={{
        options: {
          zIndex: 100000,
          arrowColor: '#fff8f0', // amber-50 to match tooltip header
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

export default ChildDetailsTour;
