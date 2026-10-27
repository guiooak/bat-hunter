import { ReactNode, useEffect } from 'react';
import { NavLink } from 'react-router';
import { Title } from 'src/components';
import { Language, useI18n } from 'src/i18n';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import { LEGAL_UPDATED_AT } from 'src/services/legal-service';
import './legal-page.scss';

// Legal texts are long and reviewed as a whole: one JSX block per language,
// shown in the language picked in the navbar.
export function LegalPage({
  title,
  content,
}: {
  title: Record<Language, string>;
  content: Record<Language, ReactNode>;
}) {
  const { language, t, formatDate } = useI18n();

  useEffect(() => {
    disableBatGame();
    killAllBats();
  }, []);

  const updatedAt = formatDate(
    new Date(`${LEGAL_UPDATED_AT}T12:00:00`).getTime(),
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="legal-page">
      <article className="legal-page__container" lang={language}>
        <div className="legal-page__header">
          <Title size="h1">{title[language]}</Title>
        </div>
        <p className="legal-page__updated">
          {t.legal.updated}: {updatedAt}
        </p>
        {content[language]}
        <nav className="legal-page__links">
          <NavLink to="/privacy">{t.legal.privacyPolicy}</NavLink>
          <NavLink to="/terms">{t.legal.termsOfUse}</NavLink>
          <NavLink to="/">{t.common.backHome}</NavLink>
        </nav>
      </article>
    </div>
  );
}
