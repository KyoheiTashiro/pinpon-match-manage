import type { Tournament } from "@/store/types";

/** 対戦表カード上部の大会名・開催日ヘッダ（シングルス/マトリクス/ダブルスで共有） */
export const MatchesHeader = ({ tournament }: { tournament: Tournament }) => (
  <div className="border-line border-b-2 pb-2">
    <div className="text-xl font-extrabold">{tournament.name}</div>
    <div className="text-sub text-sm">{tournament.date}</div>
  </div>
);
