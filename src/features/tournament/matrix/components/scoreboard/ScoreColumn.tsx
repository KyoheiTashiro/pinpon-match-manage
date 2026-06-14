import { MAX_SCORE } from "@/features/tournament/matrix/hooks";

type Props = {
  name: string;
  score: number;
  isGameWinner: boolean;
  isMatchWinner: boolean;
  isMatchPoint: boolean;
  isServing: boolean;
  disabled: boolean;
  disableAdd?: boolean;
  canSub?: boolean;
  onAdd: () => void;
  onSub: () => void;
};

export const ScoreColumn = ({
  name,
  score,
  isGameWinner,
  isMatchWinner,
  isMatchPoint,
  isServing,
  disabled,
  disableAdd,
  canSub,
  onAdd,
  onSub,
}: Props) => {
  const highlight = isGameWinner || isMatchWinner;
  const scoreColor = highlight ? "text-green-500" : isMatchPoint ? "text-yellow-400" : "text-white";

  return (
    <div
      className={`flex flex-col items-stretch min-h-0 p-1 sm:p-2 ${
        isMatchWinner ? "bg-success/20" : ""
      }`}
    >
      <div
        className={`shrink-0 text-center text-base sm:text-2xl font-extrabold truncate ${
          highlight ? "text-green-500" : ""
        }`}
        title={name}
      >
        {name}
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center py-1">
        <div
          className={`relative h-full aspect-[5/4] max-w-full rounded-2xl overflow-hidden border-2 ${
            isMatchWinner ? "bg-success/20 border-success" : "bg-neutral-900 border-white/30"
          }`}
        >
          <button
            type="button"
            aria-label={`${name} を1増やす`}
            onClick={onAdd}
            disabled={disabled || disableAdd || score >= MAX_SCORE}
            className="absolute inset-x-0 top-0 h-1/2 w-full hover:bg-white/5 active:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition"
          />
          <button
            type="button"
            aria-label={`${name} を1減らす`}
            onClick={onSub}
            disabled={disabled || score <= 0 || canSub === false}
            className="absolute inset-x-0 bottom-0 h-1/2 w-full hover:bg-white/5 active:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={`text-[clamp(6rem,44vh,28rem)] leading-none font-extrabold tabular-nums ${scoreColor}`}
            >
              {score}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-black z-10" />
        </div>
      </div>

      <div
        className={`shrink-0 h-2 sm:h-3 rounded-full mx-2 sm:mx-4 mt-1 transition-colors ${
          isServing ? "bg-orange-500" : "bg-transparent"
        }`}
        aria-label={isServing ? "サーブ権あり" : undefined}
      />

      {disabled && (
        <div className="shrink-0 text-center text-xs sm:text-sm text-white/50">入力不可</div>
      )}
    </div>
  );
};
