import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 各テスト後に DOM を破棄してテスト間の汚染を防ぐ
afterEach(() => {
  cleanup();
});

import { vi } from "vitest";
// jsdom は dialog のモーダル API 未実装のため polyfill
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  });
}
