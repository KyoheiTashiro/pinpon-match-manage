type Props = {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  exclude: string[];
  label: string;
};

export const PairSelect = ({ value, onChange, options, exclude, label }: Props) => (
  <label className="flex flex-col gap-1">
    <span className="font-bold text-base">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-input border-2 border-line rounded-xl px-3 text-lg bg-white"
    >
      <option value="">— 選んでください —</option>
      {options
        .filter((p) => !exclude.includes(p.id))
        .map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
    </select>
  </label>
);
