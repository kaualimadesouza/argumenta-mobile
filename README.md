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
- Navegação com expo-router
- Push de lembrete de streak via expo-notifications (Expo Push API, FCM/APNs)
- Build e publicação nas lojas via EAS Build/Submit
- Design system portado do argumenta-web (paleta papel/tinta/caneta,
  Bricolage Grotesque + Source Serif 4 + IBM Plex Mono)

## Estado

Planejamento. O roadmap vive nas [issues](../../issues) deste repositório;
o quadro geral do produto fica no projeto Argumenta MVP.

## Setup (quando o código nascer)

```bash
npm install
npx expo start
```
