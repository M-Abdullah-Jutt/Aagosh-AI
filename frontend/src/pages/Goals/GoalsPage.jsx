import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { childrenService } from '../../services/childrenService';
import { GOAL_TYPES, GOAL_PRIORITIES, getGoalTypeLabel, getPriorityBadge } from '../../utils/goalConstants';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ArrowLeft,
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Power,
  Sparkles,
} from 'lucide-react';

export const GoalsPage = () => {
  const { childId } = useParams();
  const { t } = useLanguage();

  const [child, setChild] = useState(null);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [modalForm, setModalForm] = useState({
    goal_type: 'emotional_regulation',
    description: '',
    priority: 'medium',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchGoalsAndChild = async () => {
    try {
      setIsLoading(true);
      setError('');
      const childData = await childrenService.getChild(childId);
      setChild(childData);
      const goalsData = await childrenService.getGoals(childId);
      setGoals(goalsData);
    } catch (err) {
      console.error('Failed to load goals:', err);
      setError('Failed to load parenting goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndChild();
  }, [childId]);

  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setModalForm({
      goal_type: 'emotional_regulation',
      description: '',
      priority: 'medium',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setModalForm({
      goal_type: goal.goal_type,
      description: goal.description || '',
      priority: goal.priority,
    });
    setShowModal(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (editingGoal) {
        // Update
        await childrenService.updateGoal(childId, editingGoal.id, {
          goal_type: modalForm.goal_type,
          description: modalForm.description.trim() || null,
          priority: modalForm.priority,
        });
      } else {
        // Create
        await childrenService.createGoal(childId, {
          goal_type: modalForm.goal_type,
          description: modalForm.description.trim() || null,
          priority: modalForm.priority,
        });
      }
      setShowModal(false);
      fetchGoalsAndChild();
    } catch (err) {
      console.error('Failed to save goal:', err);
      setError('Failed to save goal. Please verify fields.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (goal) => {
    try {
      await childrenService.updateGoal(childId, goal.id, {
        is_active: !goal.is_active,
      });
      fetchGoalsAndChild();
    } catch (err) {
      console.error('Failed to toggle goal status:', err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this parenting goal?')) return;
    try {
      await childrenService.deleteGoal(childId, goalId);
      fetchGoalsAndChild();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-emerald-800">Loading goals...</p>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.is_active);
  const inactiveGoals = goals.filter((g) => !g.is_active);

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/children/${childId}`}
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {child?.first_name || 'Child'}'s Profile</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Goal Tracking</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Parenting Goals for {child?.first_name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Define focus areas and priority levels to guide your parenting strategy.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add Goal</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Goals */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <span>Active Goals ({activeGoals.length})</span>
            </h2>
          </div>

          {activeGoals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>No active parenting goals for {child?.first_name}.</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-3 inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Add first goal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const priority = getPriorityBadge(t, goal.priority);
                return (
                  <div
                    key={goal.id}
                    className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-300"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-900 text-sm">
                          {getGoalTypeLabel(t, goal.goal_type)}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleActive(goal)}
                        title="Deactivate Goal"
                        className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-lg transition flex items-center space-x-1"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Deactivate</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(goal)}
                        title="Edit Goal"
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Delete Goal"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Deactivated Goals */}
        {inactiveGoals.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-600 flex items-center space-x-2 pb-3 border-b border-slate-100">
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Deactivated Goals ({inactiveGoals.length})</span>
            </h2>

            <div className="space-y-3">
              {inactiveGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-70"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-700 text-sm line-through">
                      {getGoalTypeLabel(t, goal.goal_type)}
                    </span>
                    {goal.description && (
                      <p className="text-xs text-slate-500">{goal.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(goal)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition flex items-center space-x-1"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingGoal ? 'Edit Parenting Goal' : 'Add Parenting Goal'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Goal Focus Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalForm.goal_type}
                  onChange={(e) => setModalForm({ ...modalForm, goal_type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                >
                  {GOAL_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {t(type.labelKey)} ({t(type.categoryKey)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Priority Level
                </label>
                <select
                  value={modalForm.priority}
                  onChange={(e) => setModalForm({ ...modalForm, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                >
                  {GOAL_PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {t(p.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Goal Details / Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Describe your parenting strategy or specific target..."
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingGoal ? 'Update Goal' : 'Save Goal'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
