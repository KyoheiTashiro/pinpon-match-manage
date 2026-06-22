import { WinnerBadge } from "@/components/domain";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { Badge } from "@/components/ui";
import { matchSummary, winsNeededForBestOf, SIDE } from "@/domain/match";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { useSingles, MIN_PLAYERS_SINGLES } from "@/features/tournament/matches/singles/hooks";
import { SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";

export const SinglesList = ({ tournamentId }: { tournamentId: string }) => {
  const {
    tournament,
    participants,
    players,
    allPairs,
    singlesCellMatch,
    openMatchId,
    openMatch,
    closeMatch,
  } = useSingles(tournamentId);
  const addManualMatch = useAppStore((state) => state.addManualMatch);

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表</h2>

      {players.length < MIN_PLAYERS_SINGLES ? (
        <p className="text-sub">参加者を2人以上 登録してください。</p>
      ) : (
        <div className="space-y-2 bg-white p-3">
          <div className="border-line border-b-2 pb-2">
            <div className="text-xl font-extrabold">{tournament.name}</div>
            <div className="text-sub text-sm">{tournament.date}</div>
          </div>
          <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
            {allPairs.map(({ a, b }) => {
              const key = [a.id, b.id].toSorted().join("|");
              const match = singlesCellMatch.get(key);
              const summary = match ? matchSummary(match.games, wins) : null;
              const hasScore = !!match && (summary?.finished === true || match.games.length > 0);
              const finished = summary?.finished === true;
              const inProgress = hasScore && !finished;

              // leftSide は SINGLE 確定。a がどちらのサイドか判定。
              const aIsLeft =
                !!match &&
                match.leftSide.kind === SIDE_KIND.SINGLE &&
                match.leftSide.participantId === a.id;
              const aWins = aIsLeft ? summary?.leftWins : summary?.rightWins;
              const bWins = aIsLeft ? summary?.rightWins : summary?.leftWins;
              const aWon =
                finished &&
                (aIsLeft ? summary.winner === SIDE.LEFT : summary.winner === SIDE.RIGHT);

              // 終了時は勝者を左・敗者を右に並べ替え。それ以外は a・b の並び。
              const swap = finished && !aWon;
              const leftName = swap ? b.name : a.name;
              const rightName = swap ? a.name : b.name;
              const leftWins = swap ? bWins : aWins;
              const rightWins = swap ? aWins : bWins;

              const onClick = () => {
                if (match) {
                  openMatch(match.id);
                  return;
                }
                const id = addManualMatch(
                  tournamentId,
                  { kind: SIDE_KIND.SINGLE, participantId: a.id },
                  { kind: SIDE_KIND.SINGLE, participantId: b.id },
                );
                openMatch(id);
              };

              const ariaLabel = hasScore
                ? `${leftName} 対 ${rightName} ${leftWins}-${rightWins}${inProgress ? " 途中" : ""} 編集`
                : `${a.name} 対 ${b.name} 対戦追加`;

              const liClass = finished ? "bg-winBg" : inProgress ? "bg-warning/10" : "";

              return (
                <li key={key} className={liClass}>
                  <button
                    onClick={onClick}
                    aria-label={ariaLabel}
                    className="hover:bg-bg flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left"
                  >
                    <span className="flex min-w-0 flex-1 flex-col text-lg font-bold">
                      <span className="flex min-w-0 items-center gap-1">
                        {finished && <WinnerBadge size="xs" />}
                        <span className="truncate">{leftName}</span>
                      </span>
                      <span className="border-line my-1 border-t" />
                      <span className="truncate">{rightName}</span>
                    </span>
                    <span className="flex flex-col items-center gap-1">
                      {hasScore && (
                        <span className="min-w-[3rem] text-center text-2xl font-extrabold">
                          {leftWins}-{rightWins}
                        </span>
                      )}
                      {finished ? (
                        <Badge tone="success" appearance="solid">
                          終了
                        </Badge>
                      ) : inProgress ? (
                        <Badge tone="warning" appearance="solid">
                          途中
                        </Badge>
                      ) : (
                        <Badge tone="primary" appearance="solid">
                          対戦
                        </Badge>
                      )}
                    </span>
                    <ChevronDownIcon className="size-7 flex-shrink-0 -rotate-90 text-[#94a3b8]" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
