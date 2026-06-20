import { TrophyIcon } from "@/components/icons/TrophyIcon";
import { MATCH_RESULT } from "@/features/tournament/result/hooks";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";

type Props = {
  matches: PersonalMatchRow[];
};

export const PersonalMatchResults = ({ matches }: Props) => {
  if (matches.length === 0) {
    return (
      <div className="space-y-2 pt-2">
        <div className="text-base font-extrabold">対戦結果</div>
        <div className="border-line text-sub rounded-2xl border-2 p-4 text-center text-base">
          データがありません
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2 pt-2">
      <div className="text-base font-extrabold">対戦結果</div>
      <div className="space-y-3">
        {matches.map((match) => (
          <div key={match.id} className="border-line overflow-hidden rounded-2xl border-2 py-4">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center justify-items-center gap-2">
              {/* 自分 */}
              <div className="flex min-w-0 flex-col items-center justify-center gap-1">
                <div className="flex h-10 w-full items-center justify-center">
                  {match.result === MATCH_RESULT.WIN && (
                    <div className="rounded-full bg-yellow-400 p-1.5 text-lg text-white">
                      <TrophyIcon />
                    </div>
                  )}
                </div>
                <span
                  className={`max-w-24 truncate text-lg ${match.result === MATCH_RESULT.WIN ? "" : "text-sub"}`}
                >
                  {match.selfName}
                </span>
                <span
                  className={`text-[3rem] leading-none font-extrabold tabular-nums ${match.result === MATCH_RESULT.WIN ? "text-success" : "text-sub"}`}
                >
                  {match.selfWins}
                </span>
              </div>

              {/* ゲームスコア */}
              <div className="border-line flex w-full min-w-0 flex-col gap-1 border-x sm:px-6">
                {match.games.map((game, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_1fr] items-center text-lg tabular-nums"
                  >
                    <span
                      className={`text-right ${game.selfScore > game.oppScore ? "text-success" : ""}`}
                    >
                      {game.selfScore}
                    </span>
                    <span className="text-sub px-2">-</span>
                    <span
                      className={`text-left ${game.oppScore > game.selfScore ? "text-success" : ""}`}
                    >
                      {game.oppScore}
                    </span>
                  </div>
                ))}
              </div>

              {/* 相手 */}
              <div className="flex min-w-0 flex-col items-center justify-center gap-1">
                <div className="flex h-10 w-full items-center justify-center">
                  {match.result === MATCH_RESULT.LOSE && (
                    <div className="rounded-full bg-yellow-400 p-1.5 text-lg text-white">
                      <TrophyIcon />
                    </div>
                  )}
                </div>
                <span
                  className={`max-w-24 truncate text-lg ${match.result === MATCH_RESULT.LOSE ? "" : "text-sub"}`}
                >
                  {match.opponentName}
                </span>
                <span
                  className={`text-[3rem] leading-none font-extrabold tabular-nums ${match.result === MATCH_RESULT.LOSE ? "text-success" : "text-sub"}`}
                >
                  {match.oppWins}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
