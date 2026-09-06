import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { checkInService } from '../../services/checkInService';
import { childrenService } from '../../services/childrenService';
import {
  getMoodConfig,
  getEmotionConfig,
  getTriggerLabel,
  getResponseLabel,
  getOutcomeLabel,
} from '../../utils/checkInConstants';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ArrowLeft,
  Calendar,
  Smile,
  Meh,
  Frown,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  Activity,
  HeartHandshake,
} from 'lucide-react';

export const CheckInDetailsPage = () => {
  const { childId, checkInId } = useParams();
  const navigate = useNavigate();
  const { t, formatDate } = useLanguage();

  const [child, setChild] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCheckInDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      const childData = await childrenService.getChild(childId);
      setChild(childData);
      const data = await checkInService.getCheckIn(childId, checkInId);
      setCheckIn(data);
    } catch (err) {
      console.error('Failed to load check-in details:', err);
      setError(t('checkIns.notFoundError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckInDetails();
  }, [childId, checkInId]);

  const handleDeleteCheckIn = async () => {
    try {
      setIsDeleting(true);
      await checkInService.deleteCheckIn(childId, checkInId);
      navigate(`/children/${childId}/check-ins`, { replace: true });
    } catch (err) {
      console.error('Failed to delete check-in:', err);
      setError(t('checkIns.deleteError'));
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm(t('checkIns.confirmDeleteEvent'))) return;
    try {
      await checkInService.deleteEvent(childId, checkInId, eventId);
      fetchCheckInDetails();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-emerald-800">{t('checkIns.detailsLoading')}</p>
        </div>
      </div>
    );
  }

  if (error || !checkIn) {
    return (
      <div className="min-h-[85vh] bg-slate-50/50 py-12 px-4 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">{t('checkIns.notFoundTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1">{error || t('checkIns.notFoundBody')}</p>
        <Link
          to={`/children/${childId}/check-ins`}
          className="mt-6 inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('checkIns.backToCheckIns')}</span>
        </Link>
      </div>
    );
  }

  const moodConfig = getMoodConfig(t, checkIn.overall_mood);
  const formattedDate = formatDate(checkIn.check_in_date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/children/${childId}/check-ins`}
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('checkIns.backToList')}</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to={`/children/${childId}/check-ins/${checkInId}/edit`}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold text-sm transition"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>{t('common.edit')}</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold text-sm transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('common.delete')}</span>
            </button>
          </div>
        </div>

        {/* Check-In Header Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{t('checkIns.entryFor', { name: child?.first_name })}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{formattedDate}</h1>
            </div>

            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl border font-bold text-sm shrink-0 self-start sm:self-center ${moodConfig.color}`}>
              {checkIn.overall_mood === 'good' && <Smile className="w-5 h-5 text-emerald-600" />}
              {checkIn.overall_mood === 'okay' && <Meh className="w-5 h-5 text-amber-600" />}
              {checkIn.overall_mood === 'difficult' && <Frown className="w-5 h-5 text-rose-600" />}
              <span>{t('checkIns.overallDay', { mood: moodConfig.label })}</span>
            </div>
          </div>

          {/* General Notes */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('checkIns.generalNotesHeading')}
            </h2>
            {checkIn.general_notes ? (
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                {checkIn.general_notes}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">{t('checkIns.noGeneralNotes')}</p>
            )}
          </div>
        </div>

        {/* Behavior Events Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-800">
                {t('checkIns.behaviorEvents', { n: checkIn.behavior_events?.length || 0 })}
              </h2>
            </div>
          </div>

          {!checkIn.behavior_events || checkIn.behavior_events.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>{t('checkIns.noBehaviorEvents')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkIn.behavior_events.map((ev, idx) => {
                const emotionConf = getEmotionConfig(t, ev.emotion);
                return (
                  <div
                    key={ev.id}
                    className="p-5 bg-slate-50/70 border border-slate-200/70 rounded-2xl space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-400">{t('checkIns.eventNumber', { n: idx + 1 })}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${emotionConf.color}`}>
                          {t('checkIns.emotionValue', { emotion: emotionConf.label })}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                          {t('checkIns.intensityValue', { n: ev.intensity })}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title={t('checkIns.deleteEventTitle')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* What Happened Description */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        {t('checkIns.whatHappened')}
                      </h4>
                      <p className="text-sm font-medium text-slate-800 whitespace-pre-line">
                        {ev.behavior_description}
                      </p>
                    </div>

                    {/* Structured Meta Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block">{t('checkIns.triggerHeading')}</span>
                        <span className="font-semibold text-slate-700">{getTriggerLabel(t, ev.trigger)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">{t('checkIns.strategyHeading')}</span>
                        <span className="font-semibold text-slate-700">{getResponseLabel(t, ev.parent_response)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">{t('checkIns.outcomeHeading')}</span>
                        <span className="font-semibold text-slate-700">{getOutcomeLabel(t, ev.outcome)}</span>
                      </div>
                    </div>

                    {ev.event_notes && (
                      <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-600 block mb-0.5">{t('checkIns.additionalNotesValue')}</span>
                        {ev.event_notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{t('checkIns.deleteTitle')}</h3>
            <p className="text-sm text-slate-600">
              {t('checkIns.deleteBodyStart')} <strong className="text-slate-800">{formattedDate}</strong>{t('checkIns.deleteBodyEnd')}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteCheckIn}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('common.deleting')}</span>
                  </>
                ) : (
                  <span>{t('common.confirmDelete')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInDetailsPage;
