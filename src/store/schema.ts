import { SIDE } from "@/domain/match";
import {
  BEST_OF_OPTIONS,
  FONT_SIZE,
  FORMAT,
  MATCHES_VIEW,
  SIDE_KIND,
  type AppState,
} from "@/store/types";
import { z } from "zod";

const sideSchema = z.enum([SIDE.LEFT, SIDE.RIGHT]);

export const gameSchema = z.object({
  leftScore: z.number().int().min(0),
  rightScore: z.number().int().min(0),
  pointLog: z.array(sideSchema).optional(),
});

const singleSideSchema = z.object({
  kind: z.literal(SIDE_KIND.SINGLE),
  participantId: z.string(),
});

const pairSideSchema = z.object({
  kind: z.literal(SIDE_KIND.PAIR),
  memberIds: z.tuple([z.string(), z.string()]),
});

export const matchSideSchema = z.discriminatedUnion("kind", [singleSideSchema, pairSideSchema]);

export const matchSchema = z.object({
  id: z.string(),
  tournamentId: z.string(),
  leftSide: matchSideSchema,
  rightSide: matchSideSchema,
  games: z.array(gameSchema),
  note: z.string().optional(),
  firstServer: sideSchema,
});

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
  currentTournamentId: z.string().nullable(),
  fontSize: z.enum([
    FONT_SIZE.XSMALL,
    FONT_SIZE.SMALL,
    FONT_SIZE.NORMAL,
    FONT_SIZE.LARGE,
    FONT_SIZE.XLARGE,
  ]),
  matchesView: z.enum([MATCHES_VIEW.LIST, MATCHES_VIEW.MATRIX]),
});

// 型整合チェック: appStateSchema の infer が types.ts の AppState と構造一致することを
// ビルド時に保証する。ズレたら型エラーで落ちる。types.ts が真実源。
type SchemaAppState = z.infer<typeof appStateSchema>;
type AssertEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const schemaMatchesAppState: AssertEqual<SchemaAppState, AppState> = true;
void schemaMatchesAppState;

export const sanitizeAppState = (state: AppState): AppState => {
  const tournamentIds = new Set(Object.keys(state.tournaments));

  const matches: AppState["matches"] = {};
  for (const [id, match] of Object.entries(state.matches)) {
    if (tournamentIds.has(match.tournamentId)) matches[id] = match;
  }

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

  const currentTournamentId =
    state.currentTournamentId !== null && tournamentIds.has(state.currentTournamentId)
      ? state.currentTournamentId
      : null;

  return {
    tournaments,
    participants,
    matches,
    currentTournamentId,
    fontSize: state.fontSize,
    matchesView: state.matchesView,
  };
};
