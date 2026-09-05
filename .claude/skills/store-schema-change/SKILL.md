---
name: store-schema-change
description: src/store/types.ts / schema.ts / slices/*.ts を変更するとき、または永続化データ（AppState）にフィールドを追加・削除・改名するときに使う。migrate 追加と STORAGE_VERSION インクリメントを含む手順で、既存ユーザーの LocalStorage データを壊さずにスキーマを変更する。
---

# 永続化スキーマの変更手順

`AppState` の構造を変えると、既存端末の LocalStorage に残る旧データが読めなくなる。単一端末ローカル運用でサーバ側の復旧手段がないため、**migrate を欠くとユーザーの大会データが消える**。

仕様の詳細は [docs/architecture/store.md](../../../docs/architecture/store.md) と [docs/architecture/data-model.md](../../../docs/architecture/data-model.md)。本 skill は手順のみ扱う。

## 適用範囲

永続化対象（`useAppStore.ts` の `partialize`）に含まれるものを変える場合に必須。

- `tournaments` / `participants` / `matches` / `currentTournamentId` / `fontSize` / `matchesView`

`partialize` 外の状態・アクションのシグネチャ変更のみなら、手順 3〜5 は不要。

## 手順

### 1. 型を変更する（真実源）

`src/store/types.ts` を変更する。ここが型の真実源。`z.infer` を型の源にしない。

### 2. zod スキーマを追従させる

`src/store/schema.ts` を型に合わせる。`AssertEqual` により構造がズレるとビルド時に型エラーになる → `npx tsc --noEmit` で確認。

### 3. migrate を追加する

`src/store/useAppStore.ts`:

- `migrateVNToVN+1: Migration` を追加（N = 現 `STORAGE_VERSION`）。旧データに欠けるフィールドを補完する
- 入力は `Record<string, unknown>`。完全な型を返す必要はない（後段の `merge` が `safeParse` + サニタイズで型保証する）
- `isRecord` で入口ガードしてから触る
- `migrations` テーブルに `N: migrateVNToVN+1` を登録（キー = 変換元バージョン）

### 4. STORAGE_VERSION をインクリメントする

`src/constants/storage.ts` の `STORAGE_VERSION` を +1。`STORAGE_KEY` は変えない（変えると旧データを読みに行かなくなる）。

### 5. 永続化・サルベージ経路を更新する

`src/store/useAppStore.ts`:

- `partialize` に新フィールドを追加（漏らすと保存されない）
- `salvageAppState` に個別検証とフォールバックを追加。スカラーは有効値判定 + `current` へフォールバック、レコードは1エントリずつ `safeParse`
- 参照整合が絡むフィールドなら `sanitizeAppState` にも追加（dangling 参照の除去）

### 6. テストを追加する

- `src/store/useAppStore.test.ts` — 旧バージョンの persisted から migrate して新フィールドが入ること
- `src/store/merge.test.ts` — 新フィールドが壊れた値のときフォールバックすること
- 該当スライスを変えたなら `src/store/slices/*.test.ts`
- `src/store/**` はカバレッジゲート対象（lines 95 / functions 95 / branches 88 / statements 95）

### 7. docs を更新する

[docs/architecture/store.md](../../../docs/architecture/store.md) の「永続化」節（`version` の値・migrate 一覧・`partialize` 対象）と、型を変えたなら [docs/architecture/data-model.md](../../../docs/architecture/data-model.md) のデータモデル。

## 確認

```bash
npm run lint:typed && npm run format:check && npm test
```

旧バージョンからの読み込みは手作業でも確認できる。DevTools で `localStorage` の `pinpon-match-manage:v1` の `version` を旧値に書き換えてリロードし、データが残ることを見る。
