import React from 'react';
import { BookOpen, ExternalLink, Database, FileText, Baby, ShieldCheck, Layers } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const CDC_SOURCES = [
  {
    id: 'stacks',
    icon: Database,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    url: 'https://stacks.cdc.gov',
  },
  {
    id: 'positive',
    icon: Baby,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    url: 'https://www.cdc.gov/child-development/positive-parenting-tips/',
  },
  {
    id: 'signs',
    icon: ShieldCheck,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 border-violet-100',
    tagColor: 'bg-violet-50 text-violet-700 border-violet-200',
    url: 'https://www.cdc.gov/ncbddd/actearly/index.html',
  },
];

const HOW_IT_WORKS = [
  { step: '01', color: 'bg-slate-800 text-white' },
  { step: '02', color: 'bg-emerald-700 text-white' },
  { step: '03', color: 'bg-indigo-700 text-white' },
  { step: '04', color: 'bg-teal-700 text-white' },
];

const HIGHLIGHT_INDEXES = [1, 2, 3, 4];

export const HealthPage = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">

      {/* Page header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3">
          <Layers className="w-3.5 h-3.5" />
          {t('knowledge.badge')}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {t('knowledge.title')}
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
          {t('knowledge.intro')}
        </p>
      </div>

      {/* Publisher banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-md">
        <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{t('knowledge.publisherName')}</h2>
          <p className="text-blue-100 text-sm mt-0.5 leading-relaxed">
            {t('knowledge.publisherDescription')}
          </p>
        </div>
        <a
          href="https://www.cdc.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white border border-white/25 hover:border-white/50 px-3 py-2 rounded-lg transition"
        >
          {t('knowledge.visitCdc')} <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Source cards */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          {t('knowledge.indexedSources')}
          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 ml-1">
            {t('knowledge.activeCount', { n: CDC_SOURCES.length })}
          </span>
        </h2>
        <div className="space-y-4">
          {CDC_SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <div
                key={source.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${source.iconBg}`}>
                    <Icon className={`w-5 h-5 ${source.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base">
                        {t(`knowledge.sources.${source.id}.title`)}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${source.tagColor}`}>
                        {t(`knowledge.sources.${source.id}.tag`)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {t(`knowledge.sources.${source.id}.description`)}
                    </p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                      {HIGHLIGHT_INDEXES.map((n) => (
                        <li key={n} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          {t(`knowledge.sources.${source.id}.highlight${n}`)}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      {t('knowledge.visitSource')} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How the guidance is built */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          {t('knowledge.howTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOW_IT_WORKS.map((item, index) => (
            <div key={item.step} className={`rounded-2xl p-4 space-y-2 ${item.color}`}>
              <span className="text-2xl font-black opacity-40">{item.step}</span>
              <p className="font-bold text-sm">{t(`knowledge.step${index + 1}.title`)}</p>
              <p className="text-xs opacity-80 leading-relaxed">{t(`knowledge.step${index + 1}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <strong className="font-bold">{t('knowledge.disclaimerTitle')}</strong>{' '}
          {t('knowledge.disclaimerPart1')} <em>{t('knowledge.disclaimerEmphasis')}</em>{' '}
          {t('knowledge.disclaimerPart2')} <strong>{t('knowledge.disclaimerStrong')}</strong>{' '}
          {t('knowledge.disclaimerPart3')}
        </div>
      </div>

    </div>
  );
};

export default HealthPage;
