import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  Compass,
  LineChart,
  BookOpen,
  RefreshCw,
  ArrowRight,
  Mic,
  Video,
  Zap,
  Brain,
  Radio,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const LandingPage = () => {
  const { t } = useLanguage();

  const stepIds = ['assess', 'track', 'guide', 'adapt'];

  const getStepIcon = (stepId) => {
    switch (stepId) {
      case 'assess': return <Compass className="w-5 h-5 text-emerald-700" />;
      case 'track': return <LineChart className="w-5 h-5 text-emerald-700" />;
      case 'guide': return <BookOpen className="w-5 h-5 text-emerald-700" />;
      case 'adapt': return <RefreshCw className="w-5 h-5 text-emerald-700" />;
      default: return <Heart className="w-5 h-5 text-emerald-700" />;
    }
  };

  const liveFeatures = [
    {
      icon: <Radio className="w-5 h-5 text-emerald-600" />,
      title: 'Listens in Real Time',
      description: 'Your AI coach quietly listens as you talk with your child and understands the full context of every moment.',
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: 'Instant Word Scripts',
      description: 'Get exact phrases and empathetic responses delivered to your screen so you always know what to say next.',
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      title: 'Child-Aware Coaching',
      description: "Guidance is personalised to your child's age, temperament, and development stage — not generic advice.",
    },
    {
      icon: <Video className="w-5 h-5 text-teal-600" />,
      title: 'Face-to-Face with Dr. Sophia',
      description: 'Choose a focused 5-minute live video session with Dr. Sophia, your dedicated parenting specialist.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6 pt-4 sm:pt-6">
        <div className="flex justify-center mb-4 sm:mb-6">
          <img src="/logo.jpeg" alt="Aaghosh Logo" className="h-40 sm:h-56 lg:h-64 w-auto object-contain rounded-3xl shadow-sm" />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          {t('landing.heroTitle')}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal px-2">
          {t('landing.heroBody', { tagline: t('app.tagline') })}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <NavLink
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>{t('landing.exploreDashboard')}</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </section>

      {/* Real-Time Guidance Feature Spotlight */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="uppercase tracking-wider text-[11px]">Live Real-Time Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Your Personal Coach, In Every Parenting Moment
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Aaghosh is the first parenting companion that doesn't just give you advice — it actively listens to your parent-child conversations and guides you in the moment, with the right words, at the right time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {liveFeatures.map((feature, i) => (
            <div
              key={i}
              className="calm-card p-6 flex flex-col space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Two Modes callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="relative rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-indigo-950 border border-emerald-600/30 text-white overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center space-x-2 mb-3">
                <Mic className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">AI Text & Voice Coach</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kiko, your always-on AI coach, listens to conversations and delivers instant on-screen scripts and tone cues — available any time, with unlimited sessions.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl p-6 bg-gradient-to-br from-emerald-950 to-slate-900 border border-teal-600/30 text-white overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center space-x-2 mb-3">
                <Video className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Dr. Sophia — Live Video Coach</span>
              </div>
              <p className="text-sm text-teal-100/80 leading-relaxed">
                Book a focused 5-minute face-to-face session with Dr. Sophia, a virtual child psychology specialist who speaks and guides you with human-like warmth and precision.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <NavLink
            to="/dashboard"
            className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try Live Coaching Now</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </section>

      {/* Conceptual Loop Section */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('landing.loopTitle')}
          </h2>
          <p className="text-sm text-stone-600">
            {t('landing.loopSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stepIds.map((stepId, index) => (
            <div
              key={stepId}
              className="calm-card p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  {getStepIcon(stepId)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  {t('landing.stepLabel', { n: index + 1, step: t(`landing.steps.${stepId}`) })}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t(`landing.principles.${stepId}.title`)}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t(`landing.principles.${stepId}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Footer */}
      <section className="text-center pb-4">
        <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Evidence-informed guidance • Private & secure • Trusted by parents</span>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
