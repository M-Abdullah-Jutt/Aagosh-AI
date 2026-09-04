import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { childrenService } from '../../services/childrenService';
import { GOAL_TYPES, GOAL_PRIORITIES } from '../../utils/goalConstants';
import { ArrowLeft, User, Calendar, Heart, Target, AlertCircle, Sparkles } from 'lucide-react';

export const AddChildPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    date_of_birth: '',
    gender: '',
    // Profile (Optional)
    strengths: '',
    challenges: '',
    personality_notes: '',
    communication_style: '',
    // Goal (Optional)
    initial_goal_type: '',
    initial_goal_description: '',
    initial_goal_priority: 'medium',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      setError('Please enter your child\'s first name.');
      return;
    }
    if (!formData.date_of_birth) {
      setError('Please select your child\'s date of birth.');
      return;
    }

    const dob = new Date(formData.date_of_birth);
    if (dob > new Date()) {
      setError('Date of birth cannot be in the future.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Prepare payload
    const payload = {
      first_name: formData.first_name.trim(),
      date_of_birth: formData.date_of_birth,
      gender: formData.gender || null,
    };

    // Profile payload if any field filled
    if (
      formData.strengths.trim() ||
      formData.challenges.trim() ||
      formData.personality_notes.trim() ||
      formData.communication_style.trim()
    ) {
      payload.profile = {
        strengths: formData.strengths.trim() || null,
        challenges: formData.challenges.trim() || null,
        personality_notes: formData.personality_notes.trim() || null,
        communication_style: formData.communication_style.trim() || null,
      };
    }

    // Initial goal payload if goal type selected
    if (formData.initial_goal_type) {
      payload.goals = [
        {
          goal_type: formData.initial_goal_type,
          description: formData.initial_goal_description.trim() || null,
          priority: formData.initial_goal_priority,
        },
      ];
    }

    try {
      const createdChild = await childrenService.createChild(payload);
      navigate(`/children/${createdChild.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create child profile:', err);
      const msg = err?.response?.data?.detail || 'Failed to create child profile. Please check input.';
      setError(typeof msg === 'string' ? msg : 'Validation error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          to="/children"
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Children</span>
        </Link>

        {/* Form Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Profile Creation</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Add Child Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              Provide basic information and optional observations to help tailor guidance.
            </p>
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
                <span>Section 1: Basic Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Child's first name"
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
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
                  Gender <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <select
                  id="gender"
                  name="gender"
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

            {/* Section 2: About Your Child (Observations) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  <span>Section 2: About Your Child</span>
                </h2>
                <span className="text-xs font-medium text-slate-400">All fields optional</span>
              </div>
              <p className="text-xs text-slate-500 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/70">
                Note: These are your personal parent observations to customize guidance, not medical or clinical diagnoses.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="strengths" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Strengths & Interests
                  </label>
                  <textarea
                    id="strengths"
                    name="strengths"
                    rows={2}
                    value={formData.strengths}
                    onChange={handleChange}
                    placeholder="e.g. Loves building blocks, empathetic with pets, imaginative storyteller..."
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="challenges" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Current Challenges / Growth Areas
                  </label>
                  <textarea
                    id="challenges"
                    name="challenges"
                    rows={2}
                    value={formData.challenges}
                    onChange={handleChange}
                    placeholder="e.g. Gets frustrated when transitioning between activities, bedtime routines..."
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
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
                      placeholder="e.g. Cautious, energetic, sensitive..."
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
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
                      placeholder="e.g. Expressive, quiet when overwhelmed..."
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Initial Parenting Goal */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span>Section 3: Initial Parenting Goal</span>
                </h2>
                <span className="text-xs font-medium text-slate-400">Optional</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="initial_goal_type" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Goal Focus Area
                  </label>
                  <select
                    id="initial_goal_type"
                    name="initial_goal_type"
                    value={formData.initial_goal_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  >
                    <option value="">Select Initial Goal (Optional)</option>
                    {GOAL_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label} ({type.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="initial_goal_priority" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Priority Level
                  </label>
                  <select
                    id="initial_goal_priority"
                    name="initial_goal_priority"
                    value={formData.initial_goal_priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  >
                    {GOAL_PRIORITIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.initial_goal_type && (
                <div>
                  <label htmlFor="initial_goal_description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Goal Details / Notes
                  </label>
                  <input
                    id="initial_goal_description"
                    name="initial_goal_description"
                    type="text"
                    value={formData.initial_goal_description}
                    onChange={handleChange}
                    placeholder="e.g. Work on calming techniques during evening tantrums..."
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
              <Link
                to="/children"
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
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save Child Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChildPage;
