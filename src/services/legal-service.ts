import retentionDays from './retention-days.json';

// Who answers for the players' data (LGPD controller) and how to reach them.
// Shown in the privacy policy, the terms and the My data page.
export const CONTROLLER_NAME = 'Guilherme Carvalho';
export const PRIVACY_CONTACT = 'game.bat.hunter@gmail.com';
export const LEGAL_UPDATED_AT = '2026-10-26';
export const MIN_MULTIPLAYER_AGE = 13;

// Retention, in days: one file shared with the cleanup job
// (scripts/retention.mjs), so the policy and the job cannot drift apart.
export const RETENTION_DAYS = retentionDays;

export function mailtoPrivacy(subject: string, body = '') {
  const query = new URLSearchParams({ subject, body }).toString();
  return `mailto:${PRIVACY_CONTACT}?${query.replace(/\+/g, '%20')}`;
}
