# Decisões (17/10 a 26/10/2026)

Registro das decisões tomadas durante a sessão de trabalho de 17/10 a 26/10/2026: o que foi decidido, por quem e por quê. O que foi feito, commit a commit, está em [plans/README.md](plans/README.md). Os detalhes de cada assunto estão nos planos.

Legenda: **(usuário)** decisão do responsável pelo projeto; **(agente)** decisão técnica do agente, aceita ou não contestada; **(agente, padrão)** escolha do agente por falta de resposta, deixada explícita para revisão.

## Processo

- **Um commit por mudança, com push direto na `main`** (usuário). Cada push passa pelo CI e faz deploy. Commits pequenos facilitam reverter e entender o histórico.
- **Planos e histórico versionados em `.ai/`** (usuário), para o repositório guardar o porquê das mudanças, não só o código.
- **Testes no navegador sempre sem som** (usuário, depois de reclamar do som do jogo durante os testes). A música fica mutada pelo `localStorage` e os efeitos sonoros são silenciados antes de qualquer interação.
- **Arquivos locais soltos não vão para o repositório** (agente). Dois chegaram a ser commitados por engano com `git add` numa pasta inteira; foram retirados e, a pedido do usuário, movidos para a Lixeira (não apagados de vez, porque nunca estiveram no git).

## Produto

- **Celular primeiro, depois a melhoria do jogo** (usuário). O plano original foi dividido em dois para entregar o toque e o layout antes das dificuldades.
- **Dificuldade Fácil/Difícil; morcegos novos só no Difícil; a coruja tira pontos e conta como erro; o host escolhe a dificuldade no multiplayer** (usuário).
- **Seletor de dificuldade como controle segmentado**, com a seleção discreta e o amarelo reservado ao "Start" (usuário, a partir de sugestão do agente).
- **Durante a partida: sem seletor, sem chat e sem "Add bats"; os morcegos surgem sozinhos** (usuário). População de 30, reposta em até 3 por segundo (agente).
- **Start e History desabilitados até um oponente entrar; histórico começando em 0 x 0** (usuário).
- **Cartão de link (Open Graph) em 1200×630, sem a frase do jogo** (usuário pediu tirar a frase; o tamanho foi mantido por recomendação do agente, por ser o padrão das redes).
- **Guia de estilo no mesmo repositório do app** (usuário). A mudança para um repositório separado foi revertida no mesmo dia; o repositório extra foi excluído.
- **404 em que dá para atirar nos morcegos**, sem música (agente, a partir do pedido de uma 404 divertida).

## LGPD e dados

- **Contato de privacidade: game.bat.hunter@gmail.com** (usuário).
- **Controlador Guilherme Carvalho; sem plano Blaze; retenção de 90 dias (chat), 12 meses (partidas), 7 dias (convites não aceitos) e 24 meses (contas sem login); multiplayer a partir de 13 anos; banco nos EUA com a transferência apenas documentada** (agente, padrão). O usuário respondeu só o e-mail; o restante seguiu as recomendações do plano e pode ser revisto.
- **Partidas, chat e listas legíveis só pelos dois jogadores; perfil público só com primeiro nome, foto e presença; presença só nas páginas de multiplayer** (agente, a partir do teste real de acesso à API, que mostrou que um ID levava aos dados de outras pessoas).
- **Migração em duas etapas: regras aditivas, cópia dos dados com backup, regras restritas e, só depois do teste logado do usuário, limpeza dos campos antigos** (agente). Ela incluiu e-mails e tokens de um login antigo, que estavam guardados sem uso.
- **Exposição anterior desses campos registrada no plano de incidentes, com a decisão de comunicar ou não a ANPD deixada ao controlador** (agente). Os fatos indicam risco baixo.
- **Retenção só apagando depois de confirmada (`RETENTION_APPLY`)** (agente), porque os prazos não tinham sido escolhidos pelo usuário. Depois o usuário liberou e pediu para aplicar tudo de uma vez (usuário).
- **App Check descartado** (agente). O reCAPTCHA mandaria sinais de todo visitante ao Google, um tratamento novo, para proteger só contra trapaça.
- **Trapaça (placar gravado pelo próprio jogador) aceita como risco** (usuário).
- **Fontes servidas pelo próprio site, sem Google Fonts** (agente), para não mandar o IP de todo visitante a terceiros.

## Dependências

- **Corrigir todos os alertas do Dependabot, um commit por correção** (usuário).
- **Ficar dentro da versão principal atual sempre que a correção existir nela** (agente), para evitar mudanças que quebram. Exceções necessárias: Vite 6 (a correção não existia na 5), Firebase 12 e firebase-admin 14 (para sair de dependências vulneráveis), ESLint 10 (a 9 saiu de suporte).
- **`@grpc/grpc-js` forçado na 1.14** (agente). O Firestore pedia a 1.9, mas o jogo não usa Firestore e o grpc não chega ao navegador.
- **Avisos de pacotes depreciados vindos das bibliotecas do Google aceitos** (agente). Já estão na versão mais nova e só afetam o desenvolvimento.

## Testes e refatorações

- **Refatorar só depois de todos os testes prontos, commitados e passando; cobrir 100% do código** (usuário).
- **Cobertura de 100% exigida no CI antes do deploy, nas quatro métricas** (agente, para manter a regra do usuário daqui em diante).
- **Testes contra um projeto Firebase falso (`demo-bat-hunter`)** (agente), para nunca depender do `.env.local` nem tocar o banco real.
- **Regras do banco testadas no emulador, num job de CI com Java 21** (agente). Não entram na cobertura, mas são o que garante a privacidade.
- **Código inalcançável é removido, não ignorado** (agente). Na fase de testes ele foi marcado com `v8 ignore`, porque refatorar ainda não era permitido, e removido na fase seguinte.
- **Bugs encontrados viram commits `fix` próprios, com teste de regressão, publicados na hora** (agente): o loop de escrita do host e a mira sumindo ao entrar rápido num jogo.
- **Mudanças de comportamento aceitas nas refatorações** (agente): "Join battle" só aparece quando dá para entrar; o convidado segue o estado do host; "My Matches" deslogado mostra o login em vez de um `alert`.
- **Regras do React Compiler ligadas no lint**, depois de corrigidas as 9 violações (agente).
- **Imports entre pastas sempre por `src/...`, sem o alias `@components`** (agente).
- **Fora do escopo, por custo maior que o ganho** (agente): reorganizar pastas por camada, textos legais em Markdown e logger central.

## Pendências

- Conferir no console do Google Cloud os termos de tratamento de dados (`docs/lgpd/transferencia-internacional.md`).
- Revisão jurídica da Política de Privacidade e dos Termos.
- Revisar as escolhas marcadas como **(agente, padrão)** na seção de LGPD, se for o caso.
