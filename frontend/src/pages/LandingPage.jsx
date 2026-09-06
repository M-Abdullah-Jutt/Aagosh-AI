import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, Compass, LineChart, BookOpen, RefreshCw, ArrowRight } from 'lucide-react';
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

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <div className="flex justify-center mb-6">
          <img src="/logo.jpeg" alt="Aaghosh Logo" className="h-56 sm:h-64 w-auto object-contain rounded-3xl shadow-sm" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          {t('landing.heroTitle')}
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed font-normal">
          {t('landing.heroBody', { tagline: t('app.tagline') })}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NavLink
            to="/health"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>{t('landing.exploreKnowledge')}</span>
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
    </div>
  );
};

export default LandingPage;
