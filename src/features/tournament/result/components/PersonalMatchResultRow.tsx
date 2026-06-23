import { MatchResultBoard } from "@/components/domain";
import { MATCH_RESULT } from "@/features/tournament/result/hooks";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";

type Props = {
  match: PersonalMatchRow;
};

export const PersonalMatchResultRow = ({ match }: Props) => {
  const left = {
    name: match.selfName,
    wins: match.selfWins,
    isWinner: match.result === MATCH_RESULT.WIN,
  };
  const right = {
    name: match.opponentName,
    wins: match.opponentWins,
    isWinner: match.result === MATCH_RESULT.LOSE,
  };
  const games = match.games.map((game) => ({
    leftScore: game.selfScore,
    rightScore: game.opponentScore,
    leftWon: game.selfScore > game.opponentScore,
    rightWon: game.opponentScore > game.selfScore,
  }));

  return (
    <div className="border-line overflow-hidden rounded-2xl border-2 py-4">
      <MatchResultBoard left={left} right={right} games={games} />
    </div>
  );
};
