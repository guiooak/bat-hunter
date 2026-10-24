# Plano de resposta a incidentes

Para vazamentos, acessos indevidos ou perda de dados pessoais (art. 48 da LGPD e Res. CD/ANPD nº 15/2024). Atualizado em 23/10/2026.

**Responsável:** Guilherme Carvalho (game.bat.hunter@gmail.com).

## 1. Detectar
Sinais: aviso do Google sobre a conta ou o projeto, leitura anormal no uso do Realtime Database (console do Firebase), relato de jogador no canal, segredo do CI exposto, regra do banco aberta por engano.

## 2. Conter (no mesmo dia)
- Regra aberta: reverter `database.rules.json` e fazer deploy (`firebase deploy --only database`).
- Chave da conta de serviço exposta: revogar a chave no IAM do projeto `bat-hunter-game`, criar outra e atualizar o segredo `FIREBASE_SERVICE_ACCOUNT_BAT_HUNTER_GAME`.
- Conta comprometida: trocar a senha e revisar quem tem acesso ao projeto Firebase.
- Guardar evidências: horário, o que foi exposto, logs.

## 3. Avaliar o risco
Quais dados, de quantas pessoas, por quanto tempo, se há menores, se o dado é sensível (o chat pode conter qualquer coisa). Registrar tudo, mesmo que se conclua que não há risco relevante.

## 4. Comunicar (se houver risco ou dano relevante)
- **ANPD:** em até 3 dias úteis do conhecimento do incidente, pelo formulário no site da ANPD.
- **Titulares afetados:** no mesmo prazo, em linguagem simples: o que aconteceu, quais dados, o que foi feito e o que a pessoa pode fazer. Como o jogo não usa e-mail, a comunicação vai por aviso no próprio jogo e, se necessário, pelo e-mail do Firebase Authentication.

## 5. Depois
Corrigir a causa, testar as regras de novo e anotar o incidente neste arquivo (data, resumo, medidas). Guardar o registro por pelo menos 5 anos.

## Registro de incidentes

### Campos antigos legíveis por outros jogadores (corrigido em 23/10/2026)
- **O que era:** perfis em `users/$uid` guardavam campos de uma versão antiga do login: e-mail (8 contas), ID token do Google e suas datas, nome completo e presença. Até 23/10/2026, as regras deixavam qualquer usuário logado ler `users/$uid` sabendo o UID, o que na prática alcançava oponentes e quem seguisse a cadeia de partidas.
- **Exposição:** só usuários logados com o UID exato; não há listagem de usuários. Sem indício de acesso indevido (o banco não guarda log de leituras). Os tokens já tinham expirado (o mais recente em 25/07/2026).
- **Medidas:** em 23/10/2026, `users/$uid` passou a ser legível só pelo dono; no mesmo dia, os campos foram apagados, ficando só `id`, primeiro nome e foto.
- **Avaliação:** a decisão sobre comunicar a ANPD e os titulares é do controlador. Os fatos acima indicam risco baixo: dados de contato de 8 pessoas, acessíveis só a quem já jogou com elas, e tokens expirados.
