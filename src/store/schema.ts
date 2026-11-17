import { GAME_KIND, SIDE } from "@/domain/match";
import { sideMembers } from "@/domain/side";
import { BEST_OF_OPTIONS, FONT_SIZE, FORMAT, MATCHES_VIEW, type AppState } from "@/store/types";
import { z } from "zod";

const sideSchema = z.enum([SIDE.LEFT, SIDE.RIGHT]);

export const gameSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal(GAME_KIND.LOGGED), pointLog: z.array(sideSchema) }),
  z.object({
    kind: z.literal(GAME_KIND.MANUAL),
    leftScore: z.number().int().min(0),
    rightScore: z.number().int().min(0),
  }),
]);

const matchBaseShape = {
  id: z.string(),
  tournamentId: z.string(),
  games: z.array(gameSchema),
  note: z.string().optional(),
  firstServer: sideSchema,
};

const pairSchema = z.tuple([z.string(), z.string()]);

export const matchSchema = z.discriminatedUnion("kind", [
  z.object({
    ...matchBaseShape,
    kind: z.literal(FORMAT.SINGLES),
    left: z.string(),
    right: z.string(),
  }),
  z.object({
    ...matchBaseShape,
    kind: z.literal(FORMAT.DOUBLES),
    left: pairSchema,
    right: pairSchema,
  }),
]);

export const participantSchema = z.object({
  id: z.string(),
  tournamentId: z.string(),
  name: z.string(),
  affiliation: z.string().optional(),
});

export const tournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  format: z.enum([FORMAT.SINGLES, FORMAT.DOUBLES]),
  bestOf: z.literal(BEST_OF_OPTIONS),
  date: z.string(),
  createdAt: z.string(),
  participantIds: z.array(z.string()),
});

export const appStateSchema = z.object({
  tournaments: z.record(z.string(), tournamentSchema),
  participants: z.record(z.string(), participantSchema),
  matches: z.record(z.string(), matchSchema),
  fontSize: z.enum([
    FONT_SIZE.XSMALL,
    FONT_SIZE.SMALL,
    FONT_SIZE.NORMAL,
    FONT_SIZE.LARGE,
    FONT_SIZE.XLARGE,
  ]),
  matchesView: z.enum([MATCHES_VIEW.LIST, MATCHES_VIEW.MATRIX]),
  defaultBestOf: z.literal(BEST_OF_OPTIONS),
  keepScreenOn: z.boolean(),
});

// 型整合チェック: appStateSchema の infer が types.ts の AppState と構造一致することを
// ビルド時に保証する。ズレたら型エラーで落ちる。types.ts が真実源。
type SchemaAppState = z.infer<typeof appStateSchema>;
type AssertEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const schemaMatchesAppState: AssertEqual<SchemaAppState, AppState> = true;
void schemaMatchesAppState;

export const sanitizeAppState = (state: AppState): AppState => {
  const tournamentIds = new Set(Object.keys(state.tournaments));

  const participants: AppState["participants"] = {};
  for (const [id, participant] of Object.entries(state.participants)) {
    if (tournamentIds.has(participant.tournamentId)) participants[id] = participant;
  }

  const participantIdSet = new Set(Object.keys(participants));

  const tournaments: AppState["tournaments"] = {};
  for (const [id, tournament] of Object.entries(state.tournaments)) {
    tournaments[id] = {
      ...tournament,
      participantIds: tournament.participantIds.filter((participantId) =>
        participantIdSet.has(participantId),
      ),
    };
  }

  // 大会形式と食い違う試合・大会に所属しない参加者を含む試合は集計を壊すため落とす
  const matches: AppState["matches"] = {};
  for (const [id, match] of Object.entries(state.matches)) {
    const tournament = tournaments[match.tournamentId];
    if (!tournament || tournament.format !== match.kind) continue;
    const members = [...sideMembers(match.left), ...sideMembers(match.right)];
    if (members.every((memberId) => tournament.participantIds.includes(memberId)))
      matches[id] = match;
  }

  return {
    tournaments,
    participants,
    matches,
    fontSize: state.fontSize,
    matchesView: state.matchesView,
    defaultBestOf: state.defaultBestOf,
    keepScreenOn: state.keepScreenOn,
  };
};
