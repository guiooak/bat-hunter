import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

vi.mock('src/services/auth-service', () => ({
  observeAuth: (cb: (user: null) => void) => {
    cb(null);
    return () => {};
  },
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
}));
vi.mock('src/services/fly-engine-service', () => ({
  FLYING_BAT_IMG: 'bat.gif',
  createBat: vi.fn(),
}));

import { App } from './App';

describe('App', () => {
  beforeEach(() => window.history.pushState({}, '', '/'));

  it.each([
    ['/', 'Too many bats, time to drop some.'],
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Terms of Use'],
    ['/login', 'Ready to hunt?'],
    ['/what', 'This page flew off into the night.'],
  ])('routes %s', async (path, text) => {
    window.history.pushState({}, '', path);

    render(<App />);
    await act(async () => {});

    expect(screen.getAllByText(text)[0]).toBeInTheDocument();
    expect(screen.getByAltText('Bat Hunter')).toBeInTheDocument();
  });
});

describe('main', () => {
  it('renders the app into #root', async () => {
    const renderRoot = vi.fn();
    const listenToShots = vi.fn();
    vi.doMock('./services/shot-service', async (importOriginal) => ({
      ...(await importOriginal<object>()),
      listenToShots,
    }));
    vi.doMock('react-dom/client', () => ({
      createRoot: vi.fn(() => ({ render: renderRoot })),
    }));
    document.body.innerHTML = '<div id="root"></div>';

    await import('./main');

    const { createRoot } = await import('react-dom/client');
    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(listenToShots).toHaveBeenCalled();
    expect(renderRoot).toHaveBeenCalled();
  });
});
