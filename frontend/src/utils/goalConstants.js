import { DEFAULT_NEUTRAL_BADGE, localizeById } from './i18nOptions';

export const GOAL_TYPES = [
  { id: 'emotional_regulation', labelKey: 'goalTypes.emotional_regulation', categoryKey: 'goalCategories.behavior_mood' },
  { id: 'communication', labelKey: 'goalTypes.communication', categoryKey: 'goalCategories.social_language' },
  { id: 'confidence', labelKey: 'goalTypes.confidence', categoryKey: 'goalCategories.personal_growth' },
  { id: 'discipline', labelKey: 'goalTypes.discipline', categoryKey: 'goalCategories.daily_life' },
  { id: 'sleep', labelKey: 'goalTypes.sleep', categoryKey: 'goalCategories.health_wellness' },
  { id: 'school', labelKey: 'goalTypes.school', categoryKey: 'goalCategories.education' },
  { id: 'social_skills', labelKey: 'goalTypes.social_skills', categoryKey: 'goalCategories.social_language' },
  { id: 'screen_time', labelKey: 'goalTypes.screen_time', categoryKey: 'goalCategories.daily_life' },
  { id: 'parent_child_relationship', labelKey: 'goalTypes.parent_child_relationship', categoryKey: 'goalCategories.personal_growth' },
  { id: 'other', labelKey: 'goalTypes.other', categoryKey: 'goalCategories.general' },
];

export const GOAL_PRIORITIES = [
  { id: 'low', labelKey: 'priorities.low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'medium', labelKey: 'priorities.medium', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'high', labelKey: 'priorities.high', color: 'bg-rose-50 text-rose-800 border-rose-200' },
];

export const getGoalTypeLabel = (t, typeId) => localizeById(t, GOAL_TYPES, typeId, 'common.none');

export const getPriorityBadge = (t, priorityId) => {
  const found = GOAL_PRIORITIES.find((p) => p.id === priorityId);
  if (!found) return { label: localizeById(t, GOAL_PRIORITIES, priorityId, 'priorities.medium'), color: DEFAULT_NEUTRAL_BADGE };
  return { label: t(found.labelKey), color: found.color };
};
