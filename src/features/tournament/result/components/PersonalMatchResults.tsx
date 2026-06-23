import { MatchResultBoard } from "@/components/domain";
import { EmptyState } from "@/components/ui";
import { MATCH_RESULT } from "@/features/tournament/result/hooks";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";

type Props = {
  matches: PersonalMatchRow[];
};

const toBoardProps = (match: PersonalMatchRow) => ({
  left: {
    name: match.selfName,
    wins: match.selfWins,
    isWinner: match.result === MATCH_RESULT.WIN,
  },
  right: {
    name: match.opponentName,
    wins: match.opponentWins,
    isWinner: match.result === MATCH_RESULT.LOSE,
  },
  games: match.games.map((game) => ({
    leftScore: game.selfScore,
    rightScore: game.opponentScore,
    leftWon: game.selfScore > game.opponentScore,
    rightWon: game.opponentScore > game.selfScore,
  })),
});

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
            <MatchResultBoard {...toBoardProps(match)} />
          </div>
        ))}
      </div>
    </div>
  );
};
