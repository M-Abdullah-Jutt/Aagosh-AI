import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { checkInService } from '../../services/checkInService';
import BehaviorEventForm from '../../components/events/BehaviorEventForm';
import { OVERALL_MOODS } from '../../utils/checkInConstants';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeOptions } from '../../utils/i18nOptions';
import { ArrowLeft, Calendar, Smile, Plus, AlertCircle, Sparkles } from 'lucide-react';

export const CreateCheckInPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    check_in_date: todayStr,
    overall_mood: 'good',
    general_notes: '',
  });

  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEvent = () => {
    setEvents((prev) => [
      ...prev,
      {
        emotion: 'frustrated',
        intensity: 3,
        trigger: 'transition',
        behavior_description: '',
        parent_response: 'talked_calmly',
        outcome: 'calmed_down',
        event_notes: '',
      },
    ]);
  };

  const handleRemoveEvent = (index) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEventChange = (index, updatedEvent) => {
    setEvents((prev) => {
      const copy = [...prev];
      copy[index] = updatedEvent;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.check_in_date) {
      setError(t('checkIns.errDate'));
      return;
    }

    const selectedDate = new Date(formData.check_in_date);
    const today = new Date();
    if (selectedDate > today) {
      setError(t('checkIns.errFutureDate'));
      return;
    }

    // Validate behavior events if any exist
    for (let i = 0; i < events.length; i++) {
      if (!events[i].behavior_description.trim()) {
        setError(t('checkIns.errEventDescription', { n: i + 1 }));
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      check_in_date: formData.check_in_date,
      overall_mood: formData.overall_mood,
      general_notes: formData.general_notes.trim() || null,
      events: events.map((ev) => ({
        emotion: ev.emotion,
        intensity: Number(ev.intensity),
        trigger: ev.trigger || null,
        behavior_description: ev.behavior_description.trim(),
        parent_response: ev.parent_response || null,
        outcome: ev.outcome || null,
        event_notes: ev.event_notes?.trim() || null,
      })),
    };

    try {
      const created = await checkInService.createCheckIn(childId, payload);
      navigate(`/children/${childId}/check-ins/${created.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create check-in:', err);
      const msg = err?.response?.data?.detail || t('checkIns.errSave');
      setError(typeof msg === 'string' ? msg : t('common.validationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to={`/children/${childId}/check-ins`}
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('checkIns.backToCheckIns')}</span>
        </Link>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('checkIns.createBadge')}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t('checkIns.createTitle')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('checkIns.createSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Section 1: Check-in Date & Overall Mood */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Smile className="w-5 h-5 text-emerald-600" />
                <span>{t('checkIns.createSection1')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {localizeOptions(t, OVERALL_MOODS).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, overall_mood: m.id })}
                    className={`py-3.5 px-4 rounded-xl border font-bold text-sm transition flex items-center justify-center space-x-2 ${
                      formData.overall_mood === m.id
                        ? `${m.color} shadow-sm ring-2 ring-emerald-500/50`
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label htmlFor="check_in_date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  {t('checkIns.checkInDate')}
                </label>
                <input
                  id="check_in_date"
                  type="date"
                  required
                  value={formData.check_in_date}
                  onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                  className="w-full sm:w-64 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                />
              </div>
            </div>

            {/* Section 2: Optional General Notes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>{t('checkIns.createSection2')}</span>
                </h2>
                <span className="text-xs font-medium text-slate-400">{t('common.optional')}</span>
              </div>

              <div>
                <label htmlFor="general_notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  {t('checkIns.whatHappenedToday')}
                </label>
                <textarea
                  id="general_notes"
                  rows={3}
                  value={formData.general_notes}
                  onChange={(e) => setFormData({ ...formData, general_notes: e.target.value })}
                  placeholder={t('checkIns.generalNotesPlaceholder')}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                />
              </div>
            </div>

            {/* Section 3: Behavior Events */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    {t('checkIns.createSection3', { n: events.length })}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('checkIns.createSection3Hint')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('checkIns.addBehaviorEvent')}</span>
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-6 bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
                  {t('checkIns.noEventsAdded')}
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((ev, idx) => (
                    <BehaviorEventForm
                      key={idx}
                      eventData={ev}
                      onChange={(updated) => handleEventChange(idx, updated)}
                      onRemove={() => handleRemoveEvent(idx)}
                      showRemove={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Submit Controls */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
              <Link
                to={`/children/${childId}/check-ins`}
                className="px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                {t('common.cancel')}
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('checkIns.savingCheckIn')}</span>
                  </>
                ) : (
                  <span>{t('checkIns.saveCheckIn')}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCheckInPage;
