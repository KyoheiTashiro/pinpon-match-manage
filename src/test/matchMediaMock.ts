import { vi } from "vitest";

// jsdom は window.matchMedia 未実装のためテストでモックを差し込む。
// 非推奨の addListener/removeListener は実装しない（コンポーネントは addEventListener を使用）。
// MediaQueryList 全体は実装しないため、あえて型注釈を付けず部分実装のまま渡す。
export const installMatchMediaMock = (matchesQuery: (query: string) => boolean = () => false) => {
  const mock = vi.fn((query: string) => ({
    matches: matchesQuery(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>(),
  }));
  Object.defineProperty(window, "matchMedia", { writable: true, value: mock });
  return mock;
};
