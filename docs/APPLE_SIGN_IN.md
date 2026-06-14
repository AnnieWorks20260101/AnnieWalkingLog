# Sign in with Apple — 導入手順

Firebase Authentication + `expo-apple-authentication` で Apple ログインを有効化する手順です。

Google ログイン手順（[GOOGLE_SIGN_IN.md](./GOOGLE_SIGN_IN.md)）と同様に、**あなた（運営・コンソール作業）** と **実装側（リポジトリのコード変更）** の分担を明確にしています。

---

## 概要

| 項目 | 内容 |
|------|------|
| 認証基盤 | Firebase Authentication（プロジェクト `anniewalkinglog`） |
| ネイティブ連携 | `expo-apple-authentication`（Expo dev client / prebuild 向け） |
| 対象プラットフォーム | **iOS のみ**（Android ではボタン非表示または未対応） |
| 対象画面 | ログイン（`LoginScreen`）、ゲスト昇格（`GuestUpgradeScreen`） |
| Bundle ID | `com.annieworks.AnnieWalkingLog` |
| Apple Team ID | `8AXQGJTA55` |
| App Store Connect App ID | `6776878491`（`eas.json` 参照） |

ログイン成功後の流れは **Google / メール登録と同様**です。

- 初回 Apple ユーザー → 家族セットアップ（`FamilySetupScreen`）
- 既存ユーザー → そのままメイン画面
- ゲスト利用中に Apple で登録 → 匿名アカウントを Apple に **リンク**（データ維持）
- メール登録済みの同一アドレス → パスワード入力で **自動連携**（Google と同パターン）

---

## App Store の要件（重要）

iOS アプリで **Google ログイン等の第三者ログイン** を提供する場合、Apple のガイドラインにより **Sign in with Apple も同等の条件で提供** する必要があります。

本アプリは Google ログインを実装済みのため、**iOS 版では Apple ログインの実装が審査上ほぼ必須**です。

---

## 現状

| 状態 | 詳細 |
|------|------|
| コード実装 | **完了**（`signInWithApple` / `upgradeGuestWithApple` / メール既存アカウントとの自動連携） |
| `app.json` | `usesAppleSignIn: true`、`expo-apple-authentication` プラグイン |
| 依存パッケージ | `expo-apple-authentication`、nonce 用に `js-sha256`（純 JS・iOS のみ利用） |
| 残作業 | Firebase Apple プロバイダ設定（§4）、**iOS ネイティブ再ビルド**、実機テスト |

---

## 役割分担

| # | 作業 | 担当 | 完了の目安 |
|---|------|------|------------|
| A | Apple Developer — App ID で Sign in with Apple を有効化 | **あなた** | Identifiers で Capability がオン |
| B | Apple Developer — Sign in with Apple 用キー (.p8) 作成 | **あなた** | Key ID を控え、`.p8` を安全に保管 |
| C | Apple Developer — Services ID 作成・Firebase 用 URL 設定 | **あなた** | Return URL に Firebase ハンドラを登録 |
| D | Firebase — Apple プロバイダ有効化（Team ID / Key / Services ID） | **あなた** | Authentication → Apple が「有効」 |
| E | 秘密鍵 `.p8` の共有方法の合意 | **あなた → 実装側** | **Git にコミットしない**（下記 §秘密鍵） |
| F | 依存追加・ネイティブ設定・認証コード | **実装側** | PR / マージ |
| G | **iOS ネイティブ再ビルド**（dev client / TestFlight / 本番） | **あなた** | `expo run:ios` / EAS Build |
| H | 実機テスト（ログイン・ゲスト昇格・再ログイン・連携） | **共同** | チェックリスト完了 |

> **重要**: Apple ログインは **iOS 実機またはシミュレータ（Apple ID サインイン可能な環境）** でのみ動作します。Expo Go では不可（dev client が必要）。

---

## あなたが行う作業（Apple Developer / Firebase）

### 1. App ID — Sign in with Apple を有効化

