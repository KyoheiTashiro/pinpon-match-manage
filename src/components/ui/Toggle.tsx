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
    <div className="border-line bg-bg inline-flex items-center gap-1 rounded-xl border-2 p-1">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`min-h-[40px] min-w-[64px] rounded-lg px-3 transition ${
              selected
                ? "text-ink bg-white font-extrabold shadow-md"
                : "text-sub hover:text-ink bg-transparent font-medium"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);
