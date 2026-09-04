import React from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const HealthStatusBadge = ({ loading, status, error }) => {
  if (loading) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-stone-500" />
        Checking API...
      </span>
    );
  }

  if (error || status !== 'healthy') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
        API Offline
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
      API Connected
    </span>
  );
};

export default HealthStatusBadge;
