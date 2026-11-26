import React, { createContext, useState, useEffect, useCallback } from 'react';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, RTL_CODES, fallback, TranslationSchema } from '@/i18n/i18n';

const LOCALE_KEY = 'plantlens_locale';

type NestedKeyOf<T, Prefix extends string = ''> =
  T extends object
    ? { [K in keyof T]: K extends string
        ? T[K] extends object
          ? NestedKeyOf<T[K], `${Prefix}${Prefix extends '' ? '' : '.'}${K}`>
          : `${Prefix}${Prefix extends '' ? '' : '.'}${K}`
        : never
      }[keyof T]
    : never;

type TranslationKey = NestedKeyOf<TranslationSchema>;

interface LocaleContextValue {
  locale: string;
  setLocale: (code: string) => Promise<void>;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const defaultT = (key: string) => key;

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: async () => {},
  t: defaultT as LocaleContextValue['t'],
  isRTL: false,
});

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : key;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`
  );
}

// Maps device language codes that differ from our supported keys.
// Covers: Norwegian variants, Filipino macrolanguage, Android legacy codes.
const LOCALE_ALIASES: Record<string, string> = {
  nb:  'no', // Norwegian Bokmål  → Norwegian
  nn:  'no', // Norwegian Nynorsk → Norwegian
  fil: 'tl', // Filipino (macro)  → Tagalog/Filipino
  in:  'id', // Android legacy    → Indonesian
  iw:  'he', // Android legacy    → Hebrew
};

function detectLocale(): string {
  const tag = Localization.getLocales()[0]?.languageTag ?? 'en-US';
  let base = tag.split('-')[0].toLowerCase();
  base = LOCALE_ALIASES[base] ?? base;
  return translations[base] ? base : 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Synchronous device-locale detection as the initial value eliminates the
  // English flash on first render. AsyncStorage override is applied in useEffect.
  const [locale, setLocaleState] = useState<string>(() => detectLocale());

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_KEY).then((stored) => {
      const code = stored && translations[stored] ? stored : detectLocale();
      applyLocale(code);
    });
  }, []);

  const applyLocale = useCallback((code: string) => {
    setLocaleState(code);
    const shouldBeRTL = RTL_CODES.has(code);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const setLocale = useCallback(async (code: string) => {
    await AsyncStorage.setItem(LOCALE_KEY, code);
    applyLocale(code);
  }, [applyLocale]);

  const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>): string => {
    const dict = (translations[locale] ?? fallback) as Record<string, unknown>;
    const template = getNestedValue(dict, key as string);
    return interpolate(template, vars);
  }, [locale]);

  const isRTL = RTL_CODES.has(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
}
