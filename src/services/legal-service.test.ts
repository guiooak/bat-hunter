import { describe, expect, it } from 'vitest';
import {
  mailtoPrivacy,
  PRIVACY_CONTACT,
  RETENTION_DAYS,
} from './legal-service';

describe('legal service', () => {
  it('builds a mailto to the privacy channel with encoded spaces', () => {
    const url = mailtoPrivacy('Chat report', 'line one\nline two');

    expect(url.startsWith(`mailto:${PRIVACY_CONTACT}?`)).toBe(true);
    expect(url).toContain('subject=Chat%20report');
    expect(url).toContain('body=line%20one%0Aline%20two');
    expect(url).not.toContain('+');
  });

  it('works without a body', () => {
    expect(mailtoPrivacy('Hi')).toContain('body=');
  });

  it('keeps the retention periods promised in the privacy policy', () => {
    expect(RETENTION_DAYS).toEqual({
      chatMessages: 90,
      matches: 365,
      inactiveAccounts: 730,
      unjoinedMatches: 7,
    });
  });
});
