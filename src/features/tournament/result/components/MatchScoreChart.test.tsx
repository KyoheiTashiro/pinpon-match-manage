import type { Side } from "@/domain/match";
import { MatchScoreChart } from "@/features/tournament/result/components/MatchScoreChart";
import type { MatchResultRow } from "@/features/tournament/result/hooks";
import { gameFromLog, makeGame } from "@/test/factories";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

const makeMatchResultRow = (overrides: Partial<MatchResultRow> = {}): MatchResultRow => ({
  id: "m1",
  leftName: "選手A",
  rightName: "選手B",
  leftMembers: ["a"],
  rightMembers: ["b"],
  games: [],
  leftWins: 0,
  rightWins: 0,
  winner: null,
  firstServer: "L",
  ...overrides,
});

describe("MatchScoreChart", () => {
  it("games が空 → 「得点記録なし」が表示される", () => {
    const match = makeMatchResultRow({ games: [] });
    render(<MatchScoreChart match={match} selfSide="L" />);
    expect(screen.getByText("得点記録なし")).toBeInTheDocument();
  });

  it("games に pointLog なし game → 「得点記録なし」が表示される", () => {
    const match = makeMatchResultRow({
      games: [makeGame({ leftScore: 11, rightScore: 5 })],
    });
    render(<MatchScoreChart match={match} selfSide="L" />);
    expect(screen.getByText("得点記録なし")).toBeInTheDocument();
  });

  it("pointLog あり → 「G1」見出しが表示される", () => {
    const match = makeMatchResultRow({
      games: [gameFromLog(["L", "R", "L", "L", "R"])],
    });
    render(<MatchScoreChart match={match} selfSide="L" />);
    expect(screen.getByText("G1")).toBeInTheDocument();
  });

  it("pointLog あり → 左右選手名が表示される", () => {
    const match = makeMatchResultRow({
      leftName: "選手A",
      rightName: "選手B",
      games: [gameFromLog(["L", "R", "L", "L", "R"])],
    });
    render(<MatchScoreChart match={match} selfSide="L" />);
    // 選手名はヘッダとチャート列の両方に出るため getAllByText を使う
    expect(screen.getAllByText("選手A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("選手B").length).toBeGreaterThanOrEqual(1);
  });

  it("pointLog あり → SVGの<line>要素が描画される", () => {
    // 3点以上のログで line は 2 本以上
    const match = makeMatchResultRow({
      games: [gameFromLog(["L", "R", "L"])],
    });
    const { container } = render(<MatchScoreChart match={match} selfSide="L" />);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it("pointLog が3点 → 各列に ScoreCircle が描画される（合計8個）", () => {
    // pointLog 3点: gameProgress で 3 ProgressPoint → 3列 + final列 1 = 4列
    // 各列に上下 2 個の ScoreCircle = 計 8 個
    // jsdom では数値テキストとして確認（重複がありえるので getAllByText で緩く）
    const match = makeMatchResultRow({
      games: [gameFromLog(["L", "R", "L"])],
    });
    const { container } = render(<MatchScoreChart match={match} selfSide="L" />);
    // ScoreCircle の div.rounded-full は数値を持つ
    const circles = container.querySelectorAll(".rounded-full");
    // 各列 2 個 × 4 列 = 8 個以上（サーブインジケータの rounded-full も含まれることがある）
    expect(circles.length).toBeGreaterThanOrEqual(8);
  });

  it("複数ゲーム → 「G1」「G2」両方が表示される", () => {
    const match = makeMatchResultRow({
      games: [gameFromLog(["L", "R", "L", "L", "R"]), gameFromLog(["R", "L", "R", "R", "L"])],
    });
    render(<MatchScoreChart match={match} selfSide="L" />);
    expect(screen.getByText("G1")).toBeInTheDocument();
    expect(screen.getByText("G2")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 追加テスト
  // -----------------------------------------------------------------------

  it("winner===LEFT → leftName が強調(text-sub なし)、rightName が text-sub", () => {
    const match = makeMatchResultRow({
      leftName: "選手A",
      rightName: "選手B",
      winner: "L",
      games: [gameFromLog(["L", "R", "L", "L", "R", "R", "L", "L", "L", "L", "L"])],
    });
    const { container } = render(<MatchScoreChart match={match} selfSide="L" />);
    // ヘッダの名前 span (.text-xl) は selfName, oppName, スコア の順
    const header = container.querySelector(".mb-1");
    const nameSpans = header?.querySelectorAll("span.text-xl");
    expect(nameSpans?.[0]?.className).not.toMatch(/text-sub/u);
    expect(nameSpans?.[1]?.className).toMatch(/text-sub/u);
  });

  it("winner===RIGHT → rightName が強調(text-sub なし)、leftName が text-sub", () => {
    const match = makeMatchResultRow({
      leftName: "選手A",
      rightName: "選手B",
      winner: "R",
      games: [gameFromLog(["R", "L", "R", "R", "L", "L", "R", "R", "R", "R", "R"])],
    });
    const { container } = render(<MatchScoreChart match={match} selfSide="L" />);
    const header = container.querySelector(".mb-1");
    const nameSpans = header?.querySelectorAll("span.text-xl");
    expect(nameSpans?.[1]?.className).not.toMatch(/text-sub/u);
    expect(nameSpans?.[0]?.className).toMatch(/text-sub/u);
  });

  it("デュースゲーム(10-10→12-10) → ラリー列数が pointLog の長さと一致する", () => {
    // 10-10 からさらに L,L で 12-10
    const log: Side[] = [
      ...Array.from({ length: 10 }, (): Side => "L"),
      ...Array.from({ length: 10 }, (): Side => "R"),
      "L",
      "L",
    ];
    const match = makeMatchResultRow({ games: [gameFromLog(log)] });
    const { container } = render(<MatchScoreChart match={match} selfSide="L" />);
    // チャート内の Column は .absolute.flex.flex-col で描画される
    // ラリー列 = log.length、最終スコア列 = 1 → 合計 log.length + 1
    const columns = container.querySelectorAll(".absolute.flex.flex-col");
    expect(columns.length).toBe(log.length + 1);
  });

  it("2ゲーム目(realIndex=1)では firstServer が opposite になる（サーブ権インジケータあり）", () => {
    // matchFirstServer="L" → G1 first="L", G2 first="R"
    const game1log: Side[] = ["L", "R", "L", "L", "R", "R", "L", "L", "L", "L", "L"];
    const game2log: Side[] = ["R", "L", "R", "R", "L", "L", "R", "R", "R", "R", "R"];
    const match = makeMatchResultRow({
      firstServer: "L",
      games: [gameFromLog(game1log), gameFromLog(game2log)],
    });
    const { container } = render(<MatchScoreChart match={match} selfSide="L" />);
    // G2が描画されること
    expect(screen.getByText("G2")).toBeInTheDocument();
    // サーブ権インジケータ (bg-orange-500) が存在すること
    const indicators = container.querySelectorAll(".bg-orange-500");
    expect(indicators.length).toBeGreaterThanOrEqual(1);
  });

  it("pointLog 1点(L) → final列 top=1/bot=0 が bg-amber-300 セルで表示される", () => {
    const match = makeMatchResultRow({ games: [gameFromLog(["L"])] });
    const { container } = render(<MatchScoreChart match={match} selfSide="L" />);
    // finalCell は bg-amber-300 クラスを持つ
    const finalCells = container.querySelectorAll(".bg-amber-300");
    expect(finalCells.length).toBe(2); // top と bot の 2 つ
    const texts = Array.from(finalCells).map((el) => el.textContent);
    expect(texts).toContain("1");
    expect(texts).toContain("0");
  });
});
