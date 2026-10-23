# Bat Hunter: conformidade com a LGPD

> Plano técnico e de produto, **não é parecer jurídico**. As decisões marcadas como "decisão" e os textos legais (política, termos) devem passar por revisão de alguém da área antes de publicar.

## Status (23/10/2026)

Decisões tomadas: contato **game.bat.hunter@gmail.com**, controlador Guilherme Carvalho, sem plano Blaze, os prazos de retenção sugeridos, multiplayer 13+ e o banco nos EUA com a transferência documentada.

| Fase | Situação |
|---|---|
| 1. Transparência e canal | Feita: `/privacy` e `/terms` em PT e EN, aviso no login, links na home e no menu |
| 2.1 Regras | Feita: nós privados, regras restritas, migração e aviso de partida privada |
| 2.2 Menos dados | Feita: o app grava só primeiro nome e foto, e os campos antigos foram apagados do banco em 24/10/2026, incluindo e-mail e tokens de uma versão antiga do login |
| 2.3 Fontes | Feita: app e manual da marca sem Google Fonts |
| 2.4 App Check | **Pendente:** exige configurar o reCAPTCHA Enterprise no console |
| 3. Direitos do titular | Feita: `/account` com ver, baixar e excluir |
| 4. Retenção | Feita: job diário às 06:17 UTC, apagando de verdade desde que `RETENTION_APPLY` passou a `true` |
| 5. Governança | Feita: [`docs/lgpd/`](../../docs/lgpd/README.md) |
| 6. Menores | Feita: 13+ nos termos e no login, botão de denúncia no chat |

**Ainda falta:**
- [x] Testar logado, com duas contas: convite, partida, chat, denúncia, "My Matches", exportar e excluir conta.
- [x] Apagar do banco os campos antigos de `users/$uid`.
- [x] Liberar a retenção (`RETENTION_APPLY=true`).
- [ ] Conferir os termos de tratamento de dados do Google Cloud (ver `docs/lgpd/transferencia-internacional.md`).
- [ ] App Check (2.4).
- [ ] Revisão jurídica da política e dos termos.

## Contexto

O Bat Hunter trata dados pessoais de quem entra com Google para jogar o multiplayer. O single-player e a home funcionam sem login e não guardam nada pessoal no servidor.

### Inventário dos dados

| Dado | Onde fica | Origem | Para quê | Quem lê hoje |
|---|---|---|---|---|
| UID, nome completo, primeiro e último nome, URL da foto | `users/$uid` (Realtime Database) | Conta Google | Mostrar o jogador e o oponente | **Qualquer usuário logado** |
| E-mail, provedor, datas de login | Firebase Authentication | Conta Google | Login (o app não usa o e-mail) | Só o projeto Firebase |
| Presença: `lastPulseAt`, `away` | `users/$uid` | Eventos de mouse, clique e foco da janela | Status online/away do oponente | **Qualquer usuário logado** |
| Lista de partidas com nomes e IDs de host e convidado | `users/$uid/matches` | Ao aceitar convite | Página "My Matches" | **Qualquer usuário logado** |
| Partidas, placares por jogo, vencedor | `matches/$matchId` | Durante o jogo | Placar ao vivo e histórico | **Qualquer usuário logado** que saiba o ID |
| Mensagens do chat (texto livre) | `matches/$matchId/messages` | Digitadas pelo jogador | Chat da partida | **Qualquer usuário logado** que saiba o ID |
| Preferências: música mutada, dificuldade | `localStorage` do navegador | O próprio jogador | Lembrar a escolha | Só o navegador |
| IP e user agent | Google Fonts, Firebase Hosting, Auth e Database | Cada requisição | Entregar fontes e o app | Google |

O Realtime Database está em `firebaseio.com` (região `us-central1`), então **há transferência internacional** para os EUA, assim como no Authentication e nas fontes do Google.

Não há analytics, cookies de terceiros nem publicidade. Isso ajuda: o escopo é pequeno.

### Lacunas encontradas

1. **Transparência (art. 9):** não existe política de privacidade, termos de uso nem aviso no login.
2. **Canal do titular (art. 41 e Res. CD/ANPD nº 2/2022):** não há contato para pedidos sobre dados. Mesmo dispensado de nomear encarregado como agente de pequeno porte, o controlador precisa oferecer um canal.
3. **Direitos do titular (art. 18):** não dá para ver, exportar, corrigir nem excluir os dados nem a conta.
4. **Minimização e segurança (arts. 6º, III e 46):**
   - as regras deixam qualquer usuário logado ler o perfil, a presença e a lista de partidas de outro;
   - qualquer usuário logado lê qualquer partida e o chat dela, bastando o ID;
   - o app guarda `lastName` e o nome completo, mas só exibe o primeiro nome na maior parte das telas.
