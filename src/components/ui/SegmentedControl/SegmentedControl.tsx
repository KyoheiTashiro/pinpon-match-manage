type Segment<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  ariaLabel: string;
  value: T;
  options: Segment<T>[];
  onChange: (value: T) => void;
};

export const SegmentedControl = <T extends string | number>({
  ariaLabel,
  value,
  options,
  onChange,
}: Props<T>) => (
  <div
    className="border-line inline-flex gap-1 rounded-xl border-2 bg-gray-200/70 p-1"
    role="radiogroup"
    aria-label={ariaLabel}
  >
    {options.map((option) => (
      <button
        key={String(option.value)}
        type="button"
        // oxlint-disable-next-line prefer-tag-over-role -- セグメント型UIは button + role=radio が意図的
        role="radio"
        aria-checked={value === option.value}
        onClick={() => onChange(option.value)}
        className={`min-h-btn flex-1 rounded-lg px-4 text-lg font-bold whitespace-nowrap ${
          value === option.value
            ? "text-ink bg-white shadow-sm"
            : "text-ink/60 hover:text-ink bg-transparent"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
