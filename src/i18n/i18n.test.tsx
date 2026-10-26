import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { AuthContext } from 'src/features/authentication/auth-context/_auth-context-definition';
import { buildAuth, ME } from 'src/test/render';
import type { UserSessionType } from 'src/services/auth-service';

const userModel = vi.hoisted(() => ({
  getPrivateUserLanguage: vi.fn(() => Promise.resolve<string | null>(null)),
  setPrivateUserLanguage: vi.fn(() => Promise.resolve()),
}));
vi.mock('src/models/user-model', () => userModel);

import { buildI18nValue } from './_i18n-context-definition';
import { en } from './en';
import { pt } from './pt';
import { I18nProvider } from './i18n-provider';
import { useI18n } from './use-i18n';
import { detectLanguage, getInitialLanguage, storeLanguage } from './language';

function setBrowserLanguages(languages: string[] | undefined, language = '') {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(
    languages as readonly string[]
  );
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);
}

// Renders the provider for a signed-in (or not) player and exposes the hook
function renderProvider(currentUser: UserSessionType | null = null) {
  const auth = buildAuth({ currentUser });
  const wrapper = ({ children }: PropsWithChildren) => (
    <AuthContext.Provider value={auth}>
      <I18nProvider>{children}</I18nProvider>
    </AuthContext.Provider>
  );

  return renderHook(() => useI18n(), { wrapper });
}

const flush = () => act(async () => {});

beforeEach(() => {
  vi.clearAllMocks();
  setBrowserLanguages(['en-US']);
});

afterEach(() => {
  document.documentElement.lang = '';
});

describe('language detection', () => {
  it.each([
    [['pt-BR'], 'pt-BR'],
    [['pt-PT', 'en'], 'pt-BR'],
    [['fr-FR', 'PT'], 'pt-BR'],
    [['en-GB', 'pt-BR'], 'en-US'],
    [['fr-FR', 'de'], 'en-US'],
    [[], 'en-US'],
  ])('%j → %s', (preferred, expected) => {
    expect(detectLanguage(preferred)).toBe(expected);
  });

  it('prefers the choice saved in this browser', () => {
    setBrowserLanguages(['pt-BR']);
    localStorage.setItem('bh-language', '"en-US"');

    expect(getInitialLanguage()).toBe('en-US');
  });

  it('ignores a saved value that is not a language', () => {
    setBrowserLanguages(['pt-BR']);
    localStorage.setItem('bh-language', '"fr-FR"');

    expect(getInitialLanguage()).toBe('pt-BR');
  });

  it('falls back to navigator.language without a list', () => {
    setBrowserLanguages(undefined, 'pt-BR');
    expect(getInitialLanguage()).toBe('pt-BR');

    setBrowserLanguages([], 'pt-BR');
    expect(getInitialLanguage()).toBe('pt-BR');
  });

  it('keeps going when the storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => storeLanguage('pt-BR')).not.toThrow();
  });
});

describe('without a provider', () => {
  it('speaks English', () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.language).toBe('en-US');
    expect(result.current.t).toBe(en);
    expect(() => result.current.setLanguage('pt-BR')).not.toThrow();
  });
});

