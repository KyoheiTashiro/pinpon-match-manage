import { PersonalMatchResults } from "@/features/tournament/result/components/PersonalMatchResults";
import type { PersonalMatchRow } from "@/features/tournament/result/hooks";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

const makeRow = (overrides: Partial<PersonalMatchRow> = {}): PersonalMatchRow => ({
  id: "m1",
  selfName: "選手A",
  opponentName: "選手B",
  selfWins: 0,
  oppWins: 0,
  games: [],
  result: null,
  ...overrides,
});

describe("PersonalMatchResults", () => {
  it("空配列 → 「データがありません」", () => {
    render(<PersonalMatchResults matches={[]} bestOf={5} />);
    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });

  it("対戦名を表示する", () => {
    const matches = [makeRow({ selfWins: 3, oppWins: 1 })];
    render(<PersonalMatchResults matches={matches} bestOf={5} />);
    expect(screen.getAllByText("選手A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("選手B").length).toBeGreaterThanOrEqual(1);
  });

  it("総合セット数を個別に表示する(selfWins=3, oppWins=1)", () => {
    const matches = [makeRow({ selfWins: 3, oppWins: 1 })];
    render(<PersonalMatchResults matches={matches} bestOf={5} />);
    // 計セルに 3 と 1 が出る
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("result=win → selfName が font-extrabold、opponentName が text-sub", () => {
    render(<PersonalMatchResults matches={[makeRow({ result: "win" })]} bestOf={5} />);
    // ヘッダ部とスコアボード名前セルの両方に同名が出る可能性があるのでAllByTextで
    const selfEls = screen.getAllByText("選手A");
    expect(selfEls.some((el) => el.className.includes("font-extrabold"))).toBe(true);
    const oppEls = screen.getAllByText("選手B");
    expect(oppEls.some((el) => el.className.includes("text-sub"))).toBe(true);
  });

  it("result=lose → opponentName が font-extrabold", () => {
    render(<PersonalMatchResults matches={[makeRow({ result: "lose" })]} bestOf={5} />);
    const oppEls = screen.getAllByText("選手B");
    expect(oppEls.some((el) => el.className.includes("font-extrabold"))).toBe(true);
    const selfEls = screen.getAllByText("選手A");
    expect(selfEls.some((el) => el.className.includes("text-sub"))).toBe(true);
  });

  it("自分が勝ったゲームのselfScoreがfont-extrabold", () => {
    const matches = [makeRow({ games: [{ selfScore: 11, oppScore: 9 }], selfWins: 1, oppWins: 0 })];
    render(<PersonalMatchResults matches={matches} bestOf={5} />);
    const eleven = screen.getByText("11");
    expect(eleven.className).toMatch(/font-extrabold/u);
    // oppScoreの9は通常表示
    expect(screen.getByText("9").className).not.toMatch(/font-extrabold/u);
  });

  it("games が bestOf より少ない → 未入力セルは '-'", () => {
    const matches = [makeRow({ games: [{ selfScore: 11, oppScore: 5 }] })];
    render(<PersonalMatchResults matches={matches} bestOf={5} />);
    // bestOf=5, games=1 → 未入力4ゲーム × 自分行+相手行 = 8つ "-"
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(4);
  });

  it("bestOf=3 → G1〜G3 のみ、G4 は無い", () => {
    render(<PersonalMatchResults matches={[makeRow()]} bestOf={3} />);
    expect(screen.getByText("G1")).toBeInTheDocument();
    expect(screen.getByText("G3")).toBeInTheDocument();
    expect(screen.queryByText("G4")).not.toBeInTheDocument();
  });

  it("複数対戦をブロックとして並べる", () => {
    const matches = [
      makeRow({ id: "m1", opponentName: "選手B" }),
      makeRow({ id: "m2", opponentName: "選手C" }),
    ];
    render(<PersonalMatchResults matches={matches} bestOf={5} />);
    expect(screen.getAllByText("選手B").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("選手C").length).toBeGreaterThanOrEqual(1);
  });
});