1. [Apple Developer](https://developer.apple.com/account/) → **Certificates, Identifiers & Profiles**
2. **Identifiers** → App ID `com.annieworks.AnnieWalkingLog` を選択（なければ作成）
3. **Sign In with Apple** にチェックを入れて保存
4. Capability を「Enable as a primary App ID」として設定（デフォルトのまま通常可）

Live Activity 拡張（`com.annieworks.AnnieWalkingLog.walkliveactivity`）には Sign in with Apple は **不要**（メインアプリのみ）。

### 2. Sign in with Apple 用キー (.p8) の作成

1. **Keys** → **+** で新規キー
2. 名前（例: `AnnieWalkingLog Apple Sign In`）
3. **Sign In with Apple** にチェック → **Configure** → 対象 App ID を選択
4. 登録後 **Key ID** を控える
5. **Download** で `.p8` ファイルを取得（**再ダウンロード不可**）

控える情報:

| 項目 | 例 / 備考 |
|------|-----------|
| Team ID | `8AXQGJTA55` |
| Key ID | Apple Developer に表示される 10 文字 |
| 秘密鍵 | `AuthKey_XXXXXXXXXX.p8` |

### 3. Services ID の作成（Firebase 連携用）

Firebase が Apple の ID トークンを検証するために必要です。

1. **Identifiers** → **+** → **Services IDs**
2. Description（例: `Annie Walking Log Firebase Auth`）
3. Identifier（例: `com.annieworks.AnnieWalkingLog.signin`）  
   ※ 実装時に Firebase Console へ登録する値。一度決めたら変えないこと
4. **Sign In with Apple** を有効化 → **Configure**
   - Primary App ID: `com.annieworks.AnnieWalkingLog`
   - **Domains and Subdomains**: `anniewalkinglog.firebaseapp.com`
   - **Return URLs**:  
     `https://anniewalkinglog.firebaseapp.com/__/auth/handler`
5. 保存

### 4. Firebase — Apple プロバイダを有効化

1. [Firebase Console](https://console.firebase.google.com/) → **anniewalkinglog**
2. **Authentication** → **Sign-in method** → **Apple** → 有効化
3. 次を入力:

| Firebase の項目 | 入力する値 |
|-----------------|------------|
| Services ID | §3 で作成した Identifier（例: `com.annieworks.AnnieWalkingLog.signin`） |
| Apple team ID | `8AXQGJTA55` |
| Key ID | §2 の Key ID |
| Private key | `.p8` ファイルの **中身全文**（`-----BEGIN PRIVATE KEY-----` 〜 `END`） |

4. 保存

OAuth コードフロー設定（Firebase の案内にある場合）は、上記 Services ID の Return URL と一致していることを確認してください。

### 5. 秘密鍵 (.p8) の取り扱い

| やること | やらないこと |
|----------|--------------|
| ローカルで安全に保管 | Git リポジトリへのコミット |
| Firebase Console に貼り付け（§4） | Slack / メール平文での共有 |
| 必要ならパスワード管理ツールで実装者と共有 | `app.json` や `.env` に記載 |

`.p8` は Firebase Console に登録すれば、**アプリのソースコードには通常不要**です（Google の Web Client ID とは異なる）。

---

## 実装済み（コード側）

Google ログイン（[GOOGLE_SIGN_IN.md](./GOOGLE_SIGN_IN.md)）と **同じ設計**で実装済みです。

### パッケージ・ネイティブ設定

| ファイル | 内容 |
|----------|------|
| `package.json` | `expo-apple-authentication`、`expo-crypto` |
| `app.json` | `ios.usesAppleSignIn: true`、`plugins` に `expo-apple-authentication` |

### 認証ロジック

| ファイル | 内容 |
|----------|------|
| `src/services/appleSignIn.js` | nonce 生成、`signInAsync`、キャンセル処理 |
| `src/contexts/AuthContext.js` | `signInWithApple`、`upgradeGuestWithApple`、`linkAppleWithPassword` |
| `src/components/auth/GoogleAccountLinkModal.js` | Google / Apple 共通の連携モーダル（`provider`  prop） |

### メール既存アカウントとの自動連携

Google と同様。パスワード入力後に `linkWithCredential` で Apple を既存 UID にリンクします。

### UI

| ファイル | 内容 |
|----------|------|
| `src/screens/auth/LoginScreen.js` | iOS かつ利用可能時のみ Apple ボタン表示 |
| `src/screens/settings/GuestUpgradeScreen.js` | 同上 |
| `src/locales/ja.json` / `en.json` | Apple 用エラー・連携文言 |

### 未実装（別タスク）

- Android 版 Apple ログイン（非対応）
- Apple ID と Google ID の相互自動マージ（別 UID の場合）

---

## 結合・テスト手順（共同）

Firebase / Apple Developer 設定とコード実装が完了し、**iOS ネイティブ再ビルド後**に確認してください。

### ログイン画面（iOS 実機推奨）

- [ ] 「Appleでログイン」で Apple ID シートが表示される
- [ ] 初回 Apple ユーザー → 家族セットアップ画面へ
- [ ] 表示名が Apple から取得できた場合、`users.displayName` に反映される
- [ ] 既存 Apple ユーザー → メイン画面へ
- [ ] ログアウト → 再ログインで同じ UID で復帰する
- [ ] キャンセル時にクラッシュしない
- [ ] **メール登録済みの同一アドレス**（非 relay の場合）→ パスワード連携モーダル → ログインできる

### ゲスト昇格（iOS）

- [ ] ゲストで記録後、設定 → 会員登録 → Apple で登録
- [ ] 新規 Apple アカウントなら **同じ UID** のままデータが残る
- [ ] `users.isGuest` が `false`、`authProvider` が `apple` になる

### Firestore 確認

- [ ] `users/{uid}` に `authProvider: 'apple'`（または `email,apple`）、`email`、`displayName`
- [ ] ログイン成功時に `privacyConsent` / `termsConsent` が記録される

### Android 確認

- [ ] ログイン画面に Apple ボタンが **表示されない**（または無効で問題ない）

### TestFlight / 審査前

- [ ] Sandbox Apple ID でサインインできる
- [ ] Google + Apple + メールのログイン手段が iOS で揃っている

---

## トラブルシューティング

| 症状 | よくある原因 | 対処 |
|------|--------------|------|
| `auth/invalid-credential` | nonce 不一致、Firebase Apple 設定不備 | rawNonce / ハッシュの実装と Firebase §4 を再確認 |
| `Apple サインインできません`（実機） | App ID に Capability 未設定 | Apple Developer §1 → prebuild し直し |
| Firebase で Apple が有効化できない | Services ID / Return URL 不一致 | §3 の URL を再確認 |
| メールが毎回 null | 2 回目以降の Apple 仕様 | 初回保存済みデータを維持（上書きしない） |
| `auth/account-exists-with-different-credential` | 同メールがメール登録済み | 連携モーダルでパスワード入力（自動マージ） |
| シミュレータで動かない | Apple ID 未設定 | 設定 → Apple ID でサインイン、または実機でテスト |
| Expo Go では動かない | ネイティブモジュールが必要 | dev client / `expo run:ios` でビルド |

---

## Google ログインとの比較

| 項目 | Google | Apple |
|------|--------|-------|
| プラットフォーム | Android + iOS | **iOS のみ** |
| 追加 `.env` | `GOOGLE_WEB_CLIENT_ID` 必須 | 不要（秘密鍵は Firebase Console のみ） |
| ネイティブ設定 | `google-services.json` / plist | `usesAppleSignIn` + entitlement |
| コンソール作業 | Google Cloud OAuth + SHA-1 | Apple Developer キー + Services ID |
| アカウント連携 | パスワードで自動マージ済み | **同パターンで実装予定** |
| App Store 要件 | — | Google 提供時は **必須に近い** |

---

## 参考リンク

- [Expo — AppleAuthentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Firebase — Apple でログイン（iOS）](https://firebase.google.com/docs/auth/ios/apple)
- [Firebase — Apple プロバイダの構成](https://firebase.google.com/docs/auth/web/apple#configure_sign_in_with_apple)
- [Apple — Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
- [App Store Review Guideline 4.8（サインイン）](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple)

---

## 作業の進め方（推奨順）

1. **あなた**: Apple Developer §1〜§3（App ID / キー / Services ID）
2. **あなた**: Firebase Apple プロバイダ §4
3. **実装側**: コード変更（**完了**）
4. **あなた**: `npx expo prebuild`（必要時）→ `npx expo run:ios` または EAS Build
5. **共同**: §結合・テスト

Firebase Apple プロバイダ（§4）の設定後、**iOS ネイティブ再ビルド** を行い、§結合・テストで確認してください。
