import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import childrenService from '../../services/childrenService';
import LiveParentingStudioModal from '../../components/LiveParenting/LiveParentingStudioModal';
import LiveParentingCard from '../../components/LiveParenting/LiveParentingCard';
import { ArrowLeft } from 'lucide-react';

export const LiveParentingPage = () => {
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('childId');
  const modeParam = searchParams.get('mode') || 'non_human';

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const data = await childrenService.getChildren();
        setChildren(data || []);
        if (childIdParam && data) {
          const match = data.find((c) => String(c.id) === String(childIdParam));
          if (match) setSelectedChild(match);
        } else if (data && data.length > 0) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        console.warn('Failed to load children in LiveParentingPage:', err);
      }
    };
    fetchKids();
  }, [childIdParam]);

  return (
    <div className="py-4 sm:py-6">
      {/* Page header — matches CoachPage pattern */}
      <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex flex-wrap items-center gap-2">
            Live Coaching Center
            {selectedChild && (
              <span className="text-sm font-normal text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {selectedChild.first_name}
                {selectedChild.age_years ? ` · ${selectedChild.age_years} yrs` : ''}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-Time Parenting Guidance</p>
        </div>
      </div>

      {/* Main Card */}
      <LiveParentingCard />
    </div>
  );
};

export default LiveParentingPage;
