const RELEASES = 'https://github.com/guiooak/bat-hunter/releases/tag/';
const RELEASE = /^\d+\.\d+\.\d+$/;

export type AppVersion = {
  // What Settings shows: v1.4.0, v1.4.0-pr.12, or dev
  label: string;
  // The GitHub Release of a released version; previews and dev have none
  href: string | null;
};

// The version CI stamped on this build (VITE_APP_VERSION, see
// scripts/release-version.mjs), for display. Local builds have none.
export function appVersion(
  raw: string | undefined = import.meta.env.VITE_APP_VERSION
): AppVersion {
  const version = raw?.trim();

  if (!version) return { label: 'dev', href: null };

  return {
    label: `v${version}`,
    href: RELEASE.test(version) ? `${RELEASES}v${version}` : null,
  };
}
