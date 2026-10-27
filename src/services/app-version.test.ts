import { afterEach, describe, expect, it, vi } from 'vitest';
import { appVersion } from './app-version';

afterEach(() => vi.unstubAllEnvs());

describe('appVersion', () => {
  it('links a released version to its GitHub Release', () => {
    expect(appVersion('1.4.0')).toEqual({
      label: 'v1.4.0',
      href: 'https://github.com/guiooak/bat-hunter/releases/tag/v1.4.0',
    });
  });

  it('shows a preview without a link', () => {
    expect(appVersion('1.4.0-pr.12')).toEqual({
      label: 'v1.4.0-pr.12',
      href: null,
    });
  });

  it.each([undefined, '', '  '])('is dev without a version (%j)', (raw) => {
    expect(appVersion(raw)).toEqual({ label: 'dev', href: null });
  });

  it('reads the version the build got', () => {
    vi.stubEnv('VITE_APP_VERSION', '2.0.1');

    expect(appVersion().label).toBe('v2.0.1');
  });
});
