# CLAUDE.md

卓ログ — 卓球の総当たり戦（リーグ戦）の対戦結果を管理するWebアプリ。シングルス/ダブルス両対応・LocalStorage保存・PWA・GitHub Pages ホスティング。単一端末ローカル運用（サーバ同期なし）。

## コーディング規約

**コード追加・変更前に必ず `docs/coding-standards.md` を参照**。命名・ディレクトリ構成・型（`type`採用/`interface`不使用）・React（アロー+named export）・状態管理（Immer破壊的変更/細粒度 selector）・import（`@/`絶対パス）・テスト・コメント言語（日本語、コミットのみ英語）の慣習を集約。本ファイルと重複する要点は規約書が詳細版。

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

## ドキュメント

設計の真実源は `docs/` に集約。**実装変更時は対応 docs の更新も検討**。目次 → [docs/README.md](docs/README.md)。

- [coding-standards.md](docs/coding-standards.md) — コーディング規約
- [architecture/store.md](docs/architecture/store.md) — ストア設計（zustand・スライス・永続化・migrate/merge）
- [architecture/data-model.md](docs/architecture/data-model.md) — データモデル・ドメインロジック仕様
- [architecture/directory-structure.md](docs/architecture/directory-structure.md) — ディレクトリ/feature 構成
- [architecture/tech-stack.md](docs/architecture/tech-stack.md) — 技術スタック（HashRouter 採用理由含む）
- [design/ui-guidelines.md](docs/design/ui-guidelines.md) — UI/UX（高齢者向け視認性）
- [infra/pwa.md](docs/infra/pwa.md) / [infra/deploy.md](docs/infra/deploy.md) — PWA・デプロイ
- [testing.md](docs/testing.md) — テスト方針

## アーキテクチャ要点

実装時に踏みやすい不変条件のみ抜粋。詳細は上記 docs。

- **状態管理**: 単一 zustand ストア `src/store/useAppStore.ts`、`persist(immer(...))`。`set` は Immer ドラフトを破壊的変更（`state.x[id] = ...` / `delete state.x[id]`）。`useAppStore(selector)` で購読。→ store.md
- **正規化と FK 導出**: `Tournament` は試合配列を持たない。所属試合は `Match.tournamentId` から `selectors.matchesOf` で導出。試合進行・勝敗・順位は**永続化せず**純関数で派生。→ data-model.md
- **永続化の不変条件**: 型の真実源 `store/types.ts`、zod は `store/schema.ts`（`AssertEqual` で構造一致をビルド時強制）。**スキーマ変更時は migrate 追加 + `STORAGE_VERSION` インクリメント**必須。→ store.md
- **ドメイン**: `src/domain/` は純関数のみ。卓球ルール（`isGameFinished`: ≥11 かつ 2点差、`winsNeeded = floor(bestOf/2)+1`）。→ data-model.md
- **ルーティング**: `HashRouter`（GH Pages のパスフォールバック不可のため hash 必須）。→ tech-stack.md
- **テスト**: jsdom 単一環境。**domain 層は proptest 必須**（fast-check）。カバレッジはラチェット方式。→ testing.md
- **プロダクト制約**: シニア層中心、高齢者向け視認性最優先（本文≥18px・主要ボタン≥56px高・コントラスト≥4.5:1・色のみに依存しない、WCAG 2.1 AA 目標）。完全オフライン（PWA autoUpdate）。→ ui-guidelines.md / pwa.md

## このリポジトリの自動チェック

`.claude/hooks/` に2つのフックを登録済み（`.claude/settings.local.json`）:

- **post-edit-reminder.sh**（PostToolUse Write|Edit）: `src/` 編集時に「対応 docs の更新」「stories/test の追加検討」をリマインドする（test/stories/`.d.ts` は対象外）。
- **stop-ci-check.sh**（Stop）: 作業終了時に変更があれば `lint:typed → format:check → test` を実行し、失敗したら差し戻す。これらが通る状態で終えること。
