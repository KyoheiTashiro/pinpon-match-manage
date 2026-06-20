import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    // jsdom 単一環境。component(RTL)に必須で、ロジックテストにも無害。
    // node 環境だと zustand persist が localStorage 不在で警告を吐くため jsdom に統一。
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.stories.tsx",
        "src/test/**",
        "src/main.tsx",
        "src/**/types.ts",
        // PWA Service Worker 連携 glue。virtual:pwa-register/react に依存し unit テスト不能。
        // include 指定時 coverage-v8 は未カバーファイルも走査するが(vitest v4 は coverage.all
        // 廃止で include 有れば常時走査)、この未カバー走査用 transform では仮想モジュールを
        // 解決できず JSX が素のまま parseAstAsync に渡り "Unexpected JSX expression" で落ちる。
        "src/components/system/**",
      ],
      // ロジック層のみ厳格ゲート。component(.tsx)は重要部のみ方針なので全体ゲートしない。
      // 実測(domain 100/100/98, store 96/100/90, utils 100)に対し数%の余白を残した
      // ラチェット値。カバレッジ後退を CI で検知する。実測が上がったら引き上げる。
      thresholds: {
        "src/domain/**": { lines: 98, functions: 100, branches: 95, statements: 98 },
        "src/store/**": { lines: 95, functions: 95, branches: 88, statements: 95 },
        "src/utils/id.ts": { lines: 100, functions: 100, branches: 100, statements: 100 },
        // branches 75: line14 の `?.value ?? ""` フォールバックは formatToParts が
        // 常に year/month/day を返すため実行不能。到達不能分岐ぶん 75 が実測上限。
        "src/utils/time.ts": { lines: 95, functions: 90, branches: 75, statements: 95 },
      },
    },
  },
});
