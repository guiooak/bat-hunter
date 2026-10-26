import { useNavigate } from 'react-router';
import { Card } from 'src/components';
import { SignInButton } from 'src/features/authentication/sign-in-button';
import symbolUrl from '../../../brand/logo/symbol.svg';
import { useI18n } from 'src/i18n';
import './login-page.scss';

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="login-page">
      <img className="login-page__bg" src="/images/sign-in-bg.jpg" alt="" />
      <Card className="login-page__box">
        <img className="login-page__symbol" src={symbolUrl} alt="" />
        <h1 className="login-page__title">{t.login.title}</h1>
        <p className="login-page__text">{t.login.text}</p>
        <SignInButton onSuccess={() => navigate('/')} />
      </Card>
    </div>
  );
}
