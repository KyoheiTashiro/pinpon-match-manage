# 卓ログ 仕様・設計ドキュメント

卓球の総当たり戦（リーグ戦）の対戦結果を管理するWebアプリ。シングルス/ダブルス両対応。データはブラウザのLocalStorageに保存。GitHub Pagesで無料ホスティング。

- 対象: 小規模大会・部活・サークル・社内交流戦・**シニア層中心の卓球サークル想定**
- 利用形態: 単一端末ローカル運用（マルチユーザー同期なし）
- オフライン動作: PWA対応・インストール可・完全オフライン動作
- UI方針: **高齢者向け視認性最優先**。大きな文字・高コントラスト・大きなタップ領域

---

## ドキュメント目次

### アーキテクチャ

- [tech-stack.md](architecture/tech-stack.md) — 技術スタック（HashRouter採用理由含む）
- [data-model.md](architecture/data-model.md) — データモデル・ロジック仕様
- [store.md](architecture/store.md) — ストア設計（useAppStore・スライス・永続化・migrate/merge）
- [directory-structure.md](architecture/directory-structure.md) — ディレクトリ構成

### デザイン

- [ui-guidelines.md](design/ui-guidelines.md) — UI/UX設計（高齢者向け視認性・タイポグラフィ・カラーパレット等）

### インフラ

- [pwa.md](infra/pwa.md) — PWA設計
- [deploy.md](infra/deploy.md) — デプロイ

### テスト

- [testing.md](testing.md) — テスト方針（Vitest・Storybook UIカタログ含む）

### 画面別仕様

- [features/home.md](features/home.md) — 大会一覧・新規作成
- [features/participants.md](features/participants.md) — 参加者管理
- [features/matrix.md](features/matrix.md) — マトリクス表・試合詳細・スコアボード
- [features/ranking.md](features/ranking.md) — 結果タブ（順位表・点数表）
- [features/result-graph.md](features/result-graph.md) — 点数進行グラフ
- [features/settings.md](features/settings.md) — 大会設定・リセット

---

## 機能要件（索引）

各画面の詳細仕様は `features/` 配下を参照。

- 大会管理（作成/切替/削除/全リセット） → [features/home.md](features/home.md)、[features/settings.md](features/settings.md)
- 参加者管理 → [features/participants.md](features/participants.md)
- 組合せ生成・試合詳細・マトリクス・スコアボード → [features/matrix.md](features/matrix.md)
- 点数進行グラフ（結果画面） → [features/result-graph.md](features/result-graph.md)
- 順位表 → [features/ranking.md](features/ranking.md)
- リセット → [features/settings.md](features/settings.md)

---

## 非機能要件

- 対応ブラウザ: 最新Chrome/Edge/Safari/Firefox
- レスポンシブ: スマホ縦持ち〜PC
- ストレージ上限: LocalStorage 5MB想定。1大会1MB未満を目標
- パフォーマンス: 参加者30名・全総当たり435試合まで動作
- アクセシビリティ: キーボード入力可・WCAG 2.1 **AAA準拠目標**（最低AA）
- PWA: ホーム画面追加可・初回ロード後オフライン全機能動作・更新時 自動再取得
- 視認性: 高齢者前提。本文最低18px・主要操作ボタン最低56px高・コントラスト比7:1以上

---

## 画面一覧

| #   | ルート                 | 画面                                                         |
| --- | ---------------------- | ------------------------------------------------------------ |
| 1   | `/#/`                  | [大会一覧・新規作成](features/home.md)                       |
| 2   | `/#/tournaments/:id`   | 大会ダッシュボード（タブ切替）                               |
| 2-a | タブ: 参加者           | [参加者管理](features/participants.md)                       |
| 2-b | タブ: 対戦表           | [マトリクス表](features/matrix.md)                           |
| 2-c | タブ: 結果（`result`） | [結果タブ — 点数表/グラフ サブタブ2つ](features/ranking.md)  |
| 2-d | タブ: 設定             | [大会設定・リセット](features/settings.md)                   |
| 3   | モーダル               | [試合詳細入力](features/matrix.md)                           |
| 4   | モーダル（ポータル）   | [スコアボード（試合進行中・横向き前提）](features/matrix.md) |

各画面のワイヤーは `features/` 配下参照。

---

## スコープ外（将来拡張）

- 認証・複数端末同期（Firebase等）
- トーナメント形式（敗者復活・ダブルエリミ）
- バックグラウンド同期・Push通知
- 試合動画リンク・写真添付
- CSV/JSONエクスポート（要望時に追加容易）
