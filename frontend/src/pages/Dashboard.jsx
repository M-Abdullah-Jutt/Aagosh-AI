import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-600/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-emerald-100 mb-3 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parent Portal</span>
              </div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.full_name || 'Parent'}!</h1>
              <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
                Your secure parenting companion foundation is ready. You are authenticated as an active parent user.
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-medium text-sm backdrop-blur-sm transition shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Profile Card & Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Account Info */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Parent Profile Information</span>
            </h2>

            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</span>
                <span className="text-sm font-semibold text-slate-800">{user?.full_name}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</span>
                <div className="flex items-center space-x-2 text-slate-800 text-sm font-medium">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{user?.email}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account ID</span>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                  {user?.id}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Member Since</span>
                <div className="flex items-center space-x-2 text-slate-700 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Status */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Security Status</span>
              </h2>

              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Account Active</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your parent session is authenticated via secure Bearer JWT.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700">Password Encryption</p>
                  <p>Secured with Argon2id password hashing algorithm.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <p className="text-xs text-slate-400 text-center">
                Aaghosh Step 3 Authentication MVP
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
