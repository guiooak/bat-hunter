# Planos e histórico

Os planos de trabalho do Bat Hunter e o histórico do que foi feito, para que o repositório guarde não só o código, mas o porquê de cada mudança. Cada plano tem um status no topo.

## Planos

| Plano | Assunto | Status |
|---|---|---|
| [mobile-compatibility.md](mobile-compatibility.md) | Jogar no celular: toque e layout | Concluído (17/10) |
| [game-improvements.md](game-improvements.md) | Dificuldade Fácil/Difícil e novos tipos de morcego | Concluído (17/10) |
| [lgpd-compliance.md](lgpd-compliance.md) | Conformidade com a LGPD | Concluído (23/10), com pendências manuais |
| [engineering-quality.md](engineering-quality.md) | Testes com 100% de cobertura e refatorações | Concluído (25/10) |

## Histórico

Em ordem. Os commits estão na `main`; itens em itálico foram operações fora do código (banco, GitHub, console).

### 17/10: Firebase nativo, marca e celular

- **Infraestrutura:** login nativo do Firebase, regras do banco e deploy automático pelo GitHub Actions (`81d25bf`, `cc771ca`).
- **Marca:** logo novo, manual da marca no GitHub Pages e o app redesenhado com a identidade (`b7a5b23`, `edae73d`, `6afc339`, `2f00e26`, `c3cb2c2`, `43cf3a6`, `16313be`, `c6e8385`).
- **Mira:** anel de fogo no cursor de tiro (`179a201`, `0fff5ca`).
- **Planos de celular e de jogo** escritos e divididos em dois (`6025826`).
- **Celular:** tiro por toque com pointer events (`eab3729`) e layout para telas pequenas (`bf14d13`).
- **Jogo:** dificuldade Fácil/Difícil com morcego pequeno, dourado e coruja (`9f987fd`); seletor segmentado (`0e7d7a9`); seletor e chat escondidos durante a partida (`9fcbebd`); morcegos automáticos (`3a86840`).
- **Correções de celular e multiplayer:** botões acima do painel (`072637c`), sem rolagem vertical (`4f951bd`), History só com oponente (`c51e385`), histórico começando em 0 x 0 (`d786aba`).
- **README:** banner e botão "Play now" desenhados por script (`3d00dad`, `389f7c3`).

### 18/10: link, 404 e multiplayer

- *Guia de estilo movido para um repositório separado e revertido no mesmo dia, a pedido; o repositório extra foi excluído* (`89a82e6`, `e41a67c`).
- **Cartão de compartilhamento** (Open Graph) para WhatsApp e outras redes (`747676d`, `4007480`).
- **Página 404** em que dá para atirar nos morcegos (`d31188c`).
- **Start desabilitado** até um oponente entrar (`084fa40`).

### 23/10: LGPD e dependências

- **Plano de LGPD** (`8abb75f`), com teste real de acesso à API do banco.
- **Privacidade no banco:** nós privados (`76e51fc`); *migração dos dados com backup*; partidas, chat e listas legíveis só pelos jogadores, só primeiro nome e foto (`1e3b4fa`); lint dos scripts (`7e59168`).
- **Fontes** servidas pelo próprio site, sem Google Fonts (`a3ec795`).
- **Política de Privacidade, Termos**, aviso no login, 13+ e denúncia no chat (`d02d08c`).
- **Página "My data"**: ver, baixar e excluir dados (`6bb31a7`).
- **Retenção automática** diária (`fed4805`, `c45e759`).
- **Documentos de LGPD** em `docs/lgpd/` (`2ad98f2`).
- *Limpeza dos campos antigos do banco (nome completo, presença, e-mails e tokens de um login antigo) e registro da exposição anterior no plano de incidentes* (`b5e3c1e`).
- *Retenção liberada (`RETENTION_APPLY=true`) e aplicada: 3 partidas, 7 convites e 192 mensagens; backups locais apagados; App Check descartado* (`548cb50`, `d465e85`, `b135dc2`).
- **87 alertas do Dependabot fechados**, um commit por correção: react-router, vite, firebase, transitivas, grpc-js, uuid, firebase-admin, eslint, sass e eslint 10 (`4d6f2c9` a `cd925c3`).

### 25/10: testes e refatorações

- **Typecheck** que de fato checa o código (`8c0ce37`).
- **Testes até 100% de cobertura**, com o limite exigido no CI, e as regras do banco testadas no emulador (`6bcb780` a `c6d5220`; `001fa03` tira do repositório dois arquivos locais commitados por engano).
- **Refatorações** com os testes como rede de proteção (`07ff44c` a `cab83e4`) e o `CONTRIBUTING.md` (`2038bff`).
- **Dois bugs de produção** encontrados e corrigidos: o loop de escrita do host (`712165d`) e a mira sumindo ao entrar rápido num jogo (`0d5570c`).
- Detalhes em [engineering-quality.md](engineering-quality.md).

## Pendências

- Conferir no console do Google Cloud os termos de tratamento de dados (passo a passo em `docs/lgpd/transferencia-internacional.md`).
- Revisão jurídica da Política de Privacidade e dos Termos.
