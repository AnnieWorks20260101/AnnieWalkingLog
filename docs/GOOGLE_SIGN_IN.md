# Google アカウントでのログイン — 導入手順

Firebase Authentication + `@react-native-google-signin/google-signin` で Google ログインを有効化する手順です。

**役割分担**を先に整理し、あなた（運営・コンソール作業）と実装側（リポジトリのコード変更）を分けて進めます。

---

## 概要

| 項目 | 内容 |
|------|------|
| 認証基盤 | Firebase Authentication（プロジェクト `anniewalkinglog`） |
| ネイティブ連携 | `@react-native-google-signin/google-signin`（Expo dev client / prebuild 向け） |
| 対象画面 | ログイン（`LoginScreen`）、ゲスト昇格（`GuestUpgradeScreen`） |
| 対象外（本ドキュメント） | Apple ログイン、Web 版 |

ログイン成功後の流れは **メール登録と同様**です。

- 初回 Google ユーザー → 家族セットアップ（`FamilySetupScreen`）
- 既存ユーザー → そのままメイン画面
- ゲスト利用中に Google で登録 → 匿名アカウントを Google に **リンク**（データ維持）

---

## 現状（2026-05 時点）

| 状態 | 詳細 |
|------|------|
| Google ログインボタン | UI のみ。`showComingSoon('Google')` で未接続 |
| Firebase Google プロバイダ | コンソールで有効化が必要（未確認） |
| `google-services.json` | リポジトリに存在するが **`oauth_client` が空** → Android 用 OAuth 未設定 |
| `GoogleService-Info.plist` | リポジトリに **未配置**（iOS 用） |
| 依存パッケージ | `@react-native-google-signin/google-signin` **未導入** |

---

## 役割分担

| # | 作業 | 担当 | 完了の目安 |
|---|------|------|------------|
| A | Firebase で Google プロバイダを有効化 | **あなた** | Authentication → Sign-in method で Google が「有効」 |
| B | Google Cloud OAuth 同意画面の整備 | **あなた** | テスト／本番でログイン画面がブロックされない |
| C | Android SHA-1 登録 + `google-services.json` 再取得 | **あなた** | JSON 内に `oauth_client` が入っている |
| D | iOS アプリ登録 + `GoogleService-Info.plist` 取得 | **あなた** | plist をリポジトリに配置できる |
| E | Web クライアント ID の共有 | **あなた** | `....apps.googleusercontent.com` を実装側に渡す |
| F | 依存追加・ネイティブ設定・認証コード | **実装側** | PR / マージ |
| G | `.env` に Web クライアント ID を設定 | **あなた** | ローカル・EAS の両方 |
| H | **ネイティブ再ビルド**（dev client / ストア用） | **あなた** | `expo run:android` / EAS Build 等 |
| I | 実機テスト（ログイン・ゲスト昇格・再ログイン） | **共同** | チェックリスト完了 |

> **重要**: Google ログインは **JavaScript だけでは動きません**。F〜H のあと、必ずネイティブビルドし直してください（Expo Go 単体では不可。本プロジェクトは既に dev client 運用）。

---

## あなたが行う作業（コンソール・ファイル）

### 1. Firebase — Google プロバイダを有効化

