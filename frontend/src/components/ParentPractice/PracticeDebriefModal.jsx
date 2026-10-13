import React, { useState } from 'react';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  X,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Brain,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  ArrowRight,
  Check
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import feedbackService from '../../services/feedbackService';

export const PracticeDebriefModal = ({
  debrief,
  scenario,
  isOpen,
  onClose,
  onTryAgain
}) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';

  const [feedbackVote, setFeedbackVote] = useState(null); // true = helpful, false = not helpful
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFeedback = async (isHelpful) => {
    try {
      setFeedbackSubmitting(true);
      setFeedbackVote(isHelpful);
      await feedbackService.submitFeedback({
        module: 'parent_practice',
        isHelpful,
        targetId: scenario?.id || 'practice-session',
        comment: feedbackComment || (isHelpful ? 'Helpful practice simulation' : 'Need improvements')
      });
      setFeedbackSuccess(true);
    } catch (err) {
      console.error('Failed to submit practice feedback:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const submitComment = async () => {
    if (!feedbackComment.trim() || feedbackVote === null) return;
    try {
      setFeedbackSubmitting(true);
      await feedbackService.submitFeedback({
        module: 'parent_practice',
        isHelpful: feedbackVote,
        targetId: scenario?.id || 'practice-session',
        comment: feedbackComment.trim()
      });
      setShowCommentBox(false);
      setFeedbackSuccess(true);
    } catch (err) {
      console.error('Failed to submit comment feedback:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (!isOpen || !debrief) return null;

  const score = debrief.overall_score || 75;
  const getScoreColor = (sc) => {
    if (sc >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (sc >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div
      dir={isUrdu ? 'rtl' : 'ltr'}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in ${
        isUrdu ? 'font-urdu' : ''
      }`}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  {isUrdu ? 'اے آئی کوچ تجزیہ اور کارکردگی رپورٹ' : 'AI Coach Practice Debrief'}
                </h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  Verified Simulation
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {scenario?.title} • {scenario?.child_name} ({scenario?.child_age} yrs)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-stone-50/50">
          
          {/* Top Score & Summary Banner */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5 max-w-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                {isUrdu ? 'مجموعی خلاصہ (Executive Summary)' : 'Session Performance Overview'}
              </span>
              <p className="text-sm text-stone-700 leading-relaxed font-medium">
                {debrief.summary}
              </p>
              {debrief.emotional_trajectory && (
                <div className="text-xs text-stone-500 flex items-center space-x-1.5 pt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span><strong>{isUrdu ? 'جذباتی تبدیلی:' : 'Trajectory:'}</strong> {debrief.emotional_trajectory}</span>
                </div>
              )}
            </div>

            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${getScoreColor(score)} min-w-[130px] shrink-0`}>
              <span className="text-3xl font-extrabold tracking-tight">{score}%</span>
              <span className="text-[11px] font-bold uppercase tracking-wider mt-0.5">
                {score >= 85 ? (isUrdu ? 'بہترین ردعمل' : 'Mastery') : score >= 70 ? (isUrdu ? 'اچھی کوشش' : 'Good Progress') : (isUrdu ? 'مزید مشق درکار' : 'Needs Practice')}
              </span>
            </div>
          </div>

          {/* CRITICAL SECTION: Parent Wrong Behaviors & Mistakes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                {isUrdu ? 'والدین کی غلطیاں اور اصلاح کے مقامات' : 'Parent Mistakes & Areas for Correction'}
              </h3>
            </div>

            <div className="space-y-3">
              {debrief.parent_wrong_behaviors && debrief.parent_wrong_behaviors.length > 0 ? (
                debrief.parent_wrong_behaviors.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200/80 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-rose-100 pb-2.5">
                      <div className="text-xs">
                        <span className="font-bold text-rose-600 block uppercase tracking-wider text-[10px]">
                          {isUrdu ? 'آپ کا جملہ:' : 'Your Response:'}
                        </span>
                        <blockquote className="italic text-stone-800 font-semibold mt-0.5">
                          "{item.parent_utterance}"
                        </blockquote>
                      </div>
                      <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        Mistake #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 space-y-1">
                        <span className="font-bold text-rose-800 block">
                          ⚠️ {isUrdu ? 'کیا غلط ہوا؟' : 'What Went Wrong:'}
                        </span>
                        <p className="text-rose-950 leading-relaxed">{item.what_went_wrong}</p>
                      </div>

                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 space-y-1">
                        <span className="font-bold text-amber-800 block">
                          🧠 {isUrdu ? 'بچے پر اثر:' : 'Why It Escalated the Child:'}
                        </span>
                        <p className="text-amber-950 leading-relaxed">{item.why_it_escalated}</p>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1">
                      <span className="font-bold text-emerald-800 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'اس کے بجائے کیا کہنا چاہیے تھا؟' : 'Recommended Alternative Script:'}</span>
                      </span>
                      <p className="text-emerald-950 font-medium text-sm leading-relaxed italic">
                        "{item.better_alternative}"
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isUrdu ? 'کوئی بڑی غلطی نوٹ نہیں ہوئی! آپ نے پرسکون انداز میں نمٹا۔' : 'No major missteps detected! You demonstrated calm emotional leadership.'}</span>
                </div>
              )}
            </div>
          </div>

          {/* What Parent Did Well */}
          {debrief.what_parent_did_well && debrief.what_parent_did_well.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  {isUrdu ? 'آپ کی مثبت کوششیں (Strengths)' : 'What You Handled Well'}
                </h3>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-2">
                {debrief.what_parent_did_well.map((point, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Recommendations for Real Life */}
          {debrief.key_recommendations && debrief.key_recommendations.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  {isUrdu ? 'اصلی زندگی کے لیے سنہری ہدایات' : 'Golden Recommendations for Real Life'}
                </h3>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4.5 border border-amber-200/80 shadow-sm space-y-2.5">
                {debrief.key_recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs text-stone-800 font-medium">
                    <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidance Feedback Prompt for Parents */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 sm:p-4.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>{isUrdu ? 'کیا یہ پریکٹس سیشن اور رہنمائی آپ کے لیے مفید تھی؟' : 'Was this practice session and debrief helpful for you?'}</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isUrdu ? 'آپ کی رائے سسٹم کو بہتر بنانے میں براہ راست پروڈکٹ ٹیم کی رہنمائی کرتی ہے۔' : 'Your honest feedback helps us improve AI guidance simulations.'}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  disabled={feedbackSubmitting}
                  onClick={() => handleFeedback(true)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm ${
                    feedbackVote === true
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'جی ہاں، مفید تھی' : 'Yes, Helpful'}</span>
                </button>

                <button
                  type="button"
                  disabled={feedbackSubmitting}
                  onClick={() => {
                    handleFeedback(false);
                    setShowCommentBox(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm ${
                    feedbackVote === false
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'نہیں، مزید بہتری چاہیے' : 'Not Helpful'}</span>
                </button>
              </div>
            </div>

            {feedbackSuccess && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 animate-fade-in">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{isUrdu ? 'شکریہ! آپ کا فیڈ بیک ریکارڈ ہو گیا ہے۔' : 'Thank you! Your feedback has been recorded for the team.'}</span>
                </div>
                {!showCommentBox && (
                  <button
                    type="button"
                    onClick={() => setShowCommentBox(true)}
                    className="text-[11px] underline hover:text-emerald-900 font-semibold"
                  >
                    {isUrdu ? 'تفصیل شامل کریں' : 'Add Note'}
                  </button>
                )}
              </div>
            )}

            {showCommentBox && (
              <div className="pt-1 space-y-2 animate-fade-in">
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder={isUrdu ? 'مزید بتائیں کہ کیا چیز مددگار تھی یا کیا بہتر ہو سکتا ہے...' : 'Tell us what could be improved or what felt most realistic...'}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCommentBox(false)}
                    className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1"
                  >
                    {isUrdu ? 'منسوخ' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={feedbackSubmitting || !feedbackComment.trim()}
                    onClick={submitComment}
                    className="text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 px-3 py-1 rounded-lg transition disabled:opacity-50"
                  >
                    {isUrdu ? 'بھیجیں' : 'Submit Note'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500">
            {isUrdu ? 'بار بار مشق کرنے سے صبر اور خود اعتمادی بڑھتی ہے۔' : 'Practicing scenarios builds instinctive calm for real-world parenting.'}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onTryAgain}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isUrdu ? 'دوبارہ مشق کریں' : 'Practice Scenario Again'}</span>
            </button>

            <button
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <span>{isUrdu ? 'دیگر منظرنامے دیکھیں' : 'Choose Another Scenario'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeDebriefModal;
