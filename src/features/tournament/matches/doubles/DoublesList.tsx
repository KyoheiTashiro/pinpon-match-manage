import { WinnerBadge } from "@/components/domain";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { Badge, EmptyState } from "@/components/ui";
import { matchSummary, SIDE } from "@/domain/match";
import { sideMembers, sideName } from "@/domain/side";
import { MatchesCard } from "@/features/tournament/matches/components/MatchesCard";
import { MatchModal } from "@/features/tournament/matches/components/MatchModal";
import { useDoubles } from "@/features/tournament/matches/doubles/hooks";
import { PairSelectForm } from "@/features/tournament/matches/doubles/PairSelectForm";
import { MATCH_STATE, STATE_BADGE } from "@/features/tournament/matches/matchState";
import type { MatchSide } from "@/store/types";

export const DoublesList = ({ tournamentId }: { tournamentId: string }) => {
  const {
    tournament,
    participants,
    matchList,
    players,
    wins,
    openMatchId,
    openMatch,
    closeMatch,
    pairForm,
    submit,
  } = useDoubles(tournamentId);

  if (!tournament) return null;

  /** ペアを名前の配列で返す（名前単位で折り返しを禁止するため連結しない） */
  const memberNames = (side: MatchSide) =>
    sideMembers(side).map((id) => ({ id, name: participants[id]?.name ?? "?" }));

  return (
    <div className="space-y-4">
      <PairSelectForm
        pairForm={pairForm}
        players={players}
        onSubmit={() => {
          void submit();
        }}
      />

      <MatchesCard tournament={tournament}>
        <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
          {matchList.length === 0 ? (
            <EmptyState variant="listItem" message="まだ試合がありません。" />
          ) : (
            matchList.map((match) => {
              const summary = matchSummary(match.games, wins);
              // ゲームが1つも入力されていない試合は「対戦」扱い（シングルス一覧と同基準）
              const hasScore = match.games.length > 0;
              const state = summary.finished
                ? MATCH_STATE.WON
                : hasScore
                  ? MATCH_STATE.IN_PROGRESS
                  : MATCH_STATE.UNPLAYED;
              // 終了済みは勝者を上段へ寄せる
              const swap = summary.finished && summary.winner === SIDE.RIGHT;
              const topSide = swap ? match.rightSide : match.leftSide;
              const bottomSide = swap ? match.leftSide : match.rightSide;
              const topWins = swap ? summary.rightWins : summary.leftWins;
              const bottomWins = swap ? summary.leftWins : summary.rightWins;
              return (
                <li key={match.id} className={STATE_BADGE[state].backgroundClassName}>
                  <button
                    onClick={() => openMatch(match.id)}
                    aria-label={`${sideName(topSide, participants)} 対 ${sideName(bottomSide, participants)}${hasScore ? ` ${topWins}-${bottomWins}${summary.finished ? "" : " 途中"}` : ""} 編集`}
                    className="hover:bg-bg flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left"
                  >
                    <span className="flex min-w-0 flex-1 flex-col text-lg font-bold">
                      <span className="flex min-w-0 items-center gap-2">
                        {summary.finished && <WinnerBadge size="xs" />}
                        <PairNames members={memberNames(topSide)} />
                        {hasScore && (
                          <span className="ml-auto text-2xl font-extrabold tabular-nums">
                            {topWins}
                          </span>
                        )}
                      </span>
                      <span className="border-line my-1 border-t" />
                      <span className="flex min-w-0 items-center gap-2">
                        <PairNames members={memberNames(bottomSide)} />
                        {hasScore && (
                          <span className="ml-auto text-2xl font-extrabold tabular-nums">
                            {bottomWins}
                          </span>
                        )}
                      </span>
                    </span>
                    <Badge tone={STATE_BADGE[state].tone} appearance="solid">
                      {STATE_BADGE[state].label}
                    </Badge>
                    <ChevronDownIcon className="size-7 flex-shrink-0 -rotate-90 text-[#94a3b8]" />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </MatchesCard>

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};

/** 狭い画面では1人1行に積み、sm 以上で「A / B」の横1行に戻す */
const PairNames = ({ members }: { members: { id: string; name: string }[] }) => (
  <span className="flex min-w-0 flex-col sm:flex-row sm:items-center">
    {members.map((member, index) => (
      <span key={member.id} className="whitespace-nowrap">
        {index > 0 && <span className="text-sub mx-2 hidden sm:inline">/</span>}
        {member.name}
      </span>
    ))}
  </span>
);
