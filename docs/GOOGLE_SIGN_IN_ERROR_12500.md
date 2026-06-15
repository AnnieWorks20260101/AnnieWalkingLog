# Google ログイン エラー 12500 — 解消手順（詳細版）

アプリで「Googleログインの設定が完了していません。Firebase のサポートメール、OAuth 同意画面…」と表示される場合の対処手順です。

**対象プロジェクト**

| 項目 | 値 |
|------|-----|
| Firebase プロジェクト ID | `anniewalkinglog` |
| Google Cloud プロジェクト番号 | `468922569983` |
| Android パッケージ名 | `com.annieworks.AnnieWalkingLog` |
| iOS Bundle ID | `com.annieworks.AnnieWalkingLog` |
| Web クライアント ID（`client_type: 3`） | `468922569983-mvvo9gv74tusogikcf3m79vptqk4si6t.apps.googleusercontent.com` |
| プライバシーポリシー URL（OAuth 同意画面に登録推奨） | `https://www.annie-works.com/jp/AnnieWalkingLog/Privacy-Policy` |

基本の導入手順は [GOOGLE_SIGN_IN.md](./GOOGLE_SIGN_IN.md) を参照してください。本書は **エラー 12500 専用**のチェックリストです。

---

## 1. エラー 12500 とは

Android で Google ログインを開始したとき、Google Play 開発者サービスが返す **設定不備系のエラー** です。アプリの JavaScript や Firebase Auth のコードが壊れているというより、**Google Cloud / Firebase コンソール側の設定が揃っていない**ときに多く発生します。

よくある原因（優先度順）:

1. **Android 用 SHA-1 が Firebase に未登録**（または登録後に `google-services.json` を取り直していない）
2. **Firebase のサポートメールが未設定**
3. **OAuth 同意画面の必須項目が未入力**（アプリ名・プライバシーポリシー URL など）
4. OAuth 同意画面が **テストモード**のまま、ログインしようとした Google アカウントがテストユーザーに含まれていない
5. 設定変更後に **ネイティブアプリを再ビルドしていない**（古い `google-services.json` が APK/AAB に入ったまま）

> **補足**: `DEVELOPER_ERROR` は SHA-1 不足で出やすい一方、**12500 も同じ根本原因（SHA-1 未登録など）** で出ることがあります。本手順は 12500 向けですが、SHA-1 と `google-services.json` の確認は最優先で行ってください。

---

## 2. まず確認する（5 分チェック）

作業前に、次をメモしておくと迷いません。

- [ ] エラーが出ているのは **Android 実機 / Play 内部テスト / 本番** のどれか
- [ ] そのビルドは **EAS Build** か **ローカル debug** か
- [ ] Firebase Console で Google プロバイダが **有効** か
- [ ] リポジトリの [`google-services.json`](../google-services.json) を開き、`oauth_client` に **`client_type: 1`（Android 用）** があるか

### `google-services.json` の見方（重要）

SHA-1 を正しく登録し、JSON を再ダウンロードすると、通常は次の **2 種類** のクライアントが並びます。

```json
"oauth_client": [
  {
    "client_id": "xxxxx.apps.googleusercontent.com",
    "client_type": 1
  },
  {
    "client_id": "468922569983-mvvo9gv74tusogikcf3m79vptqk4si6t.apps.googleusercontent.com",
    "client_type": 3
  }
]
```

| client_type | 意味 |
|-------------|------|
| **1** | **Android 用** OAuth クライアント（SHA-1 登録後に自動作成される） |
| **3** | **Web 用** OAuth クライアント（アプリの `GOOGLE_WEB_CLIENT_ID` に使う） |

**`client_type: 3` だけで `1` が無い** → ほぼ確実に **SHA-1 未登録、または登録後に JSON 未更新** です。§5 を最優先で実施してください。

---

## 3. Firebase のサポートメールを設定する

サポートメールは **2 か所** あります。どちらか片方だけ未設定でも、OAuth や Google ログインで不具合が出ることがあります。**両方** 設定してください。

### 3-1. プロジェクト全体のサポートメール

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト **anniewalkinglog** を選択
3. 左上の **歯車アイコン** → **プロジェクトの設定**
4. **全般** タブ
5. **サポートメール**（Support email）を確認
   - 「メールアドレスが設定されていません」や空欄なら、ドロップダウンから **Google アカウントとして管理しているメール** を選ぶ
   - 例: 運営用の `xxx@gmail.com` や Google Workspace のアドレス
