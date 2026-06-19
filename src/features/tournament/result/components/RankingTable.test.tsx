import type { RankingRow } from "@/domain/ranking";
import { RankingTable } from "@/features/tournament/result/components/RankingTable";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

const makeRow = (overrides: Partial<RankingRow> = {}): RankingRow => ({
  participantId: "p1",
  name: "選手A",
  played: 3,
  wins: 2,
  losses: 1,
  gamesWon: 5,
  gamesLost: 2,
  gameDiff: 3,
  pointsFor: 50,
  pointsAgainst: 35,
  pointDiff: 15,
  rank: 1,
  ...overrides,
});

describe("RankingTable", () => {
  it("空配列 → 「データがありません」", () => {
    render(<RankingTable rows={[]} />);
    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });

  it("rows を渡す → 順位・名前・試合数・勝・敗が表示される", () => {
    const row = makeRow({
      rank: 1,
      name: "選手A",
      played: 3,
      wins: 2,
      losses: 1,
    });
    render(<RankingTable rows={[row]} />);
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("選手A")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("signed 正値 → +N", () => {
    const row = makeRow({ gameDiff: 3 });
    render(<RankingTable rows={[row]} />);
    expect(screen.getByText("+3", { exact: false })).toBeInTheDocument();
  });

  it("signed 負値 → -N", () => {
    const row = makeRow({ gameDiff: -2, gamesWon: 1, gamesLost: 3 });
    render(<RankingTable rows={[row]} />);
    expect(screen.getByText("-2", { exact: false })).toBeInTheDocument();
  });

  it("G差セルに (gamesWon/gamesLost) が表示される", () => {
    const row = makeRow({ gamesWon: 5, gamesLost: 2 });
    render(<RankingTable rows={[row]} />);
    expect(screen.getByText("(5/2)")).toBeInTheDocument();
  });

  it("点差セルに (pointsFor/pointsAgainst) が表示される", () => {
    const row = makeRow({ pointsFor: 50, pointsAgainst: 35 });
    render(<RankingTable rows={[row]} />);
    expect(screen.getByText("(50/35)")).toBeInTheDocument();
  });

  it("複数行が全て描画される", () => {
    const rows: RankingRow[] = [
      makeRow({ participantId: "p1", name: "選手A", rank: 1 }),
      makeRow({ participantId: "p2", name: "選手B", rank: 2 }),
    ];
    render(<RankingTable rows={rows} />);
    expect(screen.getByText("選手A")).toBeInTheDocument();
    expect(screen.getByText("選手B")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 追加テスト
  // -----------------------------------------------------------------------

  it("gameDiff===0 → 「0」(符号なし)が表示され「+0」は存在しない", () => {
    const row = makeRow({ gameDiff: 0, gamesWon: 2, gamesLost: 2 });
    render(<RankingTable rows={[row]} />);
    // signed(0) = "0"（0 > 0 は false なので "0" になる）
    // G差セル (gamesWon/gamesLost) のペアで同定
    expect(screen.getByText("(2/2)")).toBeInTheDocument();
    // "+0" が存在しないこと
    expect(screen.queryByText("+0")).not.toBeInTheDocument();
  });

  it("pointDiff===0 → 「0」(符号なし)が表示され「+0」は存在しない", () => {
    const row = makeRow({ pointDiff: 0, pointsFor: 30, pointsAgainst: 30 });
    render(<RankingTable rows={[row]} />);
    expect(screen.getByText("(30/30)")).toBeInTheDocument();
    expect(screen.queryByText("+0")).not.toBeInTheDocument();
  });

  it("同順位(ties) → 同じ rank 値が複数行に表示される", () => {
    const rows: RankingRow[] = [
      makeRow({
        participantId: "p1",
        name: "選手A",
        rank: 1,
        wins: 2,
        gameDiff: 3,
        pointDiff: 10,
      }),
      makeRow({
        participantId: "p2",
        name: "選手B",
        rank: 1,
        wins: 2,
        gameDiff: 3,
        pointDiff: 10,
      }),
    ];
    render(<RankingTable rows={rows} />);
    // rank=1 のセルが 2 行分表示される
    const rankCells = screen.getAllByText("1");
    expect(rankCells.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("選手A")).toBeInTheDocument();
    expect(screen.getByText("選手B")).toBeInTheDocument();
  });

  it("losses 列の値が正しく表示される", () => {
    const row = makeRow({ losses: 3 });
    render(<RankingTable rows={[row]} />);
    // text-danger クラスを持つセルが losses 列
    const cells = Array.from(document.querySelectorAll("td"));
    const lossCells = cells.filter((td) => td.className.includes("text-danger"));
    expect(lossCells.some((td) => td.textContent === "3")).toBe(true);
  });
});
