import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { childrenService } from '../../services/childrenService';
import { getGoalTypeLabel, getPriorityBadge } from '../../utils/goalConstants';
import {
  ArrowLeft,
  User,
  Heart,
  Target,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
  MessageCircle,
} from 'lucide-react';

export const ChildDetailsPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchChildDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await childrenService.getChild(childId);
      setChild(data);
    } catch (err) {
      console.error('Failed to load child details:', err);
      setError('Child profile not found or access denied.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildDetails();
  }, [childId]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await childrenService.deleteChild(childId);
      navigate('/children', { replace: true });
    } catch (err) {
      console.error('Failed to delete child profile:', err);
      setError('Failed to delete profile. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-emerald-800">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="min-h-[85vh] bg-slate-50/50 py-12 px-4 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'The requested child profile does not exist.'}</p>
        <Link
          to="/children"
          className="mt-6 inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Children</span>
        </Link>
      </div>
    );
  }

  const activeGoals = child.goals?.filter((g) => g.is_active) || [];
  const inactiveGoals = child.goals?.filter((g) => !g.is_active) || [];

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Actions Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/children"
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Children</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to={`/children/${child.id}/edit`}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold text-sm transition"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-semibold text-sm transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                {child.first_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{child.first_name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold px-3 py-1 rounded-full">
                    Age: {child.age_display || 'N/A'}
                  </span>
                  {child.gender && (
                    <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {child.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div className="text-xs">
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-800">{child.date_of_birth}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Track daily mood and specific behavior situations for {child.first_name}.
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/children/${child.id}/coach`}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask AI Coach</span>
              </Link>
              <Link
                to={`/children/${child.id}/analytics`}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:shadow transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Behavior Insights</span>
              </Link>
              <Link
                to={`/children/${child.id}/check-ins`}
                className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:shadow transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Daily Check-Ins</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Observations Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              <span>Parent Observations & Insights</span>
            </h2>
            <Link
              to={`/children/${child.id}/edit`}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Edit Observations
            </Link>
          </div>

          {!child.profile ||
          (!child.profile.strengths &&
            !child.profile.challenges &&
            !child.profile.personality_notes &&
            !child.profile.communication_style) ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              <p>No observations added yet.</p>
              <Link
                to={`/children/${child.id}/edit`}
                className="mt-2 inline-block text-xs font-semibold text-emerald-600 hover:underline"
              >
                + Add observations about {child.first_name}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {child.profile.strengths && (
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1.5">
                    Strengths & Interests
                  </h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{child.profile.strengths}</p>
                </div>
              )}

              {child.profile.challenges && (
                <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
                    Challenges & Growth Areas
                  </h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{child.profile.challenges}</p>
                </div>
              )}

              {child.profile.personality_notes && (
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Personality Notes
                  </h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{child.profile.personality_notes}</p>
                </div>
              )}

              {child.profile.communication_style && (
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Communication Style
                  </h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{child.profile.communication_style}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Parenting Goals Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-800">Parenting Goals</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                {activeGoals.length} Active
              </span>
            </div>
            <Link
              to={`/children/${child.id}/goals`}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Manage Goals</span>
            </Link>
          </div>

          {child.goals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>No parenting goals defined for {child.first_name} yet.</p>
              <Link
                to={`/children/${child.id}/goals`}
                className="mt-3 inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Set first goal</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Goals */}
              <div className="space-y-3">
                {activeGoals.map((goal) => {
                  const priority = getPriorityBadge(goal.priority);
                  return (
                    <div
                      key={goal.id}
                      className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-800 text-sm">
                            {getGoalTypeLabel(goal.goal_type)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priority.color}`}>
                            {priority.label}
                          </span>
                        </div>
                        {goal.description && (
                          <p className="text-xs text-slate-600 pl-6">{goal.description}</p>
                        )}
                      </div>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-center">
                        Active
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Inactive Goals */}
              {inactiveGoals.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Deactivated Goals ({inactiveGoals.length})
                  </h3>
                  <div className="space-y-2">
                    {inactiveGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-3 bg-slate-50/50 border border-slate-100 rounded-lg flex items-center justify-between opacity-60 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{getGoalTypeLabel(goal.goal_type)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase">Inactive</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Delete Child Profile</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-800">{child.first_name}</strong>'s profile?
              This will permanently remove all associated observations and parenting goals.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildDetailsPage;
