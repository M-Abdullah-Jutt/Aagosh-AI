import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { childrenService } from '../../services/childrenService';
import { checkInService } from '../../services/checkInService';
import { getMoodConfig } from '../../utils/checkInConstants';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ArrowLeft,
  Calendar,
  Plus,
  ChevronRight,
  AlertCircle,
  Activity,
  Sparkles,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';

export const CheckInsListPage = () => {
  const { childId } = useParams();
  const { t, formatDate } = useLanguage();

  const [child, setChild] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCheckIns = async () => {
    try {
      setIsLoading(true);
      setError('');
      const childData = await childrenService.getChild(childId);
      setChild(childData);
      const listData = await checkInService.getCheckIns(childId);
      setCheckIns(listData);
    } catch (err) {
      console.error('Failed to load check-ins:', err);
      setError(t('checkIns.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, [childId]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-emerald-800">{t('checkIns.loading')}</p>
        </div>
      </div>
    );
  }

  const renderMoodIcon = (moodId) => {
    if (moodId === 'good') return <Smile className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (moodId === 'okay') return <Meh className="w-4 h-4 text-amber-600 shrink-0" />;
    return <Frown className="w-4 h-4 text-rose-600 shrink-0" />;
  };

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to={`/children/${childId}`}
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.backToProfile', { name: child?.first_name || t('coach.childLabelFallback') })}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('checkIns.badge')}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t('checkIns.title', { name: child?.first_name })}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('checkIns.subtitle')}
            </p>
          </div>
          <Link
            to={`/children/${childId}/check-ins/new`}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>{t('checkIns.newCheckIn')}</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Timeline List */}
        {checkIns.length === 0 ? (
          <div className="bg-white border border-dashed border-emerald-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-emerald-100/70 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('checkIns.emptyTitle')}</h2>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              {t('checkIns.emptyBody')}
            </p>
            <Link
              to={`/children/${childId}/check-ins/new`}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition mt-6"
            >
              <Plus className="w-4 h-4" />
              <span>{t('checkIns.recordFirst')}</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>{t('checkIns.history', { n: checkIns.length })}</span>
            </h2>

            <div className="space-y-3">
              {checkIns.map((ci) => {
                const moodConfig = getMoodConfig(t, ci.overall_mood);
                const formattedDate = formatDate(ci.check_in_date, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <Link
                    key={ci.id}
                    to={`/children/${childId}/check-ins/${ci.id}`}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl flex items-center justify-between transition group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-slate-900">
                          {formattedDate}
                        </span>
                        <div className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${moodConfig.color}`}>
                          {renderMoodIcon(ci.overall_mood)}
                          <span>{moodConfig.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span>
                          {ci.events_count || 0} {t('checkIns.behaviorEventsCount', { count: ci.events_count || 0 })}
                        </span>
                        {ci.general_notes && (
                          <span className="truncate max-w-md italic text-slate-600">
                            • "{ci.general_notes}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                      <span>{t('common.details')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInsListPage;
