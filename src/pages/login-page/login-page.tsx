import { useNavigate } from 'react-router';
import { Card } from 'src/components';
import { SignInButton } from 'src/features/authentication/sign-in-button';
import symbolUrl from '../../../brand/logo/symbol.svg';
import './login-page.scss';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <img className="login-page__bg" src="/images/sign-in-bg.jpg" alt="" />
      <Card className="login-page__box">
        <img className="login-page__symbol" src={symbolUrl} alt="" />
        <h1 className="login-page__title">Ready to hunt?</h1>
        <p className="login-page__text">
          Sign in to challenge friends and keep your match history.
        </p>
        <SignInButton onSuccess={() => navigate('/')} />
      </Card>
    </div>
  );
}
