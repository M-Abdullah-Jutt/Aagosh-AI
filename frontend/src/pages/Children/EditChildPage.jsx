import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { childrenService } from '../../services/childrenService';
import { useLanguage } from '../../i18n/LanguageContext';
import { ArrowLeft, User, Heart, AlertCircle, Save } from 'lucide-react';

export const EditChildPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    first_name: '',
    date_of_birth: '',
    gender: '',
    strengths: '',
    challenges: '',
    personality_notes: '',
    communication_style: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        setIsLoading(true);
        const data = await childrenService.getChild(childId);
        setFormData({
          first_name: data.first_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          strengths: data.profile?.strengths || '',
          challenges: data.profile?.challenges || '',
          personality_notes: data.profile?.personality_notes || '',
          communication_style: data.profile?.communication_style || '',
        });
      } catch (err) {
        console.error('Failed to fetch child:', err);
        setError(t('childForm.errNotFound'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchChild();
  }, [childId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      setError('Please enter full name.');
      return;
    }
    if (!formData.date_of_birth) {
      setError('Please select date of birth.');
      return;
    }
    if (!formData.gender) {
      setError('Please select a gender.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Update basic child info
      await childrenService.updateChild(childId, {
        first_name: formData.first_name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender || null,
      });

      // 2. Update profile observations
      await childrenService.updateProfile(childId, {
        strengths: formData.strengths.trim() || null,
        challenges: formData.challenges.trim() || null,
        personality_notes: formData.personality_notes.trim() || null,
        communication_style: formData.communication_style.trim() || null,
      });

      navigate(`/children/${childId}`, { replace: true });
    } catch (err) {
      console.error('Failed to update child profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-emerald-800">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to={`/children/${childId}`}
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile Details</span>
        </Link>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900">Edit Child Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Update basic details and parent observations.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b border-slate-100">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Basic Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option value="">Select Gender (Optional)</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non_binary">Non-binary / Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Section 2: Observations */}
            <div className="space-y-4 pt-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Heart className="w-5 h-5 text-emerald-600" />
                <span>Parent Observations</span>
              </h2>

              <div>
                <label htmlFor="challenges" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Challenges & Growth Areas
                </label>
                <textarea
                  id="challenges"
                  name="challenges"
                  rows={2}
                  value={formData.challenges}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="personality_notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Personality Notes
                  </label>
                  <input
                    id="personality_notes"
                    name="personality_notes"
                    type="text"
                    value={formData.personality_notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="communication_style" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Communication Style
                  </label>
                  <input
                    id="communication_style"
                    name="communication_style"
                    type="text"
                    value={formData.communication_style}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
              <Link
                to={`/children/${childId}`}
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

export default EditChildPage;
