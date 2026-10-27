import { SegmentedControl } from 'src/components';
import { LANGUAGE_NAMES, LANGUAGES, useI18n } from 'src/i18n';

// The one place to switch the language of the whole app, in the navbar:
// EN | PT, with the full names for screen readers.
export function LanguagePicker() {
  const { language, setLanguage, t } = useI18n();

  return (
    <SegmentedControl
      label={t.languagePicker.label}
      hideLabel
      size="sm"
      options={LANGUAGES.map((value) => ({
        value,
        label: LANGUAGE_NAMES[value].short,
        ariaLabel: LANGUAGE_NAMES[value].name,
      }))}
      value={language}
      onChange={setLanguage}
    />
  );
}
