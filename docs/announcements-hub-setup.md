# Annie Works お知らせハブ — 設定の取得と死亡時スイッチ

## 1. そもそも何を作るか

| もの | 役割 |
|------|------|
| Firebase プロジェクト（例: `annieworks-announcements`） | 全 Annie Works アプリ共通のお知らせ置き場 |
| その中の **Web アプリ** | クライアントが接続するための API キー等を発行するため（実際に Web サイトを公開する必要はない） |
| `.env` の `EXPO_PUBLIC_ANNOUNCEMENTS_*` | 各スマホアプリがハブを読むための接続情報 |

アプリ固有の「新機能のお知らせ」はこれまでどおり **各アプリの Firebase**（Annie Walking Log なら `anniewalkinglog`）。  
**開発停止・死亡時など全体向け**だけハブに置く。

---

## 2. Web アプリ追加 → 設定値の取得手順

### 2-1. ハブ用プロジェクトを作る

1. [Firebase Console](https://console.firebase.google.com/) を開く  
2. **プロジェクトを追加**（名前例: `annieworks-announcements`）  
3. Google Analytics は任意（お知らせだけならオフでも可）  
4. 作成後、**Firestore Database** を作成（本番モードで開始 → 後でルールをデプロイ）

### 2-2. Web アプリを登録する（設定値を出すため）

1. プロジェクトのホームで、アプリ追加のアイコン **`</>`（ウェブ）** をクリック  
2. アプリのニックネーム例: `announcements-client`  
3. 「このアプリの Firebase Hosting も設定する」は **不要（チェックしない）**  
4. **アプリを登録** を押す  

すると、次のような `firebaseConfig` が表示されます。

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "annieworks-announcements.firebaseapp.com",
  projectId: "annieworks-announcements",
  storageBucket: "annieworks-announcements.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef..."
};
```

これを `.env` に対応づけます。

| firebaseConfig のキー | `.env` に書く名前 |
|----------------------|-------------------|
| `apiKey` | `EXPO_PUBLIC_ANNOUNCEMENTS_API_KEY` |
| `projectId` | `EXPO_PUBLIC_ANNOUNCEMENTS_PROJECT_ID` |
| `appId` | `EXPO_PUBLIC_ANNOUNCEMENTS_APP_ID` |
| `authDomain` | `EXPO_PUBLIC_ANNOUNCEMENTS_AUTH_DOMAIN`（省略可。未設定なら `projectId.firebaseapp.com`） |
| `storageBucket` | `EXPO_PUBLIC_ANNOUNCEMENTS_STORAGE_BUCKET`（省略可） |
| `messagingSenderId` | `EXPO_PUBLIC_ANNOUNCEMENTS_MESSAGING_SENDER_ID`（省略可） |

**あとから見たい場合**

1. 歯車 → **プロジェクトの設定**  
2. 「マイアプリ」で、先ほど作った **Web アプリ** を選択  
3. 「SDK の設定と構成」→ **構成** で同じ JSON を再表示  

※ Android / iOS アプリをハブに追加する必要はありません。Web の設定だけで十分です。

### 2-3. ルールをデプロイ

このリポジトリ（または他 Annie Works アプリ）で:

```bash
npx firebase-tools login --reauth
npx firebase-tools deploy --only firestore:rules --config firebase.announcements-hub.json --project <ハブのprojectId>
```

### 2-4. 各アプリの `.env` に貼る

Annie Walking Log（および他の Annie Works アプリ）の `.env` に同じ値を入れる。  
入れないと、全体お知らせは当面 `anniewalkinglog` プロジェクトへフォールバックします。

---

## 2-5. Walking Log 固有: `startsOn` 以降は新規課金を停止

Docs の基本仕様に加え、Walking Log では **`startsOn` 到来後（shutdown が表示可能になった時点）** から:

- プレミアムの **新規購入ボタンを非表示**
- 「新規の購入は受け付けていません。すでにご購入済みの場合は「購入の復元」をご利用ください。」を表示
- **購入の復元**は引き続き利用可能

`blocksOn` まではアプリ自体は使えます（通知は閉じられる）。`blocksOn` 以降はブロッキング表示になります。

---

## 3. 死亡時・全体停止のお知らせ（第三者なし・日付で自動）

**Cloud Functions や人手の当日操作は不要**です。

仕組み（日付は2つ）:

| フィールド | 意味 |
|------------|------|
| `startsOn` | **通知の表示開始日**（この日からダイアログが出る。閉じればアプリは使える） |
| `blocksOn` | **ブロック開始日**（この日 0:00 JST 以降は閉じられずアプリ利用不可） |

- Firestore にドキュメントを **あらかじめ** 置いておく  
- `active: true` のまま  
- アプリ起動時に端末の日付で判定（Cloud Function 不要）  

年次の「予定停止日」をずらすときは、主に `blocksOn`（と文面）を Console で更新すればよいです。

### 推奨ドキュメント例（ハブの `announcements` コレクション）

ドキュメント ID 例: `org-shutdown`

```json
{
  "active": true,
  "scope": "global",
  "kind": "shutdown",
  "priority": 1000,
  "startsOn": "2026-09-10",
  "blocksOn": "2028-04-01",
  "titles": {
    "ja": "【重要】サービス終了のお知らせ",
    "en": "Service discontinuation notice"
  },
  "bodies": {
    "ja": "誠に勝手ながら、作者急逝のためサーバーを停止予定です。アプリのデータを保存して類似アプリ等への移行をお願いいたします。",
    "en": "Due to the author's passing, this service is scheduled to shut down. Please export your data and migrate."
  }
}
```

`blocking` は不要です（`blocksOn` がある場合はそちらが優先）。  
即時ブロックしたいときだけ `blocksOn` なし + `blocking: true`。

### Console での作り方

1. ハブプロジェクト → Firestore → コレクション開始 `announcements`  
2. ドキュメント ID を指定（または自動 ID）  
3. フィールドを上記どおり追加  
   - `active` : boolean `true`  
   - `scope` : string `global`  
   - `kind` : string `shutdown`  
   - `priority` : number / int64 `1000`  
   - `startsOn` : string `YYYY-MM-DD`（通知投稿・表示開始日）  
   - `blocksOn` : string `YYYY-MM-DD`（利用停止日）  
   - `titles` : map  
   - `bodies` : map  

- `startsOn` より前 → 何も出ない  
- `startsOn` 〜 `blocksOn` 前日 → 通知（OK で閉じられる）  
- `blocksOn` 当日 0:00 JST 以降 → ブロッキング（閉じられない）  

### 注意

- 発動は **ユーザー端末の時計** 基準です（一般ユーザー向けの停止告知用途では実用上十分なことが多いです）  
- 当日にネット不通だと取得できません（次回オンライン時に表示）  
- メッセージ本文を秘密にはできません（クライアントが読む公開データのため）。内容は「公表してよい停止文」にしてください  

---

## 4. アプリ固有の新機能お知らせ（参考）

こちらは **Annie Walking Log の Firebase**（`anniewalkinglog`）の `announcements` に置きます。

```json
{
  "active": true,
  "scope": "app",
  "kind": "feature",
  "blocking": false,
  "appIds": ["anniewalkinglog"],
  "targetAppVersion": "1.04.00",
  "priority": 10,
  "startsOn": "2026-09-10",
  "titles": { "ja": "アップデートのお知らせ", "en": "What's new" },
  "bodies": { "ja": "…", "en": "…" }
}
```
