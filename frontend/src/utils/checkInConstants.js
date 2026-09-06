import { localizeById } from './i18nOptions';

export const OVERALL_MOODS = [
  { id: 'good', labelKey: 'moods.good', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'Smile' },
  { id: 'okay', labelKey: 'moods.okay', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'Meh' },
  { id: 'difficult', labelKey: 'moods.difficult', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: 'Frown' },
];

export const EMOTIONS = [
  { id: 'angry', labelKey: 'emotions.angry', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'frustrated', labelKey: 'emotions.frustrated', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'sad', labelKey: 'emotions.sad', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'anxious', labelKey: 'emotions.anxious', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'excited', labelKey: 'emotions.excited', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'calm', labelKey: 'emotions.calm', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'other', labelKey: 'emotions.other', color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export const TRIGGERS = [
  { id: 'screen_time', labelKey: 'triggers.screen_time' },
  { id: 'homework', labelKey: 'triggers.homework' },
  { id: 'bedtime', labelKey: 'triggers.bedtime' },
  { id: 'sibling', labelKey: 'triggers.sibling' },
  { id: 'school', labelKey: 'triggers.school' },
  { id: 'meal', labelKey: 'triggers.meal' },
  { id: 'transition', labelKey: 'triggers.transition' },
  { id: 'parent_instruction', labelKey: 'triggers.parent_instruction' },
  { id: 'other', labelKey: 'triggers.other' },
];

export const PARENT_RESPONSES = [
  { id: 'talked_calmly', labelKey: 'responses.talked_calmly' },
  { id: 'set_boundary', labelKey: 'responses.set_boundary' },
  { id: 'redirected', labelKey: 'responses.redirected' },
  { id: 'gave_space', labelKey: 'responses.gave_space' },
  { id: 'negotiated', labelKey: 'responses.negotiated' },
  { id: 'ignored', labelKey: 'responses.ignored' },
  { id: 'other', labelKey: 'responses.other' },
];

export const OUTCOMES = [
  { id: 'calmed_down', labelKey: 'outcomes.calmed_down' },
  { id: 'partially_improved', labelKey: 'outcomes.partially_improved' },
  { id: 'no_change', labelKey: 'outcomes.no_change' },
  { id: 'got_worse', labelKey: 'outcomes.got_worse' },
  { id: 'not_sure', labelKey: 'outcomes.not_sure' },
];

const FALLBACK_BADGE_COLOR = 'bg-slate-100 text-slate-800';

export const getMoodConfig = (t, moodId) => {
  const found = OVERALL_MOODS.find((m) => m.id === moodId);
  return {
    label: localizeById(t, OVERALL_MOODS, moodId),
    color: found ? found.color : FALLBACK_BADGE_COLOR,
    icon: found ? found.icon : undefined,
  };
};

export const getEmotionConfig = (t, emotionId) => {
  const found = EMOTIONS.find((e) => e.id === emotionId);
  return {
    label: localizeById(t, EMOTIONS, emotionId),
    color: found ? found.color : FALLBACK_BADGE_COLOR,
  };
};

export const getTriggerLabel = (t, triggerId) => localizeById(t, TRIGGERS, triggerId);

export const getResponseLabel = (t, responseId) => localizeById(t, PARENT_RESPONSES, responseId);

export const getOutcomeLabel = (t, outcomeId) => localizeById(t, OUTCOMES, outcomeId);

export const ANALYSIS_PERIODS = ['7d', '14d', '30d', 'all'].map((id) => ({
  id,
  labelKey: `periods.${id}`,
}));

export const getPeriodLabel = (t, periodId) => localizeById(t, ANALYSIS_PERIODS, periodId, 'periods.all');