1. [Firebase Console](https://console.firebase.google.com/) → プロジェクト **anniewalkinglog**
2. **Authentication** → **Sign-in method**
3. **Google** を有効化
4. サポートメールを選択して保存

### 2. Google Cloud — OAuth 同意画面

Firebase で Google を有効化すると、同じプロジェクトの [Google Cloud Console](https://console.cloud.google.com/) に OAuth クライアントが自動作成されます。

1. **APIs & Services** → **OAuth consent screen**
2. User type（外部／内部）を選択
3. アプリ名・サポートメール・デベロッパー連絡先を入力
4. スコープはデフォルト（`email`, `profile`, `openid`）で足りる
5. **テスト**段階ではテストユーザーを追加（本番公開前は Google 未登録アカウントは弾かれる場合あり）
6. ストア公開前に **本番公開（Publish）** の審査を完了させる

### 3. Android — SHA-1 フィンガープリント

Google ログイン（Android）には、Firebase に **SHA-1** の登録が必須です。**デバッグ用とリリース用の両方**を登録してください。

#### デバッグ用 SHA-1（ローカル開発）

```bash
cd android
./gradlew signingReport
```

`Variant: debug` の `SHA1` をコピーします（Windows は `gradlew.bat signingReport`）。

#### リリース用 SHA-1（EAS / Play ストア）

- **EAS Build** を使う場合: [expo.dev](https://expo.dev) → プロジェクト → Credentials → Android → Keystore の SHA-1
- 手元の keystore を使う場合: `keytool -list -v -keystore <your-release.keystore>`

#### Firebase への登録

1. Firebase Console → **プロジェクトの設定** → **マイアプリ**
2. Android アプリ `com.annieworks.AnnieWalkingLog` を選択
3. **フィンガープリント証明書** に SHA-1 を追加（デバッグ・リリースそれぞれ）
4. **google-services.json を再ダウンロード**
5. リポジトリの [`google-services.json`](../google-services.json) を差し替え

**確認**: 新しい JSON の `oauth_client` 配列が **空でない**こと。

```json
"oauth_client": [
  {
    "client_id": "xxxxx.apps.googleusercontent.com",
    "client_type": 1,
    ...
  },
  {
    "client_id": "yyyyy.apps.googleusercontent.com",
    "client_type": 3,
    ...
  }
]
```

- `client_type: 1` → Android
- `client_type: 3` → **Web**（アプリコードで `webClientId` に使う）

### 4. iOS — Firebase アプリと plist

1. Firebase Console → **プロジェクトの設定** → **マイアプリ**
2. iOS アプリが無ければ追加
   - Bundle ID: `com.annieworks.AnnieWalkingLog`
3. **GoogleService-Info.plist** をダウンロード
4. リポジトリ直下（または `ios/`）に配置し、実装側にパスを伝える  
   （実装側が `app.json` の `ios.googleServicesFile` を設定します）
5. Apple Developer の App ID に **Sign In with Google 用の URL スキーム**が必要になる場合、実装側の prebuild 後に Xcode で確認

### 5. Web クライアント ID の共有

Firebase Console → プロジェクトの設定 → **全般** → **マイアプリ** → **Web クライアント ID**  
（または `google-services.json` の `client_type: 3` の `client_id`）

例: `468922569983-xxxxxxxx.apps.googleusercontent.com`

これを実装側が `.env` の `GOOGLE_WEB_CLIENT_ID` として使います。

### 6. 環境変数の設定

[`.env.example`](../.env.example) を参考に、**あなたの `.env`**（Git 管理外）に追加:

```env
# Firebase Google Sign-In（Web クライアント ID。Maps 用キーとは別物）
GOOGLE_WEB_CLIENT_ID=468922569983-xxxxxxxx.apps.googleusercontent.com
```

**EAS Build** でも同じ値が必要です:

```bash
eas secret:create --name GOOGLE_WEB_CLIENT_ID --value "468922569983-xxxxxxxx.apps.googleusercontent.com" --scope project
```

（ローカルは `.env`、クラウドビルドは EAS Secret の両方を忘れずに。）

### 7. ネイティブ再ビルド

実装マージ後:

```bash
npm install
npx expo prebuild --clean   # 必要に応じて（実装側の指示に従う）
npx expo run:android
npx expo run:ios
```

ストア用は EAS Build（`development` / `production` プロファイル）で再ビルドしてください。

---

## 実装側が行う作業（コード変更）

以下は **リポジトリ内**で行う予定の作業です。あなたのコンソール作業（上記 A〜E）が揃ってから、または並行して進めます。

### パッケージ・ネイティブ設定

| ファイル | 変更内容 |
|----------|----------|
| `package.json` | `@react-native-google-signin/google-signin` を追加 |
| `app.json` / `app.config.js` | Google Sign-In 用 Expo プラグイン、`GOOGLE_WEB_CLIENT_ID` を `extra` 経由で渡す |
| `app.json` | `ios.googleServicesFile` で `GoogleService-Info.plist` を指定 |
| `.env.example` | `GOOGLE_WEB_CLIENT_ID` の説明を追記 |

### 認証ロジック

| ファイル | 変更内容 |
|----------|----------|
| `src/services/googleSignIn.js`（新規） | `GoogleSignin.configure`、`signIn`、キャンセル・エラー処理 |
| `src/contexts/AuthContext.js` | `signInWithGoogle` — `signInWithCredential(GoogleAuthProvider.credential(idToken))` |
| 同上 | `upgradeGuestWithGoogle` — ゲスト時は `linkWithCredential` |
| 同上 | 初回 Google ユーザー向け `users/{uid}` 作成（`authProvider: 'google'`, `displayName`, `email`） |
| `src/utils/legalConsentStorage.js` | ログイン成功時に既存の法的同意保存を呼ぶ（メールログインと同様） |

### UI

| ファイル | 変更内容 |
|----------|----------|
| `src/screens/auth/LoginScreen.js` | `showComingSoon('Google')` → `signInWithGoogle` + ローディング・エラー表示 |
| `src/screens/settings/GuestUpgradeScreen.js` | 同上（ゲスト昇格） |
| `src/locales/ja.json` / `en.json` | `auth.googleLoginError` 等のエラー文言 |

### 実装しないもの（今回）

- Apple ログイン
- Google アカウントとメールアドレスの自動マージ UI（`auth/account-exists-with-different-credential` はエラーメッセージで案内）
- Cloud Functions 側の処理（不要）

---

## 結合・テスト手順（共同）

実装とコンソール設定が完了し、**ネイティブ再ビルド後**に確認してください。

### ログイン画面

- [ ] 法的同意チェック後、「Googleでログイン」で Google アカウント選択画面が開く
- [ ] 初回 Google ユーザー → 家族セットアップ画面へ
- [ ] 既存 Google ユーザー（`users` + `activeFamilyId` あり）→ メイン画面へ
- [ ] ログアウト → 再ログインで同じ UID で復帰する
- [ ] キャンセル時にクラッシュせず、元の画面に戻る

### ゲスト昇格

- [ ] ゲストで散歩記録後、設定 → 会員登録 → Google で登録
- [ ] **同じ UID** のままデータが残る（家族・ペット・散歩記録）
- [ ] `users.isGuest` が `false`、`authProvider` が `google` になる

### Firestore 確認

- [ ] `users/{uid}` に `authProvider: 'google'`、`email`、`displayName`
- [ ] 初回ログイン時に `privacyConsent` / `termsConsent` が記録される（同意済みの場合）

### プラットフォーム

- [ ] Android 実機（Google Play 開発者サービス入り）
- [ ] iOS 実機（シミュレータは Google ログインが不安定なことがある）

---

## トラブルシューティング

| 症状 | よくある原因 | 対処 |
|------|--------------|------|
| `DEVELOPER_ERROR`（Android） | SHA-1 未登録、または `google-services.json` が古い | Firebase に SHA-1 追加 → JSON 再ダウンロード → 再ビルド |
| `oauth_client` が空のまま | 上記と同じ | Android アプリ設定を見直す |
| ログイン直後に `auth/invalid-credential` | `GOOGLE_WEB_CLIENT_ID` が誤り（Android/iOS 用 ID を入れている） | **Web クライアント ID**（type 3）を設定 |
| 「このアプリは Google で確認されていません」 | OAuth 同意画面がテストモード | テストユーザー追加、または本番公開 |
| iOS で何も起きない | `GoogleService-Info.plist` 未配置・URL スキーム未設定 | plist と prebuild を確認 |
| `auth/account-exists-with-different-credential` | 同じメールがメール/パスワードで既登録 | 既存方法でログインするよう案内（別途アカウントリンクは将来対応可） |
| Expo Go では動かない | ネイティブモジュールが必要 | dev client または `expo run:*` でビルドしたアプリを使う |

---

## 参考リンク

- [Firebase — Google でログイン（Android）](https://firebase.google.com/docs/auth/android/google-signin)
- [Firebase — Google でログイン（iOS）](https://firebase.google.com/docs/auth/ios/google-signin)
- [@react-native-google-signin/google-signin](https://react-native-google-signin.github.io/docs/install)
- [Expo — Using Google authentication](https://docs.expo.dev/guides/google-authentication/)

---

## 作業の進め方（推奨順）

1. **あなた**: Firebase で Google 有効化（§1）
2. **あなた**: Android SHA-1 + `google-services.json` 更新（§3）
3. **あなた**: iOS `GoogleService-Info.plist` 取得（§4）
4. **あなた**: Web クライアント ID を実装側に共有（§5）
5. **実装側**: コード変更（上記「実装側が行う作業」）
6. **あなた**: `.env` / EAS Secret 設定（§6）
7. **あなた**: ネイティブ再ビルド（§7）
8. **共同**: テストチェックリスト（§結合・テスト）

実装を依頼するときは、このドキュメントの **§5 まで完了しているか**（特に `oauth_client` と Web クライアント ID）を伝えてもらえるとスムーズです。
