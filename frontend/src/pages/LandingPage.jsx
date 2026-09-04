import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, Compass, LineChart, BookOpen, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, PRINCIPLES } from '../utils/constants';

export const LandingPage = () => {

  const getStepIcon = (step) => {
    switch (step) {
      case 'Assess': return <Compass className="w-5 h-5 text-emerald-700" />;
      case 'Track': return <LineChart className="w-5 h-5 text-emerald-700" />;
      case 'Guide': return <BookOpen className="w-5 h-5 text-emerald-700" />;
      case 'Adapt': return <RefreshCw className="w-5 h-5 text-emerald-700" />;
      default: return <Heart className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Nurturing Every Stage of Your Child's Journey
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed font-normal">
          {APP_TAGLINE} Designed to bring clarity, calm, and actionable positive parenting insights to daily life.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NavLink
            to="/health"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore Knowledge Base</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </section>

      {/* Conceptual Loop Section */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            The Conceptual Loop
          </h2>
          <p className="text-sm text-stone-600">
            Assess → Track → Guide → Adapt
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((item, index) => (
            <div
              key={item.step}
              className="calm-card p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  {getStepIcon(item.step)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Step {index + 1}: {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Foundations Card */}
      <section className="calm-card p-8 bg-gradient-to-br from-white to-stone-50/60 border border-stone-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2 text-brand-700">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Clean MVP Architecture (Step 1)
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Scalable Core Foundation
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Built using React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, and Microsoft SQL Server. Clean separation of frontend, REST API, domain repositories, and modular backend logic.
            </p>
          </div>

          <div className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs font-mono w-full md:w-auto shrink-0 space-y-1.5">
            <div className="text-stone-400 font-sans text-[11px] font-semibold uppercase tracking-wider">
              Architecture Stack
            </div>
            <div>React + Vite SPA</div>
            <div className="text-emerald-400">FastAPI REST Backend</div>
            <div className="text-sky-400">SQLAlchemy ORM</div>
            <div className="text-amber-400">Microsoft SQL Server</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
