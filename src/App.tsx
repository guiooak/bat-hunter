import { BrowserRouter, Route, Routes } from 'react-router';
import { HomePage } from './pages/home-page';
import { LoginPage } from './pages/login-page';
import { MultiPlayerPage } from './pages/multi-player-page';
import { SinglePlayerPage } from './pages/single-player-page';
import { MatchesPage } from './pages/matches-page';
import { Navbar } from './components/navbar';
import './App.scss';
import { AuthContextProvider } from './features/authentication';
import { LogoutPage } from './pages/logout-page';
import { InvitationPage } from './pages/invitation-page';
import { NotFoundPage } from './pages/not-found-page';
import { PrivacyPage, TermsPage } from './pages/legal-pages';
import { AccountPage } from './pages/account-page';

export function App() {
  return (
    <AuthContextProvider>
      <div className="app-container">
        <BrowserRouter>
          <header>
            <Navbar />
          </header>
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="single-player" element={<SinglePlayerPage />} />
              <Route path="multi-player" element={<MultiPlayerPage />} />
              <Route
                path="multi-player/:matchId"
                element={<MultiPlayerPage />}
              />
              <Route
                path="invitation-link/:matchId"
                element={<InvitationPage />}
              />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="logout" element={<LogoutPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </div>
    </AuthContextProvider>
  );
}
