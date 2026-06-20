import { ResultTab } from "@/features/tournament/result";
import { SIDE_KIND } from "@/store/types";
import {
  makeTournament,
  makeParticipant,
  makeMatch,
  makeGame,
  gameFromLog,
} from "@/test/factories";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";

// jsdom は scrollIntoView を実装していないため polyfill
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn<() => void>();
});

const ROUTE_OPTIONS = {
  initialEntries: ["/tournaments/t1/result"],
  routePath: "/tournaments/:tournamentId/result",
};

const renderResult = () => renderWithStore(<ResultTab />, ROUTE_OPTIONS);

describe("ResultTab", () => {
  beforeEach(setupStoreIsolation);

  it("参加者 0 → 「参加者を登録してください。」が表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: [] }),
      },
    });
    renderResult();
    expect(screen.getByText("参加者を登録してください。")).toBeInTheDocument();
  });

  it("参加者あり → 見出し「結果」と Tabs が表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
    });
    renderResult();
    expect(screen.getByRole("heading", { name: "結果" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "全体" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "グラフ" })).toBeInTheDocument();
  });

  it("デフォルトで RankingTable / MatchResultsTable の見出しが見える", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
    });
    renderResult();
    // RankingTable の見出し「順位」が複数ある（ヘッダ+テーブル列）ため getAllByText で確認
    const rankingHeaders = screen.queryAllByText("順位");
    const noData = screen.queryAllByText("データがありません");
    expect(rankingHeaders.length + noData.length).toBeGreaterThanOrEqual(1);
  });

  it("「グラフ」タブクリック → graphMatches なし → 「対戦結果がありません。」", async () => {
    const user = userEvent.setup();
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          games: [
            makeGame({ leftScore: 11, rightScore: 0 }),
            makeGame({ leftScore: 11, rightScore: 0 }),
            makeGame({ leftScore: 11, rightScore: 0 }),
          ],
        }),
      },
    });
    renderResult();

    await user.click(screen.getByRole("tab", { name: "グラフ" }));

    await waitFor(() => {
      expect(screen.getByText("対戦結果がありません。")).toBeInTheDocument();
    });
  });

  it("graphMatches あり → Select と「ゲーム 1」が表示される", async () => {
    const user = userEvent.setup();
    const log = gameFromLog(["L", "R", "L", "L", "R", "R", "L", "L", "L", "L", "L"]);
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          games: [log],
        }),
      },
    });
    renderResult();

    await user.click(screen.getByRole("tab", { name: "グラフ" }));

    // Select「参加者を選択」が表示される
    await waitFor(() => {
      expect(screen.getByText("参加者を選択")).toBeInTheDocument();
    });

    // MatchScoreChart の「ゲーム 1」が見える（テキストノードが分割されるため getAllByText で確認）
    expect(screen.getAllByText(/ゲーム\s*1/u).length).toBeGreaterThanOrEqual(1);
  });

  it("graphMatches なし → 「対戦結果がありません。」", async () => {
    const user = userEvent.setup();
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
    });
    renderResult();

    await user.click(screen.getByRole("tab", { name: "グラフ" }));

    await waitFor(() => {
      expect(screen.getByText("対戦結果がありません。")).toBeInTheDocument();
    });
  });

  it("SaveImageButtons が存在する — 「画像で保存」テキストが見える", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
    });
    renderResult();
    expect(screen.getByText("画像で保存")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 追加テスト
  // -----------------------------------------------------------------------

  it("tournament が存在しないとき null を返す（見出し「結果」なし）", () => {
    seedStore({ tournaments: {} });
    renderResult();
    expect(screen.queryByRole("heading", { name: "結果" })).not.toBeInTheDocument();
  });

  it("グラフモードで参加者 Select を操作すると表示対象が切り替わる", async () => {
    const user = userEvent.setup();
    const log1 = gameFromLog(["L", "R", "L", "L", "R", "R", "L", "L", "L", "L", "L"]);
    const log2 = gameFromLog(["R", "L", "R", "R", "L", "L", "R", "R", "R", "R", "R"]);
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2", "p3", "p4"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
        p3: makeParticipant({ id: "p3", tournamentId: "t1", name: "選手C" }),
        p4: makeParticipant({ id: "p4", tournamentId: "t1", name: "選手D" }),
      },
      matches: {
        // p1 vs p2 の対戦（pointLog あり）
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: SIDE_KIND.SINGLE, participantId: "p1" },
          rightSide: { kind: SIDE_KIND.SINGLE, participantId: "p2" },
          games: [log1],
        }),
        // p3 vs p4 の対戦（pointLog あり）
        m2: makeMatch({
          id: "m2",
          tournamentId: "t1",
          leftSide: { kind: SIDE_KIND.SINGLE, participantId: "p3" },
          rightSide: { kind: SIDE_KIND.SINGLE, participantId: "p4" },
          games: [log2],
        }),
      },
    });
    renderResult();

    await user.click(screen.getByRole("tab", { name: "グラフ" }));

    // 参加者 Select トリガーが表示されるまで待つ（初期選択は p1=選手A → m1 が表示）
    await waitFor(() => {
      expect(screen.getByText("参加者を選択")).toBeInTheDocument();
    });
    expect(screen.getAllByText("選手A").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("選手C")).not.toBeInTheDocument();

    // 参加者セレクトを開いて 選手C に切り替え
    const trigger = screen.getByRole("button", { name: /選手A/u });
    await user.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "選手C" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("option", { name: "選手C" }));

    // 選手C が関わる m2 のチャートに切り替わる
    await waitFor(() => {
      expect(screen.getAllByText("選手C").length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.queryByText("選手A")).not.toBeInTheDocument();
  });

  it("未完了試合のみ(realGames=0)のとき MatchResultsTable に「データがありません」が出る", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
      matches: {
        // games に 0-0 のゲームのみ → realGames = [] なのでフィルタで除外される
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          games: [makeGame()],
        }),
      },
    });
    renderResult();
    // TABLE モードがデフォルト; MatchResultsTable の「データがありません」を確認
    const noDataEls = screen.getAllByText("データがありません");
    expect(noDataEls.length).toBeGreaterThanOrEqual(1);
  });

  it("graphMatches あり → renderContent が null でなく MatchScoreChart が描画される", async () => {
    const user = userEvent.setup();
    const log = gameFromLog(["L", "R", "L", "L", "R", "R", "L", "L", "L", "L", "L"]);
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", participantIds: ["p1", "p2"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", tournamentId: "t1", name: "選手A" }),
        p2: makeParticipant({ id: "p2", tournamentId: "t1", name: "選手B" }),
      },
      matches: {
        m1: makeMatch({ id: "m1", tournamentId: "t1", games: [log] }),
      },
    });
    renderResult();

    await user.click(screen.getByRole("tab", { name: "グラフ" }));

    // selectedMatch は null でない → MatchScoreChart が描画される（「ゲーム 1」が見える）
    await waitFor(() => {
      expect(screen.getAllByText(/ゲーム\s*1/u).length).toBeGreaterThanOrEqual(1);
    });
  });
});