6. **保存**（変更した場合）

**選べるメールが無い場合**

- その Google アカウントで Firebase プロジェクトの **オーナー** または **編集者** になっているか確認
- 別の Google アカウントでプロジェクトを作った場合は、そのアカウントでログインし直す

### 3-2. Authentication → Google プロバイダのサポートメール

1. Firebase Console → **Authentication**
2. **Sign-in method**（ログイン方法）タブ
3. **Google** の行をクリック
4. **有効** にする（まだの場合）
5. **プロジェクトのサポートメール** のドロップダウンで、§3-1 と **同じメール** を選択
6. **保存**

### 3-3. 設定できたかの確認

- Firebase → プロジェクトの設定 → 全般 → サポートメールにアドレスが表示される
- Authentication → Google が **有効** で、サポートメールが表示される

---

## 4. OAuth 同意画面（Firebase が自動作成したものを使う場合）

Firebase で Google ログインを有効にすると、同じ Google Cloud プロジェクトに **OAuth クライアントと同意画面の骨組み** が自動作成されます。  
**同意画面をゼロから手動で新規作成する必要はありません。** 既存（自動作成）の画面を **開いて不足項目を埋める** だけで足ります。

### 4-1. Google Cloud Console を開く

次のどちらかで同じ画面に行けます。

**方法 A（Firebase から）**

1. Firebase Console → **Authentication** → **Sign-in method**
2. **Google** をクリック
3. 画面下部の **「Google Cloud Console で OAuth 同意画面を設定」** などのリンクをクリック

**方法 B（直接）**

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. 上部のプロジェクト選択で **`anniewalkinglog`**（番号 `468922569983`）を選択
3. 左メニュー → **API とサービス** → **OAuth 同意画面**

### 4-2. User type（ユーザーの種類）

| 種類 | いつ使うか |
|------|------------|
| **外部** | 一般ユーザー向けアプリ（AnnieWalkingLog はこちら） |
| 内部 | Google Workspace 組織内のみ |

初回は **外部** を選び、作成済みなら変更しないでください。

### 4-3. アプリ情報（必須項目を埋める）

**OAuth 同意画面** → **アプリ情報**（または「編集」）で次を確認・入力します。

| 項目 | 推奨値・注意 |
|------|----------------|
| **アプリ名** | ストア表示名に近い名前（例: `AnnieWalkingLog` または `アニーお散歩ログ`） |
| **ユーザーサポートメール** | §3 で設定したのと同じ運営メール |
| **アプリのロゴ** | 任意（なくてもログインは動くことが多い） |
| **アプリのホームページ** | 任意だが、本番公開時は設定推奨（例: `https://www.annie-works.com/`） |
| **アプリのプライバシーポリシーリンク** | **必須に近い** → `https://www.annie-works.com/jp/AnnieWalkingLog/Privacy-Policy` |
| **アプリの利用規約リンク** | 任意だが設定推奨 |
| **デベロッパーの連絡先情報** | 運営メール（Google からの通知先） |

入力後 **保存して続行**。

### 4-4. スコープ

**スコープ** 画面では、Google ログインに必要な範囲だけで足ります。

- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`
- `openid`

Firebase 自動構成では通常すでに付いています。**追加の機密スコープは不要**です（付けると審査が必要になります）。

### 4-5. テストユーザー（テストモードのとき必須）

**公開ステータス** が **テスト**（Testing）のとき:

- ログインできるのは **テストユーザーに追加した Google アカウントだけ** です
- それ以外のアカウントでログインすると「このアプリは Google で確認されていません」等が出ます

**手順**

1. OAuth 同意画面 → **対象**（または「テストユーザー」）
2. **+ ADD USERS**
3. ログイン試験に使う Gmail アドレスを追加（複数可）
4. 保存

**本番公開後**

- **本番環境に公開**（Publish app）の審査が通れば、テストユーザー以外もログイン可能になります
- ストア公開前でも、内部テスト用にテストユーザーを足す運用で問題ありません

### 4-6. 公開ステータス

| ステータス | 意味 |
|------------|------|
| **テスト** | テストユーザーのみ（開発・社内検証向け） |
| **本番** | 一般ユーザー向け（審査・プライバシーポリシー URL 等が必要） |

Play 内部テストや TestFlight 前の検証では **テスト + テストユーザー追加** で十分なことが多いです。

### 4-7. Firebase 自動作成を使うときの注意

- **新しい OAuth クライアント ID を自分で作らない**（Firebase / SHA-1 連携とズレる原因になる）
- 同意画面は **既存の `anniewalkinglog` プロジェクトのものを編集** する
- 変更は反映まで **数分〜最大で数時間** かかることがあります（通常は数分）

---

## 5. Android の SHA-1 を登録する（最重要）

Google ログイン（Android）では、**APK/AAB に署名した証明書の SHA-1** を Firebase に登録しないと、Android 用 OAuth クライアント（`client_type: 1`）が作られません。  
これが **12500 の最大要因** です。

### 5-1. どの SHA-1 が必要か

| ビルドの種類 | 登録すべき SHA-1 |
|--------------|------------------|
| ローカル `expo run:android` / debug APK | **デバッグ keystore** の SHA-1 |
| EAS Build（production / preview） | **EAS が管理する keystore** の SHA-1 |
| Google Play にアップロード後（Play App Signing 有効時） | **Play Console の「アプリ署名鍵」** の SHA-1 **も** 登録 |

Play ストア経由のビルドでは、**EAS の SHA-1 だけでは足りず、Play のアプリ署名鍵 SHA-1 も必要** なことがあります。**両方登録** してください。

### 5-2. デバッグ用 SHA-1（ローカル開発）

プロジェクトに `android/` がある場合:

```bash
cd android
./gradlew signingReport
```

Windows:

```bash
cd android
gradlew.bat signingReport
```

出力の **`Variant: debug`** → **`SHA1`** をコピーします。

`android/` が無い場合は、Android Studio または JDK の debug keystore から取得:

```bash
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### 5-3. EAS Build 用 SHA-1（リリース / 内部配布）

