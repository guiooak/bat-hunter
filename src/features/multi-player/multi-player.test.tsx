import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { ME, renderWithContext } from 'src/test/render';
import { AuthContext } from 'src/features/authentication/auth-context/_auth-context-definition';
import type { MatchType } from 'src/models/match-model';
import type { UserSessionType } from 'src/services/auth-service';

const messageModel = vi.hoisted(() => ({
  createMessageInFirebase: vi.fn(() => Promise.resolve('id')),
}));
vi.mock('src/models/message-model', () => messageModel);

const matchModel = vi.hoisted(() => ({
  createMatchInFirebase: vi.fn(() => Promise.resolve('new-match')),
  getMatchDataReactivelyFromFirebase: vi.fn(),
}));
vi.mock('src/models/match-model', () => matchModel);

const userModel = vi.hoisted(() => ({
  getPublicProfileReactivelyFromFirebase: vi.fn(),
}));
vi.mock('src/models/user-model', () => userModel);

import { MultiPlayerChat } from './multi-player-chat';
import {
  MultiPlayerContext,
  MultiPlayerContextProvider,
  useMultiPlayerContext,
} from './multi-player-context';
import { MultiPlayerMainDashboard } from './multi-player-main-dashboard';
import { MultiPlayerOpponentDashboard } from './multi-player-opponent-dashboard';
import { MultiPlayerGameHistoryModal } from './multi-player-game-dashboard/_multi-player-game-history-modal';
import { MultiPlayerGameResultModal } from './multi-player-game-dashboard/_multi-player-game-result-modal';

const BIA: UserSessionType = {
  id: 'bia',
  name: 'Bia',
  firstName: 'Bia',
  picture: 'bia.png',
  lastPulseAt: Date.now(),
};

const match: MatchType = {
  id: 'm1',
  hostId: ME.id,
  guestId: 'bia',
  messages: {
    a: {
      id: 'a',
      authorId: ME.id,
      message: 'hi',
      createdAt: Date.UTC(2026, 0, 1, 10),
    },
    b: {
      id: 'b',
      authorId: 'bia',
      message: 'hey',
      createdAt: Date.UTC(2026, 0, 1, 11),
    },
  },
};

beforeEach(() => vi.clearAllMocks());

