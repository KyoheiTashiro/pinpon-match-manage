import { SIDE } from "@/domain/match";
import type { Game } from "@/domain/match";
import { MatchResultsTable } from "@/features/tournament/result/components/MatchResultsTable";
import type { MatchResultRow } from "@/features/tournament/result/hooks";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

const makeGame = (overrides: Partial<Game> = {}): Game => ({
  leftScore: 0,
  rightScore: 0,
  ...overrides,
});

const makeMatchResult = (overrides: Partial<MatchResultRow> = {}): MatchResultRow => ({
  id: "m1",
  leftName: "選手A",
  rightName: "選手B",
  leftMembers: ["a"],
  rightMembers: ["b"],
  games: [],
  leftWins: 0,
  rightWins: 0,
  winner: null,
  firstServer: SIDE.LEFT,
  ...overrides,
});

describe("MatchResultsTable", () => {
  it("空配列 → 「データがありません」", () => {
    render(<MatchResultsTable matchResults={[]} bestOf={5} />);
    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });

  it("bestOf=5 → ヘッダに G1〜G5 と「セット」が出る", () => {
    const matchResults = [makeMatchResult({ games: [makeGame()] })];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    expect(screen.getByText("G1")).toBeInTheDocument();
    expect(screen.getByText("G2")).toBeInTheDocument();
    expect(screen.getByText("G3")).toBeInTheDocument();
    expect(screen.getByText("G4")).toBeInTheDocument();
    expect(screen.getByText("G5")).toBeInTheDocument();
    expect(screen.getByText("セット")).toBeInTheDocument();
  });

  it('games が bestOf より少ない → 未入力ゲーム枠は "-"', () => {
    const games = [
      makeGame({ leftScore: 11, rightScore: 5 }),
      makeGame({ leftScore: 11, rightScore: 7 }),
    ];
    const matchResults = [makeMatchResult({ games })];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    const dashes = screen.getAllByText("-");
    // スコア間の "-" と未入力ゲームの "-" の両方がある
    // 未入力ゲームは 3 枠分 ("-" が 3 つ以上あることを確認)
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  it("各ゲームのスコアが表示される", () => {
    const games = [makeGame({ leftScore: 11, rightScore: 5 })];
    const matchResults = [makeMatchResult({ games })];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("winner=LEFT → leftName は text-sub を持たず、rightName が text-sub", () => {
    const games = [makeGame({ leftScore: 11, rightScore: 5 })];
    const matchResults = [
      makeMatchResult({ winner: SIDE.LEFT, leftName: "選手A", rightName: "選手B", games }),
    ];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    expect(screen.getByText("選手A").className).not.toMatch(/text-sub/u);
    expect(screen.getByText("選手B").className).toMatch(/text-sub/u);
  });

  it("winner=RIGHT → rightName は text-sub を持たず、leftName が text-sub", () => {
    const games = [makeGame({ leftScore: 5, rightScore: 11 })];
    const matchResults = [
      makeMatchResult({ winner: SIDE.RIGHT, leftName: "選手A", rightName: "選手B", games }),
    ];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    expect(screen.getByText("選手B").className).not.toMatch(/text-sub/u);
    expect(screen.getByText("選手A").className).toMatch(/text-sub/u);
  });

  it("セット数セルに leftWins-rightWins が表示される", () => {
    const games = [
      makeGame({ leftScore: 11, rightScore: 5 }),
      makeGame({ leftScore: 11, rightScore: 7 }),
      makeGame({ leftScore: 11, rightScore: 9 }),
      makeGame({ leftScore: 5, rightScore: 11 }),
      makeGame({ leftScore: 7, rightScore: 11 }),
    ];
    const matchResults = [makeMatchResult({ leftWins: 3, rightWins: 2, winner: SIDE.LEFT, games })];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    expect(screen.getByText("3-2")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 追加テスト
  // -----------------------------------------------------------------------

  it("winner===null → 両名が text-sub クラスを持つ", () => {
    const games = [makeGame({ leftScore: 5, rightScore: 5 })];
    const matchResults = [
      makeMatchResult({ winner: null, leftName: "選手A", rightName: "選手B", games }),
    ];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    expect(screen.getByText("選手A").className).toMatch(/text-sub/u);
    expect(screen.getByText("選手B").className).toMatch(/text-sub/u);
  });

  it("ゲーム同点(leftScore===rightScore) → どちらも font-extrabold なし", () => {
    const games = [makeGame({ leftScore: 10, rightScore: 10 })];
    const matchResults = [makeMatchResult({ games })];
    render(<MatchResultsTable matchResults={matchResults} bestOf={5} />);
    const allTens = screen.getAllByText("10");
    for (const el of allTens) {
      expect(el.className).not.toMatch(/font-extrabold/u);
    }
  });

  it("bestOf=3 → G1〜G3 のみ表示され G4 は存在しない", () => {
    render(<MatchResultsTable matchResults={[makeMatchResult()]} bestOf={3} />);
    expect(screen.getByText("G1")).toBeInTheDocument();
    expect(screen.getByText("G2")).toBeInTheDocument();
    expect(screen.getByText("G3")).toBeInTheDocument();
    expect(screen.queryByText("G4")).not.toBeInTheDocument();
  });

  it("bestOf=7 → G1〜G7 が全て表示される", () => {
    render(<MatchResultsTable matchResults={[makeMatchResult()]} bestOf={7} />);
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByText(`G${i}`)).toBeInTheDocument();
    }
  });

  it("複数行: 最終行の td に border-b-2 なし、先頭行の td に border-b-2 あり", () => {
    const rows = [
      makeMatchResult({ id: "m1", games: [makeGame({ leftScore: 11, rightScore: 5 })] }),
      makeMatchResult({ id: "m2", games: [makeGame({ leftScore: 5, rightScore: 11 })] }),
    ];
    const { container } = render(<MatchResultsTable matchResults={rows} bestOf={5} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(2);

    // 先頭行の最初の td: border-b-2 あり
    const firstTds = bodyRows[0].querySelectorAll("td");
    expect(firstTds[0].className).toMatch(/border-b-2/u);

    // 最終行の最初の td: border-b-2 なし
    const lastTds = bodyRows[1].querySelectorAll("td");
    expect(lastTds[0].className).not.toMatch(/border-b-2/u);
  });
});
