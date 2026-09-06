/**
 * Option lists are stored with translation keys (`labelKey`) rather than literal
 * strings, because module-level constants are evaluated once at import time and
 * would therefore be frozen in whichever language was active first.
 */

const humanize = (id) => String(id).replace(/_/g, ' ');

export const localizeOptions = (t, options) =>
  options.map((option) => ({ ...option, label: t(option.labelKey) }));

export const localizeById = (t, options, id, fallbackKey = 'common.notSpecified') => {
  const found = options.find((option) => option.id === id);
  if (found) return t(found.labelKey);
  if (!id) return t(fallbackKey);
  return humanize(id);
};

export const DEFAULT_NEUTRAL_BADGE = 'bg-slate-100 text-slate-800 border-slate-200';
