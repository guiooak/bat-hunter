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
  multi: {
    you: 'You',
    playAgain: 'Play again',
    gameClosed: 'Game Closed',
    history: 'History',
    waitingOpponent: 'Waiting for an opponent to join.',
    sameScore: 'Same score! 🤝',
    youWin: 'You Win! 🎉',
    youLose: 'You lose! 💔',
    opponentScore: (name: string) => `${name}'s Score`,
    historyTitle: 'Games History',
    winner: 'Winner',
    noWinner: 'N/A',
    noGames: 'No games played yet.',
    gameLine: (name: string, kills: number, accuracy: number, score: number) =>
      `${name}: ${kills} kills | ${accuracy}% accuracy | score: ${score}`,
    matchSetup: 'Match Setup',
    shareInvite: 'Share the invitation link.',
    createGame: 'Create a Game',
    copied: 'Copied!',
    copyInvite: 'Copy invite link',
  },
  presence: {
    online: 'online',
    away: 'away',
    offline: 'offline',
  },
  chat: {
    title: 'Chat',
    unread: 'Unread messages',
    placeholder: 'Enter to send, Shift+Enter for a new line',
    placeholderDisabled: 'Create or join a match to chat',
    sendError: 'Message not sent. Press Enter to try again.',
    report: 'Report',
    // The report email to the privacy channel
    reportSubject: 'Bat Hunter: chat report',
    reportIntro: 'I want to report this chat message.',
    reportMatch: 'Match',
    reportMessage: 'Message',
    reportSentAt: 'Sent at',
    reportText: 'Text',
    reportWhy: 'Why (optional):',
  },
  invitation: {
    missing: 'This invitation does not exist (or the match was removed).',
    private:
      'This match already has two players, and its games and chat are private to them.',
    invited: (name: string) =>
      `You're invited to a battle with ${name}. Wanna join the game?`,
    backHome: 'Back home',
    nope: 'Nope',
    join: 'Join battle',
    joinError: 'Ops! It was not possible to join this battle. Try again.',
  },
  matches: {
    loading: 'Loading matches...',
    title: 'My Matches',
    empty: 'No matches found.',
    host: 'Host',
    guest: 'Guest',
    createdAt: 'Created At',
    open: 'Open',
  },
  account: {
    title: 'My data',
    // The intro links to the policy: the text around the link
    introStart:
      'What Bat Hunter keeps about you, a copy to take with you, and the way out. Details in the ',
    introLink: 'Privacy Policy',
    introEnd: '.',
    keepTitle: 'What we keep',
    accountId: 'Account ID',
    keepProfile:
      'Your first name and photo, from Google. To correct them, change them in your Google account and sign in again.',
    keepMatches: (matches: number | string, messages: number | string) =>
      `${matches} matches with their scores, and ${messages} chat messages you sent.`,
    keepPresence:
      'Your presence (online or away), only while you play multiplayer.',
    keepEmail:
      "Your email, kept by Google's sign-in service (Firebase Authentication). The game never reads it.",
    keepBrowser: (preferences: string) =>
      `In this browser only: ${preferences}.`,
    noPreferences: 'no saved preferences',
    preferenceNames: {
      'bh-background-music-muted': 'background music muted',
      'bh-difficulty': 'difficulty',
      'bh-language': 'language',
    },
    downloadTitle: 'Download a copy',
    downloadText:
      'A JSON file with your account, your matches (your own scores) and your messages.',
    download: 'Download my data',
    downloadBusy: 'Preparing…',
    downloadError: 'The download failed. Try again in a moment.',
    deleteTitle: 'Delete my account',
    deleteText:
      'Erases your profile, your match list, your chat messages and your sign-in. Your opponents keep their own scores, and you show up as a removed player. This cannot be undone.',
    deleteWarning:
      'Google will ask you to confirm it is you. Then everything is erased.',
    deleteButton: 'Delete my account',
    keepAccount: 'Keep my account',
    deleteConfirm: 'Yes, delete everything',
    deleteBusy: 'Deleting…',
    deleteError: (contact: string) =>
      `The account was not deleted. Try again, or write to ${contact}.`,
    contact: (contact: string) => `Anything else about your data: ${contact}.`,
  },
  player: {
    removed: 'Removed player',
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
