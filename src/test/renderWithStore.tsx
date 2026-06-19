import { useAppStore, type StoreState } from "@/store/useAppStore";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

type RenderWithStoreOptions = RenderOptions & {
  initialEntries?: string[];
  routePath?: string;
};

/**
 * RTL render をラップし MemoryRouter で包む。
 * routePath を指定すると useParams が解決できるよう <Routes><Route> で囲む。
 */
export function renderWithStore(
  ui: React.ReactElement,
  options: RenderWithStoreOptions = {},
): RenderResult {
  const { initialEntries = ["/"], routePath, ...rest } = options;

  const wrapped = routePath ? (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={routePath} element={ui} />
      </Routes>
    </MemoryRouter>
  ) : (
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  );

  return render(wrapped, rest);
}

/**
 * store に部分的な state をマージする。
 * persist 汚染なし（zustand の setState で直接上書き）。
 */
export function seedStore(partial: Partial<StoreState>): void {
  useAppStore.setState(partial);
}

/**
 * 各テストファイルの beforeEach で呼ぶ store 隔離セットアップ。
 *
 * ```ts
 * beforeEach(setupStoreIsolation);
 * ```
 */
export function setupStoreIsolation(): void {
  useAppStore.getState().resetAll();
  localStorage.clear();
}

// convenience: 各テストファイルで `beforeEach(setupStoreIsolation)` を書く代わりに
// このファイルで export する関数として使う。
// vi.beforeEach をラップしないため呼び出し元で beforeEach(setupStoreIsolation) と書く。
