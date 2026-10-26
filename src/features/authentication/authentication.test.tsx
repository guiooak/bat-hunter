import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from 'src/test/render';
import type { UserSessionType } from 'src/services/auth-service';

const authService = vi.hoisted(() => ({
  listener: null as null | ((user: UserSessionType | null) => void),
  observeAuth: vi.fn(),
  signInWithGoogle: vi.fn(() => Promise.resolve()),
  signOutUser: vi.fn(() => Promise.resolve()),
}));
vi.mock('src/services/auth-service', () => authService);

const userModel = vi.hoisted(() => ({
  setPrivateUserInFirebase: vi.fn(() => Promise.resolve()),
  setPublicProfileInFirebase: vi.fn(() => Promise.resolve()),
}));
vi.mock('src/models/user-model', () => userModel);

import {
  AuthContextProvider,
  useAuthContext,
} from 'src/features/authentication';
import { AuthContext } from './auth-context/_auth-context-definition';
import { Pulse } from './pulse';
import { SignInButton } from './sign-in-button';

beforeEach(() => {
  vi.clearAllMocks();
  authService.observeAuth.mockImplementation((cb) => {
    authService.listener = cb;
    return () => {};
  });
});

function Probe() {
  const { currentUser, status, updatePresence } = useAuthContext();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="name">{currentUser?.firstName}</span>
      <button onClick={() => updatePresence({ away: true })}>away</button>
    </div>
  );
}

describe('AuthContextProvider', () => {
  it('starts loading, then stores the minimal profile of the signed-in user', async () => {
    render(
      <AuthContextProvider>
        <Probe />
      </AuthContextProvider>
    );
    expect(screen.getByTestId('status')).toHaveTextContent('loading');

    act(() =>
      authService.listener!({
        id: 'u1',
        name: 'Ana Silva',
        firstName: 'Ana',
        lastName: 'Silva',
        picture: 'p',
      })
    );

    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('name')).toHaveTextContent('Ana');
    expect(userModel.setPrivateUserInFirebase).toHaveBeenCalledWith({
      id: 'u1',
      firstName: 'Ana',
      picture: 'p',
    });
    expect(userModel.setPublicProfileInFirebase).toHaveBeenCalledWith('u1', {
      firstName: 'Ana',
      picture: 'p',
    });

    await userEvent.click(screen.getByRole('button', { name: 'away' }));
    expect(userModel.setPublicProfileInFirebase).toHaveBeenLastCalledWith(
      'u1',
      {
        away: true,
      }
    );
  });

  it('stores empty strings for missing name or photo, and logs failures', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    userModel.setPrivateUserInFirebase.mockRejectedValueOnce(new Error('x'));
    render(
      <AuthContextProvider>
        <Probe />
      </AuthContextProvider>
    );

    await act(async () => authService.listener!({ id: 'u2' }));

    expect(userModel.setPrivateUserInFirebase).toHaveBeenCalledWith({
      id: 'u2',
      firstName: '',
      picture: '',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'AuthContextProvider::ERROR: user not saved',
      expect.any(Error)
    );
  });

  it('is unauthenticated without a user, and presence is a no-op', async () => {
    render(
      <AuthContextProvider>
        <Probe />
      </AuthContextProvider>
    );

    act(() => authService.listener!(null));
    await userEvent.click(screen.getByRole('button', { name: 'away' }));

    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(userModel.setPublicProfileInFirebase).not.toHaveBeenCalled();
  });
});

describe('auth context defaults', () => {
  it('has harmless defaults outside the provider', async () => {
    const { result } = renderHook(() => React.useContext(AuthContext));

    expect(result.current.currentUser).toBeNull();
    expect(result.current.status).toBe('loading');
    result.current.updatePresence({ away: true });
    await result.current.signIn();
    await result.current.signOut();
  });
});

describe('Pulse', () => {
  beforeEach(() => vi.useFakeTimers({ now: 100_000 }));
  afterEach(() => vi.useRealTimers());

  it('publishes presence while mounted, at most every 20 seconds', () => {
    const { auth, unmount } = renderWithContext(<Pulse />);
    const presence = auth.updatePresence;

    expect(presence).toHaveBeenLastCalledWith({
      away: false,
      lastPulseAt: 100_000,
    });

    fireEvent.mouseOver(window);
    expect(presence).toHaveBeenCalledTimes(1);

    vi.setSystemTime(100_000 + 20_001);
    fireEvent.pointerDown(window);
    expect(presence).toHaveBeenLastCalledWith({
      lastPulseAt: 120_001,
      away: false,
    });

    fireEvent.blur(window);
    expect(presence).toHaveBeenLastCalledWith({ away: true });

    vi.setSystemTime(130_000);
    fireEvent.focus(window);
    expect(presence).toHaveBeenLastCalledWith({
      away: false,
      lastPulseAt: 130_000,
    });

    unmount();
    expect(presence).toHaveBeenLastCalledWith({ away: true });
  });

  it('does nothing while signed out', () => {
    const { auth } = renderWithContext(<Pulse />, { currentUser: null });

    fireEvent.blur(window);

    expect(auth.updatePresence).not.toHaveBeenCalled();
  });
});

describe('SignInButton', () => {
  it('signs in and calls back', async () => {
    const onSuccess = vi.fn();
    const { auth } = renderWithContext(<SignInButton onSuccess={onSuccess} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' })
    );

    expect(auth.signIn).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows the terms, age and privacy notice', () => {
    renderWithContext(<SignInButton />);

    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/terms'
    );
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' })
    ).toHaveAttribute('href', '/privacy');
    expect(screen.getByText(/13 or older/)).toBeInTheDocument();
  });

  it('shows an error when the sign-in fails, and works without onSuccess', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { auth } = renderWithContext(<SignInButton />);
    auth.signIn.mockRejectedValueOnce(new Error('closed'));

    await userEvent.click(screen.getByRole('button'));
    expect(
      screen.getByText('Ops! Something wrong happened. Try again.')
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(/Ops!/)).toBeNull();
  });

  it('is busy while signing in', async () => {
    let finish!: () => void;
    const { auth } = renderWithContext(<SignInButton />);
    auth.signIn.mockReturnValueOnce(new Promise<void>((r) => (finish = r)));

    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();

    await act(async () => finish());
  });
});
