import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import analyticsService from '../../services/analyticsService';
import childrenService from '../../services/childrenService';
import { MOOD_CONFIG, EMOTION_CONFIG, TRIGGER_CONFIG } from '../../utils/checkInConstants';

export default function AnalyticsPage() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [childId, period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [childData, analyticsData] = await Promise.all([
        childrenService.getChild(childId),
        analyticsService.getAnalyticsSummary(childId, period)
      ]);
      setChild(childData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      if (err.response && err.response.status === 404) {
        setError("Child profile not found.");
      } else {
        setError("Failed to load behavior insights. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSufficiencyBadge = (level) => {
    switch (level) {
      case 'basic_pattern_analysis':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Basic Pattern Analysis
          </span>
        );
      case 'early_observations':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Early Observations
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Insufficient Data
          </span>
        );
    }
  };

  const formatLabel = (key, configMap) => {
    if (!key) return 'None';
    if (configMap && configMap[key]) {
      return configMap[key].label;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <p className="text-rose-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate('/children')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Children
          </button>
        </div>
      </div>
    );
  }

  const {
    data_sufficiency,
    check_ins,
    events,
    emotions,
    triggers,
    intensity,
    parent_responses,
    outcomes,
    recent_activity,
    trend,
    frequent_contexts,
    goal_alignment
  } = analytics || {};

  const isInsufficient = data_sufficiency?.level === 'insufficient_data' || events?.total === 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(`/children/${childId}`)}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          {getSufficiencyBadge(data_sufficiency?.level)}
        </div>

        {/* Page Title & Period Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Behavior Insights {child?.first_name ? `— ${child.first_name}` : ''}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Structured, explainable statistics derived directly from parent-recorded observations.
              </p>
            </div>

            {/* Time Window Selectors */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              {[
                { id: '7d', label: '7 Days' },
                { id: '14d', label: '14 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setPeriod(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    period === item.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sufficiency Notice Banner */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-medium text-indigo-900">{data_sufficiency?.message}</p>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Check-Ins</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{check_ins?.total || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Behavior Events</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{events?.total || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Most Observed Emotion</p>
            <p className="text-lg font-semibold text-slate-800 mt-1 truncate">
              {emotions?.most_observed ? formatLabel(emotions.most_observed, EMOTION_CONFIG) : '—'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Most Observed Trigger</p>
            <p className="text-lg font-semibold text-slate-800 mt-1 truncate">
              {triggers?.most_observed ? formatLabel(triggers.most_observed, TRIGGER_CONFIG) : '—'}
            </p>
          </div>
        </div>

        {/* Empty State / Insufficient Data */}
        {isInsufficient ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Not enough observations yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Continue recording daily check-ins and behavior events to build a clearer, explainable behavioral picture over time.
            </p>
            <Link
              to={`/children/${childId}/check-ins/new`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              + Record Daily Check-In
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Intensity & Trends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Intensity Distribution */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">Observed Intensity</h2>
                  <span className="text-sm font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                    Average: {intensity?.average} / 5
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Distribution of parent-rated intensity levels (1 = Very Mild, 5 = Severe / Intense).
                </p>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(level => {
                    const cnt = intensity?.distribution?.[String(level)] || 0;
                    const pct = events?.total > 0 ? (cnt / events.total) * 100 : 0;
                    return (
                      <div key={level} className="flex items-center text-xs">
                        <span className="w-16 font-medium text-slate-600">Level {level}</span>
                        <div className="flex-1 mx-3 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-right font-medium text-slate-700">{cnt} ({Math.round(pct)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity & Deterministic Trend */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-2">Recent Activity Comparison</h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Comparison of event counts between the selected window and the previous equivalent period.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Current Period ({period}):</span>
                      <span className="font-semibold text-slate-900">{recent_activity?.current_period_events} events</span>
                    </div>
                    {recent_activity?.previous_period_events !== null && (
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Previous Equivalent Period:</span>
                        <span className="font-semibold text-slate-900">{recent_activity?.previous_period_events} events</span>
                      </div>
                    )}
                    <p className="text-xs font-medium text-indigo-700 pt-2 border-t border-slate-200">
                      {recent_activity?.summary_message}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Deterministic Trend Indicator: </span>
                  <span className="text-xs font-semibold capitalize text-slate-800 ml-1">
                    {trend?.direction ? trend.direction.replace(/_/g, ' ') : 'Stable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emotions & Triggers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emotion Frequency */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-1">Frequently Observed Emotions</h2>
                <p className="text-xs text-slate-500 mb-4">Total occurrences recorded across check-ins.</p>
                <div className="space-y-3">
                  {Object.entries(emotions?.frequencies || {}).map(([emoKey, count]) => {
                    const pct = events?.total > 0 ? (count / events.total) * 100 : 0;
                    return (
                      <div key={emoKey} className="text-xs">
                        <div className="flex justify-between font-medium text-slate-700 mb-1">
                          <span>{formatLabel(emoKey, EMOTION_CONFIG)}</span>
                          <span>{count} events</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trigger Frequency */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-1">Frequently Observed Triggers</h2>
                <p className="text-xs text-slate-500 mb-4">Recorded contextual triggers preceding events.</p>
                <div className="space-y-3">
                  {Object.entries(triggers?.frequencies || {}).map(([trigKey, count]) => {
                    const pct = triggers?.percentages?.[trigKey] || 0;
                    return (
                      <div key={trigKey} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <span className="font-semibold text-slate-800">{formatLabel(trigKey, TRIGGER_CONFIG)}</span>
                        <div className="text-right">
                          <span className="font-bold text-indigo-600">{count} events</span>
                          <span className="text-slate-400 ml-2">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Frequently Recorded Context Combinations */}
            {frequent_contexts && frequent_contexts.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-1">Frequently Recorded Contexts</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Common trigger and emotion combinations observed together.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {frequent_contexts.map((ctx, idx) => (
                    <div key={idx} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-indigo-950">
                          {formatLabel(ctx.trigger, TRIGGER_CONFIG)} + {formatLabel(ctx.emotion, EMOTION_CONFIG)}
                        </p>
                        <p className="text-[11px] text-indigo-600 mt-0.5">Observed together</p>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-xs">
                        {ctx.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parenting Goal Alignment */}
            {goal_alignment && goal_alignment.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-1">Parenting Goal Alignment</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Relationship between your active parenting goals and recorded behavior observations.
                </p>
                <div className="space-y-3">
                  {goal_alignment.map((goal, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full capitalize">
                          {goal.goal_type.replace(/_/g, ' ')}
                        </span>
                        {goal.goal_description && (
                          <p className="text-xs text-slate-600 mt-1">{goal.goal_description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-semibold text-slate-800">
                          {goal.related_observations} related events recorded
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
