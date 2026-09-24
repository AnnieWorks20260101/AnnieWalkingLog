# CLAUDE.md

Claude Code（および同種のコーディングエージェント）向けの作業指針です。

## 概要

- **Annie Walking Log**（アニーのお散歩日記）: Expo / React Native のお散歩記録アプリ
- データは **家族単位**（Firestore `family_members` でスコープ）
- 主な機能: お散歩記録（GPS ルート）、うんち・カスタムピン、メモ、写真、履歴・グラフ、共有、プレミアム

## 技術スタック

- Expo SDK 54 / React Native / React Navigation
- Firebase（Auth / Firestore / Storage）
- i18n: `i18n-js` + `src/locales/*.json`
- 地図: `react-native-maps`
- 課金: `react-native-purchases`
- ローカルモジュール: `modules/expo-walk-tracking`

## ディレクトリ

| パス | 内容 |
|------|------|
| `src/screens/` | 画面（walk / record / settings / auth / pet など） |
| `src/components/` | UI コンポーネント |
| `src/services/` | Firestore 等のサービス層 |
| `src/contexts/` | テーマ・表示設定・お散歩設定など |
| `src/utils/` | 純関数ユーティリティ |
| `src/locales/` | 翻訳（**9言語**） |
| `src/dev/` | 開発・テスト用（本番 UI に混ぜない） |
| `firestore.rules` / `storage.rules` | セキュリティルール |
| `docs/` | 利用規約・プライバシーポリシー（多言語） |

## i18n

- 対象ロケール: `ja` `en` `de` `es` `fr` `it` `nl` `pt` `ko`
- UI 文言を追加・変更したら **9ファイルすべて**を更新する（欠落は `missing !xx.key!` になる）
- **`Alert.alert` の本文では `\n` による改行が効かない**（実機で確認済み）。改行や複数段落が必要ならモーダルを使う（例: `WalkDetailTipModal`）

## お散歩記録・共有（前提）

- 結果画面（`WalkDetailScreen`）でうんち・カスタムピンの追加・位置修正が可能（中央ピン + 地図移動）
- 多頭の場合、上部ペットチップでフィルター可能。うんち／カスタムマークには `petId` を付与。出会った人ピンは「すべて」表示時のみ
- お散歩中も「いま記録する犬」を切替可能（通知／Live Activity のボタンにも反映）
- 共有は画面丸ごとキャプチャではなく **`WalkSharePreviewModal`** でカード画像を生成してから OS 共有
- 共有時の開始・終了付近マスク: `src/utils/walkSharePrivacy.js` + 設定 `WalkPreferencesContext` の `sharePrivacyRadiusMeters`
- マスク距離のデフォルトは **隠さない（0m）**。選択肢は 0 / 100 / 200 / 300 / 400 / 500m（マイル表示時は切りのいい分数ラベル）
- お散歩中の通知／Live Activity の文字色は設定で変更可能（白・黒・緑・赤・青）。**次のお散歩開始から反映**

## Firestore / 権限

- walks / pets 等は **家族メンバーであること**が読み書きの前提
- アカウント削除時は `family_members` を消す**前に** walks / pets 等を削除する（ルールでブロックされる）
- ルール変更時は「誰がどのドキュメントを触れるか」を必ず確認する

## 変更の作法

- 依頼範囲以外のリファクタ・ファイル整理・ドキュメント追加はしない
- 既存の命名・スタイル・コンポーネント構成に合わせる
- シークレットをコミットしない（`.env`、`google-services.json`、`GoogleService-Info.plist`、鍵類など）
- **コミット・プッシュはユーザーが明示したときだけ**行う
- コミットメッセージは既存スタイルに合わせる: `vX.XX.XX 要約`（必要なら本文に補足）
- アプリバージョンは主に `app.json` の `expo.version`

## 触るときの注意

- 設定画面の開発用シード（`src/dev`）は本番向け文言・FAQ に残さない
- ネイティブ寄り変更（`modules/`、prebuild、EAS）は影響範囲を狭く保つ
- 地図・共有・権限まわりはシミュレータだけでは不足しがち。実機確認を前提にする

## よく触るファイル例

- お散歩詳細・共有: `src/screens/walk/WalkDetailScreen.js`, `src/components/walk/WalkSharePreviewModal.js`
- お散歩設定: `src/contexts/WalkPreferencesContext.js`, `src/screens/settings/SettingsScreen.js`
- FAQ: `src/screens/settings/FaqScreen.js`
