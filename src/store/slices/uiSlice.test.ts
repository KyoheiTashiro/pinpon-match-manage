/**
 * uiSlice.test.ts
 * uiSlice の未カバーアクションを網羅するユニットテスト。
 */

import { FONT_SIZE } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  useAppStore.getState().resetAll();
});

// ---------------------------------------------------------------------------
// fontSize の初期値
// ---------------------------------------------------------------------------

describe("fontSize: 初期値", () => {
  it("初期 fontSize は NORMAL である", () => {
    expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.NORMAL);
  });
});

// ---------------------------------------------------------------------------
// setFontSize
// ---------------------------------------------------------------------------

describe("setFontSize", () => {
  it("LARGE に変更できる", () => {
    useAppStore.getState().setFontSize(FONT_SIZE.LARGE);
    expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.LARGE);
  });

  it("XLARGE に変更できる", () => {
    useAppStore.getState().setFontSize(FONT_SIZE.XLARGE);
    expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.XLARGE);
  });

  it("NORMAL に戻せる", () => {
    useAppStore.getState().setFontSize(FONT_SIZE.LARGE);
    useAppStore.getState().setFontSize(FONT_SIZE.NORMAL);
    expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.NORMAL);
  });

  it("同じ値で呼んでも崩れない", () => {
    useAppStore.getState().setFontSize(FONT_SIZE.LARGE);
    useAppStore.getState().setFontSize(FONT_SIZE.LARGE);
    expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.LARGE);
  });

  it("複数回異なる値を設定すると最後の値が残る", () => {
    useAppStore.getState().setFontSize(FONT_SIZE.LARGE);
    useAppStore.getState().setFontSize(FONT_SIZE.XLARGE);
    useAppStore.getState().setFontSize(FONT_SIZE.NORMAL);
    expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.NORMAL);
  });
});

// ---------------------------------------------------------------------------
// resetAll との関係
// ---------------------------------------------------------------------------

describe("resetAll との関係", () => {
  it("resetAll を呼んでも fontSize はリセットされない (UI 設定は保持される)", () => {
    useAppStore.getState().setFontSize(FONT_SIZE.XLARGE);
    useAppStore.getState().resetAll();
    // resetAll はトーナメント/参加者/試合のみリセット。fontSize は永続化ユーザー設定なので保持。
    expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.XLARGE);
  });
});
