# テスト方針

親: [README.md](README.md)

## テストツール

- **Vitest** (`vitest run` / `vitest`)
- **Testing Library**（`@testing-library/react` / `@testing-library/user-event` / `@testing-library/jest-dom`）でコンポーネントテスト
- **fast-check** で domain 層の property-based testing
- 環境は jsdom 単一（component に必須・ロジックテストにも無害。node 環境だと zustand persist が localStorage 不在で警告を吐くため統一）
- `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`

### setup（`vitest.setup.ts`）

- `@testing-library/jest-dom/vitest` の matcher を読み込み
- `afterEach` で `cleanup()`（テスト間の DOM 汚染防止）
- jsdom は `HTMLDialogElement` のモーダル API（`showModal` / `close`）未実装のため polyfill

### テストヘルパー（`src/test/`）

- `renderWithStore.tsx`
  - `renderWithStore(ui, { initialEntries, routePath })`: RTL render を `MemoryRouter` で包む。`routePath` 指定で `<Routes><Route>` 囲み（`useParams` 解決用）
  - `seedStore(partial)`: zustand `setState` で state を部分上書き（persist 汚染なし）
  - `setupStoreIsolation()`: 各テストファイルの `beforeEach(setupStoreIsolation)` で呼ぶ。`resetAll()` + `localStorage.clear()`
- `arbitraries.ts`: fast-check の Arbitrary 定義（`gameArb` / `gameFromLogArb` / `finishedGameArb` / `matchSideArb` / `matchArb` / `matchWithPairArb` など）

## domain層（必須）

`match` / `matchGames` / `ranking` / `scoreProgress` / `side` に property-based test（`*.proptest.test.ts`）必須。

- 11-9はゲーム未確定、12-10は確定、11-10は未確定
- bestOf可変の試合勝敗判定（3/5/7ゲームマッチ）: 先取ゲーム数 = floor(bestOf/2)+1
  - bestOf=3: 2勝先取。2-0/2-1のみ有効
  - bestOf=5: 3勝先取。3-0/3-1/3-2のみ有効
  - bestOf=7: 4勝先取。4-0/4-1/4-2/4-3のみ有効
- 順位ソートの同点ケース（single / doubles 両方）
- `scoreProgress.ts`: `gameProgress` の進行点列・サーバー交代・累計スコア整合
- `side.ts`: single / pair の判定・メンバー解決

## UI / component

- `@testing-library/react` でコンポーネント・feature 単位のテスト
  - 共通 UI（`src/components/ui/*.test.tsx`）: Button / Select / Toggle / RadioGroup / Tabs / ConfirmModal / InfoModal
  - feature（`src/features/**/*.test.tsx`）: home / matches（singles・doubles）/ participants / scoreboard / settings / result（RankingTable / MatchResultsTable / MatchScoreChart）
- **Storybook** でコンポーネント単位の見た目・状態を確認
  - 起動: `npm run storybook`（dev・ポート6006） / ビルド: `npm run build-storybook`
  - story配置: 各コンポーネント隣に `*.stories.tsx`（`src/**/*.stories.@(tsx|mdx)`）
  - `@storybook/addon-a11y` で各storyのアクセシビリティ検査（現状 `a11y.test: "todo"`）
  - 背景: Light（`#ffffff`・アプリ実背景） / Dark（`#0f172a`）切替
  - PWAプラグインはStorybookビルドから除外（`.storybook/main.ts` の `viteFinal`・SW不要）

## カバレッジ（ラチェット方式）

`@vitest/coverage-v8`（provider `v8`）。`vitest.config.ts` の `thresholds` でロジック層のみ厳格ゲート。component（`.tsx`）は重要部のみ方針のため全体ゲートしない。

実測に対し数%の余白を残したラチェット値で後退を CI 検知し、実測が上がったら引き上げる。

- `src/domain/**`: lines 98 / functions 100 / branches 95 / statements 98
- `src/store/**`: lines 95 / functions 95 / branches 88 / statements 95
- `src/utils/id.ts`: 100 / 100 / 100 / 100
- `src/utils/time.ts`: lines 95 / functions 90 / branches 75 / statements 95

除外: `*.test.{ts,tsx}` / `*.stories.tsx` / `src/test/**` / `src/main.tsx` / `**/types.ts` / `src/components/system/**`（PWA SW連携 glue。`virtual:pwa-register/react` 依存で未カバー走査時に JSX をパースできず除外）

## アクセシビリティ

- Lighthouse Accessibility 95点以上
- axe-core 重大違反0

## 視認性 実機確認

- 高齢者層（60代以上）数名にユーザーテスト
- 室内蛍光灯下での視認性確認
