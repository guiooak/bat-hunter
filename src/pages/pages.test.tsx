import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import {
  ME,
  buildAuth,
  renderWithContext,
  type TestContext,
} from 'src/test/render';
import { AuthContext } from 'src/features/authentication/auth-context/_auth-context-definition';
import * as gameService from 'src/services/game-service';
import { TestI18n } from 'src/test/test-i18n';

const matchModel = vi.hoisted(() => ({
  getInvitationFromFirebase: vi.fn(),
  joinMatchInFirebase: vi.fn(() => Promise.resolve()),
  createMatchInFirebase: vi.fn(),
  getMatchDataReactivelyFromFirebase: vi.fn(),
}));
vi.mock('src/models/match-model', () => matchModel);

const userModel = vi.hoisted(() => ({
  getPublicProfileFromFirebase: vi.fn(() =>
    Promise.resolve({ firstName: 'Bia' })
  ),
  getPublicProfileReactivelyFromFirebase: vi.fn(),
  setUserMatchInFirebase: vi.fn(() => Promise.resolve()),
  getUserMatchesFromFirebase: vi.fn(
    (): Promise<unknown[]> => Promise.resolve([])
  ),
}));
vi.mock('src/models/user-model', () => userModel);

const accountService = vi.hoisted(() => ({
  getAccountSummary: vi.fn(
    (): Promise<{
      matches: number;
      messages: number;
      preferences: Record<string, unknown>;
    }> =>
      Promise.resolve({
        matches: 2,
        messages: 5,
        preferences: { 'bh-difficulty': 'hard' },
      })
  ),
  buildAccountExport: vi.fn(() => Promise.resolve({ account: { id: 'me' } })),
  deleteAccount: vi.fn(() => Promise.resolve()),
}));
vi.mock('src/services/account-service', () => accountService);

const authService = vi.hoisted(() => ({
  reauthenticateCurrentUser: vi.fn(() => Promise.resolve()),
}));
vi.mock('src/services/auth-service', () => authService);

vi.mock('src/services/fly-engine-service', () => ({
  FLYING_BAT_IMG: 'bat.gif',
  createBat: () => {
    const div = document.createElement('div');
    div.className = 'flying-bat flying-bat--normal';
    document.body.appendChild(div);
  },
}));

import { AccountPage } from './account-page';
import { HomePage } from './home-page';
import { InvitationPage } from './invitation-page';
import { PrivacyPage, TermsPage } from './legal-pages';
import { LoginPage } from './login-page';
import { LogoutPage } from './logout-page';
import { MatchesPage } from './matches-page';
import { MultiPlayerPage } from './multi-player-page';
import { NotFoundPage } from './not-found-page';
import { SinglePlayerPage } from './single-player-page';

function Path() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

// Renders a page at a route (for useParams) with a probe of the current path
function renderAt(
  path: string,
  route: string,
  element: ReactElement,
  context: TestContext = {}
) {
  const auth = buildAuth(context);
  const view = render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={auth}>
        <TestI18n language={context.language ?? 'en-US'}>
          <Routes>
            <Route path={path} element={element} />
            <Route path="*" element={<Path />} />
          </Routes>
          <Path />
        </TestI18n>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  return { auth, ...view };
}

beforeEach(() => vi.clearAllMocks());

describe('HomePage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('turns the game off and fades the background in', () => {
    const disable = vi.spyOn(gameService, 'disableBatGame');
    document.body.innerHTML = '<div class="flying-bat"></div>';
    const { container } = renderWithContext(<HomePage />);

    expect(disable).toHaveBeenCalled();
    expect(document.querySelector('.flying-bat')).toBeNull();
    const bg = container.querySelector('.home-page-bg')!;
    expect(bg).not.toHaveClass('visible');
    act(() => vi.advanceTimersByTime(100));
    expect(bg).toHaveClass('visible');

    for (const name of ['Play Single', 'Play Multi']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/privacy'
    );
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/terms'
    );
  });
});

