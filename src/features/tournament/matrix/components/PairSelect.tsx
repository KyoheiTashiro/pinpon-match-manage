type Props = {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  exclude: string[];
  label: string;
};

export const PairSelect = ({ value, onChange, options, exclude, label }: Props) => (
  <label className="flex flex-col gap-1">
    <span className="font-bold text-base">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-input border-2 border-line rounded-xl px-3 text-lg bg-white"
    >
      <option value="">— 選んでください —</option>
      {options
        .filter((participant) => !exclude.includes(participant.id))
        .map((participant) => (
          <option key={participant.id} value={participant.id}>
            {participant.name}
          </option>
        ))}
    </select>
  </label>
);
