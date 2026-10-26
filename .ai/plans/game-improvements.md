# Bat Hunter: dificuldades e tipos de morcego

## Status (17/10/2026)

**Concluído** (`9f987fd`): Fácil/Difícil, morcego pequeno, dourado e coruja, pontos e regras do banco. Depois do plano: o seletor virou um controle segmentado (`0e7d7a9`), some durante a partida junto com o chat (`9fcbebd`), e os morcegos passaram a surgir sozinhos durante a partida, sem o botão "Add bats" (`3a86840`). A semente compartilhada de morcegos (seção "Fora do escopo") continua não implementada.

## Contexto
Este plano cria a **dificuldade Fácil/Difícil**. Os novos tipos de morcego aparecem só no Difícil:
- **pequeno e rápido**, que vale mais;
- **dourado e raro**, que dá bônus;
- **coruja inocente**, que tira pontos.

Decisões do usuário:
- a dificuldade vale também no **multiplayer**: o host escolhe e ela vale para os dois;
- acertar a coruja **tira pontos** e o tiro conta como erro na precisão.

Depende do [plano de compatibilidade mobile](mobile-compatibility.md), que vem antes. Os morcegos novos usam a entrada `pointerdown` criada lá.

---

## 1. Modelo
Novo arquivo `src/services/bat-types.ts` com a config de cada tipo. Os valores são o ponto de partida e podem ser ajustados:

| Tipo | Pontos | Tamanho | Velocidade | Chance no Difícil |
|---|---|---|---|---|
| `normal` | +1 | 1× | 1× | 60% |
| `small` (pequeno e rápido) | +3 | 0,6× | 1,8× | 25% |
| `golden` (dourado e raro) | +10 | 1× | 1,4×, foge após ~6 s | 5% |
| `owl` (inocente) | −5 | 1,1× | 0,8× | 10% |

- `type Difficulty = 'easy' | 'hard'`. No Fácil, todo morcego é `normal`, ou seja, o jogo de hoje.
- `pickBatType(difficulty)` sorteia pelo peso.

## 2. Motor (`fly-engine-service.ts`)
- `createBat(killCallback)` passa a ser `createBat({ type, onHit })`:
  - o tamanho vem da largura da imagem;
  - a velocidade divide o `timeout` do passo atual;
  - a classe `flying-bat--{type}` é adicionada;
  - o `golden` sai da tela depois de alguns segundos.
- **Sprites:**
  - o `golden` é o GIF atual com filtro CSS dourado (`sepia` + `saturate` + `hue-rotate`, `drop-shadow` brilhante);
  - o `small` é o mesmo GIF, só menor;
  - a `owl` é uma silhueta nova em SVG, desenhada em `brand/tools/` no mesmo traço da marca, com bater de asas via CSS.
- Ao acertar, `onHit(type)` é chamado. Aparece um texto flutuante no ponto (`+3`, `+10`, `−5`, nas cores da marca) e o som toca. A coruja tem um som próprio, ou o atual mais grave.
- `killAllBats()` continua igual, porque os novos tipos também usam a classe `.flying-bat`.

## 3. Pontuação
- Novo contador **`points`**, ao lado de `shotCounter` e `killCounter`. Fica nos reducers de `single-player-dashboard.tsx` e `multi-player-game-dashboard.tsx`, e em `PlayerDataType` (`src/models/game-model.ts`).
- `killCounter` = acertos válidos, sem contar a coruja. Acertar a coruja soma o tiro, não soma kill e aplica −5 em `points`.
- Fórmula em `game-service.ts`: `calcFinalScore(shots, kills, points)` = `points × accuracy%`.
  - Se `points` não existir (partidas antigas), usa `kills`.
  - No Fácil, `points == kills`, então o placar continua igual ao de hoje.
- Usar a nova fórmula em todos os lugares que calculam placar: os placares, `getWinnerId`, o modal de resultado e o modal de histórico.

## 4. Escolha da dificuldade
- **Single-player:** um seletor Fácil/Difícil (dois botões, um ativo) na seção "Game Mode" de `_single-player-dashboard-challenge.tsx`.
  - Vale para o Free Play e para o Challenge.
  - Fica bloqueado durante o desafio.
  - A preferência fica salva no localStorage. Para isso, uma chave nova em `local-storage-service.ts`: `bh-difficulty`.
- **Multiplayer:**
  - o host escolhe no estado `GAME_READY`, no `_multi-player-game-dashboard-controller.tsx`;
  - a escolha fica gravada em `game.difficulty`, via `setGameInFirebase`;
  - o convidado vê o seletor só como leitura;
  - os dois lados geram os morcegos com essa dificuldade.
- **Regras** (`database.rules.json`):
  - validar `games/$gameId/difficulty` como `'easy'` ou `'hard'`, gravável só pelo host;
  - validar `hostData/points` e `guestData/points` como número entre −9999 e 9999.
- **Legenda:** ao escolher Difícil, uma linha curta com os tipos e os pontos (ícone + valor).

## 5. Fora do escopo (anotado)
Cada jogador continua sorteando morcegos próprios no multiplayer. No Difícil, isso deixa a sorte pesar mais. Usar uma semente compartilhada (o id do jogo) para os dois lados verem os mesmos morcegos é o próximo passo recomendado, mas não entra aqui.

## 6. Verificação
- Lint, typecheck e build.
- **Single-player Difícil:**
  - os quatro tipos aparecem nas proporções esperadas;
  - os pontos flutuam no acerto;
  - a coruja tira 5 pontos e conta como erro na precisão.
- **Single-player Fácil:** o placar fica idêntico ao de hoje.
- **Multiplayer**, em duas janelas com contas diferentes:
  - o host escolhe Difícil e o convidado vê a escolha;
  - o placar ao vivo e o vencedor usam `points`;
  - as regras aceitam as gravações.
- **Partidas antigas** no histórico continuam com o placar certo, usando `kills` quando não há `points`.

## Entrega
Implementar tudo → commit e push.
