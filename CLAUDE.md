# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

卓ログ — 卓球の総当たり戦（リーグ戦）の対戦結果を管理するWebアプリ。シングルス/ダブルス両対応・LocalStorage保存・PWA・GitHub Pages ホスティング。単一端末ローカル運用（サーバ同期なし）。

## コマンド

```bash
npm run dev            # 開発サーバ (vite)
npm run dev:seed       # シードデータ投入で起動 (VITE_SEED=1)
npm run build          # tsc --noEmit → vite build (dist/)
npm test               # vitest run（全テスト）
npm run test:watch     # ウォッチ
npm run test:coverage  # カバレッジ（ロジック層に閾値ゲートあり）
npm run lint           # oxlint
npm run lint:typed     # oxlint --type-aware（CI と同じ・型情報込み）
npm run format:check   # oxfmt --check（CI と同じ）
npm run format         # oxfmt（整形適用）
npm run storybook      # Storybook (port 6006)
```

単一テスト実行: `npx vitest run src/domain/match.test.ts` / 名前で絞る: `npx vitest run -t "ゲーム勝敗"`。

Lint/Format は ESLint/Prettier ではなく **oxlint + oxfmt**。CI 相当チェックは `npm run lint:typed && npm run format:check && npm test`。pre-commit で lint-staged（`.lintstagedrc.mjs`）が走る。

## アーキテクチャ

設計の真実源は `docs/` に集約（**実装変更時は対応 docs の更新も検討**）。要点:

- **状態管理**: 単一 zustand ストア `src/store/useAppStore.ts`。ミドルウェア順 `persist(immer(...))` → スライスの `set` は Immer ドラフトを直接破壊的に変更（`state.x[id] = ...` / `delete state.x[id]`）。Context Provider なし、`useAppStore(selector)` で購読。4スライス合成（ui / tournament / participant / match）。詳細 → `docs/architecture/store.md`。
- **正規化と FK 導出**: `Tournament` は試合配列を持たない。所属試合は `Match.tournamentId`（FK）から `selectors.ts` の `matchesOf(matches, tournamentId)` で導出。`participantIds` のみ順序保持の正規化例外。試合進行状態・勝敗・順位は**永続化せず**純粋関数で派生。
- **永続化の堅牢化**: 読込は LocalStorage → `migrate`（version N→N+1 の単一ステップ変換テーブル）→ `merge`（3段サルベージ: 全体パース成功 / エンティティ単位 safeParse で部分救済 / 最終手段は空状態）→ `sanitizeAppState`（dangling 参照除去・整合ゲート）。型の真実源 `store/types.ts`、検証 zod は `store/schema.ts`（`AssertEqual` で両者の構造一致をビルド時強制）。スキーマ変更時は migrate 追加 + `STORAGE_VERSION` インクリメント。
- **ドメインロジック**: `src/domain/` は純粋関数のみ（`match` / `matchGames` / `ranking` / `scoreProgress` / `side`）。卓球ルール（`isGameFinished`: ≥11 かつ 2点差、`winsNeeded = floor(bestOf/2)+1` で 3/5/7 ゲームマッチ可変）。データモデルとロジック仕様 → `docs/architecture/data-model.md`。
- **feature 構成パターン**: `src/features/**/` は原則 `index.tsx`（薄いビュー）+ `hooks.ts`（ロジック）+ `schema.ts`（React Hook Form 用 zod）+ `components/`。ロジックは hooks に寄せ index.tsx は薄く保つ。
- **ルーティング**: `main.tsx` の `HashRouter`（GH Pages がパスフォールバック不可のため hash 必須）。ルート定義 `App.tsx`（`/` 大会一覧、`/tournaments/:tournamentId` 配下に participants / matches / result / settings タブ）。
- **共通 UI**: `src/components/ui/<Name>/` はサブディレクトリ + barrel。各々 `*.stories.tsx` を colocate。

## テスト方針

- 環境は **jsdom 単一**（node 環境だと zustand persist が localStorage 不在で警告するため統一）。
- **domain 層は property-based test（`*.proptest.test.ts`）必須**（fast-check）。component は Testing Library。
- ヘルパは `src/test/`: `renderWithStore`（MemoryRouter で囲む）/ `seedStore` / `setupStoreIsolation`（各ファイル `beforeEach` で `resetAll()` + `localStorage.clear()`）/ `arbitraries.ts`。
- カバレッジは**ラチェット方式**: `vitest.config.ts` の `thresholds` でロジック層（domain / store / utils）のみ厳格ゲート。`.tsx` は重要部のみで全体ゲートしない。実測が上がったら閾値を引き上げる。詳細 → `docs/testing.md`。

## プロダクト制約

- 想定ユーザーは**シニア層中心の卓球サークル**。UI は高齢者向け視認性最優先（本文最低18px・主要操作ボタン最低56px高・コントラスト比4.5:1以上、色のみに依存しない）。WCAG 2.1 AA 目標。設計 → `docs/design/ui-guidelines.md`。
- 完全オフライン動作（PWA・`vite-plugin-pwa`・autoUpdate）。Storybook ビルドからは PWA プラグイン除外。

## このリポジトリの自動チェック

`.claude/hooks/` に2つのフックを登録済み（`.claude/settings.local.json`）:

- **post-edit-reminder.sh**（PostToolUse Write|Edit）: `src/` 編集時に「対応 docs の更新」「stories/test の追加検討」をリマインドする（test/stories/`.d.ts` は対象外）。
- **stop-ci-check.sh**（Stop）: 作業終了時に変更があれば `lint:typed → format:check → test` を実行し、失敗したら差し戻す。これらが通る状態で終えること。
