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
  PlayCircle,
  Quote,
  Star,
  Lightbulb,
  Target,
  Activity,
  MessageSquare,
  Award,
  ArrowUpRight,
  CheckCircle2,
  Users
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
          <NavLink
            to="/practice"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-medium transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t('landing.cta')}</span>
          </NavLink>
        </div>
      </section>

      {/* Purpose & Mission Section */}
      <section className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl p-7 sm:p-10 bg-gradient-to-br from-emerald-900 via-slate-900 to-brand-950 text-white shadow-xl overflow-hidden border border-emerald-500/20">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-5 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase tracking-wider text-[11px]">{t('landing.purpose.badge')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('landing.purpose.title')}
            </h2>

            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-light">
              {t('landing.purpose.subtitle')}
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('landing.purpose.missionText')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-200 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Evidence-Based Child Psychology</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-200 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero Judgment Practice Environment</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-200 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-brand-300 shrink-0" />
                <span>Tailored for Every Child's Milestones</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities & Pillars */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span className="uppercase tracking-wider text-[11px]">{t('landing.pillars.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('landing.pillars.title')}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('landing.pillars.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="calm-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all border border-slate-200/80 group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>{t('landing.pillar.practice.title')}</span>
                <span className="text-[10px] font-semibold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full uppercase">Interactive</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.pillar.practice.desc')}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <NavLink to="/practice" className="font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
                <span>Try a Practice Session</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </div>

          <div className="calm-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all border border-slate-200/80 group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>{t('landing.pillar.coach.title')}</span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">24/7 Support</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.pillar.coach.desc')}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <NavLink to="/dashboard" className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                <span>Chat via Child Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </div>

          <div className="calm-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all border border-slate-200/80 group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>{t('landing.pillar.insights.title')}</span>
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase">Analytics</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.pillar.insights.desc')}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <NavLink to="/dashboard" className="font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <span>View Dashboard Insights</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </div>

          <div className="calm-card p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all border border-slate-200/80 group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>{t('landing.pillar.knowledge.title')}</span>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase">Verified</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.pillar.knowledge.desc')}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <NavLink to="/health" className="font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1">
                <span>Explore Research Library</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Journey Section */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span className="uppercase tracking-wider text-[11px]">{t('landing.guide.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('landing.guide.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900">{t('landing.guide.step1.title')}</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('landing.guide.step1.desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900">{t('landing.guide.step2.title')}</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('landing.guide.step2.desc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900">{t('landing.guide.step3.title')}</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('landing.guide.step3.desc')}
            </p>
          </div>
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



      {/* User Testimonials Section - Infinite Moving Carousel */}
      <section className="space-y-6 max-w-6xl mx-auto overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-3 px-4">
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <Quote className="w-3.5 h-3.5 text-amber-600" />
            <span className="uppercase tracking-wider text-[11px]">{t('landing.testimonials.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('landing.testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Marquee Track */}
        <div className="relative w-full overflow-hidden py-3">
          {/* Subtle gradient edge fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[#FFFDE7] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[#FFFDE7] to-transparent" />

          <div className="animate-marquee gap-6 px-4">
            {[
              {
                name: 'Noor',
                role: 'Parent',
                feedback: 'Amazed, it used the check in information and generated an answer and that to accurate.',
                initials: 'N',
                avatarBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              },
              {
                name: 'Amna Sabahat',
                role: 'Parent & Educator',
                feedback: "I've had such a great experience exploring this app, and I would definitely recommend it to parents and caregivers! Today’s parents really need more supportive tools like this for their children's growth and training.",
                initials: 'AS',
                avatarBg: 'bg-brand-100 text-brand-800 border-brand-200',
              },
              {
                name: 'Shahab Mahmood',
                role: 'Parent',
                feedback: 'It was a good way for parents in their children parenting',
                initials: 'SM',
                avatarBg: 'bg-blue-100 text-blue-800 border-blue-200',
              },
              {
                name: 'Aqsa Owais',
                role: 'Caregiver',
                feedback: 'Excellent Experience',
                initials: 'AO',
                avatarBg: 'bg-purple-100 text-purple-800 border-purple-200',
              },
            ].concat([
              {
                name: 'Noor',
                role: 'Parent',
                feedback: 'Amazed, it used the check in information and generated an answer and that to accurate.',
                initials: 'N',
                avatarBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              },
              {
                name: 'Amna Sabahat',
                role: 'Parent & Educator',
                feedback: "I've had such a great experience exploring this app, and I would definitely recommend it to parents and caregivers! Today’s parents really need more supportive tools like this for their children's growth and training.",
                initials: 'AS',
                avatarBg: 'bg-brand-100 text-brand-800 border-brand-200',
              },
              {
                name: 'Shahab Mahmood',
                role: 'Parent',
                feedback: 'It was a good way for parents in their children parenting',
                initials: 'SM',
                avatarBg: 'bg-blue-100 text-blue-800 border-blue-200',
              },
              {
                name: 'Aqsa Owais',
                role: 'Caregiver',
                feedback: 'Excellent Experience',
                initials: 'AO',
                avatarBg: 'bg-purple-100 text-purple-800 border-purple-200',
              },
            ]).map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 calm-card p-6 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-white shrink-0 border border-amber-100"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-4">
                    "{item.feedback}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${item.avatarBg} shadow-2xs`}>
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Recommendations / Upcoming Features Section - Infinite Moving Transition */}
      <section className="space-y-6 max-w-6xl mx-auto overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-3 px-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
            <span className="uppercase tracking-wider text-[11px]">{t('landing.recommendations.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('landing.recommendations.title')}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('landing.recommendations.subtitle')}
          </p>
        </div>

        {/* Recommendations Marquee Track (Scrolling In Opposite Direction) */}
        <div className="relative w-full overflow-hidden py-3">
          {/* Subtle gradient edge fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[#FFFDE7] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[#FFFDE7] to-transparent" />

          <div className="animate-marquee-reverse gap-6 px-4">
            {[
              {
                name: 'Hadia Gilani',
                role: 'Community Member',
                suggestion: 'Add a sectionn for specially abled childs',
                initials: 'HG',
                avatarBg: 'bg-rose-100 text-rose-800 border-rose-200',
                tag: 'In Roadmap',
                tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
              },
              {
                name: 'Sidra',
                role: 'Parent Contributor',
                suggestion: "I think it's fr parents and kids too if they have interacting with their parents or may be not but add some kind of animation",
                initials: 'S',
                avatarBg: 'bg-amber-100 text-amber-800 border-amber-200',
                tag: 'Designing',
                tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
              },
              {
                name: 'Najma Razzaq',
                role: 'Community Member',
                suggestion: 'i feel difficult to find pages, i mean there is not a clear tab or button which lead towards AI coch and insights button. i accidentally clicked view profile and i find these pages so please make them visible and descriptive',
                initials: 'NR',
                avatarBg: 'bg-teal-100 text-teal-800 border-teal-200',
                tag: 'UI Improvement',
                tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
              },
            ].concat([
              {
                name: 'Hadia Gilani',
                role: 'Community Member',
                suggestion: 'Add a sectionn for specially abled childs',
                initials: 'HG',
                avatarBg: 'bg-rose-100 text-rose-800 border-rose-200',
                tag: 'In Roadmap',
                tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
              },
              {
                name: 'Sidra',
                role: 'Parent Contributor',
                suggestion: "I think it's fr parents and kids too if they have interacting with their parents or may be not but add some kind of animation",
                initials: 'S',
                avatarBg: 'bg-amber-100 text-amber-800 border-amber-200',
                tag: 'Designing',
                tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
              },
              {
                name: 'Najma Razzaq',
                role: 'Community Member',
                suggestion: 'i feel difficult to find pages, i mean there is not a clear tab or button which lead towards AI coch and insights button. i accidentally clicked view profile and i find these pages so please make them visible and descriptive',
                initials: 'NR',
                avatarBg: 'bg-teal-100 text-teal-800 border-teal-200',
                tag: 'UI Improvement',
                tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
              },
            ]).map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 calm-card p-6 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-indigo-100 bg-white shrink-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('landing.recommendations.status')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-4">
                    "{item.suggestion}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${item.avatarBg} shadow-2xs`}>
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