5. **Retenção (art. 15 e 16):** partidas, mensagens e perfis ficam para sempre.
6. **Transferência internacional (art. 33 e Res. CD/ANPD nº 19/2024):** sem registro da base para a transferência para o Google nos EUA.
7. **Governança (art. 37 e 48):** não há registro das operações de tratamento nem plano para incidentes.
8. **Crianças e adolescentes (art. 14):** o jogo pode atrair menores e não diz nada sobre idade.

---

## Fase 1: transparência e canal (prioridade alta, baixo esforço)

### 1.1 Política de privacidade
- Página `/privacy`, em português e inglês, em `src/pages/privacy-page/`. O app é em inglês, mas o público é brasileiro.
- Conteúdo mínimo (art. 9):
  - quem é o controlador e o contato (**decisão:** nome e e-mail que aparecem);
  - quais dados, para quê e com que base legal (tabela abaixo);
  - com quem são compartilhados: o Google, como operador do Firebase, e o oponente, que vê nome, foto, presença, placar e chat;
  - transferência para os EUA e a salvaguarda usada (1.4);
  - por quanto tempo cada dado fica guardado (Fase 4);
  - os direitos do art. 18 e como pedir (Fase 3 e o canal);
  - o que fica no `localStorage` e por que não precisa de consentimento (é só preferência do jogador);
  - a política para menores (Fase 6);
  - a data da última atualização.

| Tratamento | Base legal sugerida |
|---|---|
| Conta, perfil, partidas, placar | Execução de contrato, art. 7º, V: é o serviço que o jogador pediu |
| Chat | Execução de contrato, art. 7º, V |
| Presença (online/away) | Legítimo interesse, art. 7º, IX, com teste de balanceamento (1.5) |
| Logs técnicos e segurança | Legítimo interesse, art. 7º, IX, e art. 46 |

### 1.2 Termos de uso
- Página `/terms`: regras de uso do chat (sem dados pessoais de terceiros, sem ofensas), idade mínima (Fase 6) e a possibilidade de remover conteúdo.

### 1.3 Avisos e links
- No `SignInModal`, abaixo do botão do Google: "Ao entrar, você concorda com os Termos e leu a Política de Privacidade", com os dois links. Não é consentimento (a base é contrato), é transparência.
- Links para `/privacy` e `/terms` na home, no menu do usuário (`DropdownPopover` da navbar) e no rodapé do README.
- Canal do titular: um e-mail dedicado, por exemplo `privacidade@…` (**decisão**), citado na política e na página de dados (Fase 3).

### 1.4 Transferência internacional
- Conferir se o Data Processing Addendum do Google Cloud/Firebase aceito no projeto `bat-hunter-game` cobre transferências a partir do Brasil e se já incorpora as cláusulas-padrão da Res. CD/ANPD nº 19/2024. Registrar o resultado em `docs/lgpd/`.
- Alternativa para reduzir a transferência: criar um novo Realtime Database em `southamerica-east1`, se disponível para RTDB, ou migrar para Firestore em São Paulo. O Authentication continua global, então isso só reduz a transferência, não a elimina. **Decisão:** vale o esforço?

### 1.5 Teste de legítimo interesse da presença
- Documento curto em `docs/lgpd/lia-presenca.md`: finalidade (saber se o oponente está na partida), necessidade (só `away` e `lastPulseAt`, nada de páginas visitadas) e expectativa do titular (é um jogo online, presença é esperada).
- Ajuste técnico que reforça o teste: só publicar presença nas páginas de multiplayer, e não no app inteiro como hoje (`Pulse` está montado no `App.tsx`).

---

## Fase 2: minimização e segurança (prioridade alta)

### 2.1 Regras do banco (`database.rules.json`)

**Situação verificada em 23/10/2026**, com chamadas diretas à API:
- sem login, tudo é negado: a raiz, `users`, `matches`, um usuário e uma partida;
- logado (qualquer pessoa com conta Google), não dá para listar `users` nem `matches`, e os IDs não são adivinháveis. O vazamento vem de um registro levar ao outro:
  1. quem jogou com alguém tem o UID dessa pessoa;
  2. em `users/<uid>`, lê a lista de partidas dela, com os IDs e os nomes dos oponentes;
  3. com esses IDs, lê cada partida, inclusive o chat dela com terceiros;
  4. cada partida traz novos UIDs, e o ciclo continua.
- Com um script, uma única partida é o ponto de partida para varrer todo o grupo de jogadores ligado a ela. Um link de convite que vaze também expõe aquela partida a qualquer pessoa logada.

**Mudanças:**
- **Perfil:** separar o que o oponente precisa ver do que é privado.
  - `publicProfiles/$uid`: `firstName`, `picture`, `away`, `lastPulseAt`. Leitura só para quem está logado.
  - `users/$uid`: o resto, com leitura só pelo próprio usuário (`auth.uid === $uid`).
