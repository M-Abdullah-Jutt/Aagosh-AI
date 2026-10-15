import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  Activity,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Gamepad2,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../services/api';

const ProductAdmin = () => {
  const [stats, setStats] = useState({
    checkin_adoption: 0,
    coach_adoption: 0,
    total_children: 0,
    total_checkins: 0,
    total_conversations: 0,
    feedback_stats: {
      total_feedback: 0,
      helpful_feedback: 0,
      not_helpful_feedback: 0,
      overall_satisfaction: 100,
      coach: { total: 0, helpful: 0, satisfaction: 100 },
      practice: { total: 0, helpful: 0, satisfaction: 100 },
      recent: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fb = stats.feedback_stats || {
    total_feedback: 0,
    helpful_feedback: 0,
    not_helpful_feedback: 0,
    overall_satisfaction: 100,
    coach: { total: 0, helpful: 0, satisfaction: 100 },
    practice: { total: 0, helpful: 0, satisfaction: 100 },
    recent: []
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Parent Guidance Satisfaction Overview */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Parent Guidance Feedback Quality</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Guidance Helpfulness & Satisfaction Score
          </h2>
          <p className="text-orange-100 text-xs sm:text-sm max-w-xl">
            Live metrics aggregated from parent evaluations across AI Chat Coach conversations and interactive Parent Practice simulations.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 self-start md:self-auto shrink-0">
          <div className="text-center">
            <span className="text-3xl font-black block">{fb.overall_satisfaction}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-200">Helpful Rate</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <span className="text-2xl font-bold block">{fb.total_feedback}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-200">Total Votes</span>
          </div>
        </div>
      </div>

      {/* Module-by-Module Guidance Feedback Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Chat Coach Feedback Card */}
        <div className="bg-white shadow rounded-2xl p-6 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Chat Coach Feedback</h3>
                <span className="text-xs text-slate-500">Parent advice queries & scripts</span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {fb.coach.satisfaction}% Helpful
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Helpful vs Unhelpful Ratings</span>
              <span>{fb.coach.helpful} of {fb.coach.total} ratings</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${fb.coach.satisfaction}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-bold block text-base flex items-center justify-center gap-1">
                <ThumbsUp className="w-4 h-4" /> {fb.coach.helpful}
              </span>
              <span className="text-emerald-800 text-[11px] font-medium">Helpful Answers</span>
            </div>
            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
              <span className="text-rose-700 font-bold block text-base flex items-center justify-center gap-1">
                <ThumbsDown className="w-4 h-4" /> {Math.max(0, fb.coach.total - fb.coach.helpful)}
              </span>
              <span className="text-rose-800 text-[11px] font-medium">Unhelpful / Not Fit</span>
            </div>
          </div>
        </div>

        {/* Parent Practice Session Feedback Card */}
        <div className="bg-white shadow rounded-2xl p-6 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Parent Practice Session Feedback</h3>
                <span className="text-xs text-slate-500">Virtual child scenarios & debriefs</span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              {fb.practice.satisfaction}% Helpful
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Simulation & Debrief Helpfulness</span>
              <span>{fb.practice.helpful} of {fb.practice.total} sessions</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${fb.practice.satisfaction}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
            <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-100">
              <span className="text-orange-700 font-bold block text-base flex items-center justify-center gap-1">
                <ThumbsUp className="w-4 h-4" /> {fb.practice.helpful}
              </span>
              <span className="text-orange-800 text-[11px] font-medium">Helpful Practice</span>
            </div>
            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
              <span className="text-rose-700 font-bold block text-base flex items-center justify-center gap-1">
                <ThumbsDown className="w-4 h-4" /> {Math.max(0, fb.practice.total - fb.practice.helpful)}
              </span>
              <span className="text-rose-800 text-[11px] font-medium">Needs Adjustment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Parent Comments Feed */}
      <div className="bg-white shadow rounded-2xl p-6 border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Recent Parent Feedback Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Real-time Stream</span>
        </div>

        {fb.recent && fb.recent.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {fb.recent.map((entry) => (
              <div key={entry.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div className="flex items-start space-x-2.5">
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shrink-0 ${
                      entry.is_helpful
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {entry.is_helpful ? '👍 Helpful' : '👎 Not Helpful'}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 capitalize mr-2">
                      {entry.module === 'ai_chat_coach' ? 'AI Chat Coach' : 'Practice Session'}
                    </span>
                    {entry.comment && (
                      <span className="text-slate-600 italic">"{entry.comment}"</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No parent feedback logged yet. Responses will appear here in real time as parents click Helpful / Not Helpful.
          </div>
        )}
      </div>

      {/* Existing Core Metric Totals & Feature Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Analytics */}
        <div className="bg-white shadow rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-6 w-6 text-orange-500 mr-2" />
            <h3 className="text-base font-bold text-slate-900">Feature Adoption</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Profiles with Daily Check-ins</span>
                <span className="font-semibold text-slate-900">{stats.checkin_adoption}% adoption</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats.checkin_adoption}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Profiles Using AI Coach</span>
                <span className="font-semibold text-slate-900">{stats.coach_adoption}% adoption</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.coach_adoption}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Real usage totals */}
        <div className="bg-white shadow rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-orange-500 mr-2" />
            <h3 className="text-base font-bold text-slate-900">Core Metric Totals</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-600">Total Child Profiles</span>
              <span className="text-base font-bold text-slate-900">{stats.total_children}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-600">Total Behaviors / Check-ins</span>
              <span className="text-base font-bold text-slate-900">{stats.total_checkins}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs text-slate-600">Total Coaching Sessions</span>
              <span className="text-base font-bold text-slate-900">{stats.total_conversations}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAdmin;
