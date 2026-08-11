import { MatchesTab } from "@/features/tournament/matches";
import { makeTournament, makeParticipant } from "@/test/factories";
import { renderWithStore, seedStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

const ROUTE_OPTIONS = {
  initialEntries: ["/tournaments/t1/matches"],
  routePath: "/tournaments/:tournamentId/matches",
};

describe("MatchesTab", () => {
  beforeEach(() => {
    setupStoreIsolation();
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
});
