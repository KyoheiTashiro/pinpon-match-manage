import { GameScoreColumn } from "@/components/domain/GameScoreColumn";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("GameScoreColumn", () => {
  it("ゲーム数ぶんの行を描画する", () => {
    const { container } = render(
      <GameScoreColumn
        games={[
          { leftScore: 11, rightScore: 5, leftWon: true, rightWon: false },
          { leftScore: 9, rightScore: 11, leftWon: false, rightWon: true },
        ]}
        winClassName="text-success"
        separatorClassName="text-sub"
      />,
    );
    // container > 各ゲーム行
    expect(container.firstElementChild?.children).toHaveLength(2);
  });

  it("空配列なら行を描画しない", () => {
    const { container } = render(
      <GameScoreColumn games={[]} winClassName="text-success" separatorClassName="text-sub" />,
    );
    expect(container.firstElementChild?.children).toHaveLength(0);
  });

  it("左勝者のスコアに winClassName を付与する", () => {
    const { getByText } = render(
      <GameScoreColumn
        games={[{ leftScore: 11, rightScore: 5, leftWon: true, rightWon: false }]}
        winClassName="text-win"
        separatorClassName="text-sub"
      />,
    );
    expect(getByText("11").className).toContain("text-win");
    expect(getByText("5").className).not.toContain("text-win");
  });

  it("右勝者のスコアに winClassName を付与する", () => {
    const { getByText } = render(
      <GameScoreColumn
        games={[{ leftScore: 9, rightScore: 11, leftWon: false, rightWon: true }]}
        winClassName="text-win"
        separatorClassName="text-sub"
      />,
    );
    expect(getByText("11").className).toContain("text-win");
    expect(getByText("9").className).not.toContain("text-win");
  });

  it("勝者なし（同点）なら両スコアに winClassName を付与しない", () => {
    const { getAllByText } = render(
      <GameScoreColumn
        games={[{ leftScore: 10, rightScore: 10, leftWon: false, rightWon: false }]}
        winClassName="text-win"
        separatorClassName="text-sub"
      />,
    );
    for (const el of getAllByText("10")) {
      expect(el.className).not.toContain("text-win");
    }
  });

  it("区切りに separatorClassName を付与する", () => {
    const { getByText } = render(
      <GameScoreColumn
        games={[{ leftScore: 11, rightScore: 5, leftWon: true, rightWon: false }]}
        winClassName="text-win"
        separatorClassName="text-divider"
      />,
    );
    expect(getByText("-").className).toContain("text-divider");
  });
});
