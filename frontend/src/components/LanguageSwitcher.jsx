import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const LanguageSwitcher = () => {
  const { lang, setLang, languages, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="flex items-center gap-0.5 rounded-full border border-stone-200 bg-stone-50/80 p-0.5"
    >
      {languages.map((language) => {
        const isActive = language.code === lang;
        return (
          <button
            key={language.code}
            type="button"
            onClick={() => setLang(language.code)}
            aria-pressed={isActive}
            dir={language.dir}
            title={t('language.switchHint', { language: language.nativeLabel })}
            className={
              'rounded-full px-2.5 py-1 text-[13px] leading-[1.35] font-semibold transition-colors ' +
              (language.dir === 'rtl' ? 'font-urdu ' : 'font-sans ') +
              (isActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-500 hover:bg-white hover:text-slate-800')
            }
          >
            {language.shortLabel}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
