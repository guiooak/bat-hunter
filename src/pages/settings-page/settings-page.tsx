import { useEffect } from 'react';
import { NavLink } from 'react-router';
import { Title } from 'src/components';
import { LanguagePicker } from 'src/features/language-picker';
import { useI18n } from 'src/i18n';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import './settings-page.scss';

// Settings for everyone, signed in or not. The language is the only one so
// far; it starts from the browser, so most players never need to come here.
export function SettingsPage() {
  const { t } = useI18n();

  useEffect(() => {
    disableBatGame();
    killAllBats();
  }, []);

  return (
    <div className="settings-page">
      <div className="settings-page__container">
        <Title size="h1">{t.settings.title}</Title>

        <section className="settings-page__card">
          <LanguagePicker />
          <p className="settings-page__note">{t.settings.languageNote}</p>
        </section>

        <NavLink to="/">{t.common.backHome}</NavLink>
      </div>
    </div>
  );
}
