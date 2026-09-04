import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { childrenService } from '../../services/childrenService';
import { User, Plus, Heart, Target, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

export const ChildrenPage = () => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await childrenService.getChildren();
      setChildren(data);
    } catch (err) {
      console.error('Failed to load children:', err);
      setError('Unable to load child profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-emerald-800">Loading child profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Family Overview</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">My Children</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your children's profiles and active parenting goals.
            </p>
          </div>
          <Link
            to="/children/new"
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Child</span>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {children.length === 0 ? (
          <div className="bg-white border border-dashed border-emerald-200 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-emerald-100/70 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Heart className="w-8 h-8 fill-emerald-500/20 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Let's get started</h2>
            <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Add your child's profile to begin setting parenting goals and receiving personalized guidance.
            </p>
            <Link
              to="/children/new"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition mt-6"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Child</span>
            </Link>
          </div>
        ) : (
          /* Children Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shadow-sm">
                        {child.first_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{child.first_name}</h3>
                        <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md mt-0.5">
                          Age: {child.age_display || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {child.gender && (
                      <span className="text-xs font-semibold text-slate-400 capitalize bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                        {child.gender}
                      </span>
                    )}
                  </div>

                  <div className="my-5 p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span>Active Parenting Goals</span>
                    </div>
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {child.active_goals_count} {child.active_goals_count === 1 ? 'Goal' : 'Goals'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                  <Link
                    to={`/children/${child.id}`}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl text-center transition flex items-center justify-center space-x-1"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link
                    to={`/children/${child.id}/goals`}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl text-center shadow-sm hover:shadow transition"
                  >
                    <span>Manage Goals</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenPage;
