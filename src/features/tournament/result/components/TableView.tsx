import { MatchResultsTable } from "@/features/tournament/result/components/MatchResultsTable";
import { RankingTable } from "@/features/tournament/result/components/RankingTable";
import { useResult } from "@/features/tournament/result/hooks";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

type Props = {
  rows: ReturnType<typeof useResult>["rows"];
  matchResults: MatchResultRow[];
  bestOf: number;
};

export const TableView = ({ rows, matchResults, bestOf }: Props) => (
  <>
    <RankingTable rows={rows} />
    <MatchResultsTable matchResults={matchResults} bestOf={bestOf} />
  </>
);
