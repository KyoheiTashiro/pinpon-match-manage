import { WinnerBadge } from "@/components/domain";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { Badge } from "@/components/ui";
import { MatchesHeader } from "@/features/tournament/matches/components/MatchesHeader";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { MATCH_STATE, STATE_BADGE } from "@/features/tournament/matches/matchState";
import { useSinglesList } from "@/features/tournament/matches/singles/hooks";

export const SinglesList = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, rows, openOrCreate, openMatchId, closeMatch } =
    useSinglesList(tournamentId);

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2 bg-white p-3">
        <MatchesHeader tournament={tournament} />
        <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
          {rows.map((row) => (
            <li key={row.key} className={STATE_BADGE[row.state].backgroundClassName}>
              <button
                onClick={() => openOrCreate(row.aId, row.bId)}
                aria-label={row.ariaLabel}
                className="hover:bg-bg flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left"
              >
                <span className="flex min-w-0 flex-1 flex-col text-lg font-bold">
                  <span className="flex min-w-0 items-center gap-1">
                    {row.state === MATCH_STATE.WON && <WinnerBadge size="xs" />}
                    <span className="truncate">{row.leftName}</span>
                  </span>
                  <span className="border-line my-1 border-t" />
                  <span className="truncate">{row.rightName}</span>
                </span>
                <span className="flex flex-col items-center gap-1">
                  {row.state !== MATCH_STATE.UNPLAYED && (
                    <span className="min-w-[3rem] text-center text-2xl font-extrabold">
                      {row.leftWins}-{row.rightWins}
                    </span>
                  )}
                  <Badge tone={STATE_BADGE[row.state].tone} appearance="solid">
                    {STATE_BADGE[row.state].label}
                  </Badge>
                </span>
                <ChevronDownIcon className="size-7 flex-shrink-0 -rotate-90 text-[#94a3b8]" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
