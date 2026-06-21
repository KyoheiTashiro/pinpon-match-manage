type Tab<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  ariaLabel: string;
  value: T;
  options: Tab<T>[];
  onChange: (value: T) => void;
};

export const Tabs = <T extends string | number>({
  ariaLabel,
  value,
  options,
  onChange,
}: Props<T>) => (
  <div className="border-line flex border-b-2" role="tablist" aria-label={ariaLabel}>
    {options.map((option) => (
      <button
        key={String(option.value)}
        role="tab"
        aria-selected={value === option.value}
        onClick={() => onChange(option.value)}
        className={`min-h-btn flex-1 rounded-t-2xl border-b-4 text-lg font-bold transition-colors ${
          value === option.value
            ? "border-primary bg-primary/10 text-primary"
            : "text-ink border-transparent bg-white"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