describe('MultiPlayerChat', () => {
  it('counts unread messages until the chat opens', async () => {
    renderWithContext(<MultiPlayerChat />, { match, opponentUser: BIA });

    expect(screen.getByText('Chat (2)')).toBeInTheDocument();
    expect(screen.getByLabelText('Unread messages')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Chat (2)'));
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(document.querySelector('.multi-player-chat')).toHaveClass(
      'multi-player-chat--open'
    );

    await userEvent.click(screen.getByText('Chat'));
    expect(document.querySelector('.multi-player-chat')).not.toHaveClass(
      'multi-player-chat--open'
    );
  });

  it('shows who said what, with a Report link on the opponent messages', () => {
    renderWithContext(<MultiPlayerChat />, { match, opponentUser: BIA });

    expect(screen.getByText('hi').nextSibling).toHaveTextContent(/^You, /);
    expect(screen.getByText('hey').nextSibling).toHaveTextContent(/^Bia, /);

    const reports = screen.getAllByRole('link', { name: 'Report' });
    expect(reports).toHaveLength(1);
    const href = decodeURIComponent(reports[0].getAttribute('href')!);
    expect(href).toContain('mailto:game.bat.hunter@gmail.com');
    expect(href).toContain('Match: m1');
    expect(href).toContain('Message: b');
    expect(href).toContain('Text: hey');
  });

  it('sends a trimmed message on Enter and clears the input', async () => {
    renderWithContext(<MultiPlayerChat />, { match, opponentUser: BIA });
    const input = screen.getByRole('textbox');

    await userEvent.type(input, '  gg  ');
    fireEvent.keyDown(input, { key: 'Enter' });
    await act(async () => {});

    expect(messageModel.createMessageInFirebase).toHaveBeenCalledWith({
      matchId: 'm1',
      authorId: ME.id,
      message: 'gg',
    });
    expect(input).toHaveValue('');
  });

  it('does not send empty messages or twice at once', async () => {
    let finish!: () => void;
    messageModel.createMessageInFirebase.mockReturnValueOnce(
      new Promise((r) => (finish = () => r('id')))
    );
    renderWithContext(<MultiPlayerChat />, { match, opponentUser: BIA });
    const input = screen.getByRole('textbox');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(messageModel.createMessageInFirebase).not.toHaveBeenCalled();

    await userEvent.type(input, 'one');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(messageModel.createMessageInFirebase).toHaveBeenCalledTimes(1);

    await act(async () => finish());
  });

  it('tells when a message was not sent', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    messageModel.createMessageInFirebase.mockRejectedValueOnce(new Error('x'));
    renderWithContext(<MultiPlayerChat />, { match, opponentUser: BIA });

    await userEvent.type(screen.getByRole('textbox'), 'hi');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    await act(async () => {});

    expect(
      screen.getByText('Message not sent. Press Enter to try again.')
    ).toBeInTheDocument();
  });

  it('is disabled outside a match and hidden while a game runs', () => {
    const { unmount } = renderWithContext(<MultiPlayerChat />);
    expect(
      screen.getByPlaceholderText('Create or join a match to chat')
    ).toBeDisabled();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    unmount();

    renderWithContext(<MultiPlayerChat />, {
      match: { id: 'm1', games: { g: { id: 'g', state: 'GAME_IN_PROGRESS' } } },
      currentUser: null,
    });
    expect(document.querySelector('.multi-player-chat')).toHaveClass(
      'multi-player-chat--hidden'
    );
  });

  it('does not scroll after the chat is gone', async () => {
    let finish!: () => void;
    messageModel.createMessageInFirebase.mockReturnValueOnce(
      new Promise((r) => (finish = () => r('id')))
    );
    const { unmount } = renderWithContext(<MultiPlayerChat />, {
      match,
      opponentUser: BIA,
    });
    await userEvent.type(screen.getByRole('textbox'), 'bye');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });

    unmount();
    await act(async () => finish());
  });

  it('handles messages without author name, text or date', () => {
    renderWithContext(<MultiPlayerChat />, {
      match: { id: 'm1', messages: { x: { id: 'x', authorId: 'bia' } } },
    });

    expect(screen.getAllByRole('link', { name: 'Report' })).toHaveLength(1);
  });
});

