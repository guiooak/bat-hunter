import { SegmentedControl } from 'src/components';
import { LANGUAGE_NAMES, LANGUAGES, useI18n } from 'src/i18n';

// Switches the language of the whole app. Each language is named in itself.
export function LanguagePicker() {
  const { language, setLanguage, t } = useI18n();

  return (
    <SegmentedControl
      label={t.languagePicker.label}
      options={LANGUAGES.map((value) => ({
        value,
        label: LANGUAGE_NAMES[value],
      }))}
      value={language}
      onChange={setLanguage}
    />
  );
}
