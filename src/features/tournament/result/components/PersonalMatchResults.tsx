import { WinnerBadge } from "@/components/domain";
import { EmptyState } from "@/components/ui";
import { MATCH_RESULT } from "@/features/tournament/result/hooks";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";

type Props = {
  matches: PersonalMatchRow[];
};

export const PersonalMatchResults = ({ matches }: Props) => {
  const selfName = matches[0]?.selfName;
  const title = selfName ? `${selfName}さんの対戦結果` : "対戦結果";
  if (matches.length === 0) {
    return (
      <div className="space-y-2 pt-2">
        <div className="text-xl font-extrabold">{title}</div>
        <EmptyState />
      </div>
    );
  }
  return (
    <div className="-mx-3 space-y-2 pt-2">
      <div className="px-2 text-xl font-extrabold">{title}</div>
      <div className="space-y-3">
        {matches.map((match) => (
          <div key={match.id} className="border-line overflow-hidden rounded-2xl border-2 py-4">
            <div className="divide-line grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-stretch divide-x">
              {/* 自分 */}
              <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-4">
                <div className="flex h-10 w-full items-center justify-center">
                  {match.result === MATCH_RESULT.WIN && <WinnerBadge size="lg" />}
                </div>
                <span
                  className={`w-full text-center text-lg break-words ${match.result === MATCH_RESULT.WIN ? "" : "text-sub"}`}
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
              <div className="flex w-full min-w-0 flex-col justify-center gap-1 px-4">
                {match.games.map((game, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-2 text-lg tabular-nums"
                  >
                    <span
                      className={`w-7 text-center ${game.selfScore > game.opponentScore ? "text-success" : ""}`}
                    >
                      {game.selfScore}
                    </span>
                    <span className="text-sub">-</span>
                    <span
                      className={`w-7 text-center ${game.opponentScore > game.selfScore ? "text-success" : ""}`}
                    >
                      {game.opponentScore}
                    </span>
                  </div>
                ))}
              </div>

              {/* 相手 */}
              <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-4">
                <div className="flex h-10 w-full items-center justify-center">
                  {match.result === MATCH_RESULT.LOSE && <WinnerBadge size="lg" />}
                </div>
                <span
                  className={`w-full text-center text-lg break-words ${match.result === MATCH_RESULT.LOSE ? "" : "text-sub"}`}
                >
                  {match.opponentName}
                </span>
                <span
                  className={`text-[3rem] leading-none font-extrabold tabular-nums ${match.result === MATCH_RESULT.LOSE ? "text-success" : "text-sub"}`}
                >
                  {match.opponentWins}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
