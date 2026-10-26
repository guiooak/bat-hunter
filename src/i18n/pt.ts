import type { Messages } from './messages';

// Brazilian Portuguese: the same keys as en.ts
export const pt: Messages = {
  common: {
    backHome: '← Início',
    loading: 'Carregando...',
  },
  nav: {
    greeting: (name) => `Oi, ${name}!`,
    player: 'jogador',
    matches: 'Partidas',
    myData: 'Meus dados',
    privacy: 'Privacidade',
    signOut: 'Sair',
    signIn: 'Entrar',
  },
  home: {
    tagline: 'Morcego demais. Hora de derrubar alguns.',
    playSingle: 'Jogar solo',
    playMulti: 'Jogar online',
    privacy: 'Privacidade',
    terms: 'Termos',
  },
  game: {
    kills: 'Abates',
    score: 'Pontos',
    accuracy: 'Precisão',
    finalScore: 'Pontuação final',
    yourScore: 'Sua pontuação',
    points: 'pts',
    getReady: 'Prepare-se!',
    timesUp: 'Acabou o tempo!',
    start: 'Começar',
    cancel: 'Cancelar',
    controls: 'Controles',
    hide: 'Esconder',
  },
  single: {
    gameMode: 'Modo de jogo',
    freePlayLabel: 'Jogo livre!',
    freePlay: 'Jogo livre',
    challenge: 'Desafio',
    reset: 'Zerar',
    sendBats: 'Soltar morcegos',
    close: 'Fechar',
    cleanBats: 'Limpar morcegos',
  },
  difficulty: {
    label: 'Dificuldade',
    easy: 'Fácil',
    hard: 'Difícil',
    legend: 'Alvos do modo difícil',
    hostPicks: 'O anfitrião escolhe',
  },
  batTypes: {
    normal: 'Morcego',
    small: 'Pequeno',
    golden: 'Dourado',
    owl: 'Coruja',
  },
  login: {
    title: 'Pronto para caçar?',
    text: 'Entre para desafiar amigos e guardar seu histórico de partidas.',
  },
  signIn: {
    modalTitle: 'Vem jogar!',
    button: 'Continuar com o Google',
    busy: 'Entrando…',
    error: 'Ops! Algo deu errado. Tente de novo.',
    noticeStart: 'Ao entrar, você aceita os ',
    noticeTerms: 'Termos',
    noticeMiddle: (age) =>
      ` e confirma que tem ${age} anos ou mais. Veja como tratamos seus dados na `,
    noticePrivacy: 'Política de Privacidade',
    noticeEnd: '.',
  },
  notFound: {
    title: 'Esta página voou noite adentro.',
    text: 'Procuramos em cada campanário e em cada sótão. Alguma coisa com asas a levou.',
    takeMeHome: 'Voltar ao início',
    releaseMore: 'Soltar mais morcegos',
    shotTheOwl:
      'Você acertou a coruja. Ela era a única que sabia o caminho de volta. 🦉',
    noKills: 'Já que está aqui, que tal derrubar um ou dois morcegos?',
    oneKill: '1 morcego derrubado. Mas nada da página.',
    fewKills: (kills) =>
      `${kills} morcegos derrubados. A página continua sumida.`,
    manyKills: (kills) =>
      `${kills} morcegos! Você ainda está procurando a página?`,
    lotsOfKills: (kills) =>
      `${kills} morcegos. Esquece a página, você encontrou sua vocação.`,
  },
  languagePicker: {
    label: 'Idioma',
  },
  legal: {
    updated: 'Última atualização',
    privacyPolicy: 'Política de Privacidade',
    termsOfUse: 'Termos de Uso',
  },
};
