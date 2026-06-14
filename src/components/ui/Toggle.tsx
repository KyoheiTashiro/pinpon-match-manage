export type ToggleOption<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  label?: string;
  ariaLabel: string;
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
};

export const Toggle = <T extends string | number>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
}: Props<T>) => (
  <div role="radiogroup" aria-label={ariaLabel} className="flex items-center gap-2">
    {label && <span className="text-base font-bold">{label}</span>}
    <div className="inline-flex items-center bg-bg border-2 border-line rounded-xl p-1 gap-1">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`min-h-[40px] min-w-[64px] px-3 rounded-lg transition ${
              selected
                ? "bg-white text-ink font-extrabold shadow-md"
                : "bg-transparent text-sub font-medium hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);
