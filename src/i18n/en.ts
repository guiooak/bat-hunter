// Every text the player reads, in English: the source language. pt.ts must
// have the same keys (the typecheck fails otherwise). Texts with a variable
// are functions.
export const en = {
  common: {
    backHome: '← Home',
  },
  languagePicker: {
    label: 'Language',
  },
  legal: {
    updated: 'Last updated',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
  },
} as const;
