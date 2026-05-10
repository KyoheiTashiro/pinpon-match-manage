type Props = {
  value: number;
  onChange: (n: number) => void;
  label: string;
  disabled?: boolean;
};

export const ScoreInput = ({ value, onChange, label, disabled }: Props) => {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(Math.min(30, value + 1));

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-base font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label} を1減らす`}
          onClick={dec}
          disabled={disabled || value <= 0}
          className="min-h-btn min-w-[56px] rounded-xl bg-bg border-2 border-line text-2xl font-extrabold disabled:opacity-40"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={`${label} の点数`}
          min={0}
          max={30}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onChange(Number.isFinite(n) ? Math.max(0, Math.min(30, n)) : 0);
          }}
          className="w-20 h-btn text-center text-2xl font-extrabold border-2 border-line rounded-xl bg-white disabled:bg-bg"
        />
        <button
          type="button"
          aria-label={`${label} を1増やす`}
          onClick={inc}
          disabled={disabled || value >= 30}
          className="min-h-btn min-w-[56px] rounded-xl bg-bg border-2 border-line text-2xl font-extrabold disabled:opacity-40"
        >
          ＋
        </button>
      </div>
    </div>
  );
};
