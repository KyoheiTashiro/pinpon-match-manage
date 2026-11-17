// カレンダーの開閉・表示月・キーボードカーソルの遷移。
// cursor は常に表示中の月 (year/month) の範囲内に保つ。
export type CalendarState = {
  isOpen: boolean;
  year: number;
  month: number; // 0-11
  cursor: number; // 1-末日
};

export type CalendarAction =
  | { type: "open"; year: number; month: number; day: number }
  | { type: "close" }
  | { type: "goMonth"; delta: number }
  | { type: "moveCursor"; delta: number };

const daysIn = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case "open":
      return { isOpen: true, year: action.year, month: action.month, cursor: action.day };
    case "close":
      return { ...state, isOpen: false };
    case "goMonth": {
      const next = new Date(state.year, state.month + action.delta, 1);
      const year = next.getFullYear();
      const month = next.getMonth();
      return { ...state, year, month, cursor: Math.min(state.cursor, daysIn(year, month)) };
    }
    case "moveCursor": {
      const next = new Date(state.year, state.month, state.cursor + action.delta);
      return {
        ...state,
        year: next.getFullYear(),
        month: next.getMonth(),
        cursor: next.getDate(),
      };
    }
    default:
      return state;
  }
};
