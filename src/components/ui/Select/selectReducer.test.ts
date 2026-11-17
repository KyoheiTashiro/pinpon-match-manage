import {
  selectInitial,
  selectReducer,
  type SelectState,
} from "@/components/ui/Select/selectReducer";
import { describe, expect, it } from "vitest";

const opened = (focused: number): SelectState => ({ open: true, focused });

describe("selectReducer", () => {
  it("open: 指定位置にフォーカスして開く。未選択(-1)は先頭", () => {
    expect(selectReducer(selectInitial, { type: "open", focused: 2 })).toEqual(opened(2));
    expect(selectReducer(selectInitial, { type: "open", focused: -1 })).toEqual(opened(0));
  });

  it("close: フォーカス位置ごと捨てる", () => {
    expect(selectReducer(opened(3), { type: "close" })).toEqual({ open: false });
  });

  it("move: 選択肢の範囲内に収める", () => {
    expect(selectReducer(opened(0), { type: "move", delta: -1, optionCount: 3 })).toEqual(
      opened(0),
    );
    expect(selectReducer(opened(1), { type: "move", delta: 1, optionCount: 3 })).toEqual(opened(2));
    expect(selectReducer(opened(2), { type: "move", delta: 1, optionCount: 3 })).toEqual(opened(2));
    // 開いている間に選択肢が減っても範囲外を指さない
    expect(selectReducer(opened(5), { type: "move", delta: 1, optionCount: 2 })).toEqual(opened(1));
  });

  it("focus: 開いているときだけ位置を変える", () => {
    expect(selectReducer(opened(0), { type: "focus", index: 2 })).toEqual(opened(2));
  });

  it("閉じている間は focus / move を無視する", () => {
    expect(selectReducer(selectInitial, { type: "focus", index: 2 })).toBe(selectInitial);
    expect(selectReducer(selectInitial, { type: "move", delta: 1, optionCount: 3 })).toBe(
      selectInitial,
    );
  });
});
