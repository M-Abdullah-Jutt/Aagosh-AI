export const GOAL_TYPES = [
  { id: 'emotional_regulation', label: 'Emotional Regulation', category: 'Behavior & Mood' },
  { id: 'communication', label: 'Communication & Expression', category: 'Social & Language' },
  { id: 'confidence', label: 'Self-Confidence & Independence', category: 'Personal Growth' },
  { id: 'discipline', label: 'Routine & Discipline', category: 'Daily Life' },
  { id: 'sleep', label: 'Sleep & Rest Habits', category: 'Health & Wellness' },
  { id: 'school', label: 'School & Learning', category: 'Education' },
  { id: 'social_skills', label: 'Social Skills & Peer Relations', category: 'Social & Language' },
  { id: 'screen_time', label: 'Screen Time Balance', category: 'Daily Life' },
  { id: 'parent_child_relationship', label: 'Parent-Child Bonding', category: 'Personal Growth' },
  { id: 'other', label: 'Other Custom Goal', category: 'General' },
];

export const GOAL_PRIORITIES = [
  { id: 'low', label: 'Low Priority', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'medium', label: 'Medium Priority', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'high', label: 'High Priority', color: 'bg-rose-50 text-rose-800 border-rose-200' },
];

export const getGoalTypeLabel = (typeId) => {
  const found = GOAL_TYPES.find((g) => g.id === typeId);
  return found ? found.label : typeId;
};

export const getPriorityBadge = (priorityId) => {
  const found = GOAL_PRIORITIES.find((p) => p.id === priorityId);
  return found ? found : { label: priorityId, color: 'bg-slate-100 text-slate-700 border-slate-200' };
};
