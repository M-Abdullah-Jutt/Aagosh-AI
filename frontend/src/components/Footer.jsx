import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      {/* Important Disclaimer Notice */}
      <div className="bg-amber-950/40 border-b border-amber-900/30 text-amber-200/90 py-3.5 px-4 text-xs">
        <div className="max-w-6xl mx-auto flex items-start sm:items-center space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-300">{t('footer.disclaimerLabel')}</strong> {t('app.name')} {t('footer.disclaimerPart1')} <strong>{t('footer.disclaimerNotMedical')}</strong> {t('footer.disclaimerAnd')} <strong>{t('footer.disclaimerNotReplacement')}</strong> {t('footer.disclaimerPart2')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
            <span className="font-medium text-stone-200">{t('app.name')}</span>
            <span>{t('footer.productLine')}</span>
          </div>

          <p className="text-xs text-stone-500">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
