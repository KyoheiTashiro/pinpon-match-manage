import { WinnerBadge } from "@/components/domain";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { Badge } from "@/components/ui";
import { MatchesHeader } from "@/features/tournament/matches/components/MatchesHeader";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { useSinglesList, MIN_PLAYERS_SINGLES } from "@/features/tournament/matches/singles/hooks";

export const SinglesList = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, players, rows, openRow, openMatchId, closeMatch } =
    useSinglesList(tournamentId);

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      {players.length < MIN_PLAYERS_SINGLES ? (
        <p className="text-sub">参加者を2人以上 登録してください。</p>
      ) : (
        <div className="space-y-2 bg-white p-3">
          <MatchesHeader tournament={tournament} />
          <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
            {rows.map((row) => (
              <li
                key={row.key}
                className={row.finished ? "bg-winBg" : row.inProgress ? "bg-warning/10" : ""}
              >
                <button
                  onClick={() => openRow(row)}
                  aria-label={row.ariaLabel}
                  className="hover:bg-bg flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left"
                >
                  <span className="flex min-w-0 flex-1 flex-col text-lg font-bold">
                    <span className="flex min-w-0 items-center gap-1">
                      {row.finished && <WinnerBadge size="xs" />}
                      <span className="truncate">{row.leftName}</span>
                    </span>
                    <span className="border-line my-1 border-t" />
                    <span className="truncate">{row.rightName}</span>
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    {row.hasScore && (
                      <span className="min-w-[3rem] text-center text-2xl font-extrabold">
                        {row.leftWins}-{row.rightWins}
                      </span>
                    )}
                    {row.finished ? (
                      <Badge tone="neutral" appearance="solid">
                        終了
                      </Badge>
                    ) : row.inProgress ? (
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
            ))}
          </ul>
        </div>
      )}

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
