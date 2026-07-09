# ストア設計（useAppStore）

親: [README.md](../README.md) ／ 関連: [data-model.md](data-model.md)（型定義の真実源）

アプリ全状態を保持する zustand ストア。実装: `src/store/useAppStore.ts`。

## 全体像

```
useAppStore = create<StoreState>()(
  persist(                       // ← LocalStorage 永続化・migrate・merge
    immer(                       // ← set 内でミュータブル記法（Immer ドラフト）
      (...) => ({ ...4スライス合成 })
    ),
    { name, version, partialize, migrate, merge }
  )
)
```

- ミドルウェア順: `persist(immer(...))`。`immer` が内側 → スライスの `set` は Immer ドラフトを直接変更できる。
- 単一ストア。Context Provider 不要。コンポーネントは `useAppStore(selector)` で購読。
- 永続化は LocalStorage のみ（サーバ同期なし）。単一端末ローカル運用。

## スライス構成

`StoreState = UiSlice & TournamentSlice & ParticipantSlice & MatchSlice`。各スライスは `StateCreator` で定義し、ルートで合成。

| スライス           | 状態                                 | アクション                                                                                                             | 実装                         |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `uiSlice`          | `fontSize`, `matchesView`            | `setFontSize`, `setMatchesView`                                                                                        | `slices/uiSlice.ts`          |
| `tournamentSlice`  | `tournaments`, `currentTournamentId` | `createTournament` / `updateTournament` / `deleteTournament` / `setCurrentTournament` / `resetTournament` / `resetAll` | `slices/tournamentSlice.ts`  |
| `participantSlice` | `participants`                       | `addParticipant` / `addParticipants` / `updateParticipant` / `removeParticipant`                                       | `slices/participantSlice.ts` |
| `matchSlice`       | `matches`                            | `addManualMatch` / `updateMatch` / `deleteMatch`                                                                       | `slices/matchSlice.ts`       |

- スライスは互いの状態へ `StoreState` 経由で到達可能（`set` は全ストアのドラフト、`get()` は全状態）。例: `addParticipant` は `participantSlice` だが `tournaments[id].participantIds` も更新。
- スライス内では `state.xxx[id] = ...` / `delete state.xxx[id]` の破壊的記法を使用（Immer が不変更新へ変換）。

## アクション仕様（カスケード・整合性）

データ整合は各アクションが手続き的に維持。参照を壊さない設計。

- `createTournament(name, format, date, bestOf)` → `id` 採番、`tournaments[id]` 追加、`currentTournamentId` を新 id へ。`createdAt = now()`、`participantIds: []`。
- `deleteTournament(id)` → 配下 `matches`（`tournamentId === id`）と `participantIds` の各 `participant` を**カスケード削除**。`currentTournamentId === id` なら `null`。
- `resetTournament(id)` → 配下 `matches` のみ削除。参加者・大会は残す（再戦用）。
- `resetAll()` → 3スライスを初期値へ一括リセット（`Object.assign(state, tournamentInitial, participantInitial, matchInitial)`）。`fontSize` は維持。
- `addParticipant(tournamentId, name, affiliation?)` → `name.trim()`。`participants[id]` 追加 + 親 `participantIds.push(id)`。対象大会が無ければ no-op。
- `addParticipants(tournamentId, names)` → 複数名を一括追加。各 `name` を `trim()` し、空文字・既存名（重複）はスキップ。対象大会が無ければ no-op。
- `removeParticipant(tournamentId, id)` → 当該 participant 削除 + その参加者が絡む `matches` を**カスケード削除**（single/pair 双方を判定）+ `participantIds` から除去。
- `addManualMatch(tournamentId, left, right)` → **シングルス同士は重複ガード**: 同一2人（左右入替含む）の既存試合があれば新規作成せず既存 `id` を返す。新規時 `games: []`・`firstServer: SIDE.LEFT`。
- `updateTournament` / `updateParticipant` / `updateMatch` → 対象が無ければ no-op。`Object.assign` でパッチ。`updateParticipant` は `name` を常に `trim()`。

カスケード対象一覧:

- 大会削除 → matches + participants 削除
- 参加者削除 → 当該参加者を含む matches 削除
- 試合削除 → 当該 match のみ（被参照なし）

