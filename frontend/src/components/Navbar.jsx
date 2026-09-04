import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Heart, Activity, User, LogOut, LayoutDashboard, LogIn, UserPlus, BookOpen } from 'lucide-react';
import { APP_NAME } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <NavLink to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 transition-colors">
              <Heart className="w-5 h-5 fill-emerald-500/20 text-emerald-600" />
            </div>
            <div>
              <span className="font-semibold text-lg text-slate-900 tracking-tight block leading-none">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase">
                Parenting Companion
              </span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2 sm:space-x-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100/70'
                }`
              }
            >
              Home
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100/70'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/children"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100/70'
                    }`
                  }
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Children</span>
                </NavLink>
              </>
            )}

            <NavLink
              to="/health"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100/70'
                }`
              }
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Knowledge Base</span>
            </NavLink>

            {/* Auth Buttons / Profile Indicator */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-stone-200">
                <span className="text-xs font-semibold text-slate-700 hidden md:inline-block">
                  {user?.full_name}
                </span>
                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-stone-200">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
