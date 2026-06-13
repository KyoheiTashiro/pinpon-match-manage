# 技術スタック

親: [README.md](../README.md)

| 項目         | 採用                                                          |
| ------------ | ------------------------------------------------------------- |
| フロント     | React 18 + TypeScript                                         |
| ビルド       | Vite                                                          |
| ルーティング | React Router (HashRouter — GH Pages対応)                      |
| 状態管理     | Zustand（軽量・LocalStorage永続化ミドルウェア利用）           |
| スタイル     | Tailwind CSS                                                  |
| 永続化       | LocalStorage（zustand persist）                               |
| ホスティング | GitHub Pages                                                  |
| CI           | GitHub Actions（push時 build → GitHub Pages deploy）          |
| PWA          | `vite-plugin-pwa`（Workbox ベース・自動SW生成・manifest生成） |
| Lint/Format  | oxlint + oxfmt                                                |
| テスト       | Vitest（ユニット）+ Testing Library（任意）                   |

## HashRouter採用理由

GH Pagesは任意パスへのフォールバック設定不可 → SPAルーティングはhashベースが安全。