- **Lista de partidas:** mover `users/$uid/matches` para `userMatches/$uid`, com leitura só pelo dono. Hoje, como a leitura de `users/$uid` vale para todos os filhos, qualquer um vê com quem a pessoa jogou.
- **Partidas:** restringir a leitura de `matches/$matchId` ao host e ao convidado. Para a página de convite, que precisa ler antes de entrar, liberar só `hostId` e a existência de `guestId`, num nó `invitations/$matchId` sem chat e sem placar.
- **Migração:** copiar as listas existentes de `users/$uid/matches` para `userMatches/$uid` e criar `publicProfiles` e `invitations` a partir dos dados atuais. A cópia é feita com a conta de serviço, antes do deploy das regras novas, e os nós antigos só são apagados depois do deploy. Sem isso, "My Matches" aparece vazia para quem já jogou.
- **Partida privada:** quem não participa e abre o link de uma partida que já tem dois jogadores vê a mensagem "This match is private", no lugar de um painel quebrado por permissão negada.
- Testar as regras no emulador (precisa de Java) com casos de leitura negada para terceiros.

**O que muda para quem joga sem trapacear:** quase nada. O jogo, o placar ao vivo, o chat, o histórico e os convites continuam iguais. As únicas diferenças visíveis:
- o card do oponente e o convite mostram só o primeiro nome, já que o perfil visível para os outros fica com primeiro nome, foto e status;
- abrir o link de uma partida entre outras duas pessoas mostra "This match is private";
- antes de aceitar, quem recebe um convite vê só quem convidou, e não o chat nem os placares;
- "My Matches" continua com o histórico, desde que a migração rode junto com a mudança.

### 2.2 Menos dados guardados
- Parar de gravar `lastName` e o nome completo no banco. Gravar só `firstName` (exibição) e `picture`. Nas listas de partidas, usar `firstName`.
- Migração única para apagar `lastName` e `name` dos perfis existentes, rodada com a conta de serviço.

### 2.3 Fontes
- Servir Barlow e Chakra Petch do próprio Hosting (`public/fonts/`) em vez do Google Fonts. Isso tira o envio de IP para o Google em toda visita, inclusive de quem nunca faz login.
- O mesmo vale para o manual da marca (`brand/index.html`).

### 2.4 App Check (opcional)
- Ativar o Firebase App Check com reCAPTCHA Enterprise no app e exigi-lo no Realtime Database e no Authentication. Chamadas de scripts fora do site passam a ser recusadas, mesmo com um login válido.
- É invisível para o jogador. No desenvolvimento local, é preciso registrar um token de debug no console do Firebase.
- Não impede trapaça: quem roda o próprio site ainda consegue mandar placares falsos. **Risco aceito:** o placar continua sendo gravado pelo próprio jogador, e a trapaça fica fora do escopo deste plano.

---

## Fase 3: direitos do titular (prioridade alta)

### 3.1 Página "My data" (`/account`)
- Acesso pelo menu do usuário.
- Mostra o que está guardado: perfil, número de partidas e mensagens, e as preferências locais.
- **Exportar:** botão que gera um JSON com o perfil, as partidas e as mensagens do próprio usuário (portabilidade, art. 18, V).
- **Corrigir:** o nome vem do Google; explicar que a correção é feita na conta Google e é sincronizada no próximo login.
- **Excluir conta** (art. 18, VI), com confirmação:
  1. apagar `users/$uid`, `publicProfiles/$uid` e `userMatches/$uid`;
  2. nas partidas de que participou, apagar as próprias mensagens e trocar o próprio ID por um marcador anônimo (`deleted-user`), mantendo o placar do oponente;
  3. limpar as preferências do `localStorage`;
  4. excluir o usuário do Firebase Authentication (`deleteUser`, que pode pedir login recente).
- Os passos 1 e 2 mexem em dados que outra pessoa também usa, e as regras atuais não deixam o convidado escrever no nó do jogo. Há dois caminhos (**decisão**):
  - **Cloud Function** `deleteAccount`, chamada pelo app, que faz tudo com privilégio de administrador. É mais simples e segura, mas exige o plano Blaze (pago por uso, gratuito nesse volume);
  - **Só regras e cliente:** criar regras específicas que deixem cada participante anonimizar o que é seu. Não tem custo, mas é mais frágil.

### 3.2 Pedidos pelo canal
- Para o que a página não cobre (informação sobre compartilhamento, revisão etc.), responder pelo e-mail em até 15 dias (art. 19, II), com um modelo de resposta em `docs/lgpd/`.

---

## Fase 4: retenção (prioridade média)

**Decisão:** confirmar os prazos. Sugestão:

