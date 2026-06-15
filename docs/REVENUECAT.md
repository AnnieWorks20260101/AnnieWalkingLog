# RevenueCat 組み込み手順

Firebase 認証・家族単位プレミアム（`families.premiumExpiresAt`）との連携です。

## 概要

| 項目 | 内容 |
|------|------|
| SDK | `react-native-purchases` |
| 初期化 | アプリ起動時（`RevenueCatSync` → `configureRevenueCat`） |
| App User ID | **`familyId`**（1人加入で家族全員がプレミアム） |
| プレミアム判定 | Firestore `premiumExpiresAt` **または** RevenueCat エンタイトルメント |

> **Expo Go では実課金テスト不可**です。dev client / EAS Build が必要です。

---

## あなたが `.env` に設定する値

[`.env.example`](../.env.example) をコピーし、RevenueCat ダッシュボード → **Project → API keys → Public app-specific API keys** から取得:

| 環境変数 | 例の形式 |
|----------|----------|
| `REVENUECAT_API_KEY_IOS` | `appl_xxxxxxxx` |
| `REVENUECAT_API_KEY_ANDROID` | `goog_xxxxxxxx` |

**EAS Build** でも同じ値を Secret に登録してください:

```bash
eas secret:create --name REVENUECAT_API_KEY_IOS --value "appl_xxxx" --scope project
eas secret:create --name REVENUECAT_API_KEY_ANDROID --value "goog_xxxx" --scope project
```

---

## コード側で確認・更新する定数

[`src/constants/revenueCat.js`](../src/constants/revenueCat.js):

| 定数 | 説明 | デフォルト |
|------|------|------------|
| `REVENUECAT_ENTITLEMENT_ID` | RevenueCat の Entitlement 識別子 | `premium` |
| `REVENUECAT_OFFERING_ID` | Offering 識別子（購入 UI 用・後続） | `default` |

ダッシュボードの Entitlement 名が `premium` でなければ、定数を合わせてください。

---

## 実装済みファイル

| ファイル | 役割 |
|----------|------|
| `src/services/revenueCat.js` | configure / logIn(familyId) / logOut / エンタイトルメント判定 |
| `src/components/RevenueCatSync.js` | 起動時初期化 + ログイン後の family 紐づけ |
| `src/hooks/usePremium.js` | Firestore + RevenueCat の OR 判定 |
| `App.js` | `<RevenueCatSync />` を `AuthProvider` 内に配置 |

---

## ネイティブ再ビルド（必須）

`react-native-purchases` はネイティブモジュールのため、インストール後は **再ビルド** が必要です。

```bash
npm install
npx expo prebuild   # 必要に応じて
eas build --platform android --profile development
eas build --platform ios --profile development
```

ローカル:

```bash
npx expo run:android
npx expo run:ios
```

---

## 動作確認

1. `.env` に API キーを設定
2. 再ビルドした dev client で起動
3. 会員登録済みユーザーでログイン（`familyId` が取れる状態）
4. デバッグログに `[RevenueCat]` が出ること（`__DEV__` 時 DEBUG レベル）
5. RevenueCat ダッシュボード → **Customers** に `familyId` が App User ID として現れること

---

## 未実装（次のステップ）

- RevenueCat Webhook → Cloud Function → `families.premiumExpiresAt` 更新（家族全員への確実な同期）
- Paywall（`react-native-purchases-ui`）

## 購入 UI

[`src/screens/settings/PremiumScreen.js`](../src/screens/settings/PremiumScreen.js) で Offering `pro_offering` から月額・年額パッケージの購入、復元、利用規約・プライバシーポリシーへのリンクを表示します。

Firestore 手動テストは引き続き有効です（[PREMIUM_FIRESTORE.md](./PREMIUM_FIRESTORE.md)）。
