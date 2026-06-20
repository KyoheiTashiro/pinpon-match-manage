# 技術スタック

親: [README.md](../README.md)

| 項目         | 採用                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| フロント     | React 19 + TypeScript                                                                                |
| ビルド       | Vite 8                                                                                               |
| ルーティング | React Router v7 (`HashRouter` — GH Pages対応)                                                        |
| 状態管理     | Zustand v5 + `immer` ミドルウェア + `persist`（LocalStorage永続化）                                  |
| フォーム     | React Hook Form + Zod（`@hookform/resolvers/zod`）                                                   |
| スタイル     | Tailwind CSS v4（`@tailwindcss/vite` プラグイン採用・既存設定は `@config` で継続利用）               |
| 画像出力     | `html-to-image`（対戦表・点数表・グラフの画像保存）                                                  |
| 永続化       | LocalStorage（zustand persist・キー `pinpon-match-manage:v1`・version 2）                            |
| ホスティング | GitHub Pages（base path `/pinpon-match-manage/`）                                                    |
| CI           | GitHub Actions 2ワークフロー: `test.yml`（test/coverage/build）・`deploy.yml`（GitHub Pages deploy） |
| PWA          | `vite-plugin-pwa`（Workbox ベース・自動SW生成・manifest生成・`autoUpdate`）                          |
| Lint/Format  | oxlint + oxfmt                                                                                       |
| テスト       | Vitest + Testing Library（component）+ fast-check（domain の property test）・v8 coverage            |
| UIカタログ   | Storybook 10（`@storybook/react-vite` + `addon-a11y`・UIコンポーネント確認）                         |

## HashRouter採用理由

GH Pagesは任意パスへのフォールバック設定不可 → SPAルーティングはhashベースが安全。
