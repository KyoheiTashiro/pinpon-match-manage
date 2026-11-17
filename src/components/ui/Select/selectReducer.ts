// セレクトの開閉とキーボードフォーカス位置の遷移。
// フォーカス位置は開いている間だけ存在する。
export type SelectState = { open: false } | { open: true; focused: number };

export type SelectAction =
  | { type: "open"; focused: number }
  | { type: "close" }
  | { type: "focus"; index: number }
  | { type: "move"; delta: number; optionCount: number };

export const selectInitial: SelectState = { open: false };

export const selectReducer = (state: SelectState, action: SelectAction): SelectState => {
  switch (action.type) {
    case "open":
      return { open: true, focused: Math.max(action.focused, 0) };
    case "close":
      return selectInitial;
    case "focus":
      return state.open ? { open: true, focused: action.index } : state;
    case "move": {
      if (!state.open) return state;
      const last = Math.max(action.optionCount - 1, 0);
      return { open: true, focused: Math.min(Math.max(state.focused + action.delta, 0), last) };
    }
    default:
      return state;
  }
};