describe('LoginPage', () => {
  it('signs in and goes home', async () => {
    renderAt('/login', '/login', <LoginPage />);

    expect(screen.getByText('Ready to hunt?')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' })
    );

    expect(screen.getAllByTestId('path')[0]).toHaveTextContent('/');
  });
});

describe('LogoutPage', () => {
  it('signs out and goes home', async () => {
    const { auth } = renderAt('/logout', '/logout', <LogoutPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await act(async () => {});

    expect(auth.signOut).toHaveBeenCalled();
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent('/');
  });
});

describe('legal pages', () => {
  it('privacy policy in Portuguese, then in English', async () => {
    renderWithContext(<PrivacyPage />, { language: 'pt-BR' });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Política de Privacidade'
    );
    expect(
      screen.getByText(/Última atualização: 23 de outubro de 2026/)
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'game.bat.hunter@gmail.com' }).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole('table')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'English' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Privacy Policy'
    );
    expect(
      screen.getByText(/Last updated: October 23, 2026/)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      '/terms'
    );
    expect(screen.getByRole('link', { name: '← Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('opens in the language of the app', () => {
    renderWithContext(<PrivacyPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Privacy Policy'
    );
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
  });

  it('terms of use in both languages', async () => {
    renderWithContext(<TermsPage />, { language: 'pt-BR' });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Termos de Uso'
    );
    expect(screen.getByText(/maiores de 13 anos/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'English' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Terms of Use'
    );
    expect(screen.getByText(/aged 13 and over/)).toBeInTheDocument();
  });
});

describe('NotFoundPage', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('lets you shoot bats while lost, with a running joke', () => {
    const { unmount } = renderWithContext(<NotFoundPage />);
    expect(screen.getByRole('img', { name: '404' })).toBeInTheDocument();
    expect(document.body.style.cursor).toContain('aim.png');
    expect(document.querySelectorAll('.flying-bat')).toHaveLength(8);

    const text = () =>
      document.querySelector('.not-found-page__score')!.textContent;
    expect(text()).toBe('While you are here, why not drop a bat or two?');

    unmount();
    expect(document.querySelectorAll('.flying-bat')).toHaveLength(0);
    expect(document.body.style.cursor).toBe('');
  });
});

