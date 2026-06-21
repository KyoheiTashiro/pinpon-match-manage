type RadioOption<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  legend: string;
  name: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
};

export const RadioGroup = <T extends string | number>({
  legend,
  name,
  value,
  options,
  onChange,
}: Props<T>) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-1 font-bold">{legend}</legend>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <label
          key={String(option.value)}
          className={`min-h-btn flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 ${
            value === option.value
              ? "border-primary bg-primary text-white"
              : "border-line text-ink bg-white"
          }`}
        >
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            aria-label={option.label}
            className="h-4 w-4"
          />
          <span className="text-lg font-bold">{option.label}</span>
        </label>
      ))}
    </div>
  </fieldset>
);
