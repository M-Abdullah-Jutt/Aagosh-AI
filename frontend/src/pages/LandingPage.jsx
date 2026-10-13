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
  Sparkles,
  PlayCircle
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
      titleKey: 'landing.feature.listens.title',
      descKey: 'landing.feature.listens.desc',
    },
    {
      icon: <Zap className="w-5 h-5 text-brand-500" />,
      titleKey: 'landing.feature.scripts.title',
      descKey: 'landing.feature.scripts.desc',
    },
    {
      icon: <Brain className="w-5 h-5 text-emerald-600" />,
      titleKey: 'landing.feature.aware.title',
      descKey: 'landing.feature.aware.desc',
    },
    {
      icon: <Video className="w-5 h-5 text-emerald-600" />,
      titleKey: 'landing.feature.video.title',
      descKey: 'landing.feature.video.desc',
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

      {/* How to Use Aagosh — YouTube Video Section */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <PlayCircle className="w-3.5 h-3.5 text-brand-600" />
            <span className="uppercase tracking-wider text-[11px]">{t('landing.video.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('landing.video.title')}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('landing.video.subtitle')}
          </p>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-brand-100 bg-black"
          style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/drQ01yGFlFQ?rel=0&modestbranding=1"
            title={t('landing.video.title')}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
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
            <span className="uppercase tracking-wider text-[11px]">{t('landing.live.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('landing.live.title')}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('landing.live.body')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {liveFeatures.map((feature, i) => (
            <div
              key={i}
              className="calm-card p-6 flex flex-col space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t(feature.titleKey)}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>

        {/* Two Modes callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="relative rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-600/30 text-white overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center space-x-2 mb-3">
                <Mic className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">{t('landing.mode.kiko.badge')}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t('landing.mode.kiko.body')}
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl p-6 bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-600/30 text-white overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center space-x-2 mb-3">
                <Video className="w-5 h-5 text-brand-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-300">{t('landing.mode.sophia.badge')}</span>
              </div>
              <p className="text-sm text-brand-100/80 leading-relaxed">
                {t('landing.mode.sophia.body')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <NavLink
            to="/dashboard"
            className="inline-flex items-center space-x-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-brand-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('landing.cta')}</span>
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
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  {getStepIcon(stepId)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
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
        <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('landing.trust')}</span>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
