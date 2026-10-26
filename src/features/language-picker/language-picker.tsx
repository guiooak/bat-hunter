import { SegmentedControl } from 'src/components';
import { LANGUAGE_NAMES, LANGUAGES, useI18n } from 'src/i18n';

// Switches the whole app. Compact (EN | PT) in the navbar, with the full
// names where there is room.
export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <SegmentedControl
      label={t.languagePicker.label}
      hideLabel={compact}
      size={compact ? 'sm' : 'md'}
      options={LANGUAGES.map((value) => ({
        value,
        label: compact
          ? LANGUAGE_NAMES[value].short
          : LANGUAGE_NAMES[value].name,
        ariaLabel: compact ? LANGUAGE_NAMES[value].name : undefined,
      }))}
      value={language}
      onChange={setLanguage}
    />
  );
}
