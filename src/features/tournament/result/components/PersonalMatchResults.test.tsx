import { PersonalMatchResults } from "@/features/tournament/result/components/PersonalMatchResults";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

const makeRow = (overrides: Partial<PersonalMatchRow> = {}): PersonalMatchRow => ({
  id: "m1",
  selfName: "選手A",
  opponentName: "選手B",
  selfWins: 0,
  opponentWins: 0,
  games: [],
  result: null,
  ...overrides,
});

describe("PersonalMatchResults", () => {
  it("空配列 → 「データがありません」", () => {
    render(<PersonalMatchResults matches={[]} />);
    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });

  it("対戦名を表示する", () => {
    const matches = [makeRow({ selfWins: 3, opponentWins: 1 })];
    render(<PersonalMatchResults matches={matches} />);
    expect(screen.getAllByText("選手A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("選手B").length).toBeGreaterThanOrEqual(1);
  });

  it("総合セット数を個別に表示する(selfWins=3, opponentWins=1)", () => {
    const matches = [makeRow({ selfWins: 3, opponentWins: 1 })];
    render(<PersonalMatchResults matches={matches} />);
    // 計セルに 3 と 1 が出る
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("result=win → selfName は強調(text-sub なし)、opponentName が text-sub", () => {
    render(<PersonalMatchResults matches={[makeRow({ result: "win" })]} />);
    expect(screen.getByText("選手A").className).not.toMatch(/text-sub/u);
    expect(screen.getByText("選手B").className).toMatch(/text-sub/u);
  });

  it("result=lose → opponentName は強調(text-sub なし)、selfName が text-sub", () => {
    render(<PersonalMatchResults matches={[makeRow({ result: "lose" })]} />);
    expect(screen.getByText("選手B").className).not.toMatch(/text-sub/u);
    expect(screen.getByText("選手A").className).toMatch(/text-sub/u);
  });

  it("自分が勝ったゲームのselfScoreが text-success", () => {
    const matches = [
      makeRow({ games: [{ selfScore: 11, opponentScore: 9 }], selfWins: 1, opponentWins: 0 }),
    ];
    render(<PersonalMatchResults matches={matches} />);
    expect(screen.getByText("11").className).toMatch(/text-success/u);
    // opponentScoreの9は通常表示
    expect(screen.getByText("9").className).not.toMatch(/text-success/u);
  });

  it("games の数だけスコア行を表示する（未入力パディングなし）", () => {
    const matches = [makeRow({ games: [{ selfScore: 11, opponentScore: 5 }] })];
    render(<PersonalMatchResults matches={matches} />);
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    // 区切りダッシュは入力済み1ゲーム分のみ
    expect(screen.getAllByText("-").length).toBe(1);
  });

  it("複数対戦をブロックとして並べる", () => {
    const matches = [
      makeRow({ id: "m1", opponentName: "選手B" }),
      makeRow({ id: "m2", opponentName: "選手C" }),
    ];
    render(<PersonalMatchResults matches={matches} />);
    expect(screen.getAllByText("選手B").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("選手C").length).toBeGreaterThanOrEqual(1);
  });
});
