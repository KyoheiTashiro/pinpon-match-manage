import { MatchScoreChart } from "@/features/tournament/result/components/MatchScoreChart";
import type { MatchResultRow } from "@/features/tournament/result/hooks";
import type { Ref } from "react";

type Props = {
  captureRef: Ref<HTMLDivElement>;
  name: string;
  date: string;
  graphMatches: MatchResultRow[];
};

export const AllMatchesCapture = ({ captureRef, name, date, graphMatches }: Props) => (
  <div
    aria-hidden
    className="pointer-events-none absolute top-0 -left-[99999px] h-0 overflow-hidden"
  >
    <div ref={captureRef} className="space-y-2 bg-white p-3">
      {/* 大会名・日付ヘッダ */}
      <div className="border-line border-b-2 pb-2">
        <div className="text-xl font-extrabold">{name}</div>
        <div className="text-sub text-sm">{date}</div>
      </div>
      {/* 全対戦を縦積み（対戦ごとに区切り線） */}
      <div>
        {graphMatches.map((match) => (
          <div
            key={match.id}
            className="border-line mt-6 border-t-2 pt-6 first:mt-0 first:border-t-0 first:pt-0"
          >
            <MatchScoreChart match={match} />
          </div>
        ))}
      </div>
    </div>
  </div>
);
