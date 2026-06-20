import { MATCH_RESULT } from "@/features/tournament/result/hooks";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";

type Props = {
  matches: PersonalMatchRow[];
  bestOf: number;
};

export const PersonalMatchResults = ({ matches, bestOf }: Props) => {
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
          <div key={match.id} className="border-line overflow-hidden rounded-2xl border-2">
            {/* ヘッダ部 */}
            <div className="border-line bg-bg flex items-center gap-2 border-b-2 p-2">
              <div className="text-base">
                <span className={match.result === MATCH_RESULT.WIN ? "font-extrabold" : "text-sub"}>
                  {match.selfName}
                </span>
                <span className="text-sub"> vs </span>
                <span
                  className={match.result === MATCH_RESULT.LOSE ? "font-extrabold" : "text-sub"}
                >
                  {match.opponentName}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-sm font-bold whitespace-nowrap ${
                  match.result === MATCH_RESULT.WIN
                    ? "text-success bg-winBg"
                    : match.result === MATCH_RESULT.LOSE
                      ? "text-danger bg-loseBg"
                      : "text-sub bg-bg"
                }`}
              >
                {match.result === MATCH_RESULT.WIN
                  ? "勝"
                  : match.result === MATCH_RESULT.LOSE
                    ? "負"
                    : "—"}
              </span>
            </div>
            {/* スコアボード部 */}
            <div className="p-2">
              <div
                style={{
                  gridTemplateColumns: `minmax(8rem,1fr) auto repeat(${bestOf}, 2.5rem)`,
                }}
                className="grid items-center gap-x-3 gap-y-1 overflow-x-auto"
              >
                {/* ヘッダ行 */}
                <div className="sticky left-0 z-10 bg-white" />
                <div className="text-sub flex items-center justify-center self-stretch px-3 text-center text-base font-bold">
                  計
                </div>
                {Array.from({ length: bestOf }, (_, i) => (
                  <div key={i} className="text-sub text-center text-base font-bold">
                    G{i + 1}
                  </div>
                ))}

                {/* 自分行 */}
                <div
                  className={`sticky left-0 z-10 truncate bg-white pr-3 pl-1 text-lg ${match.result === MATCH_RESULT.WIN ? "font-extrabold" : "text-sub"}`}
                >
                  {match.selfName}
                </div>
                <div
                  className={`border-line flex items-center justify-center self-stretch border-r px-3 text-center font-extrabold tabular-nums ${match.result === MATCH_RESULT.WIN ? "text-success" : ""}`}
                >
                  {match.selfWins}
                </div>
                {Array.from({ length: bestOf }, (_, i) => {
                  const game = match.games[i];
                  if (!game)
                    return (
                      <div key={i} className="text-sub text-center">
                        -
                      </div>
                    );
                  const selfWon = game.selfScore > game.oppScore;
                  return (
                    <div key={i} className="text-center">
                      <span
                        className={
                          selfWon ? "text-success font-extrabold tabular-nums" : "tabular-nums"
                        }
                      >
                        {game.selfScore}
                      </span>
                    </div>
                  );
                })}

                {/* 区切り線 */}
                <div style={{ gridColumn: "1 / -1" }} className="border-line border-t" />

                {/* 相手行 */}
                <div
                  className={`sticky left-0 z-10 truncate bg-white pr-3 pl-1 text-lg ${match.result === MATCH_RESULT.LOSE ? "font-extrabold" : "text-sub"}`}
                >
                  {match.opponentName}
                </div>
                <div
                  className={`border-line flex items-center justify-center self-stretch border-r px-3 text-center font-extrabold tabular-nums ${match.result === MATCH_RESULT.LOSE ? "text-success" : ""}`}
                >
                  {match.oppWins}
                </div>
                {Array.from({ length: bestOf }, (_, i) => {
                  const game = match.games[i];
                  if (!game)
                    return (
                      <div key={i} className="text-sub text-center">
                        -
                      </div>
                    );
                  const oppWon = game.oppScore > game.selfScore;
                  return (
                    <div key={i} className="text-center">
                      <span
                        className={
                          oppWon ? "text-success font-extrabold tabular-nums" : "tabular-nums"
                        }
                      >
                        {game.oppScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
