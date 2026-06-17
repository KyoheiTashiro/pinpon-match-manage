import { MatchScoreChart } from "@/features/tournament/result/components/MatchScoreChart";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

type Props = {
  graphMatches: MatchResultRow[];
  selectedMatch: MatchResultRow | null;
};

export const GraphView = ({ graphMatches, selectedMatch }: Props) =>
  graphMatches.length === 0 ? (
    <p className="text-sub">対戦結果がありません。</p>
  ) : selectedMatch ? (
    <MatchScoreChart match={selectedMatch} />
  ) : null;
