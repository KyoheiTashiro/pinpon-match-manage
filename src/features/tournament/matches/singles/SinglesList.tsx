import { WinnerBadge } from "@/components/domain";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { Badge } from "@/components/ui";
import { MatchesCard } from "@/features/tournament/matches/components/MatchesCard";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { MATCH_STATE, STATE_BADGE } from "@/features/tournament/matches/matchState";
import { useSinglesList } from "@/features/tournament/matches/singles/hooks";

export const SinglesList = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, rows, openOrCreate, openMatchId, closeMatch } =
    useSinglesList(tournamentId);

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <MatchesCard tournament={tournament}>
        <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
          {rows.map((row) => (
            <li key={row.key} className={STATE_BADGE[row.state].backgroundClassName}>
              <button
                onClick={() => openOrCreate(row.aId, row.bId)}
                aria-label={row.ariaLabel}
                className="hover:bg-bg flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left"
              >
                <span className="flex min-w-0 flex-1 flex-col text-lg font-bold">
                  <span className="flex min-w-0 items-center gap-2">
                    {row.state === MATCH_STATE.WON && <WinnerBadge size="xs" />}
                    <span className="truncate">{row.leftName}</span>
                    {row.state !== MATCH_STATE.UNPLAYED && (
                      <span className="ml-auto text-2xl font-extrabold tabular-nums">
                        {row.leftWins}
                      </span>
                    )}
                  </span>
                  <span className="border-line my-1 border-t" />
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{row.rightName}</span>
                    {row.state !== MATCH_STATE.UNPLAYED && (
                      <span className="ml-auto text-2xl font-extrabold tabular-nums">
                        {row.rightWins}
                      </span>
                    )}
                  </span>
                </span>
                <Badge tone={STATE_BADGE[row.state].tone} appearance="solid">
                  {STATE_BADGE[row.state].label}
                </Badge>
                <ChevronDownIcon className="size-7 flex-shrink-0 -rotate-90 text-[#94a3b8]" />
              </button>
            </li>
          ))}
        </ul>
      </MatchesCard>

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
