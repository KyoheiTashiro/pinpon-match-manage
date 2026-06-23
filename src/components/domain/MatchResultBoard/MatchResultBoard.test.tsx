import { MatchResultBoard } from "@/components/domain/MatchResultBoard";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

const games = [
  { leftScore: 11, rightScore: 5, leftWon: true, rightWon: false },
  { leftScore: 9, rightScore: 11, leftWon: false, rightWon: true },
];

describe("MatchResultBoard", () => {
  it("左右の名前と勝数を描画する", () => {
    const { getByText } = render(
      <MatchResultBoard
        left={{ name: "山田", wins: 2, isWinner: true }}
        right={{ name: "佐藤", wins: 1, isWinner: false }}
        games={games}
      />,
    );
    expect(getByText("山田")).toBeTruthy();
    expect(getByText("佐藤")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
  });

  it("左勝者のときのみ左に勝者バッジを表示する", () => {
    const { container } = render(
      <MatchResultBoard
        left={{ name: "山田", wins: 2, isWinner: true }}
        right={{ name: "佐藤", wins: 1, isWinner: false }}
        games={games}
      />,
    );
    // 勝者バッジ（lg）は div ラッパ。svg は1つだけ存在する。
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("右勝者のときのみ右に勝者バッジを表示する", () => {
    const { container } = render(
      <MatchResultBoard
        left={{ name: "山田", wins: 1, isWinner: false }}
        right={{ name: "佐藤", wins: 2, isWinner: true }}
        games={games}
      />,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("勝者なしのとき勝者バッジを表示しない", () => {
    const { container } = render(
      <MatchResultBoard
        left={{ name: "山田", wins: 0, isWinner: false }}
        right={{ name: "佐藤", wins: 0, isWinner: false }}
        games={[]}
      />,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("空games のとき名前と勝数は描画される", () => {
    const { getByText } = render(
      <MatchResultBoard
        left={{ name: "山田", wins: 0, isWinner: false }}
        right={{ name: "佐藤", wins: 0, isWinner: false }}
        games={[]}
      />,
    );
    expect(getByText("山田")).toBeTruthy();
    expect(getByText("佐藤")).toBeTruthy();
  });

  it("各ゲームのスコアを描画する", () => {
    const { getByText } = render(
      <MatchResultBoard
        left={{ name: "山田", wins: 1, isWinner: false }}
        right={{ name: "佐藤", wins: 2, isWinner: true }}
        games={games}
      />,
    );
    // 1ゲーム目 11-5、2ゲーム目 9-11
    expect(getByText("5")).toBeTruthy();
    expect(getByText("9")).toBeTruthy();
  });

  it("勝者ゲームのスコアにのみ勝者色クラスを付与する", () => {
    const { getByText } = render(
      <MatchResultBoard
        left={{ name: "山田", wins: 1, isWinner: false }}
        right={{ name: "佐藤", wins: 2, isWinner: true }}
        games={[{ leftScore: 11, rightScore: 5, leftWon: true, rightWon: false }]}
      />,
    );
    expect(getByText("11").className).toContain("text-success");
    expect(getByText("5").className).not.toContain("text-success");
  });
});
