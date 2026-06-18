import { DISPLAY_MODE } from "@/features/tournament/result/hooks";

type DisplayMode = (typeof DISPLAY_MODE)[keyof typeof DISPLAY_MODE];

type Props = {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
};

export const ResultModeTabs = ({ mode, setMode }: Props) => (
  <div className="flex border-b-2 border-line" role="tablist" aria-label="表示モード">
    <button
      role="tab"
      aria-selected={mode === DISPLAY_MODE.TABLE}
      onClick={() => setMode(DISPLAY_MODE.TABLE)}
      className={`min-h-btn flex-1 rounded-t-2xl border-b-4 text-lg font-bold transition-colors ${
        mode === DISPLAY_MODE.TABLE
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent bg-white text-ink"
      }`}
    >
      点数表
    </button>
    <button
      role="tab"
      aria-selected={mode === DISPLAY_MODE.GRAPH}
      onClick={() => setMode(DISPLAY_MODE.GRAPH)}
      className={`min-h-btn flex-1 rounded-t-2xl border-b-4 text-lg font-bold transition-colors ${
        mode === DISPLAY_MODE.GRAPH
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent bg-white text-ink"
      }`}
    >
      点数グラフ
    </button>
  </div>
);
