import type { SideView } from "@/features/tournament/scoreboard/types";

/** スコア入力の上限値。 */
const MAX_SCORE = 50;

/** この点以降スコアを常時黄色表示する閾値。 */
const ALWAYS_HIGHLIGHT_SCORE = 10;

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
}: SideView) => {
  const highlight = isGameWinner || isMatchWinner;
  const scoreColor = highlight
    ? "text-green-500"
    : isMatchPoint || score >= ALWAYS_HIGHLIGHT_SCORE
      ? "text-yellow-400"
      : "text-white";

  return (
    <div
      className={`flex min-h-0 flex-col items-stretch p-1 sm:p-2 ${
        isMatchWinner ? "bg-success/20" : ""
      }`}
    >
      <div
        className={`shrink-0 truncate text-center text-base font-extrabold sm:text-2xl ${
          highlight ? "text-green-500" : ""
        }`}
        title={name}
      >
        {name}
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-1">
        <div
          className={`relative aspect-[5/4] h-full max-w-full overflow-hidden rounded-2xl border-2 ${
            isMatchWinner ? "border-success bg-success/20" : "border-white/30 bg-neutral-900"
          }`}
        >
          <button
            type="button"
            aria-label={`${name} を1増やす`}
            onClick={onAdd}
            disabled={disabled || disableAdd || score >= MAX_SCORE}
            className="absolute inset-x-0 top-0 h-1/2 w-full transition hover:bg-white/5 active:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
          />
          <button
            type="button"
            aria-label={`${name} を1減らす`}
            onClick={onSub}
            disabled={disabled || score <= 0 || !canSub}
            className="absolute inset-x-0 bottom-0 h-1/2 w-full transition hover:bg-white/5 active:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={`text-[clamp(6rem,44vh,28rem)] leading-none font-extrabold tabular-nums ${scoreColor}`}
            >
              {score}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-[3px] -translate-y-1/2 bg-black" />
        </div>
      </div>

      <div
        className={`mx-2 mt-1 h-2 shrink-0 rounded-full transition-colors sm:mx-4 sm:h-3 ${
          isServing ? "bg-orange-500" : "bg-transparent"
        }`}
        aria-label={isServing ? "サーブ権あり" : undefined}
      />

      {disabled && (
        <div className="shrink-0 text-center text-xs text-white/50 sm:text-sm">入力不可</div>
      )}
    </div>
  );
};
