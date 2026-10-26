# Registro das operações de tratamento

Formato simplificado para agente de tratamento de pequeno porte (Res. CD/ANPD nº 2/2022). Atualizado em 26/10/2026.

- **Controlador:** Guilherme Carvalho, responsável pelo Bat Hunter (https://bat-hunter-game.web.app).
- **Canal do titular:** game.bat.hunter@gmail.com.
- **Operador:** Google LLC, pelo Firebase (Authentication, Realtime Database e Hosting), projeto `bat-hunter-game`.
- **Titulares:** jogadores com 13 anos ou mais que entram com Google para jogar o multiplayer. O single-player não trata dados pessoais.

| Operação | Dados | Finalidade | Base legal | Onde | Quem acessa | Retenção |
|---|---|---|---|---|---|---|
| Login | UID, e-mail, provedor, datas de login | Autenticar | Execução de contrato (art. 7º, V) | Firebase Authentication | Só o controlador | Até a exclusão da conta ou 24 meses sem login |
| Perfil privado | UID, primeiro nome, foto, idioma escolhido | Identificar o jogador e abrir o jogo no idioma dele em qualquer aparelho | Execução de contrato | `users/$uid` | O próprio jogador | Idem |
| Perfil público | Primeiro nome, foto, presença | Mostrar o jogador ao oponente | Execução de contrato; presença por legítimo interesse (art. 7º, IX) | `publicProfiles/$uid` | Usuários logados | Idem |
| Lista de partidas | IDs e primeiros nomes de host e convidado | Página de partidas | Execução de contrato | `userMatches/$uid` | O próprio jogador | 12 meses após a partida |
| Partidas e placares | Tiros, acertos, pontos, vencedor, dificuldade | Jogo, placar e histórico | Execução de contrato | `matches/$id` | Os dois jogadores | 12 meses (7 dias se o convite não for aceito) |
| Convites | ID do host e do convidado | Aceitar o convite | Execução de contrato | `invitations/$id` | Usuários logados | Com a partida |
| Chat | Texto, autor, horário | Conversa na partida | Execução de contrato | `matches/$id/messages` | Os dois jogadores | 90 dias |
| Preferências | Música, dificuldade, idioma | Lembrar escolhas | Necessário ao funcionamento | `localStorage` do navegador | Só o navegador | Até o jogador limpar |
| Dados técnicos | IP, user agent | Entregar o site, segurança | Legítimo interesse | Google (Hosting, Auth, Database) | Google | Conforme o Google |

**Medidas de segurança:** regras do Realtime Database com acesso mínimo (cada um lê o que é seu e as partidas de que participa), HTTPS, conta de serviço do CI com papéis restritos, fontes servidas pelo próprio site, sem analytics nem terceiros além do Google.

**Retenção automática:** `scripts/retention.mjs`, diário pelo GitHub Actions (`.github/workflows/retention.yml`).

**Direitos do titular:** página `/account` (ver, exportar e excluir) e o canal por e-mail.
