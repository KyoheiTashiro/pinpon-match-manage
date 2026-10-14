import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

// vitest 5 で Assertion の型引数が <R, T> の 2 個になり、@testing-library/jest-dom 7.0.1 の
// `@testing-library/jest-dom/vitest` が宣言する `Assertion<T>`(1 個)とマージできず
// toBeInTheDocument 等の型が消える。jest-dom 側が vitest 5 対応するまで同等の拡張を自前で宣言する。
// ランタイムの matcher 登録は vitest.setup.ts の import で行われる。
declare module "vitest" {
  interface Assertion<
    R extends void | Promise<void> = void,
    T = unknown,
  > extends TestingLibraryMatchers<any, R> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
