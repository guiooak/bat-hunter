# Teste de legítimo interesse: presença

Avaliação do art. 10 da LGPD para tratar a presença do jogador (online ou ausente e o horário da última atividade) sem consentimento. Atualizado em 23/10/2026.

## 1. Finalidade
Mostrar ao oponente, durante uma partida, se a outra pessoa está na tela. Sem isso, um jogador espera um oponente que já saiu.

## 2. Necessidade
- Só dois campos: `away` (sim/não) e `lastPulseAt` (horário).
- Publicados apenas nas páginas de multiplayer. Fora delas o jogo não registra nada.
- Nada de páginas visitadas, cliques, posição do mouse ou tempo de jogo: a atividade só atualiza o horário, no máximo a cada 20 segundos.
- Visíveis só para usuários logados, por quem conhece o UID; na prática, o oponente.

## 3. Balanceamento
- **Expectativa do titular:** num jogo online contra outra pessoa, saber se o oponente está presente é esperado.
- **Impacto:** baixo. Revela só se a pessoa está com o jogo aberto no multiplayer.
- **Transparência:** descrito na Política de Privacidade.
- **Oposição:** o jogador pode sair do multiplayer (a presença vira "ausente") ou excluir a conta. Pedidos de oposição pelo canal são atendidos.

## Conclusão
O legítimo interesse se sustenta, com as salvaguardas acima.
