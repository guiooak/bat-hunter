import {
  getLocalStorageValue,
  setLocalStorageValue,
} from 'src/services/local-storage-service';

export const LANGUAGES = ['en-US', 'pt-BR'] as const;

export type Language = (typeof LANGUAGES)[number];

// Each language is named in itself, so anyone finds their own
export const LANGUAGE_NAMES: Record<Language, string> = {
  'en-US': 'English',
  'pt-BR': 'Português',
};

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

// The first English or Portuguese entry in the browser's preferences decides
// (any pt-* is Brazilian Portuguese); anything else falls back to English.
export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const code = tag.toLowerCase();

    if (code.startsWith('pt')) return 'pt-BR';
    if (code.startsWith('en')) return 'en-US';
  }

  return 'en-US';
}

// Before the account answers: the last choice in this browser, or the
// browser's own languages.
export function getInitialLanguage(): Language {
  const stored = getLocalStorageValue('bh-language');
  if (isLanguage(stored)) return stored;

  return detectLanguage(
    navigator.languages?.length ? navigator.languages : [navigator.language]
  );
}

export function storeLanguage(language: Language) {
  try {
    setLocalStorageValue('bh-language', language);
  } catch {
    // Storage may be blocked: the choice still holds for this visit
  }
}
