# Bat Hunter: compatibilidade mobile

## Status (17/10/2026)

**Concluído:** toque com pointer events (`eab3729`) e layout para telas pequenas (`bf14d13`). Ajustes depois: botões flutuantes acima do painel com altura medida (`072637c`) e fim da rolagem vertical com `100dvh` (`4f951bd`).

## Contexto
O jogo só funciona com mouse. O tiro, o acerto no morcego e o "flash" da mira usam `mousedown`. Os painéis têm posição fixa e largura de desktop, então cobrem a tela do celular. O objetivo é **jogar no celular**. Este plano vem antes do [plano de melhoria no jogo](game-improvements.md) e é publicado sozinho.

---

## 1. Entrada por toque
- Trocar `mousedown` por `pointerdown`, que cobre mouse, toque e caneta:
  - `src/services/fly-engine-service.ts`: `div.onmousedown` vira `div.onpointerdown`;
  - `src/services/shot-service.ts`: `document.onmousedown` vira `document.onpointerdown`;
  - `src/services/game-service.ts`: `setBodyOnClick` passa a usar `bodyEl.onpointerdown`;
  - ajustar o tipo `ShotEventType` se precisar.
- `isShotEnabled()` lê o `cursor` calculado do elemento tocado. No toque, o CSS de `cursor` continua aplicado, então a regra "contém aim" segue valendo, sem mudar a lógica de contagem.
- **Feedback de tiro no toque:** no celular não há cursor visível. Em `shot-service`, quando `pointerType !== 'mouse'`, criar por 150 ms um elemento `.touch-shot` na posição do toque, com `/images/cursor/aim-shot.png` (o anel de fogo), e removê-lo depois.
- CSS de jogo, em um novo `src/styles/_game.scss` ou no `App.scss`:
  - `-webkit-tap-highlight-color: transparent`;
  - `.flying-bat` com `touch-action: none`, `user-select: none` e `-webkit-touch-callout: none`, para o toque longo não abrir o menu da imagem;
  - `body` com `touch-action: manipulation` nas páginas de jogo, para o toque duplo não dar zoom;
  - em `@media (pointer: coarse)`, aumentar a área de toque do morcego com padding na `.flying-bat`, sem mudar o tamanho do desenho.
- Usar `100dvh` em `--full-height` (`src/styles/tokens.scss`), porque `100vh` no celular ignora a barra do navegador.

## 2. Layout em tela pequena (≤ 640 px)
- **Painel recolhível** no novo componente `src/components/game-panel/`:
  - no desktop, renderiza o `Card` como hoje;
  - no celular, mostra uma barra compacta com o resumo (kills, Final Score, Accuracy) e um botão "Controles" que abre o resto;
  - o estado aberto/fechado fica em `useState`, e a visibilidade usa só CSS com media query, sem JS de tamanho de tela.
- **Single-player:** `.single-player-dashboard` vira, no celular, um painel encaixado na **base da tela**, com largura total e recolhido por padrão. A área de jogo fica livre.
- **Multiplayer**, no celular:
  - os painéis Main e Opponent viram dois "chips" de placar no topo, lado a lado, sem `ProfileSection` e sem avatar, com o nome curto e o status;
  - o card do controlador (`.multi-player-game-dashboard`) vai para a base;
  - o chat recolhido vira um botão compacto acima do controlador; aberto, ocupa a largura;
  - o Match Setup sem oponente continua aparecendo inteiro, porque é preciso para compartilhar o link.
- **Navbar:** o `DropdownPopover` (`src/components/dropdown-popover/`) hoje abre só no hover. Vai abrir também no toque/clique, com estado `open` e fechamento por clique fora.
- **Partidas:** a tabela de `matches-page` ganha um wrapper com `overflow-x: auto`.
- **Botão de música:** fica acima do painel da base no celular.

## 3. Verificação
- `yarn lint && yarn typecheck && yarn format:check && yarn build`.
- Capturas a 390×844 via iframe (o Chrome headless não respeita janelas estreitas) de home, login, single-player e multiplayer.
- No celular real, pelo `bat-hunter-game.web.app` após o deploy:
  - tocar em morcego conta acerto;
  - tocar no vazio conta tiro;
  - aparece o anel de fogo no ponto tocado;
  - não há zoom nem menu de imagem;
  - o painel recolhe e abre.

## Entrega
Implementar tudo → commit e push → testar no celular. Só depois começar o [plano de melhoria no jogo](game-improvements.md).
