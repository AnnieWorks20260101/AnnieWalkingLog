# プレミアム（家族単位）— Firestore

## フィールド

`families/{familyId}` に次を設定します。

| フィールド | 型 | 説明 |
|------------|-----|------|
| `premiumExpiresAt` | Timestamp | この日時より後ならプレミアム有効 |

アプリは [usePremium.js](../src/hooks/usePremium.js) で `onSnapshot` 購読しています。

## テスト

Firebase Console で `premiumExpiresAt` を未来の日時に設定すると、その家族コードの全員がプレミアム扱いになります。

## 本番（Phase 2）

- RevenueCat / ストア課金の Webhook → Cloud Function で `premiumExpiresAt` を更新
- `storage.rules` を Console にデプロイ（[storage.rules](../storage.rules)）
- 無料プラン用の walks クエリ（1年フィルタ）には複合インデックスが必要な場合があります → [firestore.indexes.json](../firestore.indexes.json) を `firebase deploy --only firestore:indexes`