| Dado | Prazo sugerido |
|---|---|
| Mensagens de chat | 90 dias após a última mensagem da partida |
| Partidas e placares | 12 meses após a criação |
| Perfil de conta sem login | 24 meses sem acesso; avisar antes, se houver e-mail de contato |
| Preferências locais | Enquanto o jogador não limpar o navegador |

- Implementação: uma Cloud Function agendada por dia (plano Blaze) apaga o que passou do prazo. Sem o Blaze, é preciso um script manual com a conta de serviço, rodado por um workflow agendado do GitHub Actions, que já tem o segredo da conta de serviço.
- Gravar `lastLoginAt` no perfil para medir a inatividade.

---

## Fase 5: governança (prioridade média)

Pasta `docs/lgpd/`, versionada no repositório:
- `registro-de-tratamento.md`: o registro das operações (art. 37), no formato simplificado para agente de pequeno porte, a partir do inventário acima;
- `lia-presenca.md`: o teste de legítimo interesse (1.5);
- `transferencia-internacional.md`: a salvaguarda usada com o Google (1.4);
- `plano-de-incidentes.md`: como detectar, conter, avaliar o risco e comunicar. Se houver risco ou dano relevante, a ANPD e os titulares precisam ser avisados em até 3 dias úteis (Res. CD/ANPD nº 15/2024). Inclui quem decide e os contatos;
- revisão anual: um lembrete para conferir o inventário quando entrar uma funcionalidade que trate dado novo (por exemplo, analytics).

Segurança mínima a registrar e manter:
- permissões da conta de serviço do CI só no necessário (o deploy e as regras);
- revisão de quem tem acesso ao projeto Firebase;
- as regras do banco testadas a cada mudança, idealmente no CI quando houver Java no runner.

---

## Fase 6: crianças e adolescentes (prioridade média)

- O login com Google exige idade mínima, mas isso não basta como política.
- **Decisão:**
  - **Opção A, 13+ (mais simples):** os termos e a política dizem que o multiplayer é para maiores de 13 anos e que contas de menores serão removidas ao serem identificadas. O single-player, que não trata dados pessoais, continua aberto a todos;
  - **Opção B, aceitar menores de 12:** exige consentimento específico de um dos pais (art. 14, §1º), com verificação. É bem mais complexo e não se justifica para um jogo sem fins comerciais.
- Em qualquer opção, aplicar o melhor interesse do menor (art. 14, caput): chat sem links clicáveis e o mínimo de dados exposto ao oponente, o que a Fase 2 já resolve.
- Moderação do chat: um botão "denunciar" que envia a mensagem para o canal do titular.

---

## Decisões necessárias

1. Nome do controlador e e-mail de contato que aparecem na política.
2. Plano Blaze, sim ou não: define como exclusão de conta e retenção são feitas.
3. Prazos de retenção (Fase 4).
4. Idade mínima (Fase 6).
5. Migrar o banco para São Paulo ou só documentar a transferência (1.4).

## Ordem sugerida

1. **Fase 2.1 e 2.3** (regras com migração, e fontes): fecham a maior exposição atual sem depender de nenhuma decisão. A 2.4 (App Check) pode vir junto ou logo depois.
2. **Fase 1** (política, termos, avisos e canal), assim que as decisões 1 e 4 estiverem tomadas.
3. **Fase 3** (página de dados e exclusão), depois da decisão 2.
4. **Fase 2.2, 4 e 5** (minimização dos campos, retenção e governança).
5. **Fase 6**, junto com os termos.

Cada fase vira um ou mais commits na `main`, como nos outros planos.

## Verificação

- **Regras:** testes no emulador mostrando que um terceiro logado não lê perfil privado, lista de partidas, partida nem chat de outras pessoas, e que os participantes continuam jogando normalmente.
- **Migração:** depois do deploy, "My Matches" de uma conta antiga mostra as mesmas partidas de antes.
- **Na prática:** repetir as chamadas diretas à API feitas em 23/10/2026, agora com o token de um usuário logado que não participa da partida, e confirmar "Permission denied" em `users/<outro uid>/…`, `userMatches/<outro uid>` e `matches/<partida dos outros>`.
- **Exclusão:** criar uma conta de teste no emulador, jogar uma partida com chat, excluir a conta e conferir:
  - nada com o UID no banco;
  - as mensagens apagadas;
  - o placar do oponente mantido;
  - o usuário removido do Authentication.
- **Exportação:** o JSON baixado contém tudo o que o inventário lista para aquele usuário, e nada de outra pessoa.
- **Fontes:** a aba Network não mostra mais requisições para `fonts.googleapis.com` nem `fonts.gstatic.com`.
- **Transparência:** os links de privacidade e termos aparecem na home, no login e no menu, no desktop e no celular.
