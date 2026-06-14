# デプロイ

親: [README.md](../README.md)

## GitHub Actions ワークフロー

`.github/workflows/deploy.yml` の構成（実装が正）:

- **trigger**: `main` ブランチへの push + `workflow_dispatch`（手動実行）
- **runner**: `ubuntu-slim`
- **Node**: 20
- **ジョブ分離**: `build` ジョブと `deploy` ジョブに分離
- **concurrency**: `group: pages`、`cancel-in-progress: true`（重複実行を自動キャンセル）

### build ジョブ

1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 20、npm キャッシュ有効)
3. `npm ci`
4. `npm run build`
5. `actions/configure-pages@v5`
6. `actions/upload-pages-artifact@v3` (`path: dist`)

### deploy ジョブ

- `needs: build`
- `actions/deploy-pages@v4` で GitHub Pages へデプロイ
- environment: `github-pages`

## Vite 設定

- `vite.config.ts` に `base: '/pinpon-match-manage/'` 設定（リポジトリ名）
- `vite-plugin-pwa` が `dist/sw.js` `dist/manifest.webmanifest` 自動生成
- HashRouter のため SW スコープと干渉なし
