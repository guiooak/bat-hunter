import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuthContext } from 'src/features/authentication/auth-context';
import {
  getPrivateUserLanguage,
  setPrivateUserLanguage,
} from 'src/models/user-model';
import { buildI18nValue, I18nContext } from './_i18n-context-definition';
import {
  getInitialLanguage,
  isLanguage,
  Language,
  storeLanguage,
} from './language';

function logError(e: unknown) {
  console.error('I18nProvider::ERROR: language not synced', e);
}

// The language follows the player: saved in their account when signed in
// (it wins over this browser's), and in this browser either way.
export function I18nProvider({ children }: PropsWithChildren) {
  const { currentUser, status } = useAuthContext();
  const userId = status === 'authenticated' ? currentUser?.id : undefined;
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  // Read by the account sync, which must not rerun on every change
  const languageRef = useRef(language);

  useEffect(() => {
    languageRef.current = language;
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    getPrivateUserLanguage(userId)
      .then((saved) => {
        if (!active) return;

        if (isLanguage(saved)) {
          setLanguageState(saved);
          storeLanguage(saved);
          return;
        }

        // First sign-in, or an account from before the language: keep what
        // the player is already using
        return setPrivateUserLanguage(userId, languageRef.current);
      })
      .catch(logError);

    return () => {
      active = false;
    };
  }, [userId]);

  const setLanguage = useCallback(
    (next: Language) => {
      setLanguageState(next);
      storeLanguage(next);

      if (userId) setPrivateUserLanguage(userId, next).catch(logError);
    },
    [userId]
  );

  const value = useMemo(
    () => buildI18nValue(language, setLanguage),
    [language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
