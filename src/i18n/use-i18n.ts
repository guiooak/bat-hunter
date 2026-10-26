import { useContext } from 'react';
import { I18nContext } from './_i18n-context-definition';

export function useI18n() {
  return useContext(I18nContext);
}
