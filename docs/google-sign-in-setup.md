# Configurar o Google Sign-In

O app usa `@react-native-google-signin/google-signin`: a biblioteca abre o
seletor de conta nativo, e devolve um `serverAuthCode` que o app manda para
`POST /auth/google` na API (exatamente o mesmo endpoint que o web já usa). A
troca desse código por um token acontece no servidor, nunca no celular, então
o app nunca guarda um client secret.

Isso exige três client IDs no mesmo projeto do Google Cloud: um **Web**, um
**iOS** e um **Android**. O Web já existe (é o mesmo que a API usa para
autenticar o navegador); só falta acrescentar os dois de app nativo.

## 1. O client Web que já existe

Você já criou um client tipo **Web application** no Google Cloud Console
(`client_secret_....apps.googleusercontent.com.json`). Ele tem um
`client_id` e um `client_secret`: o secret fica só na API, nunca no app.

Duas coisas para ajustar nele:

1. **Authorized redirect URIs**: hoje só tem
   `http://localhost:8000/auth/google/callback`, que não é usado por nenhum
   código do projeto. Trocar por (ou acrescentar) os redirects reais:
   - Web (dev): `http://localhost:5173/entrar/google`
   - Web (produção): `https://<domínio do argumenta-web>/entrar/google`

   O app mobile **não precisa de um redirect aqui**: o `serverAuthCode` vem
   do SDK nativo, não de um redirect de navegador, e a API aceita
   `redirect_uri: "postmessage"` (a convenção do próprio Google para um
   código obtido dessa forma) sem precisar de nada cadastrado no Console
   para esse valor.

2. **Onde ele mora**: configure `ARGUMENTA_GOOGLE_CLIENT_ID` e
   `ARGUMENTA_GOOGLE_CLIENT_SECRET` (o `client_id`/`client_secret` desse JSON)
   nas variáveis de ambiente da API (local: `.env`; produção: secret do
   deploy). Sem isso a API responde `GoogleSignInFailedError` em qualquer
   login por Google, web ou mobile.

## 2. Criar o client Android

No [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
no mesmo projeto:

1. **Create credentials → OAuth client ID → Android**.
2. **Package name**: `com.argumenta.mobile` (é o que está em `app.json` em
   `expo.android.package`).
3. **SHA-1 certificate fingerprint**: o fingerprint da chave que assina o
   build. Para um build de desenvolvimento local (`expo prebuild` +
   `expo run:android`), pegue o da keystore de debug:

   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   Copie a linha `SHA1:`. Quando o EAS Build entrar em cena (card #8), ele
   gera e assina com uma chave própria: repita este passo com
   `eas credentials` para pegar o SHA-1 daquele keystore e cadastre um
   segundo client Android para o build de produção (o Console aceita vários
   clients Android, um por keystore).

4. Salvar. Este client não tem secret nem precisa ser referenciado em
   nenhum código: o Google casa a chamada com ele sozinho, pelo
   package name + SHA-1 do app que fez a chamada.

## 3. Criar o client iOS

Mesma tela de credenciais:

1. **Create credentials → OAuth client ID → iOS**.
2. **Bundle ID**: `com.argumenta.mobile` (é o que está em `app.json` em
   `expo.ios.bundleIdentifier`).
3. Salvar. O Console mostra um **iOS URL scheme** (o "reversed client ID",
   algo como `com.googleusercontent.apps.123-abc`).

Cole esse valor em `app.json`, no plugin do Google Sign-In (hoje ele está
sem opções, porque esse valor ainda não existia):

```json
"plugins": [
  ...,
  ["@react-native-google-signin/google-signin", { "iosUrlScheme": "com.googleusercontent.apps.SEU-VALOR-AQUI" }]
]
```

## 4. Variáveis do app

Em `.env` (nunca commitado; veja `.env.example`):

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<o client_id do Web, não o Android nem o iOS>
```

É sempre o client **Web** aqui, mesmo rodando no iOS ou Android: é ele que
identifica o *servidor* (a API) que vai validar o login, não o app em si.

## 5. Por que isso não dá para testar neste ambiente

`@react-native-google-signin/google-signin` precisa de código nativo
(Kotlin/Swift), então só funciona num **development build**
(`npx expo prebuild` + `npx expo run:android`/`run:ios`, ou um build do EAS).
Não funciona no Expo Go, e não existe emulador/dispositivo neste ambiente de
execução para testar de ponta a ponta. O caminho de e-mail/senha foi
verificado de ponta a ponta contra a API real; o caminho do Google está
implementado e testado (`src/auth/google.test.ts`, com o SDK mockado), mas a
primeira vez que ele vai rodar de verdade é num build de desenvolvimento seu,
num celular ou emulador.
