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
cp .env.example .env  # aponte EXPO_PUBLIC_API_URL para o IP da sua máquina, não localhost
npx expo start
```

Login por e-mail/senha já funciona contra a API. Para o login com Google,
veja [docs/google-sign-in-setup.md](docs/google-sign-in-setup.md).

## Releases

Versionamento e changelog são automáticos via
[Release Please](https://github.com/googleapis/release-please): todo merge na
main com conventional commit (`feat:`, `fix:`, ...) alimenta um PR de release;
mergear esse PR cria a tag semver, a GitHub Release e o `CHANGELOG.md`,
propagando a versão para `package.json` e `app.json` (`expo.version`). PRs são
squash-merged com título convencional (validado pelo workflow de título).

## Gerar APK de preview

O projeto está configurado para gerar um APK de preview (instalável direto no Android, sem loja) através do EAS Build. O build usa o profile \`preview\`, configurado em \`eas.json\`, que aponta para a API de produção.

Para gerar o APK:

1. **Login no EAS:**
   ```bash
   npx eas-cli login
   ```
   (Use a conta do dono do projeto no Expo).

2. **Vincular o projeto:**
   ```bash
   npx eas-cli init
   ```
   Isso criará um projeto no EAS e gravará o \`projectId\` no \`app.json\`.

3. **Gerar o build Android:**
   ```bash
   npx eas-cli build -p android --profile preview
   ```
   Se o EAS perguntar sobre gerar um keystore, aceite a opção de **gerenciado pelo Expo**.

4. **Configurar o Google Sign-In:**
   Após a primeira build, rode \`npx eas-cli credentials -p android\` para ver o SHA-1 do keystore gerenciado pelo EAS. Cadastre esse SHA-1 num novo OAuth Client Android no Google Cloud Console com o package \`com.argumenta.mobile\`. Sem isso, o login por e-mail funciona, mas o botão do Google falhará.

5. Ao fim do build, o EAS fornecerá um link para baixar o APK (`.apk`). Instale no seu aparelho e teste o fluxo completo!

Se o build falhar, veja
[docs/eas-build-troubleshooting.md](docs/eas-build-troubleshooting.md): os
problemas já conhecidos (e resolvidos) estão documentados lá, com o passo a
passo para ler o log de qualquer build pela CLI.
