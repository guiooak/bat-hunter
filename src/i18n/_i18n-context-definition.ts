import { createContext } from 'react';
import { en } from './en';
import { pt } from './pt';
import type { Language } from './language';
import type { Messages } from './messages';

const MESSAGES: Record<Language, Messages> = { 'en-US': en, 'pt-BR': pt };

export type I18nValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Messages;
  formatDate: (value: number, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (value: number) => string;
  formatTime: (value: number) => string;
};

// Texts and date formats for one language
export function buildI18nValue(
  language: Language,
  setLanguage: (language: Language) => void = () => {}
): I18nValue {
  return {
    language,
    setLanguage,
    t: MESSAGES[language],
    formatDate: (value, options) =>
      new Date(value).toLocaleDateString(language, options),
    formatDateTime: (value) => new Date(value).toLocaleString(language),
    formatTime: (value) =>
      new Date(value).toLocaleTimeString(language, {
        hour: '2-digit',
        minute: '2-digit',
      }),
  };
}

// English until a provider says otherwise (and in components tested alone)
export const I18nContext = createContext<I18nValue>(buildI18nValue('en-US'));
