import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import en from './locales/en.json';
import ur from './locales/ur.json';

const STORAGE_KEY = 'aaghosh_lang';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', nativeLabel: 'English', shortLabel: 'EN', dir: 'ltr', locale: 'en-US' },
  { code: 'ur', nativeLabel: 'اردو', shortLabel: 'اردو', dir: 'rtl', locale: 'ur-PK' },
];

const DICTIONARIES = { en, ur };
const DEFAULT_LANGUAGE = 'en';

const getLanguageMeta = (code) =>
  SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];

const interpolate = (template, params) =>
  template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  );

const lookup = (dict, key) =>
  dict && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : undefined;

const resolve = (dict, key, params) => {
  let value = lookup(dict, key);

  if (value === undefined && params && typeof params.count === 'number') {
    const suffix = params.count === 1 ? '_one' : '_other';
    value = lookup(dict, `${key}${suffix}`) ?? lookup(en, `${key}${suffix}`);
  }

  if (value === undefined) value = lookup(en, key);
  if (value === undefined) return key;

  return params ? interpolate(value, params) : value;
};

const readStoredLanguage = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && DICTIONARIES[stored]) return stored;
  } catch {
    /* private mode or storage disabled — fall back to the default */
  }
  return DEFAULT_LANGUAGE;
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(readStoredLanguage);
  const meta = getLanguageMeta(lang);
  const dictionary = DICTIONARIES[lang] || en;

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = meta.dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore persistence failures */
    }
  }, [lang, meta.dir]);

  const setLang = useCallback((next) => {
    if (DICTIONARIES[next]) setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'ur' ? 'en' : 'ur'));
  }, []);

  const t = useCallback((key, params) => resolve(dictionary, key, params), [dictionary]);

  const formatDate = useCallback(
    (value, options) => {
      if (!value) return '';
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleDateString(meta.locale, options);
    },
    [meta.locale]
  );

  const formatTime = useCallback(
    (value, options) => {
      if (!value) return '';
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleTimeString(meta.locale, options || { hour: '2-digit', minute: '2-digit' });
    },
    [meta.locale]
  );

  const ageParts = useCallback(
    (dobString) => {
      if (!dobString) return null;
      const dob = new Date(dobString);
      const today = new Date();
      if (Number.isNaN(dob.getTime()) || dob > today) return null;

      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();
      const days = today.getDate() - dob.getDate();

      if (days < 0) months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      return { years, months };
    },
    []
  );

  const formatAge = useCallback(
    (dobString) => {
      const parts = ageParts(dobString);
      if (!parts) return t('age.newborn');

      if (parts.years === 0) {
        if (parts.months === 0) return t('age.newborn');
        return t('age.months', { count: parts.months, n: parts.months });
      }

      const yearText = t('age.years', { count: parts.years, n: parts.years });
      if (parts.months > 0) {
        return t('age.yearsAndMonths', {
          years: yearText,
          months: t('age.months', { count: parts.months, n: parts.months }),
        });
      }
      return yearText;
    },
    [ageParts, t]
  );

  const formatAgeShort = useCallback(
    (dobString) => {
      const parts = ageParts(dobString);
      if (!parts) return t('age.newborn');

      if (parts.years === 0) {
        return parts.months === 0
          ? t('age.newborn')
          : t('age.shortMonths', { n: parts.months });
      }
      if (parts.months > 0) {
        return t('age.shortYearsAndMonths', {
          years: t('age.shortYears', { n: parts.years }),
          months: t('age.shortMonths', { n: parts.months }),
        });
      }
      return t('age.shortYears', { n: parts.years });
    },
    [ageParts, t]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      dir: meta.dir,
      isRtl: meta.dir === 'rtl',
      locale: meta.locale,
      languages: SUPPORTED_LANGUAGES,
      t,
      formatDate,
      formatTime,
      formatAge,
      formatAgeShort,
    }),
    [lang, setLang, toggleLang, meta, t, formatDate, formatTime, formatAge, formatAgeShort]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
