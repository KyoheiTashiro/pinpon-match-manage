# PWA設計

親: [README.md](../README.md)

## 10.1 構成

- `vite-plugin-pwa` 使用。`registerType: 'autoUpdate'`
- `dev` 環境でも `devOptions.enabled: true` で SW デバッグ可

## 10.2 manifest

`vite.config.ts` の定義（正）:

```json
{
  "name": "卓ログ",
  "short_name": "卓ログ",
  "description": "卓球の対戦結果を管理",
  "start_url": "/pinpon-match-manage/",
  "scope": "/pinpon-match-manage/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#1d4ed8",
  "lang": "ja",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## 10.3 Service Worker キャッシュ戦略

- アプリシェル（JS/CSS/HTML/SVG/PNG/webmanifest）: **precache**（Workbox `precacheAndRoute`）→ 完全オフライン動作
  - `workbox.globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"]` で対象ファイルを指定
- 外部API: 無し（全データLocalStorage）→ ネットワークキャッシュ戦略 不要

## 10.4 更新フロー

- `autoUpdate`: 新 SW 検出時に自動でアクティベートし、ページを自動リロードする

## 10.5 オフライン制約

- 全機能オフライン動作（永続層がLocalStorageのみのため）
- 初回アクセスのみオンライン必須

## 10.6 GH Pages との注意点

- `start_url` / `scope` はサブパス `/pinpon-match-manage/` 含める
- `vite.config.ts` の `base` と一致必須
- アイコンパスは相対 (`icons/...`) で manifest 内記述
