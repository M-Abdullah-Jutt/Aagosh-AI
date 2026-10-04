import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import childrenService from '../services/childrenService';
import LiveParentingCard from '../components/LiveParenting/LiveParentingCard';
import {
  LogOut,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Sparkles,
  Users,
  Target,
  MessageCircle,
  Plus,
  ChevronRight,
  HeartHandshake
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t, formatDate } = useLanguage();
  const [children, setChildren] = useState([]);
  const [loadingKids, setLoadingKids] = useState(true);

  useEffect(() => {
    const loadKids = async () => {
      try {
        setLoadingKids(true);
        const data = await childrenService.getChildren();
        setChildren(data || []);
      } catch (err) {
        console.warn('Could not fetch children for dashboard summary:', err);
      } finally {
        setLoadingKids(false);
      }
    };
    loadKids();
  }, []);

  const formattedDate = user?.created_at
    ? formatDate(user.created_at, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : t('common.notAvailable');

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-600/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-emerald-100 mb-3 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parent Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('dashboard.welcome', { name: user?.full_name || 'Parent' })}
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
                Welcome to your parenting command center. Monitor your children's development, track milestones, and receive real-time live parenting support.
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-medium text-sm backdrop-blur-sm transition shadow-sm self-start md:self-center"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('dashboard.logOut')}</span>
            </button>
          </div>
        </div>

        {/* Children Quick Overview & Account Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 & 2: Children Hub */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Your Children ({children.length})</span>
                </h3>
                <Link
                  to="/children/new"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 px-3 py-1.5 rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Child</span>
                </Link>
              </div>

              {loadingKids ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : children.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p>No child profiles added yet.</p>
                  <Link to="/children/new" className="text-emerald-600 font-semibold underline mt-1 inline-block">
                    Add your first child profile
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition flex flex-col justify-between"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-sm">
                          {child.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{child.first_name}</h4>
                          <span className="text-[11px] text-slate-500">
                            Age: {child.age_display || (child.age_years ? `${child.age_years} yrs` : 'N/A')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs">
                        <Link
                          to={`/children/${child.id}`}
                          className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-center font-medium text-[11px] transition shadow-2xs"
                        >
                          Profile
                        </Link>
                        <Link
                          to={`/children/${child.id}/coach`}
                          className="flex-1 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-center font-medium text-[11px] transition shadow-2xs flex items-center justify-center space-x-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>AI Coach</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>View detailed milestone analytics and observations</span>
              <Link to="/children" className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                <span>Manage all children</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 3: Account Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center space-x-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Parent Account</span>
              </h3>

              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {t('dashboard.fullName')}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{user?.full_name}</span>
                </div>

                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {t('dashboard.emailAddress')}
                  </span>
                  <div className="flex items-center space-x-1.5 text-slate-700 text-xs font-medium truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {t('dashboard.memberSince')}
                  </span>
                  <div className="flex items-center space-x-1.5 text-slate-600 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded Evidence-Informed Parent Care</span>
            </div>
          </div>
        </div>

        {/* Live Coaching Center */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Live Coaching Center
              </h2>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Real-Time Active
            </span>
          </div>
          <LiveParentingCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
