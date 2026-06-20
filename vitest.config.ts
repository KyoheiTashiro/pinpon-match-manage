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
      ],
      // ロジック層のみ厳格ゲート。component(.tsx)は重要部のみ方針なので全体ゲートしない。
      // 実測(domain 100/100/98, store 96/100/90, utils 100)に対し数%の余白を残した
      // ラチェット値。カバレッジ後退を CI で検知する。実測が上がったら引き上げる。
      thresholds: {
        "src/domain/**": { lines: 98, functions: 100, branches: 95, statements: 98 },
        "src/store/**": { lines: 95, functions: 95, branches: 88, statements: 95 },
        "src/utils/id.ts": { lines: 100, functions: 100, branches: 100, statements: 100 },
        "src/utils/time.ts": { lines: 95, functions: 90, branches: 80, statements: 95 },
      },
    },
  },
});
