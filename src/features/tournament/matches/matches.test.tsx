import { MatchesTab } from "@/features/tournament/matches";
import { MATCHES_VIEW } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { makeTournament, makeParticipant, makeMatch } from "@/test/factories";
import { installMatchMediaMock } from "@/test/matchMediaMock";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";

// SinglesList → MatchModal → ScoreboardScreen で matchMedia が必要
installMatchMediaMock();

const ROUTE_OPTIONS = {
  initialEntries: ["/tournaments/t1/matches"],
  routePath: "/tournaments/:tournamentId/matches",
};

describe("MatchesTab", () => {
  beforeEach(() => {
    setupStoreIsolation();
    // matchesView は resetAll でリセットされない永続 UI 設定のため、テスト間の状態汚染を防ぐため明示的にリセットする
    useAppStore.getState().setMatchesView(MATCHES_VIEW.MATRIX);
  });

  it("参加者 1 人以下 → 案内文表示", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({ id: "t1", format: "singles", bestOf: 5, participantIds: ["p1"] }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
      },
      matches: {},
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    expect(screen.getByText("参加者を2人以上 登録してください。")).toBeInTheDocument();
  });

  it("2 人以上 → 全ペアが一覧行に出る", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "singles",
          bestOf: 5,
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      },
      matches: {},
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    // N=2 → 1ペアの行が出る（未対戦なので「対戦追加」ボタン）
    expect(screen.getByRole("button", { name: "選手A 対 選手B 対戦追加" })).toBeInTheDocument();
  });

  it("空セルクリック → MatchModal が開く", async () => {
    const user = userEvent.setup();
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "singles",
          bestOf: 5,
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      },
      matches: {},
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    const addBtn = screen.getByRole("button", { name: "選手A 対 選手B 対戦追加" });
    await user.click(addBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "試合の入力" })).toBeInTheDocument();
  });

  it("既存 match seed → セルにスコア表示", () => {
    // bestOf=3 → winsNeeded=2 なのでゲーム2本勝ちで試合終了
    const wonGame = {
      leftScore: 11,
      rightScore: 0,
      pointLog: Array.from({ length: 11 }, (): "L" | "R" => "L"),
    };
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "singles",
          bestOf: 3,
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: "single", participantId: "p1" },
          rightSide: { kind: "single", participantId: "p2" },
          // 左が2ゲーム連取 → match finished
          games: [wonGame, wonGame],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    // 勝者(選手A)を左・スコア 2-0、「終了」バッジ表示
    expect(
      screen.getByRole("button", { name: "選手A 対 選手B 2-0 終了 編集" }),
    ).toBeInTheDocument();
    // マトリクスは対称セル（A行B列 / B行A列）双方に「終了」バッジを表示する
    expect(screen.getAllByText("終了").length).toBeGreaterThanOrEqual(1);
  });

  it("format=doubles の tournament では DoublesList (対戦表（ダブルス）) が表示される", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "doubles",
          bestOf: 5,
          participantIds: ["p1", "p2", "p3", "p4"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
        p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
        p4: makeParticipant({ id: "p4", name: "選手D", tournamentId: "t1" }),
      },
      matches: {},
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    expect(screen.getByText("対戦表（ダブルス）")).toBeInTheDocument();
    // SinglesList の見出しは表示されない
    expect(screen.queryByText("対戦表")).not.toBeInTheDocument();
  });

  it("format=doubles で参加者 4 人未満 → 案内文が出てフォームは表示されない", () => {
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "doubles",
          bestOf: 5,
          participantIds: ["p1", "p2", "p3"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
        p3: makeParticipant({ id: "p3", name: "選手C", tournamentId: "t1" }),
      },
      matches: {},
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    expect(screen.getByText("参加者を4人以上 登録してください。")).toBeInTheDocument();
    expect(screen.queryByText("試合を追加")).not.toBeInTheDocument();
    // 見出しは参加者不足でも表示される
    expect(screen.getByText("対戦表（ダブルス）")).toBeInTheDocument();
  });

  it("tournamentId なし（routeに含まれない）の場合は null を返す", () => {
    // routePath を指定しないと useParams が tournamentId を解決できない
    renderWithStore(<MatchesTab />, {
      initialEntries: ["/"],
    });

    // null を返すので何も描画されない
    expect(screen.queryByText("対戦表")).not.toBeInTheDocument();
    expect(screen.queryByText("対戦表（ダブルス）")).not.toBeInTheDocument();
  });

  it("進行中試合セルに「途中」ラベルが表示される", () => {
    // 1ゲーム途中（scores あり、finished=false）
    const inProgressGame = {
      leftScore: 5,
      rightScore: 3,
      pointLog: Array.from({ length: 8 }, (_, index): "L" | "R" => (index < 5 ? "L" : "R")),
    };
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "singles",
          bestOf: 5,
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: "single", participantId: "p1" },
          rightSide: { kind: "single", participantId: "p2" },
          games: [inProgressGame],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    // aria-label に "途中" が含まれるセルボタンが存在する
    // ゲームスコアは途中なのでゲーム勝ち数は 0-0、aria-label は "0-0 途中 編集"
    expect(
      screen.getByRole("button", { name: "選手A 対 選手B 0-0 途中 編集" }),
    ).toBeInTheDocument();
    // 「途中」テキストが少なくとも1つ表示される（span内のテキスト）
    const inProgressSpans = screen.getAllByText("途中");
    expect(inProgressSpans.length).toBeGreaterThanOrEqual(1);
  });

  it("既存 match セルクリックで MatchModal が開く (onOpen パス)", async () => {
    const user = userEvent.setup();
    const wonGame = {
      leftScore: 11,
      rightScore: 0,
      pointLog: Array.from({ length: 11 }, (): "L" | "R" => "L"),
    };
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "singles",
          bestOf: 3,
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      },
      matches: {
        m1: makeMatch({
          id: "m1",
          tournamentId: "t1",
          leftSide: { kind: "single", participantId: "p1" },
          rightSide: { kind: "single", participantId: "p2" },
          games: [wonGame, wonGame],
          firstServer: "L",
        }),
      },
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    // 既存 match セル（編集ボタン）をクリック
    const editBtn = screen.getByRole("button", { name: "選手A 対 選手B 2-0 終了 編集" });
    await user.click(editBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "試合の入力" })).toBeInTheDocument();
  });

  it("マトリクス切替で MatchMatrix が表示される", async () => {
    const user = userEvent.setup();
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "singles",
          bestOf: 5,
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      },
      matches: {},
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    await user.click(screen.getByRole("radio", { name: "マトリクス" }));

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "選手A 対 選手B 対戦追加" })).toBeInTheDocument();
  });

  it("MatchModal の × ボタンでモーダルが閉じる", async () => {
    const user = userEvent.setup();
    seedStore({
      tournaments: {
        t1: makeTournament({
          id: "t1",
          format: "singles",
          bestOf: 5,
          participantIds: ["p1", "p2"],
        }),
      },
      participants: {
        p1: makeParticipant({ id: "p1", name: "選手A", tournamentId: "t1" }),
        p2: makeParticipant({ id: "p2", name: "選手B", tournamentId: "t1" }),
      },
      matches: {},
    });

    renderWithStore(<MatchesTab />, ROUTE_OPTIONS);

    // 空セルクリックで modal を開く
    await user.click(screen.getByRole("button", { name: "選手A 対 選手B 対戦追加" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // × ボタンでモーダルを閉じる（dialog内のbutton[aria-label="閉じる"]）
    const dialog = screen.getByRole("dialog");
    const closeBtn = dialog.querySelector<HTMLButtonElement>("button[aria-label='閉じる']");
    expect(closeBtn).not.toBeNull();
    await user.click(closeBtn!);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