describe('formats', () => {
  const moment = Date.UTC(2026, 9, 26, 15, 30);

  it('follows the language, not the browser', () => {
    const ptValue = buildI18nValue('pt-BR');
    const enValue = buildI18nValue('en-US');

    expect(ptValue.t).toBe(pt);
    expect(ptValue.formatDate(moment, { timeZone: 'UTC' })).toBe('26/10/2026');
    expect(enValue.formatDate(moment, { timeZone: 'UTC' })).toBe('10/26/2026');
    expect(ptValue.formatDateTime(moment)).toBe(
      new Date(moment).toLocaleString('pt-BR')
    );
    expect(enValue.formatTime(moment)).toBe(
      new Date(moment).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  });
});

describe('I18nProvider', () => {
  it('signed out: starts from the browser and saves the choice locally only', async () => {
    setBrowserLanguages(['pt-BR']);
    const { result } = renderProvider(null);

    expect(result.current.language).toBe('pt-BR');
    expect(result.current.t).toBe(pt);
    expect(document.documentElement.lang).toBe('pt-BR');

    act(() => result.current.setLanguage('en-US'));

    expect(result.current.language).toBe('en-US');
    expect(document.documentElement.lang).toBe('en-US');
    expect(localStorage.getItem('bh-language')).toBe('"en-US"');
    expect(userModel.getPrivateUserLanguage).not.toHaveBeenCalled();
    expect(userModel.setPrivateUserLanguage).not.toHaveBeenCalled();
  });

  it('signed in: the language saved in the account wins', async () => {
    localStorage.setItem('bh-language', '"en-US"');
    userModel.getPrivateUserLanguage.mockResolvedValueOnce('pt-BR');

    const { result } = renderProvider(ME);
    await flush();

    expect(userModel.getPrivateUserLanguage).toHaveBeenCalledWith(ME.id);
    expect(result.current.language).toBe('pt-BR');
    expect(localStorage.getItem('bh-language')).toBe('"pt-BR"');
    expect(userModel.setPrivateUserLanguage).not.toHaveBeenCalled();
  });

  it.each([null, 'fr-FR'])(
    'signed in with %s in the account: saves the language in use',
    async (saved) => {
      setBrowserLanguages(['pt-BR']);
      userModel.getPrivateUserLanguage.mockResolvedValueOnce(saved);

      const { result } = renderProvider(ME);
      await flush();

      expect(result.current.language).toBe('pt-BR');
      expect(userModel.setPrivateUserLanguage).toHaveBeenCalledWith(
        ME.id,
        'pt-BR'
      );
    }
  );

  it('signed in: a new choice goes to the account and the browser', async () => {
    const { result } = renderProvider(ME);
    await flush();
    vi.clearAllMocks();

    act(() => result.current.setLanguage('pt-BR'));

    expect(result.current.language).toBe('pt-BR');
    expect(localStorage.getItem('bh-language')).toBe('"pt-BR"');
    expect(userModel.setPrivateUserLanguage).toHaveBeenCalledWith(
      ME.id,
      'pt-BR'
    );
  });

  it('changes the screen even when the account cannot be read or written', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    userModel.getPrivateUserLanguage.mockRejectedValueOnce(new Error('read'));

    const { result } = renderProvider(ME);
    await flush();

    expect(result.current.language).toBe('en-US');

    userModel.setPrivateUserLanguage.mockRejectedValueOnce(new Error('write'));
    act(() => result.current.setLanguage('pt-BR'));
    await flush();

    expect(result.current.language).toBe('pt-BR');
    expect(consoleError).toHaveBeenCalledTimes(2);
  });

  it('ignores an account answer that arrives after unmounting', async () => {
    let answer: (value: string | null) => void = () => {};
    userModel.getPrivateUserLanguage.mockReturnValueOnce(
      new Promise((resolve) => (answer = resolve))
    );

    const { unmount } = renderProvider(ME);
    unmount();
    answer(null);
    await flush();

    expect(userModel.setPrivateUserLanguage).not.toHaveBeenCalled();
  });

  it('keeps the language after signing out', async () => {
    userModel.getPrivateUserLanguage.mockResolvedValueOnce('pt-BR');
    const auth = { value: buildAuth({ currentUser: ME }) };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthContext.Provider value={auth.value}>
        <I18nProvider>{children}</I18nProvider>
      </AuthContext.Provider>
    );
    const { result, rerender } = renderHook(() => useI18n(), { wrapper });
    await flush();

    auth.value = buildAuth({ currentUser: null });
    rerender();

    expect(result.current.language).toBe('pt-BR');
  });

  it('renders its children', () => {
    render(
      <AuthContext.Provider value={buildAuth({ currentUser: null })}>
        <I18nProvider>
          <p>inside</p>
        </I18nProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByText('inside')).toBeInTheDocument();
  });
});

// Every leaf of a dictionary, as path → text (functions called with a sample)
function flatten(messages: object, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(messages).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'function') return [[path, String(value(7, 7))]];
      if (typeof value === 'string') return [[path, value]];

      return Object.entries(flatten(value, path));
    })
  );
}

// Same in both languages on purpose: names, symbols, loanwords
const SAME_IN_BOTH = new Set<string>(['signIn.noticeEnd']);

describe('dictionaries', () => {
  const enTexts = flatten(en);
  const ptTexts = flatten(pt);

  it('have the same keys', () => {
    expect(Object.keys(ptTexts).sort()).toEqual(Object.keys(enTexts).sort());
  });

  it('have every Portuguese text translated', () => {
    const untranslated = Object.keys(enTexts).filter(
      (path) =>
        !SAME_IN_BOTH.has(path) && ptTexts[path].trim() === enTexts[path].trim()
    );

    expect(untranslated).toEqual([]);
  });

  it('have no empty text', () => {
    expect(
      Object.entries({ ...enTexts, ...ptTexts }).filter(
        ([, text]) => !text.trim()
      )
    ).toEqual([]);
  });
});
