# 技術スタック

親: [README.md](../README.md)

| 項目         | 採用                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| フロント     | React 19 + TypeScript                                                       |
| ビルド       | Vite 5                                                                      |
| ルーティング | React Router v6 (`HashRouter` — GH Pages対応)                               |
| 状態管理     | Zustand v5 + `immer` ミドルウェア + `persist`（LocalStorage永続化）         |
| フォーム     | React Hook Form + Zod（`@hookform/resolvers/zod`）                          |
| スタイル     | Tailwind CSS v3                                                             |
| 画像出力     | `html-to-image`（対戦表・点数表・グラフの画像保存）                         |
| 永続化       | LocalStorage（zustand persist・キー `pinpon-match-manage:v1`・version 2）   |
| ホスティング | GitHub Pages（base path `/pinpon-match-manage/`）                           |
| CI           | GitHub Actions（push時 build → GitHub Pages deploy）                        |
| PWA          | `vite-plugin-pwa`（Workbox ベース・自動SW生成・manifest生成・`autoUpdate`） |
| Lint/Format  | oxlint + oxfmt                                                              |
| テスト       | Vitest（ドメインのユニットテストのみ。Testing Library は未導入）            |

## HashRouter採用理由

GH Pagesは任意パスへのフォールバック設定不可 → SPAルーティングはhashベースが安全。
