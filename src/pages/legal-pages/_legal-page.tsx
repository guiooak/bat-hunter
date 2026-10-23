import { ReactNode, useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { SegmentedControl, Title } from 'src/components';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import { LEGAL_UPDATED_AT } from 'src/services/legal-service';
import './legal-page.scss';

type Language = 'pt' | 'en';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
];

// Legal texts in Portuguese (the players are in Brazil) and English (the
// language of the game).
export function LegalPage({
  title,
  content,
}: {
  title: Record<Language, string>;
  content: Record<Language, ReactNode>;
}) {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    disableBatGame();
    killAllBats();
  }, []);

  const updatedAt = new Date(`${LEGAL_UPDATED_AT}T12:00:00`).toLocaleDateString(
    language === 'pt' ? 'pt-BR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="legal-page">
      <article className="legal-page__container" lang={language}>
        <div className="legal-page__header">
          <Title size="h1">{title[language]}</Title>
          <SegmentedControl
            label={language === 'pt' ? 'Idioma' : 'Language'}
            options={LANGUAGES}
            value={language}
            onChange={setLanguage}
          />
        </div>
        <p className="legal-page__updated">
          {language === 'pt' ? 'Última atualização' : 'Last updated'}:{' '}
          {updatedAt}
        </p>
        {content[language]}
        <nav className="legal-page__links">
          <NavLink to="/privacy">
            {language === 'pt' ? 'Política de Privacidade' : 'Privacy Policy'}
          </NavLink>
          <NavLink to="/terms">
            {language === 'pt' ? 'Termos de Uso' : 'Terms of Use'}
          </NavLink>
          <NavLink to="/">← Home</NavLink>
        </nav>
      </article>
    </div>
  );
}
