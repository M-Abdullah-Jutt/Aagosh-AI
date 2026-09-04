import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-20 space-y-6">
      <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 items-center justify-center text-amber-600 text-2xl font-bold">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-stone-600 max-w-md mx-auto text-sm">
        The requested page does not exist or has been moved.
      </p>
      <div>
        <NavLink
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </NavLink>
      </div>
    </div>
  );
};

export default NotFoundPage;
