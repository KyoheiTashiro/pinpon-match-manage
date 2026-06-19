import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 各テスト後に DOM を破棄してテスト間の汚染を防ぐ
afterEach(() => {
  cleanup();
});
