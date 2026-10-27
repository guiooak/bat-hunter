# Bat Hunter: deploys versionados

## Status (27/10/2026)

**Proposto.** Nada implementado ainda. Baseado no PR [guiooak/tymebox#15](https://github.com/guiooak/tymebox/pull/15), adaptado ao CI e às convenções deste repositório.

## Situação atual

- **Nada registra o que está em produção.** Todo merge na `main` faz deploy, mas não existe tag, release nem versão no app. O `package.json` está em `0.0.0`.
- **Os commits já seguem Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:`). Dá para calcular a versão a partir deles sem pedir nada novo a quem commita.
- **A `main` é protegida** (ruleset "Main Protection"): tudo entra por PR, com `lint`, `typecheck`, `format:check`, `build`, `test:coverage` e `test:rules` passando. Por isso o histórico passa a ter commits de merge ("Merge pull request #N").
- **O CI tem três problemas que o versionamento deixaria piores:**
  - **Deploy live de qualquer branch.** O passo live roda para todo evento que não é PR, então um run manual (`workflow_dispatch`) numa branch qualquer publicaria essa branch em produção, com as regras do banco junto.
  - **Um push na `main` cancela o deploy em andamento.** O `concurrency` tem `cancel-in-progress: true` para tudo. Com versões, dois pushes seguidos poderiam calcular o mesmo número, ou deixar uma versão sem deploy.
  - **O app é compilado duas vezes.** O `build` da matriz compila sem os secrets do Firebase, e o job `deploy` compila de novo para publicar. O que vai ao ar não é o que os checks validaram.

## Decisões

| Tema | Decisão | Por quê |
|---|---|---|
| Esquema | **SemVer calculado dos commits** desde a última tag `v*`. `!` depois do tipo ou rodapé `BREAKING CHANGE:` sobe o major, algum `feat` sobe o minor, o resto sobe o patch | É o que o tymebox faz e o que os commits daqui já permitem. Todo deploy ganha versão, até um só de docs, para "o que está no ar" ter sempre resposta. |
| Commits de merge | **Ignorados** (`git log --no-merges`) | Com a `main` protegida, cada PR mergeado com merge commit traz um "Merge pull request #N", que não tem tipo e só poluiria as notas. Os commits do PR continuam contando. *(Diferente do tymebox.)* |
| Primeira versão | **1.0.0**, do `package.json` (que sai de `0.0.0`). Depois disso as tags mandam, e o `package.json` não é mais alterado | O jogo é público e tem jogadores. Sem commits de bot na `main`, que a proteção bloquearia de qualquer jeito. |
| Release | **Um GitHub Release por deploy live**, com a tag `vX.Y.Z` no commit publicado, criado só depois do deploy dar certo. As notas listam os commits agrupados em Breaking changes, Features, Fixes e Other changes, em inglês como os commits | Um deploy que falha não deixa tag, e o próximo run usa o mesmo número. |
| Mesmo commit de novo | **Se o commit publicado já tem tag, o run reaproveita a versão e não cria release** | Um run manual na `main` sem commits novos não deve gerar uma `v1.0.1` vazia. *(Diferente do tymebox.)* |
| Só a `main` vai ao ar | O deploy live e o deploy das regras exigem `refs/heads/main`, vindo de push ou de run manual | Fecha o deploy de branch qualquer descrito acima. |
| Concorrência | **Uma execução por ref.** Na `main` os runs entram em fila; num PR, um push novo cancela o run antigo | Dois pushes seguidos na `main` não calculam a mesma versão nem cancelam um deploy no meio. |
| Compilar uma vez | Um job `build` próprio compila com os secrets e o `VITE_APP_VERSION` e guarda o `dist/` como artefato. O `deploy` publica esse artefato | O que vai ao ar é o que passou nos checks. **O job continua com o nome `build`**, que é um dos checks exigidos pela regra da `main`. |
| Prévias e local | PRs mostram a versão que viriam a ser, `X.Y.Z-pr.N`. O build local mostra `dev` | Dá para conferir na prévia antes do merge. |
| Onde aparece no app | **No pé da página de Configurações** (`/settings`): "Versão v1.0.0", pequeno e discreto, com link para o GitHub Release (o repositório é público). Prévias e `dev` aparecem sem link | O bat-hunter não tem sidebar como o tymebox. Configurações já é a página de detalhes do app, e não ocupa a tela do jogo. |
| Script | `scripts/release-version.mjs`, com testes em `scripts/release-version.test.ts` | Segue o `retention.mjs`: os scripts daqui são `.mjs`, entram na cobertura de 100% e no lint de Node. *(O tymebox usa `.ts`.)* |
| Dependabot | Os PRs dele também ganham `X.Y.Z-pr.N` e passam pelo `build`, mas continuam sem deploy de prévia | O job `version` não precisa de secret. A regra que pula o deploy para o Dependabot fica como está. |

## Fases

Um commit por item, no estilo do repositório, todos num PR (a `main` não aceita push direto).

### Fase 1: CI mais seguro (antes de versionar)

1. **`ci: deploy live only from main`**: os passos live e de regras passam a exigir `github.ref == 'refs/heads/main'`.
2. **`ci: queue runs on main instead of cancelling them`**: `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`.
3. **`ci: deploy the build that passed the checks`**: `build` sai da matriz e vira um job próprio, com os secrets do Firebase, que faz upload de `dist/`. O `deploy` baixa o artefato em vez de compilar. A matriz fica com `lint`, `typecheck`, `format:check` e `test:coverage`.

### Fase 2: a versão

4. **`feat: compute the release version from the commits`**: `scripts/release-version.mjs` com funções puras (`bumpFor`, `nextVersion`, `releaseNotes`) e uma CLI que lê o git, escreve `version=…` em `$GITHUB_OUTPUT` e as notas num arquivo. Opções `--pr <n>` e `--notes <arquivo>`. Testes cobrem:
   - major, minor e patch;
   - escopo (`feat(chat):`) e `!`;
   - rodapé `BREAKING CHANGE:`;
   - commits sem tipo;
   - primeira versão sem tag, e `package.json` inválido;
   - notas agrupadas, sem mudanças e primeira release;
   - commits de merge ignorados;
   - commit já com tag (reaproveita a versão).
5. **`ci: version every production deploy with a tag and a GitHub Release`**:
   - Um job `version` com `fetch-depth: 0` e `fetch-tags: true` alimenta o `build` (`VITE_APP_VERSION`) e o `deploy`.
   - O `deploy` ganha `contents: write`.
   - Depois do deploy live, `gh release create "v$VERSION" --target "$GITHUB_SHA" --notes-file …`, pulado quando a versão já existia.
   - `package.json` vai para `1.0.0`.

### Fase 3: a versão no app

6. **`feat: show the running version in Settings`**:
   - `src/services/app-version.ts` transforma o `VITE_APP_VERSION` em `{ label, href }` (`v1.0.0` com link, `v1.0.0-pr.12` sem link, `dev` sem link).
   - `src/vite-env.d.ts` declara a variável.
   - O pé de `SettingsPage` mostra a versão.
   - Os textos ("Version" / "Versão") entram nos dois dicionários.
   - Testes do serviço e da página, em inglês e português.

### Fase 4: documentação

7. **`docs: how releases work`**:
   - No README, uma seção "Releases": como a versão é calculada, onde ver e o que fazer se a release falhar.
   - No `CONTRIBUTING.md`, a seção de commits passa a dizer que o tipo do commit decide a versão. Num merge por squash, quem decide é o título do PR, que também precisa seguir o padrão.
   - Este plano passa para "Concluído".

## Fora do escopo

Do PR do tymebox, ficam de fora as partes que são específicas daquele repositório: Knip, a regra de camadas no ESLint, o upload para o Codecov, o `npm audit` no CI, o `packageExtensions` e os testes e2e com Playwright.

## Checagens

`yarn lint`, `yarn typecheck`, `yarn format:check`, `yarn test:coverage` (100%) e `yarn build` localmente, em cada commit. O workflow em si só roda no GitHub:

- A prévia do PR deve mostrar `v1.0.0-pr.N` em Configurações.
- Depois do merge, o primeiro deploy da `main` deve criar a tag e o release `v1.0.0`.

## Em aberto

- **Proteger as tags?** A regra "Main Protection" vale só para a branch `main`, então o `GITHUB_TOKEN` consegue criar tags (é o que o release precisa). Uma regra para `v*`, que só o GitHub Actions possa criar, evita tags feitas à mão. A recomendação é criar essa regra depois que o `v1.0.0` sair.
- **Mostrar a versão também no rodapé da home?** Hoje a proposta é só em Configurações. A recomendação é manter assim.
- **Travar o `firebase-tools` no `yarn.lock`?** O tymebox passou a usar a versão travada no deploy e nos testes de regras. Aqui os dois usam `npx firebase-tools@15`, que pega a versão mais nova da linha 15. A recomendação é fazer num PR separado, porque mexe nos testes de regras e não no versionamento.

## Estimativa

São 4 fases e 7 commits, num PR só. O maior é o script com testes (fase 2).
