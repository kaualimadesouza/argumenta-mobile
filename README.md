# Argumenta Mobile

Aplicativo do Argumenta: treino de escrita argumentativa para vestibulares
(ENEM e FUVEST) em histórias interativas. O aluno convence personagens com
argumentos escritos, corrigidos por um motor com critérios de banca.

Este repositório é a **fase 2** do produto. O MVP roda na web
([argumenta-web](https://github.com/kaualimadesouza/argumenta-web)) contra a API
([argumenta-api](https://github.com/kaualimadesouza/argumenta-api)); o app nasce
depois que o motor de correção e o conteúdo estiverem validados no beta web.

## Stack

- **Expo** (managed workflow) + **React Native** + **TypeScript**
- Navegação com expo-router (rotas em `src/app`, seguindo o layout oficial de
  projeto novo do Expo)
- Push de lembrete de streak via expo-notifications (Expo Push API, FCM/APNs)
- Build e publicação nas lojas via EAS Build/Submit
- Design system portado do argumenta-web: paleta papel/tinta/caneta e tipo em
  Inter (design system v3), em `src/styles/tokens.ts`

## Estado

Esqueleto do app no ar (Expo + expo-router + tokens). O roadmap vive nas
[issues](../../issues) deste repositório; o quadro geral do produto fica no
projeto Argumenta MVP.

## Setup

```bash
npm install
npx expo start
```

## Releases

Versionamento e changelog são automáticos via
[Release Please](https://github.com/googleapis/release-please): todo merge na
main com conventional commit (`feat:`, `fix:`, ...) alimenta um PR de release;
mergear esse PR cria a tag semver, a GitHub Release e o `CHANGELOG.md`,
propagando a versão para `package.json` e `app.json` (`expo.version`). PRs são
squash-merged com título convencional (validado pelo workflow de título).
