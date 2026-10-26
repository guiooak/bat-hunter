import { PropsWithChildren, useState } from 'react';
import { buildI18nValue, I18nContext } from 'src/i18n/_i18n-context-definition';
import type { Language } from 'src/i18n';

// The language switches for real, so pickers can be tested through the UI
export function TestI18n({
  language,
  children,
}: PropsWithChildren<{ language: Language }>) {
  const [current, setCurrent] = useState(language);

  return (
    <I18nContext.Provider value={buildI18nValue(current, setCurrent)}>
      {children}
    </I18nContext.Provider>
  );
}