describe('MultiPlayerContextProvider', () => {
  function Probe() {
    const { match, opponentUser, isMatchPrivate } = useMultiPlayerContext();
    return (
      <p>
        {match?.id ?? 'no-match'}|{opponentUser?.firstName ?? 'no-opponent'}|
        {String(isMatchPrivate)}
      </p>
    );
  }

  function renderProvider(route: string, user: UserSessionType | null = ME) {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider
          value={{
            currentUser: user,
            status: user ? 'authenticated' : 'unauthenticated',
            updatePresence: vi.fn(),
            signIn: vi.fn(),
            signOut: vi.fn(),
          }}
        >
          <Routes>
            <Route
              path="/multi-player/:matchId?"
              element={
                <MultiPlayerContextProvider>
                  <Probe />
                </MultiPlayerContextProvider>
              }
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  it('has no match without a match id or a user', () => {
    renderProvider('/multi-player');
    expect(screen.getByText('no-match|no-opponent|false')).toBeInTheDocument();

    renderProvider('/multi-player/m1', null);
    expect(
      matchModel.getMatchDataReactivelyFromFirebase
    ).not.toHaveBeenCalled();
  });

  it('follows the match and the opponent profile (as host and as guest)', () => {
    renderProvider('/multi-player/m1');
    const [matchId, onMatch] =
      matchModel.getMatchDataReactivelyFromFirebase.mock.calls[0];
    expect(matchId).toBe('m1');

    act(() => onMatch({ id: 'm1', hostId: ME.id, guestId: 'bia' }));
    const [opponentId, onProfile] =
      userModel.getPublicProfileReactivelyFromFirebase.mock.calls[0];
    expect(opponentId).toBe('bia');
    act(() => onProfile(BIA));
    expect(screen.getByText('m1|Bia|false')).toBeInTheDocument();

    act(() => onMatch({ id: 'm1', hostId: 'caio', guestId: ME.id }));
    expect(
      userModel.getPublicProfileReactivelyFromFirebase
    ).toHaveBeenLastCalledWith('caio', expect.any(Function));

    act(() => onMatch({ id: 'm1', hostId: ME.id }));
    expect(screen.getByText('m1|no-opponent|false')).toBeInTheDocument();
  });

  it('flags a match the user cannot read as private', () => {
    renderProvider('/multi-player/m1');
    const onDenied =
      matchModel.getMatchDataReactivelyFromFirebase.mock.calls[0][2];

    act(() => onDenied());

    expect(screen.getByText('no-match|no-opponent|true')).toBeInTheDocument();
  });

  it('has empty defaults outside the provider', () => {
    const { result } = renderHook(() => useMultiPlayerContext());

    expect(result.current).toEqual({
      opponentUser: null,
      match: undefined,
      isMatchPrivate: false,
    });
    expect(MultiPlayerContext).toBeDefined();
  });
});

describe('player dashboards', () => {
  const scored: MatchType = {
    ...match,
    games: {
      g1: {
        id: 'g1',
        createdAt: 1,
        hostData: { shotCounter: 4, killCounter: 3 },
        guestData: { shotCounter: 2, killCounter: 2, points: 13 },
      },
    },
  };

  it('main dashboard shows my score as card and chip', () => {
    renderWithContext(<MultiPlayerMainDashboard />, { match: scored });

    expect(screen.getAllByText('3')).toHaveLength(2);
    expect(screen.getByText('225 pts · 75%')).toBeInTheDocument();
    expect(
      screen.getByText('You', { selector: '.bh-score-chip__name' })
    ).toBeInTheDocument();
  });

  it('opponent dashboard shows the opponent score and status', () => {
    renderWithContext(<MultiPlayerOpponentDashboard />, {
      match: scored,
      opponentUser: BIA,
    });

    expect(screen.getByText('1300 pts · 100%')).toBeInTheDocument();
    expect(screen.getAllByText('online')).toHaveLength(2);
    expect(
      document.querySelector('.multi-player-opponent-dashboard')
    ).toHaveClass('multi-player-opponent-dashboard--with-match');
  });

  it('opponent card works with no match at all', async () => {
    const { MultiPlayerOpponentDashboardWithMatch } = await import(
      './multi-player-opponent-dashboard/_multi-player-opponent-dashboard-with-match'
    );
    renderWithContext(<MultiPlayerOpponentDashboardWithMatch match={null} />, {
      opponentUser: BIA,
    });

    expect(screen.getByText('0 pts · 100%')).toBeInTheDocument();
  });

  it('opponent dashboard waits for the opponent profile', () => {
    renderWithContext(<MultiPlayerOpponentDashboard />, { match: scored });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('match setup (no opponent yet)', () => {
  function LocationProbe() {
    return <p data-testid="path">{useLocation().pathname}</p>;
  }

  function renderSetup(route: string, user: UserSessionType | null = ME) {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider
          value={{
            currentUser: user,
            status: user ? 'authenticated' : 'unauthenticated',
            updatePresence: vi.fn(),
            signIn: vi.fn(() => Promise.resolve()),
            signOut: vi.fn(),
          }}
        >
          <Routes>
            <Route
              path="/multi-player/:matchId?"
              element={
                <>
                  <MultiPlayerOpponentDashboard />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  it('creates a game and goes to it', async () => {
    renderSetup('/multi-player');

    await userEvent.click(
      screen.getByRole('button', { name: 'Create a Game' })
    );

    expect(matchModel.createMatchInFirebase).toHaveBeenCalledWith({
      hostId: ME.id,
    });
    // The navigation happens after the match is created (an await)
    await waitFor(() =>
      expect(screen.getByTestId('path')).toHaveTextContent(
        '/multi-player/new-match'
      )
    );
  });

  it('logs a failure to create the match', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    matchModel.createMatchInFirebase.mockRejectedValueOnce(new Error('x'));
    renderSetup('/multi-player');

    await userEvent.click(
      screen.getByRole('button', { name: 'Create a Game' })
    );

    expect(consoleError).toHaveBeenCalledWith(
      'ERROR: could not create the match.',
      expect.any(Error)
    );
  });

  it('asks to sign in first', async () => {
    renderSetup('/multi-player', null);

    await userEvent.click(
      screen.getByRole('button', { name: 'Create a Game' })
    );

    expect(screen.getByText('Come and play!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(screen.queryByText('Come and play!')).toBeNull();
    expect(matchModel.createMatchInFirebase).not.toHaveBeenCalled();
  });

  describe('with a match', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    it('shares the invitation link and copies it', async () => {
      const writeText = vi.fn(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });
      renderSetup('/multi-player/m1');

      const link = `${window.location.origin}/invitation-link/m1`;
      expect(screen.getByRole('textbox')).toHaveValue(link);

      fireEvent.click(screen.getByRole('button', { name: 'Copy invite link' }));
      expect(writeText).toHaveBeenCalledWith(link);
      expect(
        screen.getByRole('button', { name: 'Copied!' })
      ).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(3000));
      expect(
        screen.getByRole('button', { name: 'Copy invite link' })
      ).toBeInTheDocument();
    });
  });
});

describe('game modals', () => {
  const finished: MatchType = {
    id: 'm1',
    hostId: ME.id,
    guestId: 'bia',
    games: {
      g1: {
        id: 'g1',
        createdAt: 1,
        state: 'GAME_CLOSED',
        winnerId: ME.id,
        hostData: { shotCounter: 4, killCounter: 3, points: 9 },
        guestData: { shotCounter: 2, killCounter: 1 },
      },
      g2: { id: 'g2', createdAt: 2, state: 'GAME_FINISHED', winnerId: 'bia' },
      g3: { id: 'g3', createdAt: 3, state: 'GAME_CLOSED', winnerId: 'DRAW' },
      g4: { id: 'g4', createdAt: 4, state: 'GAME_CLOSED', winnerId: 'someone' },
      g5: { id: 'g5', createdAt: 5, state: 'GAME_READY' },
      g6: { id: 'g6', createdAt: 6 },
    },
  };

  it('history: wins per player and each played game', () => {
    renderWithContext(
      <MultiPlayerGameHistoryModal open onClose={vi.fn()} match={finished} />,
      { opponentUser: BIA }
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent('Winner: Ana 🎉');
    expect(items[0]).toHaveTextContent(
      'Ana: 3 kills | 75% accuracy | score: 675'
    );
    expect(items[0]).toHaveTextContent(
      'Bia: 1 kills | 50% accuracy | score: 50'
    );
    expect(items[1]).toHaveTextContent('Winner: Bia 🎉');
    expect(items[2]).toHaveTextContent('Winner: Same score! 🤝');
    expect(items[3]).toHaveTextContent('Winner: N/A');

    const ranking = screen.getAllByRole('heading');
    expect(ranking.map((h) => h.textContent)).toEqual(['1', '1']);
  });

  it('history from the guest side, and empty before any game', () => {
    const { unmount } = renderWithContext(
      <MultiPlayerGameHistoryModal
        open
        onClose={vi.fn()}
        match={{ ...finished, hostId: 'bia', guestId: ME.id }}
      />,
      { opponentUser: BIA }
    );
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
      'Ana: 1 kills | 50% accuracy | score: 50'
    );
    unmount();

    renderWithContext(<MultiPlayerGameHistoryModal open onClose={vi.fn()} />, {
      currentUser: null,
    });
    expect(screen.getByText('No games played yet.')).toBeInTheDocument();
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual([
      '0',
      '0',
    ]);
  });

  it('history with no names: an opponent whose account is gone', () => {
    renderWithContext(
      <MultiPlayerGameHistoryModal open onClose={vi.fn()} match={finished} />,
      { currentUser: { id: ME.id }, opponentUser: null }
    );

    const [first] = screen.getAllByRole('listitem');
    expect(first).toHaveTextContent(': 3 kills | 75% accuracy | score: 675');
    expect(first).toHaveTextContent(': 1 kills | 50% accuracy | score: 50');
  });

  it('result: win, loss and draw, with both scores', () => {
    const game = finished.games!.g1;
    const { rerender } = renderWithContext(
      <MultiPlayerGameResultModal
        open
        onClose={vi.fn()}
        match={finished}
        game={game}
      />,
      { opponentUser: BIA }
    );
    expect(screen.getByText('You Win! 🎉')).toBeInTheDocument();
    expect(screen.getByText('675')).toBeInTheDocument();
    expect(screen.getByText("Bia's Score")).toBeInTheDocument();

    rerender(
      <MultiPlayerGameResultModal
        open
        onClose={vi.fn()}
        match={{ ...finished, hostId: 'bia', guestId: ME.id }}
        game={{ ...game, winnerId: 'bia' }}
      />
    );
    expect(screen.getByText('You lose! 💔')).toBeInTheDocument();

    rerender(
      <MultiPlayerGameResultModal
        open
        onClose={vi.fn()}
        game={{ winnerId: 'DRAW' }}
      />
    );
    expect(screen.getByText('Same score! 🤝')).toBeInTheDocument();
  });
});

describe('multiplayer in Portuguese', () => {
  const pt = { language: 'pt-BR' as const };

  it('chat: names, placeholder and a report in Portuguese', async () => {
    renderWithContext(<MultiPlayerChat />, {
      ...pt,
      match,
      opponentUser: BIA,
    });

    expect(screen.getByText('Chat (2)')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagens não lidas')).toBeInTheDocument();
    expect(screen.getByText('hi').nextSibling).toHaveTextContent(/^Você, /);
    expect(
      screen.getByPlaceholderText(
        'Enter para enviar, Shift+Enter para nova linha'
      )
    ).toBeInTheDocument();

    const report = screen.getByRole('link', { name: 'Denunciar' });
    const href = decodeURIComponent(report.getAttribute('href')!);
    expect(href).toContain('Bat Hunter: denúncia no chat');
    expect(href).toContain('Partida: m1');
    expect(href).toContain('Texto: hey');
    expect(href).toContain('Motivo (opcional):');
  });

  it('chat: the time follows the language', () => {
    renderWithContext(<MultiPlayerChat />, { ...pt, match, opponentUser: BIA });

    const time = (
      screen.getByText('hi').nextSibling as HTMLElement
    ).querySelector('span')!;
    const sentAt = match.messages!.a.createdAt!;
    expect(time).toHaveTextContent(
      new Date(sentAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    expect(time).toHaveAttribute(
      'title',
      new Date(sentAt).toLocaleString('pt-BR')
    );
  });

  it('history and result', () => {
    const finished: MatchType = {
      id: 'm1',
      hostId: ME.id,
      guestId: 'bia',
      games: {
        g1: {
          id: 'g1',
          createdAt: 1,
          state: 'GAME_CLOSED',
          winnerId: 'DRAW',
          hostData: { shotCounter: 4, killCounter: 3, points: 9 },
        },
      },
    };
    const { unmount } = renderWithContext(
      <MultiPlayerGameHistoryModal open onClose={vi.fn()} match={finished} />,
      { ...pt, opponentUser: BIA }
    );
    expect(screen.getByText('Histórico de rodadas')).toBeInTheDocument();
    const [item] = screen.getAllByRole('listitem');
    expect(item).toHaveTextContent('Vencedor: Empate! 🤝');
    expect(item).toHaveTextContent(
      'Ana: 3 abates | 75% de precisão | pontos: 675'
    );
    unmount();

    renderWithContext(
      <MultiPlayerGameResultModal
        open
        onClose={vi.fn()}
        match={finished}
        game={{ ...finished.games!.g1, winnerId: 'bia' }}
      />,
      { ...pt, opponentUser: BIA }
    );
    expect(screen.getByText('Você perdeu! 💔')).toBeInTheDocument();
    expect(screen.getByText('Sua pontuação')).toBeInTheDocument();
    expect(screen.getByText('Pontuação de Bia')).toBeInTheDocument();
  });

  it('dashboards and the match setup', () => {
    const { unmount } = renderWithContext(
      <>
        <MultiPlayerMainDashboard />
        <MultiPlayerOpponentDashboard />
      </>,
      { ...pt, match, opponentUser: { ...BIA, away: true } }
    );
    expect(screen.getAllByText('Pontos')).toHaveLength(2);
    expect(screen.getAllByText('Você').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ausente').length).toBeGreaterThan(0);
    unmount();

    renderWithContext(<MultiPlayerOpponentDashboard />, pt);
    expect(screen.getByText('Preparar partida')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar partida' })
    ).toBeInTheDocument();
  });
});
