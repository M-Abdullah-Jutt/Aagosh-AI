import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { checkInService } from '../../services/checkInService';
import { OVERALL_MOODS } from '../../utils/checkInConstants';
import { ArrowLeft, Calendar, Smile, AlertCircle, Save } from 'lucide-react';

export const EditCheckInPage = () => {
  const { childId, checkInId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    check_in_date: '',
    overall_mood: 'good',
    general_notes: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCheckIn = async () => {
      try {
        setIsLoading(true);
        const data = await checkInService.getCheckIn(childId, checkInId);
        setFormData({
          check_in_date: data.check_in_date || '',
          overall_mood: data.overall_mood || 'good',
          general_notes: data.general_notes || '',
        });
      } catch (err) {
        console.error('Failed to load check-in:', err);
        setError('Check-in record not found or access denied.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckIn();
  }, [childId, checkInId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.check_in_date) {
      setError('Please select check-in date.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await checkInService.updateCheckIn(childId, checkInId, {
        check_in_date: formData.check_in_date,
        overall_mood: formData.overall_mood,
        general_notes: formData.general_notes.trim() || null,
      });

      navigate(`/children/${childId}/check-ins/${checkInId}`, { replace: true });
    } catch (err) {
      console.error('Failed to update check-in:', err);
      setError('Failed to update check-in details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-emerald-800">Loading check-in data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to={`/children/${childId}/check-ins/${checkInId}`}
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Check-In Details</span>
        </Link>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900">Edit Daily Check-In</h1>
            <p className="text-sm text-slate-500 mt-1">Update overall mood and general notes.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Overall Day / Mood
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {OVERALL_MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, overall_mood: m.id })}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition flex items-center justify-center space-x-2 ${
                      formData.overall_mood === m.id
                        ? `${m.color} shadow-sm ring-2 ring-emerald-500/50`
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="check_in_date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Check-In Date
              </label>
              <input
                id="check_in_date"
                type="date"
                required
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                className="w-full sm:w-64 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
              />
            </div>

            <div>
              <label htmlFor="general_notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                General Notes
              </label>
              <textarea
                id="general_notes"
                rows={4}
                value={formData.general_notes}
                onChange={(e) => setFormData({ ...formData, general_notes: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
              <Link
                to={`/children/${childId}/check-ins/${checkInId}`}
                className="px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCheckInPage;
