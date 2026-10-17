import { useNavigate } from 'react-router';
import { SignInButton } from 'src/features/authentication/sign-in-button';
import './login-page.scss';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <img className="login-page__bg" src="/images/sign-in-bg.jpg" />
      <div className="login-page__box">
        <SignInButton onSuccess={() => navigate('/')} />
      </div>
    </div>
  );
}