## 永続化（zustand persist）

- ストアキー（`name`）: `pinpon-match-manage:v1`（`STORAGE_KEY`）
- スキーマ `version`: `3`（`STORAGE_VERSION`）。両定数 `src/constants/storage.ts`。
- `partialize`: 永続化対象は `tournaments` / `participants` / `matches` / `currentTournamentId` / `fontSize` / `matchesView` のみ。アクション関数や派生値は保存しない。
- 読込パイプライン: LocalStorage → `migrate`（バージョン変換）→ `merge`（検証・サニタイズ・結合）→ ストア。

### migrate

`migratePersistedState(persisted, fromVersion)`:

- `migrations: Record<number, Migration>` は「version N → N+1」の単一ステップ変換テーブル（キー = 変換元バージョン）。
- `fromVersion` から `STORAGE_VERSION` まで該当ステップを順に適用。未登録バージョンはスキップ（恒等）。
- 完全な型を返す必要なし → 後段の `merge`（`safeParse` + サニタイズ）が型保証する。
- v1→v2 (`migrateV1ToV2`): 各 `Tournament` に `bestOf` 補完（v1 は5ゲーム制固定 → `bestOf ?? 5`）。
- v2→v3 (`migrateV2ToV3`): `matchesView` を補完（v2 以前はマトリクス表示固定 → `matchesView ?? MATRIX`）。

将来スキーマ変更時: `migrateVNToVN+1` を追加 → `migrations` に登録 → `STORAGE_VERSION` をインクリメント。

### merge（サルベージ戦略）

`merge(persisted, current)` は壊れたデータを全捨てせず可能な限り救う3段構え:

1. **ハッピーパス**: `appStateSchema.safeParse(persisted)` 成功 → `sanitizeAppState` で参照整合修復 → `current` に結合。
2. **部分破損**: パース失敗かつ persisted がオブジェクト → `salvageAppState`。`tournaments`/`participants`/`matches` を**1エントリずつ**各エンティティスキーマで `safeParse`、成功分のみ保持。`currentTournamentId`（`string | null`）・`fontSize` / `matchesView`（有効列挙値か）も個別検証しフォールバック。最後に `sanitizeAppState`。
3. **最終手段**: persisted がオブジェクトですらない（null / 配列 / プリミティブ）→ `current`（空初期状態）を返す。

`isRecord(value)`: 配列・null を除外した「プレーンなレコード」型述語。migrate / salvage の入口ガード。

### スキーマと型の真実源

- 型の真実源は `src/store/types.ts`（`AppState` ほか）。
- 検証スキーマは `src/store/schema.ts`（zod）。`appStateSchema` の `z.infer` が `AppState` と構造一致することを**ビルド時に型レベルで強制**（`AssertEqual` ヘルパ。ズレたら型エラー）。
- `sanitizeAppState(state)`: 参照整合性の純粋関数。
  - `participantIds` の dangling 参照除去
  - 所属 tournament 不在の match / participant 除去
  - `currentTournamentId` が無効なら `null`
  - migrate / merge / salvage の各経路が最終的に通る整合ゲート。

## 派生（永続化しない）

ストアに置かず導出する値:

- 大会所属 match: `matchesOf(matches, tournamentId)`（`src/store/selectors.ts`）。`Tournament` は match の配列を持たず `Match.tournamentId`（FK）から導出。挿入順 = `matches` レコードのキー順。
- 過去参加者名一覧: `pastParticipantNamesOf(participants, currentTournamentId)`（`src/store/selectors.ts`）。現在の大会以外の参加者名を trim・重複除去・名前順ソートして返す（過去参加者一括追加機能用）。
- 試合進行状態・勝敗: `matchSummary(games, winsNeeded)`（`src/domain/match.ts`）。
- 順位: [features/ranking-overall.md](../features/ranking-overall.md) 参照。

## テスト

- `useAppStore.test.ts` — アクション・カスケード・migrate / salvage
- `merge.test.ts` — merge 3段構えのサルベージ挙動
- `slices/*.test.ts` — スライス単体
- `selectors.test.ts` — 導出ロジック
