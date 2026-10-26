// Every text the player reads, in English: the source language. pt.ts must
// have the same keys (the typecheck fails otherwise). Texts with a variable
// are functions.
export const en = {
  common: {
    backHome: '← Home',
    loading: 'Loading...',
  },
  nav: {
    greeting: (name: string) => `Hi ${name}!`,
    player: 'player',
    matches: 'Matches',
    myData: 'My data',
    privacy: 'Privacy',
    signOut: 'Sign out',
    signIn: 'Sign in',
  },
  home: {
    tagline: 'Too many bats, time to drop some.',
    playSingle: 'Play Single',
    playMulti: 'Play Multi',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  game: {
    kills: 'Kills',
    score: 'Score',
    accuracy: 'Accuracy',
    finalScore: 'Final Score',
    yourScore: 'Your Score',
    points: 'pts',
    getReady: 'Get Ready!',
    timesUp: "Time's Up!",
    start: 'Start',
    cancel: 'Cancel',
    controls: 'Controls',
    hide: 'Hide',
  },
  single: {
    gameMode: 'Game Mode',
    freePlayLabel: 'Free Play!',
    freePlay: 'Free Play',
    challenge: 'Challenge',
    reset: 'Reset',
    sendBats: 'Send Bats',
    close: 'Close',
    cleanBats: 'Clean Bats',
  },
  difficulty: {
    label: 'Difficulty',
    easy: 'Easy',
    hard: 'Hard',
    legend: 'Hard mode targets',
    hostPicks: 'Host picks',
  },
  batTypes: {
    normal: 'Bat',
    small: 'Small',
    golden: 'Golden',
    owl: 'Owl',
  },
  login: {
    title: 'Ready to hunt?',
    text: 'Sign in to challenge friends and keep your match history.',
  },
  signIn: {
    modalTitle: 'Come and play!',
    button: 'Continue with Google',
    busy: 'Signing in…',
    error: 'Ops! Something wrong happened. Try again.',
    // The notice has two links: the text around them, in order
    noticeStart: 'By signing in you accept the ',
    noticeTerms: 'Terms',
    noticeMiddle: (age: number) =>
      ` and confirm you are ${age} or older. See how we handle your data in the `,
    noticePrivacy: 'Privacy Policy',
    noticeEnd: '.',
  },
  notFound: {
    title: 'This page flew off into the night.',
    text: 'We searched every belfry and every attic. Something with wings took it.',
    takeMeHome: 'Take me home',
    releaseMore: 'Release more bats',
    shotTheOwl:
      'You shot the owl. It was the only one who knew the way back. 🦉',
    noKills: 'While you are here, why not drop a bat or two?',
    oneKill: '1 bat dropped. Still no page, though.',
    fewKills: (kills: number) =>
      `${kills} bats dropped. The page is still missing.`,
    manyKills: (kills: number) =>
      `${kills} bats! Are you even looking for that page?`,
    lotsOfKills: (kills: number) =>
      `${kills} bats. Forget the page, you found your calling.`,
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