describe('NotFoundPage messages', () => {
  it('counts the bats and teases about the owl', async () => {
    vi.resetModules();
    const hits: ((type: string) => void)[] = [];
    vi.doMock('src/services/fly-engine-service', () => ({
      FLYING_BAT_IMG: 'bat.gif',
      createBat: ({ onHit }: { onHit: (type: string) => void }) =>
        hits.push(onHit),
    }));
    const { NotFoundPage: Page } = await import('./not-found-page');
    const { renderWithContext: renderFresh } = await import('src/test/render');
    renderFresh(<Page />);
    const text = () =>
      document.querySelector('.not-found-page__score')!.textContent;

    act(() => hits[0]('normal'));
    expect(text()).toBe('1 bat dropped. Still no page, though.');
    act(() => hits[1]('normal'));
    expect(text()).toBe('2 bats dropped. The page is still missing.');

    await userEvent.click(
      screen.getByRole('button', { name: 'Release more bats' })
    );
    expect(hits).toHaveLength(16);
    act(() => hits.slice(2, 10).forEach((hit) => hit('small')));
    expect(text()).toBe('10 bats! Are you even looking for that page?');
    await userEvent.click(
      screen.getByRole('button', { name: 'Release more bats' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Release more bats' })
    );
    act(() => hits.slice(10, 25).forEach((hit) => hit('normal')));
    expect(text()).toBe('25 bats. Forget the page, you found your calling.');

    act(() => hits[25]('owl'));
    expect(text()).toBe(
      'You shot the owl. It was the only one who knew the way back. 🦉'
    );
    vi.doUnmock('src/services/fly-engine-service');
  });
});

describe('SinglePlayerPage', () => {
  it('turns the game on with the dashboard and the music toggle', () => {
    const enable = vi.spyOn(gameService, 'enableBatGame');
    renderWithContext(<SinglePlayerPage />);

    expect(enable).toHaveBeenCalled();
    expect(screen.getByText('Free Play!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '🔊' })).toBeInTheDocument();
  });
});

describe('MultiPlayerPage', () => {
  it('asks guests to sign in', () => {
    renderAt('/multi-player/:matchId?', '/multi-player', <MultiPlayerPage />, {
      currentUser: null,
    });

    expect(screen.getByText('Come and play!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.queryByText('Come and play!')).toBeNull();
  });

  it('shows the dashboards, chat and music for a signed-in player', () => {
    const enable = vi.spyOn(gameService, 'enableBatGame');
    renderAt('/multi-player/:matchId?', '/multi-player', <MultiPlayerPage />);

    expect(enable).toHaveBeenCalled();
    expect(screen.queryByText('Come and play!')).toBeNull();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create a Game' })
    ).toBeInTheDocument();
  });

  it('sends someone who is not a player to the invitation', () => {
    renderAt(
      '/multi-player/:matchId?',
      '/multi-player/m1',
      <MultiPlayerPage />
    );

    act(() => matchModel.getMatchDataReactivelyFromFirebase.mock.calls[0][2]());

    expect(screen.getAllByTestId('path')[0]).toHaveTextContent(
      '/invitation-link/m1'
    );
  });
});

describe('InvitationPage', () => {
  const at = (context: TestContext = {}) =>
    renderAt(
      '/invitation-link/:matchId',
      '/invitation-link/m1',
      <InvitationPage />,
      context
    );

  it('invites to join and joins the battle', async () => {
    matchModel.getInvitationFromFirebase.mockResolvedValue({
      hostId: 'bia',
      createdAt: 5,
    });
    at();

    expect(
      await screen.findByText(
        "You're invited to a battle with Bia. Wanna join the game?"
      )
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Join battle' }));

    expect(matchModel.joinMatchInFirebase).toHaveBeenCalledWith('m1', ME.id);
    const entry = {
      matchId: 'm1',
      hostId: 'bia',
      hostName: 'Bia',
      guestId: ME.id,
      guestName: ME.firstName,
      createdAt: 5,
    };
    expect(userModel.setUserMatchInFirebase).toHaveBeenCalledWith('bia', entry);
    expect(userModel.setUserMatchInFirebase).toHaveBeenCalledWith(ME.id, entry);
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent(
      '/multi-player/m1'
    );
  });

  it('uses fallbacks for a missing host name, user name or date', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(99);
    matchModel.getInvitationFromFirebase.mockResolvedValue({ hostId: 'bia' });
    userModel.getPublicProfileFromFirebase.mockResolvedValueOnce(null as never);
    at({ currentUser: { id: ME.id } });

    expect(await screen.findByText(/battle with …/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Join battle' }));

    expect(userModel.setUserMatchInFirebase).toHaveBeenCalledWith(
      'bia',
      expect.objectContaining({ hostName: '', guestName: '', createdAt: 99 })
    );
  });

  it('says when joining fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    matchModel.getInvitationFromFirebase.mockResolvedValue({
      hostId: 'bia',
      createdAt: 5,
    });
    matchModel.joinMatchInFirebase.mockRejectedValueOnce(new Error('x'));
    at();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Join battle' })
    );

    expect(
      screen.getByText(/It was not possible to join this battle/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join battle' })).toBeEnabled();

    // Trying again clears the message
    matchModel.joinMatchInFirebase.mockReturnValueOnce(new Promise(() => {}));
    await userEvent.click(screen.getByRole('button', { name: 'Join battle' }));
    expect(screen.queryByText(/It was not possible/)).toBeNull();
  });

  it('sends players of the match straight to it', async () => {
    matchModel.getInvitationFromFirebase.mockResolvedValue({
      hostId: ME.id,
      createdAt: 5,
    });
    at();

    expect(await screen.findAllByText('/multi-player/m1')).not.toHaveLength(0);
  });

  it('a full match is private', async () => {
    matchModel.getInvitationFromFirebase.mockResolvedValue({
      hostId: 'bia',
      guestId: 'caio',
      createdAt: 5,
    });
    at();

    expect(
      await screen.findByText(/already has two players/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Join battle' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Back home' }));
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent('/');
  });

  it('a missing invitation is said so', async () => {
    matchModel.getInvitationFromFirebase.mockResolvedValue(null);
    at();

    expect(await screen.findByText(/does not exist/)).toBeInTheDocument();
  });

  it('logs read failures', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    matchModel.getInvitationFromFirebase.mockResolvedValue({
      hostId: 'bia',
      createdAt: 5,
    });
    userModel.getPublicProfileFromFirebase.mockRejectedValueOnce(
      new Error('x')
    );
    const { unmount } = at();
    await act(async () => {});
    unmount();

    matchModel.getInvitationFromFirebase.mockRejectedValueOnce(new Error('y'));
    at();
    await act(async () => {});

    expect(consoleError).toHaveBeenCalledTimes(2);
  });

  it('asks guests to sign in before joining', async () => {
    at({ currentUser: null, status: 'unauthenticated' });

    expect(screen.getByText('Come and play!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(matchModel.getInvitationFromFirebase).not.toHaveBeenCalled();
  });

  it('asks to sign in when a signed-out guest tries to join', async () => {
    matchModel.getInvitationFromFirebase.mockResolvedValue({
      hostId: 'bia',
      createdAt: 5,
    });
    const auth = buildAuth({ status: 'authenticated' });
    const { rerender } = render(
      <MemoryRouter initialEntries={['/invitation-link/m1']}>
        <AuthContext.Provider value={auth}>
          <Routes>
            <Route
              path="/invitation-link/:matchId"
              element={<InvitationPage />}
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    await screen.findByRole('button', { name: 'Join battle' });

    rerender(
      <MemoryRouter initialEntries={['/invitation-link/m1']}>
        <AuthContext.Provider value={{ ...auth, currentUser: null }}>
          <Routes>
            <Route
              path="/invitation-link/:matchId"
              element={<InvitationPage />}
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Join battle' }));

    expect(screen.getByText('Come and play!')).toBeInTheDocument();
    expect(matchModel.joinMatchInFirebase).not.toHaveBeenCalled();
  });

  it('cannot join without a match id or a host', async () => {
    renderAt(
      '/invitation-link/:matchId?',
      '/invitation-link',
      <InvitationPage />
    );

    expect(screen.queryByRole('button', { name: 'Join battle' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Nope' }));
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent('/');
  });
});

describe('MatchesPage', () => {
  it('waits for the sign-in state', () => {
    renderAt('/matches', '/matches', <MatchesPage />, {
      currentUser: null,
      status: 'loading',
    });

    expect(screen.getByText('Loading matches...')).toBeInTheDocument();
    expect(userModel.getUserMatchesFromFirebase).not.toHaveBeenCalled();
  });

  it('asks signed-out visitors to sign in, and closing goes home', async () => {
    renderAt('/matches', '/matches', <MatchesPage />, { currentUser: null });

    expect(screen.getByText('Come and play!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent('/');
    expect(userModel.getUserMatchesFromFirebase).not.toHaveBeenCalled();
  });

  it('lists my matches, oldest first, and opens one', async () => {
    userModel.getUserMatchesFromFirebase.mockResolvedValueOnce([
      {
        matchId: 'b',
        hostId: 'h',
        hostName: 'Ana',
        guestId: 'g',
        guestName: 'Bia',
        createdAt: Date.UTC(2026, 1, 2),
      },
      {
        matchId: 'a',
        hostId: 'h',
        hostName: 'Ana',
        guestId: 'g',
        guestName: 'Caio',
        createdAt: Date.UTC(2026, 1, 1),
      },
    ]);
    renderAt('/matches', '/matches', <MatchesPage />);

    const rows = await screen.findAllByRole('row');
    expect(rows[1]).toHaveTextContent('Caio');
    expect(rows[2]).toHaveTextContent('Bia');

    await userEvent.click(screen.getAllByRole('button', { name: 'Open' })[0]);
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent(
      '/multi-player/a'
    );
  });

  it('says when there are no matches, and logs failures', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    userModel.getUserMatchesFromFirebase.mockRejectedValueOnce(new Error('x'));
    renderAt('/matches', '/matches', <MatchesPage />);

    expect(await screen.findByText('No matches found.')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });
});

describe('AccountPage', () => {
  it('asks to sign in, and closing the modal goes home', async () => {
    renderAt('/account', '/account', <AccountPage />, { currentUser: null });

    expect(screen.getByText('Come and play!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent('/');
  });

  it('renders nothing but waits while the sign-in state loads', () => {
    renderAt('/account', '/account', <AccountPage />, { status: 'loading' });

    expect(screen.queryByText('Come and play!')).toBeNull();
    expect(screen.queryByText('My data')).toBeNull();
  });

  it('lists what is kept about the player', async () => {
    renderAt('/account', '/account', <AccountPage />);

    expect(
      screen.getByRole('heading', { name: 'My data' })
    ).toBeInTheDocument();
    expect(screen.getByText(`Account ID ${ME.id}`)).toBeInTheDocument();
    expect(
      await screen.findByText(
        /2 matches with their scores, and 5 chat messages/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('In this browser only: difficulty.')
    ).toBeInTheDocument();
  });

  it('says when no preference is saved, and logs summary failures', async () => {
    accountService.getAccountSummary.mockResolvedValueOnce({
      matches: 0,
      messages: 0,
      preferences: {},
    });
    const { unmount } = renderAt('/account', '/account', <AccountPage />);
    expect(
      await screen.findByText('In this browser only: no saved preferences.')
    ).toBeInTheDocument();
    unmount();

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    accountService.getAccountSummary.mockRejectedValueOnce(new Error('x'));
    renderAt('/account', '/account', <AccountPage />);
    await act(async () => {});
    expect(consoleError).toHaveBeenCalled();
    expect(screen.getByText(/… matches with their scores/)).toBeInTheDocument();
  });

  it('downloads the data as JSON', async () => {
    const createObjectURL = vi.fn(() => 'blob:x');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    renderAt('/account', '/account', <AccountPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Download my data' })
    );

    expect(accountService.buildAccountExport).toHaveBeenCalledWith(ME.id);
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:x');
  });

  it('shows Preparing… while exporting, and an error when it fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let fail!: (e: Error) => void;
    accountService.buildAccountExport.mockReturnValueOnce(
      new Promise((_, r) => (fail = r))
    );
    renderAt('/account', '/account', <AccountPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Download my data' })
    );
    expect(screen.getByRole('button', { name: 'Preparing…' })).toBeDisabled();

    await act(async () => fail(new Error('x')));
    expect(
      screen.getByText('The download failed. Try again in a moment.')
    ).toBeInTheDocument();
  });

  it('does nothing without a user id', async () => {
    renderAt('/account', '/account', <AccountPage />, {
      currentUser: { firstName: 'Ana' },
      status: 'authenticated',
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Download my data' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete my account' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Yes, delete everything' })
    );

    expect(accountService.buildAccountExport).not.toHaveBeenCalled();
    expect(accountService.getAccountSummary).not.toHaveBeenCalled();
    expect(authService.reauthenticateCurrentUser).not.toHaveBeenCalled();
  });

  it('deletes the account after confirming, then goes home', async () => {
    renderAt('/account', '/account', <AccountPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete my account' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Keep my account' })
    );
    expect(accountService.deleteAccount).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete my account' })
    );
    expect(
      screen.getByText(/Google will ask you to confirm/)
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Yes, delete everything' })
    );

    expect(authService.reauthenticateCurrentUser).toHaveBeenCalled();
    expect(accountService.deleteAccount).toHaveBeenCalledWith(ME.id);
    expect(screen.getAllByTestId('path')[0]).toHaveTextContent('/');
  });

  it('keeps everything if the confirmation fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    authService.reauthenticateCurrentUser.mockRejectedValueOnce(
      new Error('closed')
    );
    renderAt('/account', '/account', <AccountPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete my account' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Yes, delete everything' })
    );

    expect(accountService.deleteAccount).not.toHaveBeenCalled();
    expect(screen.getByText(/The account was not deleted/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Yes, delete everything' })
    ).toBeEnabled();
  });

  it('shows Deleting… while it runs', async () => {
    let finish!: () => void;
    accountService.deleteAccount.mockReturnValueOnce(
      new Promise((r) => (finish = r))
    );
    renderAt('/account', '/account', <AccountPage />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete my account' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Yes, delete everything' })
    );
    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Keep my account' })
    ).toBeDisabled();

    await act(async () => finish());
  });
});

describe('in Portuguese', () => {
  const pt = { language: 'pt-BR' as const };

  it('home, login and the sign out', () => {
    renderWithContext(<HomePage />, pt);
    expect(
      screen.getByText('Morcego demais. Hora de derrubar alguns.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jogar solo' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Termos' })).toBeInTheDocument();
    cleanup();

    renderWithContext(<LoginPage />, pt);
    expect(screen.getByText('Pronto para caçar?')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continuar com o Google' })
    ).toBeInTheDocument();
    expect(screen.getByText(/13 anos ou mais/)).toBeInTheDocument();
    cleanup();

    renderWithContext(<LogoutPage />, pt);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('an invitation, and one that is gone', async () => {
    const at = () =>
      renderAt(
        '/invitation-link/:matchId',
        '/invitation-link/m1',
        <InvitationPage />,
        pt
      );
    matchModel.getInvitationFromFirebase.mockResolvedValueOnce({
      hostId: 'bia',
      createdAt: 5,
    });
    const { unmount } = at();

    expect(
      await screen.findByText('Bia te convidou para uma batalha. Bora jogar?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Entrar na batalha' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agora não' })).toBeVisible();
    unmount();

    matchModel.getInvitationFromFirebase.mockResolvedValueOnce(null);
    at();
    expect(
      await screen.findByText(
        'Este convite não existe (ou a partida foi removida).'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Voltar ao início' })
    ).toBeInTheDocument();
  });

  it('matches, with the date in Brazilian format', async () => {
    userModel.getUserMatchesFromFirebase.mockResolvedValueOnce([
      {
        matchId: 'a',
        hostId: 'h',
        hostName: 'Ana',
        guestId: 'g',
        guestName: 'Caio',
        createdAt: Date.UTC(2026, 1, 3, 12),
      },
    ]);
    renderAt('/matches', '/matches', <MatchesPage />, pt);

    expect(await screen.findByText('Minhas partidas')).toBeInTheDocument();
    const [header, row] = screen.getAllByRole('row');
    expect(header).toHaveTextContent('#AnfitriãoConvidadoCriada em');
    expect(row).toHaveTextContent('03/02/2026');
    expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Início' })).toBeInTheDocument();
  });

  it('my data', async () => {
    accountService.getAccountSummary.mockResolvedValueOnce({
      matches: 2,
      messages: 5,
      preferences: { 'bh-difficulty': 'hard', 'bh-language': 'pt-BR' },
    });
    renderAt('/account', '/account', <AccountPage />, pt);

    expect(
      await screen.findByText(
        '2 partidas com os placares, e 5 mensagens que você enviou no chat.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Só neste navegador: dificuldade, idioma.')
    ).toBeInTheDocument();
    expect(screen.getByText(`ID da conta ${ME.id}`)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Baixar meus dados' })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir minha conta' })
    );
    expect(
      screen.getByRole('button', { name: 'Sim, excluir tudo' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Manter minha conta' })
    ).toBeInTheDocument();
  });

  it('the 404 page', () => {
    renderWithContext(<NotFoundPage />, pt);

    expect(
      screen.getByText('Esta página voou noite adentro.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Já que está aqui, que tal derrubar um ou dois morcegos?'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Soltar mais morcegos' })
    ).toBeInTheDocument();
  });
});
