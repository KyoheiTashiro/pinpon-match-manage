import { SIDE } from "@/domain/match";
import type { Side } from "@/domain/match";

type Props = {
  leftName: string;
  rightName: string;
  value: Side;
  onChange: (side: Side) => void;
};

export const FirstServerSelect = ({ leftName, rightName, value, onChange }: Props) => (
  <fieldset className="border-line mb-4 rounded-xl border-2 p-3">
    <legend className="px-2 font-bold">最初のサーブ</legend>
    <div className="flex flex-col gap-2 sm:flex-row">
      {([SIDE.LEFT, SIDE.RIGHT] as Side[]).map((side) => {
        const name = side === SIDE.LEFT ? leftName : rightName;
        return (
          <label
            key={side}
            className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 ${
              value === side ? "border-primary bg-primary/10" : "border-line bg-white"
            }`}
          >
            <input
              type="radio"
              name="first-server"
              value={side}
              checked={value === side}
              onChange={() => onChange(side)}
              aria-label={`最初のサーブ: ${name}`}
              className="accent-primary h-5 w-5"
            />
            <span className="font-bold">{name}</span>
          </label>
        );
      })}
    </div>
  </fieldset>
);
