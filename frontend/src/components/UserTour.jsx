import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';

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
          <span /> // placeholder
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
            {isLastStep ? 'Finish Tour' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};


const UserTour = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run if authenticated, on the dashboard, and haven't seen the tour yet
    if (isAuthenticated && localStorage.getItem('hasSeenTour') !== 'true') {
      // Small delay to ensure DOM is fully rendered before trying to attach tooltips
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, location]);

  const steps = [
    {
      target: 'body',
      content: 'Welcome to Aaghosh AI! Let us give you a quick tour of your new parenting companion.',
      placement: 'center',
      disableBeacon: true,
      title: 'Welcome!'
    },
    {
      target: '.tour-dashboard',
      content: 'This is your Dashboard. Here you get a high-level overview of your family, active goals, and recent activity.',
      title: 'Dashboard'
    },
    {
      target: '.tour-children',
      content: 'Manage your children\'s profiles here. You can add new children, track their daily check-ins, set goals, and access the AI Coach.',
      title: 'Children & Coaching'
    },
    {
      target: '.tour-knowledge',
      content: 'Explore the Knowledge Base to see the evidence-based parenting guidance our AI Coach relies on. We believe in complete transparency!',
      title: 'Knowledge Base'
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  // Only render Joyride if user is authenticated
  if (!isAuthenticated) return null;

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
      steps={steps}
      styles={{
        options: {
          zIndex: 100000,
          arrowColor: '#ecfdf5', // emerald-50 to match the gradient start
        },
      }}
    />
  );
};

export default UserTour;
