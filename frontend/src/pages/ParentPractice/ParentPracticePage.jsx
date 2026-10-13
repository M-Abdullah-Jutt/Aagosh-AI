import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ParentPracticeCenter from '../../components/ParentPractice/ParentPracticeCenter';
import { useLanguage } from '../../i18n/LanguageContext';

export const ParentPracticePage = () => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  return (
    <div className="py-4 sm:py-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Crisp, minimal page header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/60 pb-4">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-orange-600 transition mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            {isUrdu ? 'والدین کی عملی مشق' : 'Parent Practice'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {isUrdu
              ? 'آن لائن بچے کے ساتھ گفتگو کی مشق کریں اور سیشن کے بعد اے آئی کوچ سے اصلاحی رپورٹ حاصل کریں۔'
              : 'Roleplay real parenting situations with an online child and get instant feedback.'}
          </p>
        </div>
      </div>

      {/* Main Practice Component */}
      <ParentPracticeCenter />
    </div>
  );
};

export default ParentPracticePage;
