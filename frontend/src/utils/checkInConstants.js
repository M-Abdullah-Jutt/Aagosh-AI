export const OVERALL_MOODS = [
  { id: 'good', label: 'Good Day', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'Smile' },
  { id: 'okay', label: 'Okay / Neutral', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'Meh' },
  { id: 'difficult', label: 'Difficult / Challenging', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: 'Frown' },
];

export const EMOTIONS = [
  { id: 'angry', label: 'Angry / Mad', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'frustrated', label: 'Frustrated / Upset', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'sad', label: 'Sad / Tearful', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'anxious', label: 'Anxious / Nervous', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'excited', label: 'Overly Excited / Restless', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'calm', label: 'Calm & Peaceful', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'other', label: 'Other Emotion', color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export const TRIGGERS = [
  { id: 'screen_time', label: 'Ending Screen Time / Tech' },
  { id: 'homework', label: 'Schoolwork / Homework' },
  { id: 'bedtime', label: 'Bedtime / Sleep Routine' },
  { id: 'sibling', label: 'Sibling Interaction' },
  { id: 'school', label: 'School / Daycare' },
  { id: 'meal', label: 'Mealtime / Food' },
  { id: 'transition', label: 'Activity Transition' },
  { id: 'parent_instruction', label: 'Parent Request / Boundary' },
  { id: 'other', label: 'Other Situation' },
];

export const PARENT_RESPONSES = [
  { id: 'talked_calmly', label: 'Talked Calmly & Listened' },
  { id: 'set_boundary', label: 'Set Clear Gentle Boundary' },
  { id: 'redirected', label: 'Redirected Attention' },
  { id: 'gave_space', label: 'Gave Quiet Space / Time' },
  { id: 'negotiated', label: 'Negotiated / Compromised' },
  { id: 'ignored', label: 'Ignored Reaction (Planned Ignoring)' },
  { id: 'other', label: 'Other Strategy' },
];

export const OUTCOMES = [
  { id: 'calmed_down', label: 'Calmed Down Quickly' },
  { id: 'partially_improved', label: 'Partially Improved' },
  { id: 'no_change', label: 'No Immediate Change' },
  { id: 'got_worse', label: 'Escalated / Got Worse' },
  { id: 'not_sure', label: 'Not Sure / Mixed' },
];

export const getMoodConfig = (moodId) => {
  return OVERALL_MOODS.find((m) => m.id === moodId) || { label: moodId, color: 'bg-slate-100 text-slate-800' };
};

export const getEmotionConfig = (emotionId) => {
  return EMOTIONS.find((e) => e.id === emotionId) || { label: emotionId, color: 'bg-slate-100 text-slate-800' };
};

export const getTriggerLabel = (triggerId) => {
  const found = TRIGGERS.find((t) => t.id === triggerId);
  return found ? found.label : triggerId || 'Not specified';
};

export const getResponseLabel = (respId) => {
  const found = PARENT_RESPONSES.find((r) => r.id === respId);
  return found ? found.label : respId || 'Not specified';
};

export const getOutcomeLabel = (outcomeId) => {
  const found = OUTCOMES.find((o) => o.id === outcomeId);
  return found ? found.label : outcomeId || 'Not specified';
};

// ---------------------------------------------------------------------------
// Config maps (keyed by id) — used by AnalyticsPage for label + color lookups
// ---------------------------------------------------------------------------

export const MOOD_CONFIG = Object.fromEntries(
  OVERALL_MOODS.map((m) => [m.id, m])
);

export const EMOTION_CONFIG = Object.fromEntries(
  EMOTIONS.map((e) => [e.id, e])
);

export const TRIGGER_CONFIG = Object.fromEntries(
  TRIGGERS.map((t) => [t.id, t])
);
