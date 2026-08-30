# Troubleshooting do build EAS (APK de preview)

Registro dos problemas encontrados ao gerar o primeiro APK de preview
(2026-08-30), na ordem em que apareceram, com causa raiz e correção. Leia isto
antes de depurar um build novo: os sintomas enganam, e mais de um problema
diferente termina no mesmo "Gradle build failed".

## Como investigar qualquer build que falhou

O log completo de um build fica disponível via CLI, sem depender do site:

```bash
npx eas-cli build:list --platform android --limit 3 --json --non-interactive
# pegue o id e a URL assinada em "logFiles", depois:
npx eas-cli build:view <build-id> --json
curl -s --compressed -o build.log "<logFiles[0]>"
```

O arquivo é NDJSON (um JSON por linha) com um campo `phase`. As fases que mais
falham: `INSTALL_DEPENDENCIES` (avisos de peer dependency aparecem aqui),
`EAGER_BUNDLE` (Metro) e `RUN_GRADLEW` (nativo). O erro real do Gradle fica em
"What went wrong", centenas de linhas antes do fim.

## Problema 1: projeto EAS errado no app.json

**Sintoma:** o build subia para um projeto EAS que não era o do time, ou o
`eas build` reclamava de slug/projeto.

**Causa:** `app.json` tinha `slug: "argumenta-mobile"` e nenhum
`extra.eas.projectId`. O projeto real no EAS é `argumenta-ai`, conta
`kaualima15s-team`.

**Correção** (commit `9fe3277`): `slug: "argumenta-ai"` +
`extra.eas.projectId: "06ee4197-3732-4f70-a6a9-17775c0e16f8"` no `app.json`.

## Problema 2: testes colocalizados entravam no bundle nativo

**Sintoma:** build falhava na fase **Bundle JavaScript** (erro
`UNKNOWN_ERROR`, "See logs of the Bundle JavaScript build phase").

**Causa:** os `*.test.tsx` vivem dentro de `src/app/`, colocalizados com as
rotas. O `require.context` do expo-router varre `src/app/` inteiro para o
bundle de produção, e um teste importa `@testing-library/react-native`, que
puxa módulos Node inexistentes no Hermes. O jest não é afetado porque não lê
`metro.config.js`.

**Correção** (commit `9cb1757`): `metro.config.js` com
`config.resolver.blockList = [.../\.test\.[jt]sx?$/]`.

## Problema 3: react-native-worklets incompatível com o expo-modules-core

**Sintoma:** build falhava na fase **Run gradlew**
(`EAS_BUILD_UNKNOWN_GRADLE_ERROR`). No log, o erro real:

```
expo-modules-core/android/src/main/cpp/worklets/WorkletJSCallInvoker.cpp:27:21:
error: no member named 'executeSync' in 'worklets::WorkletRuntime'
```

**Causa:** nenhuma tela usava reanimated, então ele não era dependência
direta. O npm resolvia `react-native-reanimated@4.6.0` pelo peer `*` do
expo-router, e o 4.6 exige `react-native-worklets@0.12.x` (ver a
[tabela de compatibilidade do Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/)).
Só que o `expo-modules-core` do SDK 57 compila C++ contra os headers do
worklets e aceita no máximo `^0.10.0`; o 0.12 removeu a API `executeSync`.
O `npx expo-doctor` passa 21/21 e o `npx expo install --check` diz "up to
date" porque nenhum dos dois valida dependência transitiva (problema
conhecido: [expo/expo#44789](https://github.com/expo/expo/issues/44789)).

**Correção:** pinar as versões do `bundledNativeModules.json` do SDK como
dependências diretas, para o lockfile e o expo-doctor passarem a enxergá-las:

```bash
npx expo install react-native-reanimated react-native-worklets
```

**Diagnóstico rápido em caso de reincidência** (upgrade de SDK, novo pacote):

```bash
npm ls react-native-worklets   # "invalid" na árvore = vai quebrar o gradle
```

## Problema 4: testes flaky (só na suíte completa, nunca isolados)

Não afeta o APK (o EAS não roda jest), mas derrubava o CI e mascarava tudo
acima. Sintoma: 2 a 4 suítes falhando com

```
`render` function has not been called
```

apenas no `npm test` completo; cada suíte isolada passava, e `--runInBand`
passava 74/74.

**Causa:** no `@testing-library/react-native` v14, `render`, `fireEvent`,
`act`, `rerender` e `unmount` viraram **async** e precisam de `await`
([guia de migração](https://oss.callstack.com/react-native-testing-library/docs/start/migration-v14)).
Os testes novos chamavam `render(...)` e `fireEvent...` sem `await`: o
`screen` só é populado quando a promise do render resolve, então sob carga
(workers paralelos do jest, runner de 2 cores do CI) o `waitFor` estourava
antes do flush e reportava o erro enganoso acima. Sem carga a corrida quase
nunca perdia, por isso "passava na minha máquina".

**Correção:** `await` em todo `render`/`fireEvent` (existe codemod oficial:
`npx codemod@latest rntl-v14-async-functions --target ./src`). Com as corridas
corrigidas sobrou apenas o custo real de CPU da primeira rodada fria, coberto
por `testTimeout: 30000` no bloco jest do `package.json`.

De quebra, o render await-ado expôs um bug real escondido pela corrida: a
mensagem de anotação aparece na legenda **e** no sheet aberto ao tocar no
span, e o teste assumia ocorrência única (`getByText`); corrigido para
`getAllByText(...)` com a contagem esperada.

## Nota de ambiente local

Um `~/.netrc` com credencial antiga sobrescreve a conta do `gh` nas operações
git por HTTPS e derruba o push com 403. Se o push falhar com permissão negada
mesmo com `gh auth status` correto, confira o `~/.netrc`.
