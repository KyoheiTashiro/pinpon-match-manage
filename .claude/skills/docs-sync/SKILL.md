---
name: docs-sync
description: src/ 配下の実装を変更した後、コミット前に使う。変更したパスから更新すべき docs/ を対応表で特定し、更新が必要かどうかを判断する。「docs の更新も検討」というリマインダーを受けたときもこれに従う。
---

# 実装変更 → docs 同期

設計の真実源は `docs/`。実装だけ変えて docs を放置すると、次の作業で docs を信じたまま誤った前提で書くことになる。

## 手順

1. `git --no-pager diff --stat` で変更パスを出す
2. 下の対応表で候補 docs を引く
3. 「更新不要の基準」に照らして落とす
4. 残った docs を、実装後の**現在の事実の肯定形**で書き直す

## 対応表

| 変更パス                                                             | 候補 docs                                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/domain/*.ts`（型・ルール）                                      | `docs/architecture/data-model.md`                                                                            |
| `src/domain/ranking.ts`                                              | + `docs/features/ranking-overall.md`（順位算出ロジック）                                                     |
| `src/domain/scoreProgress.ts`                                        | + `docs/features/result-graph.md`                                                                            |
| `src/store/**`                                                       | `docs/architecture/store.md`（型変更なら + `data-model.md`）→ 永続化構造の変更は `store-schema-change` skill |
| `src/features/home/**`                                               | `docs/features/home.md`                                                                                      |
| `src/features/tournament/participants/**`                            | `docs/features/participants.md`                                                                              |
| `src/features/tournament/matches/**`, `scoreboard/**`                | `docs/features/matches.md`                                                                                   |
| `src/features/tournament/result/**`                                  | `docs/features/ranking-overall.md` / `ranking-personal.md` / `result-graph.md` のうち該当サブタブ            |
| `src/features/tournament/settings/**`                                | `docs/features/settings.md`                                                                                  |
| `src/components/ui/**`, `src/styles/index.css`, `tailwind.config.js` | `docs/design/ui-guidelines.md`（サイズ・色・タイポのトークンを変えた場合のみ）                               |
| ディレクトリ追加・ファイル移動・feature 追加                         | `docs/architecture/directory-structure.md`                                                                   |
| `src/constants/routes.ts`, `App.tsx` のルート                        | `docs/README.md` の画面一覧 + `docs/architecture/tech-stack.md`                                              |
| `vite.config.ts` の PWA 設定, `public/`                              | `docs/infra/pwa.md`                                                                                          |
| `.github/workflows/**`                                               | `docs/infra/deploy.md`                                                                                       |
| `vitest.config.ts`（閾値・除外）, `src/test/**`, `vitest.setup.ts`   | `docs/testing.md`                                                                                            |
| 命名・型・React の書き方そのものを変えた                             | `docs/coding-standards.md`                                                                                   |
| ライブラリ追加・削除                                                 | `docs/architecture/tech-stack.md`                                                                            |

## 更新不要の基準

以下は docs を触らない。

- 外から見た振る舞いが変わらない内部リファクタ（関数分割・変数名変更・ファイル移動を伴わない整理）
- docs に書かれていない実装詳細（内部ヘルパ・ローカル state の持ち方）
- docs 記載の仕様どおりに戻すだけのバグ修正
- テスト・stories の追加のみ

## 書き方

- 日本語。現在の事実の肯定形のみ書く
- **過去の設計を否定する記述を書かない**（「以前は〜だったが」「〜は廃止」等）。変更後の姿だけを書く
- 対応表にない新しい概念を足したなら、`docs/README.md` の目次にも 1 行足す
