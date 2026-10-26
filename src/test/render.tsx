import { PropsWithChildren, ReactElement } from 'react';
import { render, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { AuthContext } from 'src/features/authentication/auth-context/_auth-context-definition';
import { MultiPlayerContext } from 'src/features/multi-player/multi-player-context/_multi-player-context-definition';
import type { MatchType } from 'src/models/match-model';
import type { Language } from 'src/i18n';
import { TestI18n } from './test-i18n';
import type {
  AuthStatusType,
  UserSessionType,
} from 'src/services/auth-service';

export const ME: UserSessionType = {
  id: 'me',
  name: 'Ana Silva',
  firstName: 'Ana',
  lastName: 'Silva',
  picture: 'https://me.png',
};

export type TestContext = {
  currentUser?: UserSessionType | null;
  status?: AuthStatusType;
  match?: MatchType;
  opponentUser?: UserSessionType | null;
  isMatchPrivate?: boolean;
  route?: string;
  // English by default, so the texts in the tests are the English ones
  language?: Language;
};

export function buildAuth(context: TestContext = {}) {
  const currentUser =
    context.currentUser === undefined ? ME : context.currentUser;

  return {
    currentUser,
    status:
      context.status ?? (currentUser ? 'authenticated' : 'unauthenticated'),
    updatePresence: vi.fn(),
    signIn: vi.fn(() => Promise.resolve()),
    signOut: vi.fn(() => Promise.resolve()),
  } as const;
}

// Renders inside a router and the auth, language and multiplayer contexts
export function renderWithContext(ui: ReactElement, context: TestContext = {}) {
  const auth = buildAuth(context);
  const Wrapper = makeWrapper(context, auth);

  return { auth, ...render(ui, { wrapper: Wrapper }) };
}

export function renderHookWithContext<T, Props = undefined>(
  hook: (props: Props) => T,
  context: TestContext & { initialProps?: Props } = {}
) {
  const auth = buildAuth(context);

  return {
    auth,
    ...renderHook(hook, {
      wrapper: makeWrapper(context, auth),
      initialProps: context.initialProps,
    }),
  };
}

function makeWrapper(context: TestContext, auth: ReturnType<typeof buildAuth>) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={[context.route ?? '/']}>
        <AuthContext.Provider value={auth}>
          <TestI18n language={context.language ?? 'en-US'}>
            <MultiPlayerContext.Provider
              value={{
                match: context.match,
                opponentUser: context.opponentUser ?? null,
                isMatchPrivate: context.isMatchPrivate ?? false,
              }}
            >
              {children}
            </MultiPlayerContext.Provider>
          </TestI18n>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };
}
