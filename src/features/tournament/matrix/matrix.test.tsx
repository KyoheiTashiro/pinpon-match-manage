import { MatchMatrixTab } from "@/features/tournament/matrix";
import { makeTournament, makeParticipant, makeMatch } from "@/test/factories";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

// SinglesMatrix → MatchModal → ScoreboardScreen で matchMedia が必要
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn<(query: string) => MediaQueryList>().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>(),
  })),
});

const ROUTE_OPTIONS = {
  initialEntries: ["/tournaments/t1/matrix"],
  routePath: "/tournaments/:tournamentId/matrix",
};

describe("MatchMatrixTab", () => {
  beforeEach(setupStoreIsolation);

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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

    expect(screen.getByText("参加者を2人以上 登録してください。")).toBeInTheDocument();
  });

  it("2 人以上 → 対戦表テーブル・選手名がヘッダ/行に出る", () => {
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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

    // 選手名がテーブルヘッダ・行見出しに出る
    const playerAElements = screen.getAllByText("選手A");
    expect(playerAElements.length).toBeGreaterThanOrEqual(1);
    const playerBElements = screen.getAllByText("選手B");
    expect(playerBElements.length).toBeGreaterThanOrEqual(1);

    // 対角線セルに "自分" ラベルが2つある
    const selfCells = screen.getAllByLabelText("自分");
    expect(selfCells).toHaveLength(2);
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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

    // 選手A行の対選手B列: 2-0 と "勝" が表示される (match は finished なので "途中" は付かない)
    expect(screen.getByRole("button", { name: "選手A 対 選手B 2-0 編集" })).toBeInTheDocument();
    // 選手A から見て 勝 テキスト
    expect(screen.getByText("勝")).toBeInTheDocument();
  });

  it("format=doubles の tournament では DoublesMatrix (対戦表（ダブルス）) が表示される", () => {
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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

    expect(screen.getByText("対戦表（ダブルス）")).toBeInTheDocument();
    // SinglesMatrix の見出しは表示されない
    expect(screen.queryByText("対戦表")).not.toBeInTheDocument();
  });

  it("tournamentId なし（routeに含まれない）の場合は null を返す", () => {
    // routePath を指定しないと useParams が tournamentId を解決できない
    renderWithStore(<MatchMatrixTab />, {
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
      pointLog: Array.from({ length: 8 }, (_, i): "L" | "R" => (i < 5 ? "L" : "R")),
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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

    // 既存 match セル（編集ボタン）をクリック
    const editBtn = screen.getByRole("button", { name: "選手A 対 選手B 2-0 編集" });
    await user.click(editBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "試合の入力" })).toBeInTheDocument();
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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

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

  it("参加者 2 人以上のとき SaveImageButton(画像で保存) が表示される", () => {
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

    renderWithStore(<MatchMatrixTab />, ROUTE_OPTIONS);

    expect(screen.getByText("画像で保存")).toBeInTheDocument();
  });
});
