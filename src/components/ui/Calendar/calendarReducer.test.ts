import {
  calendarReducer,
  type CalendarAction,
  type CalendarState,
} from "@/components/ui/Calendar/calendarReducer";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

const initial: CalendarState = { isOpen: true, year: 2026, month: 4, cursor: 31 };

describe("calendarReducer", () => {
  it("goMonth で cursor が移動先の末日に丸められる", () => {
    expect(calendarReducer(initial, { type: "goMonth", delta: 1 })).toEqual({
      isOpen: true,
      year: 2026,
      month: 5,
      cursor: 30,
    });
  });

  it("moveCursor で年をまたぐ", () => {
    const state = { isOpen: true, year: 2026, month: 11, cursor: 31 };
    expect(calendarReducer(state, { type: "moveCursor", delta: 1 })).toMatchObject({
      year: 2027,
      month: 0,
      cursor: 1,
    });
  });

  it("close は表示月とカーソルを保持する", () => {
    expect(calendarReducer(initial, { type: "close" })).toEqual({ ...initial, isOpen: false });
  });

  it("任意の操作列の後でも cursor は表示月の範囲内", () => {
    // 月またぎ・閏年・月末丸めを含むどの遷移でも不正日付にならない
    const action = fc.oneof(
      fc.record({
        type: fc.constant("goMonth" as const),
        delta: fc.integer({ min: -13, max: 13 }),
      }),
      fc.record({
        type: fc.constant("moveCursor" as const),
        delta: fc.constantFrom(-7, -1, 1, 7),
      }),
    );
    fc.assert(
      fc.property(
        fc.integer({ min: 1990, max: 2100 }),
        fc.integer({ min: 0, max: 11 }),
        fc.array(action, { maxLength: 30 }),
        (year, month, actions: CalendarAction[]) => {
          const start: CalendarState = { isOpen: true, year, month, cursor: 1 };
          const end = actions.reduce((state, item) => calendarReducer(state, item), start);
          const last = new Date(end.year, end.month + 1, 0).getDate();
          expect(end.cursor).toBeGreaterThanOrEqual(1);
          expect(end.cursor).toBeLessThanOrEqual(last);
        },
      ),
    );
  });
});
