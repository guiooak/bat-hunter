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
  multi: {
    you: 'Você',
    playAgain: 'Jogar de novo',
    gameClosed: 'Rodada encerrada',
    history: 'Histórico',
    waitingOpponent: 'Esperando um oponente entrar.',
    sameScore: 'Empate! 🤝',
    youWin: 'Você venceu! 🎉',
    youLose: 'Você perdeu! 💔',
    opponentScore: (name) => `Pontuação de ${name}`,
    historyTitle: 'Histórico de rodadas',
    winner: 'Vencedor',
    noWinner: 'N/D',
    noGames: 'Nenhuma rodada jogada ainda.',
    gameLine: (name, kills, accuracy, score) =>
      `${name}: ${kills} abates | ${accuracy}% de precisão | pontos: ${score}`,
    matchSetup: 'Preparar partida',
    shareInvite: 'Compartilhe o link do convite.',
    createGame: 'Criar partida',
    copied: 'Copiado!',
    copyInvite: 'Copiar link do convite',
  },
  presence: {
    online: 'online',
    away: 'ausente',
    offline: 'offline',
  },
  chat: {
    title: 'Chat',
    unread: 'Mensagens não lidas',
    placeholder: 'Enter para enviar, Shift+Enter para nova linha',
    placeholderDisabled: 'Crie ou entre numa partida para conversar',
    sendError: 'Mensagem não enviada. Aperte Enter para tentar de novo.',
    report: 'Denunciar',
    reportSubject: 'Bat Hunter: denúncia no chat',
    reportIntro: 'Quero denunciar esta mensagem do chat.',
    reportMatch: 'Partida',
    reportMessage: 'Mensagem',
    reportSentAt: 'Enviada em',
    reportText: 'Texto',
    reportWhy: 'Motivo (opcional):',
  },
  invitation: {
    missing: 'Este convite não existe (ou a partida foi removida).',
    private:
      'Esta partida já tem dois jogadores, e as rodadas e o chat são privados deles.',
    invited: (name) => `${name} te convidou para uma batalha. Bora jogar?`,
    backHome: 'Voltar ao início',
    nope: 'Agora não',
    join: 'Entrar na batalha',
    joinError: 'Ops! Não foi possível entrar nesta batalha. Tente de novo.',
  },
  matches: {
    loading: 'Carregando partidas...',
    title: 'Minhas partidas',
    empty: 'Nenhuma partida encontrada.',
    host: 'Anfitrião',
    guest: 'Convidado',
    createdAt: 'Criada em',
    open: 'Abrir',
  },
  account: {
    title: 'Meus dados',
    introStart:
      'O que o Bat Hunter guarda sobre você, uma cópia para levar com você e a porta de saída. Detalhes na ',
    introLink: 'Política de Privacidade',
    introEnd: '.',
    keepTitle: 'O que guardamos',
    accountId: 'ID da conta',
    keepProfile:
      'Seu primeiro nome e sua foto, vindos do Google. Para corrigi-los, altere-os na sua conta Google e entre de novo.',
    keepMatches: (matches, messages) =>
      `${matches} partidas com os placares, e ${messages} mensagens que você enviou no chat.`,
    keepPresence:
      'Sua presença (online ou ausente), só enquanto você joga multiplayer.',
    keepEmail:
      'Seu e-mail, guardado pelo serviço de login do Google (Firebase Authentication). O jogo nunca o lê.',
    keepBrowser: (preferences) => `Só neste navegador: ${preferences}.`,
    noPreferences: 'nenhuma preferência salva',
    preferenceNames: {
      'bh-background-music-muted': 'música de fundo desligada',
      'bh-difficulty': 'dificuldade',
      'bh-language': 'idioma',
    },
    downloadTitle: 'Baixar uma cópia',
    downloadText:
      'Um arquivo JSON com sua conta, suas partidas (seus próprios placares) e suas mensagens.',
    download: 'Baixar meus dados',
    downloadBusy: 'Preparando…',
    downloadError: 'O download falhou. Tente de novo daqui a pouco.',
    deleteTitle: 'Excluir minha conta',
    deleteText:
      'Apaga seu perfil, sua lista de partidas, suas mensagens no chat e seu login. Seus oponentes mantêm os próprios placares, e você aparece como jogador removido. Não dá para desfazer.',
    deleteWarning:
      'O Google vai pedir para você confirmar que é você. Depois, tudo é apagado.',
    deleteButton: 'Excluir minha conta',
    keepAccount: 'Manter minha conta',
    deleteConfirm: 'Sim, excluir tudo',
    deleteBusy: 'Excluindo…',
    deleteError: (contact) =>
      `A conta não foi excluída. Tente de novo ou escreva para ${contact}.`,
    contact: (contact) =>
      `Qualquer outra questão sobre seus dados: ${contact}.`,
  },
  player: {
    removed: 'Jogador removido',
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
