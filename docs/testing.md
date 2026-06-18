# テスト方針

親: [README.md](README.md)

## テストツール

- **Vitest** (`vitest run` / `vitest`)
- Testing Library は導入していない
- `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`

## domain層（必須）

`match` / `matchGames` / `ranking` / `scoreProgress` はユニットテスト必須。

- 11-9はゲーム未確定、12-10は確定、11-10は未確定
- bestOf可変の試合勝敗判定（3/5/7ゲームマッチ）: 先取ゲーム数 = floor(bestOf/2)+1
  - bestOf=3: 2勝先取。2-0/2-1のみ有効
  - bestOf=5: 3勝先取。3-0/3-1/3-2のみ有効
  - bestOf=7: 4勝先取。4-0/4-1/4-2/4-3のみ有効
- 順位ソートの同点ケース
- `scoreProgress.ts`: `gameProgress` の進行点列・サーバー交代・累計スコア整合

## UI

- スモークテストのみ（手動確認中心）
- **Storybook** でコンポーネント単位の見た目・状態を確認
  - 起動: `npm run storybook`（dev・ポート6006） / ビルド: `npm run build-storybook`
  - story配置: 各コンポーネント隣に `*.stories.tsx`（`src/**/*.stories.@(tsx|mdx)`）
  - `@storybook/addon-a11y` で各storyのアクセシビリティ検査（現状 `a11y.test: "todo"`）
  - 背景: Light（`#ffffff`・アプリ実背景） / Dark（`#0f172a`）切替
  - PWAプラグインはStorybookビルドから除外（`.storybook/main.ts` の `viteFinal`・SW不要）

## アクセシビリティ

- Lighthouse Accessibility 95点以上
- axe-core 重大違反0

## 視認性 実機確認

- 高齢者層（60代以上）数名にユーザーテスト
- 室内蛍光灯下での視認性確認
