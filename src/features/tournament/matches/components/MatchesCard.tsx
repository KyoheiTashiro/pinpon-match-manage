import type { Tournament } from "@/store/types";
import type { ReactNode } from "react";

/** 対戦表カード（大会名・開催日ヘッダ + 中身。シングルス/マトリクス/ダブルス共有） */
export const MatchesCard = ({
  tournament,
  children,
}: {
  tournament: Tournament;
  children: ReactNode;
}) => (
  <div className="space-y-2 bg-white p-3">
    <div className="border-line border-b-2 pb-2">
      <div className="text-xl font-extrabold">{tournament.name}</div>
      <div className="text-sub text-sm">{tournament.date}</div>
    </div>
    {children}
  </div>
);
