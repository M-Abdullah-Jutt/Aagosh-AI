import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Heart, User, LogOut, LayoutDashboard, LogIn, UserPlus, BookOpen, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  const navLinkClass = (extraClass = '') => ({ isActive }) =>
    `px-3 py-2 md:py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 md:space-x-1.5 ${extraClass} ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 font-semibold'
        : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100/70'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <NavLink to="/" className="flex items-center space-x-2.5 group" onClick={() => setIsOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 transition-colors">
              <Heart className="w-5 h-5 fill-emerald-500/20 text-emerald-600" />
            </div>
            <div>
              <span className="font-semibold text-lg text-slate-900 tracking-tight block leading-none">
                {t('app.name')}
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase">
                {t('nav.subtitle')}
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2 sm:space-x-3">
            <NavLink to="/" className={navLinkClass()}>
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">{t('nav.home')}</span>
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={navLinkClass('tour-dashboard')}>
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline">{t('nav.dashboard')}</span>
                </NavLink>
                <NavLink to="/children" className={navLinkClass('tour-children')}>
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline">{t('nav.children')}</span>
                </NavLink>
              </>
            )}

            <NavLink to="/health" className={navLinkClass('tour-knowledge')}>
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">{t('nav.knowledgeBase')}</span>
            </NavLink>

            {/* Language Selector */}
            <div className="flex items-center space-x-2 pl-2 border-l border-stone-200">
              <LanguageSwitcher />
            </div>

            {/* Auth Buttons / Profile Indicator */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-stone-200">
                <span className="text-xs font-semibold text-slate-700 hidden md:inline-block">
                  {user?.full_name}
                </span>
                <button
                  onClick={logout}
                  title={t('nav.logOut')}
                  aria-label={t('nav.logOut')}
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
                  <span className="hidden md:inline">{t('nav.signIn')}</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden md:inline">{t('nav.register')}</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu & Language Switcher & Hamburger */}
          <div className="flex items-center space-x-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
              className="p-2 text-stone-600 hover:text-slate-900 hover:bg-stone-100 rounded-lg transition"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className={navLinkClass()}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>{t('nav.home')}</span>
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={navLinkClass('tour-dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>{t('nav.dashboard')}</span>
              </NavLink>
              <NavLink
                to="/children"
                onClick={() => setIsOpen(false)}
                className={navLinkClass('tour-children')}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>{t('nav.children')}</span>
              </NavLink>
            </>
          )}

          <NavLink
            to="/health"
            onClick={() => setIsOpen(false)}
            className={navLinkClass('tour-knowledge')}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>{t('nav.knowledgeBase')}</span>
          </NavLink>

          <div className="pt-2 border-t border-stone-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {user?.full_name}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logOut')}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>{t('nav.signIn')}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow transition flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
