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
    <legend className="font-bold mb-1">{legend}</legend>
    <div className="flex gap-3 flex-wrap">
      {options.map((option) => (
        <label
          key={String(option.value)}
          className={`flex items-center gap-2 px-4 min-h-btn rounded-xl border-2 cursor-pointer ${
            value === option.value
              ? "bg-primary text-white border-primary"
              : "bg-white text-ink border-line"
          }`}
        >
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            aria-label={option.label}
            className="w-5 h-5"
          />
          <span className="text-lg font-bold">{option.label}</span>
        </label>
      ))}
    </div>
  </fieldset>
);