1. [expo.dev](https://expo.dev) にログイン
2. プロジェクト **AnnieWalkingLog** を開く
3. **Credentials** → **Android**
4. **Build credentials** → 使用中の **Keystore** を開く
5. **SHA-1 Certificate Fingerprint** をコピー

CLI で確認する場合（ログイン済み）:

```bash
eas credentials -p android
```

表示される keystore の SHA-1 をメモします。

### 5-4. Google Play のアプリ署名鍵 SHA-1（ストア配布時）

Play Console にアプリを登録済みの場合:

1. [Google Play Console](https://play.google.com/console/) を開く
2. **AnnieWalkingLog**（`com.annieworks.AnnieWalkingLog`）を選択
3. **設定** → **アプリの整合性**（App integrity）
4. **アプリ署名**（App signing）タブ
5. **アプリ署名鍵証明書**（App signing key certificate）の **SHA-1** をコピー  
   （**アップロード鍵** ではなく **アプリ署名鍵** 側）

### 5-5. Firebase に SHA-1 を登録する

1. Firebase Console → **プロジェクトの設定**（歯車）
2. **マイアプリ** タブ
3. Android アプリ **`com.annieworks.AnnieWalkingLog`** を選択
4. **フィンガープリント証明書**（SHA certificate fingerprints）までスクロール
5. **フィンガープリントを追加**
6. §5-2〜5-4 でコピーした SHA-1 を **1 本ずつ** 追加
   - デバッグ用（開発時）
   - EAS keystore 用（EAS で配った APK/AAB）
   - Play アプリ署名鍵用（Play 経由のインストール）
7. すべて追加したら **保存**

**形式の例**: `AA:BB:CC:DD:...`（コロン区切り 20 バイト）

### 5-6. 登録直後に必ず行うこと

SHA-1 を追加しただけでは、手元の `google-services.json` は自動では更新されません。

1. 同じ画面（マイアプリ → Android）で **google-services.json をダウンロード**
2. リポジトリ直下の [`google-services.json`](../google-services.json) を **上書き**
3. §2 の確認: `oauth_client` に **`client_type: 1`** が増えていること

増えない場合:

- SHA-1 の打ち間違い（`:` の抜け、全角文字）がないか再確認
- 5〜10 分待ってから JSON を再ダウンロード
- Firebase で Google プロバイダが有効か再確認

---

## 6. `GOOGLE_WEB_CLIENT_ID` の確認

Android ではネイティブ Google Sign-In のあと、Firebase に渡す **ID トークン取得用** に Web クライアント ID が必要です。

### 正しい値

`google-services.json` の **`client_type: 3`** の `client_id` と一致させます。

```
468922569983-mvvo9gv74tusogikcf3m79vptqk4si6t.apps.googleusercontent.com
```

### 設定場所

**ローカル** — プロジェクトルートの `.env`（Git 管理外）:

```env
GOOGLE_WEB_CLIENT_ID=468922569983-mvvo9gv74tusogikcf3m79vptqk4si6t.apps.googleusercontent.com
```

**EAS Build** — プロジェクト Secret:

```bash
eas secret:create --name GOOGLE_WEB_CLIENT_ID --value "468922569983-mvvo9gv74tusogikcf3m79vptqk4si6t.apps.googleusercontent.com" --scope project
```

既に Secret がある場合は `eas secret:delete` 後に作り直すか、Expo ダッシュボードから値を更新してください。

### よくある間違い

| 間違い | 結果 |
|--------|------|
| Android 用（`client_type: 1`）の ID を入れる | `auth/invalid-credential` 等 |
| iOS 用クライアント ID を入れる | 同上 |
| 古い JSON の Web ID のまま | 設定変更後に不整合 |

---

## 7. ネイティブアプリの再ビルド

コンソール設定と `google-services.json` の差し替えだけでは、**すでに端末に入っている APK/AAB は変わりません。** 必ず再ビルドしてください。

### 7-1. ファイルをコミット・同期

- 更新した `google-services.json` をリポジトリに反映（チームで共有する場合）

### 7-2. EAS Build（推奨）

```bash
# Android 本番
eas build --platform android --profile production

# 内部テスト用 APK
eas build --platform android --profile preview
```

### 7-3. ローカルビルド

```bash
npm install
npx expo prebuild
npx expo run:android
```

`prebuild` 後、`android/app/google-services.json` に新しい内容が入っているか確認してください。

### 7-4. 端末側

- 古いビルドをアンインストールしてから、新しい APK/AAB をインストール
- Play 内部テストの場合は、コンソールで新バージョンが配信されているか確認

---

## 8. 完了チェックリスト

すべて終えたら、順に確認します。

### コンソール

- [ ] Firebase プロジェクトの **サポートメール** 設定済み
- [ ] Authentication → **Google 有効** + サポートメール設定済み
- [ ] OAuth 同意画面: **アプリ名**・**ユーザーサポートメール**・**プライバシーポリシー URL** 入力済み
- [ ] テストモードの場合、ログインする Gmail を **テストユーザー** に追加済み
- [ ] Firebase Android アプリに **デバッグ / EAS / Play** の SHA-1 を登録済み

### ファイル

- [ ] `google-services.json` の `oauth_client` に **`client_type: 1` と `3` の両方** がある
- [ ] `.env` と EAS Secret の `GOOGLE_WEB_CLIENT_ID` が `client_type: 3` と一致

### ビルド・実機

- [ ] 上記変更 **後** に EAS Build または `expo run:android` で再ビルドした
- [ ] 新ビルドを端末にインストールした
- [ ] ログイン画面で Google アカウント選択まで進める

---

## 9. それでも 12500 が出る場合

| 確認項目 | 詳細 |
|----------|------|
| 別の SHA-1 で署名されていないか | Play が再署名しているのに Play の SHA-1 未登録 |
| テストユーザー | 同意画面がテストのままなら、ログイン Gmail がリストにあるか |
| 反映待ち | OAuth / SHA-1 変更後 10〜30 分待って再試行 |
| Google Play 開発者サービス | 端末で最新か、企業ポリシーで Google ログインがブロックされていないか |
| パッケージ名の一致 | Firebase の Android アプリが `com.annieworks.AnnieWalkingLog` と完全一致 |
| Web クライアント ID | `google-services.json` 更新後も `GOOGLE_WEB_CLIENT_ID` が type 3 と一致 |

**ログの取り方（開発者向け）**

Android の `adb logcat` で `GoogleSignIn` や `12500` を検索すると、Play 開発者サービス側の補足メッセージが出ることがあります。

---

## 10. 作業順序のまとめ（推奨）

1. §3 Firebase サポートメール（2 か所）
2. §4 OAuth 同意画面（自動作成済みのものを編集・テストユーザー）
3. §5 SHA-1 登録（デバッグ + EAS + Play）
4. §5-6 `google-services.json` 再ダウンロード → **`client_type: 1` があるか確認**
5. §6 `GOOGLE_WEB_CLIENT_ID` 確認
6. §7 再ビルド → 実機テスト

---

## 関連ドキュメント

- [GOOGLE_SIGN_IN.md](./GOOGLE_SIGN_IN.md) — Google ログイン全体の導入手順
- [APPLE_SIGN_IN.md](./APPLE_SIGN_IN.md) — Apple ログイン（別件）
