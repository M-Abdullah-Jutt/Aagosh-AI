import React from 'react';
import { EMOTIONS, TRIGGERS, PARENT_RESPONSES, OUTCOMES } from '../../utils/checkInConstants';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeOptions } from '../../utils/i18nOptions';

export const BehaviorEventForm = ({ eventData, onChange, onRemove, showRemove = true }) => {
  const { t } = useLanguage();

  const handleFieldChange = (field, value) => {
    onChange({
      ...eventData,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4 relative">
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-4 right-4 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition"
        >
          {t('eventForm.removeEvent')}
        </button>
      )}

      <h4 className="text-sm font-bold text-slate-800 pr-24">
        {t('eventForm.title')}
      </h4>

      {/* Row 1: Emotion & Intensity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('eventForm.emotionQuestion')} <span className="text-red-500">*</span>
          </label>
          <select
            value={eventData.emotion || 'angry'}
            onChange={(e) => handleFieldChange('emotion', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
          >
            {localizeOptions(t, EMOTIONS).map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('eventForm.intensityQuestion')} <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleFieldChange('intensity', lvl)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                  Number(eventData.intensity) === lvl
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl} {lvl === 1 ? t('eventForm.mild') : lvl === 5 ? t('eventForm.strong') : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Trigger & Behavior Description */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('eventForm.triggerQuestion')} <span className="text-slate-400 font-normal lowercase">{t('common.optional')}</span>
          </label>
          <select
            value={eventData.trigger || ''}
            onChange={(e) => handleFieldChange('trigger', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
          >
            <option value="">{t('eventForm.selectTrigger')}</option>
            {localizeOptions(t, TRIGGERS).map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('eventForm.whatHappenedQuestion')} <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={eventData.behavior_description || ''}
            onChange={(e) => handleFieldChange('behavior_description', e.target.value)}
            placeholder={t('eventForm.behaviorPlaceholder')}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
          />
        </div>
      </div>

      {/* Row 3: Parent Response & Outcome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('eventForm.responseQuestion')} <span className="text-slate-400 font-normal lowercase">{t('common.optional')}</span>
          </label>
          <select
            value={eventData.parent_response || ''}
            onChange={(e) => handleFieldChange('parent_response', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
          >
            <option value="">{t('eventForm.selectResponse')}</option>
            {localizeOptions(t, PARENT_RESPONSES).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('eventForm.outcomeQuestion')} <span className="text-slate-400 font-normal lowercase">{t('common.optional')}</span>
          </label>
          <select
            value={eventData.outcome || ''}
            onChange={(e) => handleFieldChange('outcome', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
          >
            <option value="">{t('eventForm.selectOutcome')}</option>
            {localizeOptions(t, OUTCOMES).map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional Event Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {t('eventForm.additionalNotes')} <span className="text-slate-400 font-normal lowercase">{t('common.optional')}</span>
        </label>
        <input
          type="text"
          value={eventData.event_notes || ''}
          onChange={(e) => handleFieldChange('event_notes', e.target.value)}
          placeholder={t('eventForm.notesPlaceholder')}
          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-xs"
        />
      </div>
    </div>
  );
};

export default BehaviorEventForm;
