import { STORAGE_KEY, STORAGE_VERSION } from "@/constants/storage";
import {
  appStateSchema,
  matchSchema,
  participantSchema,
  sanitizeAppState,
  tournamentSchema,
} from "@/store/schema";
import { createMatchSlice, type MatchSlice } from "@/store/slices/matchSlice";
import { createParticipantSlice, type ParticipantSlice } from "@/store/slices/participantSlice";
import { createTournamentSlice, type TournamentSlice } from "@/store/slices/tournamentSlice";
import { createUiSlice, type UiSlice } from "@/store/slices/uiSlice";
import { FONT_SIZE, MATCHES_VIEW, type AppState } from "@/store/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type StoreState = UiSlice & TournamentSlice & ParticipantSlice & MatchSlice;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** version N → N+1 の単一ステップ変換。入力は前段の出力（Record 確定済み）。 */
type Migration = (persisted: Record<string, unknown>) => Record<string, unknown>;

/** v1 → v2: 各 Tournament に bestOf を補完（v1 は5ゲーム制固定）。 */
const migrateV1ToV2: Migration = (persisted) => {
  if (!isRecord(persisted.tournaments)) return persisted;
  const tournaments = Object.fromEntries(
    Object.entries(persisted.tournaments).map(([id, tournament]) => [
      id,
      isRecord(tournament) && tournament.bestOf === undefined
        ? { ...tournament, bestOf: 5 }
        : tournament,
    ]),
  );
  return { ...persisted, tournaments };
};

/** v2 → v3: matchesView を補完（v2 以前はマトリクス表示固定）。 */
const migrateV2ToV3: Migration = (persisted) =>
  persisted.matchesView === undefined
    ? { ...persisted, matchesView: MATCHES_VIEW.MATRIX }
    : persisted;

/**
 * fromVersion → fromVersion+1 の変換テーブル。キー = 変換元バージョン。
 * 将来スキーマ変更時は migrateVNToVN+1 を追加・登録し STORAGE_VERSION を上げる。
 *
 * @see {@link STORAGE_VERSION} 現バージョン定義（src/constants/storage.ts）
 */
const migrations: Readonly<Record<number, Migration>> = {
  1: migrateV1ToV2,
  2: migrateV2ToV3,
};

/**
 * スキーマ変更時のデータマイグレーション。
 * fromVersion から現バージョンまで変換ステップを順に適用する。
 * merge/safeParse がその後に型検証・サニタイズを行うため、完全な型を返す必要はない。
 *
 * @see {@link STORAGE_VERSION} 変換先となる現バージョン（src/constants/storage.ts）
 */
export const migratePersistedState = (persisted: unknown, fromVersion: number): unknown => {
  if (!isRecord(persisted)) return persisted;

  let state = persisted;
  for (let version = fromVersion; version < STORAGE_VERSION; version++) {
    state = migrations[version]?.(state) ?? state;
  }
  return state;
};

/** 部分的に壊れた persisted から、パースできたエンティティだけを残して復元する。 */
export const salvageAppState = (persisted: unknown, current: AppState): AppState => {
  if (!isRecord(persisted)) {
    return current;
  }

  const raw = persisted;

  const tournaments: AppState["tournaments"] = {};
  if (raw.tournaments !== null && typeof raw.tournaments === "object") {
    for (const [id, value] of Object.entries(raw.tournaments)) {
      const result = tournamentSchema.safeParse(value);
      if (result.success) tournaments[id] = result.data;
    }
  }

  const participants: AppState["participants"] = {};
  if (raw.participants !== null && typeof raw.participants === "object") {
    for (const [id, value] of Object.entries(raw.participants)) {
      const result = participantSchema.safeParse(value);
      if (result.success) participants[id] = result.data;
    }
  }

  const matches: AppState["matches"] = {};
  if (raw.matches !== null && typeof raw.matches === "object") {
    for (const [id, value] of Object.entries(raw.matches)) {
      const result = matchSchema.safeParse(value);
      if (result.success) matches[id] = result.data;
    }
  }

  const currentTournamentId =
    raw.currentTournamentId === null || typeof raw.currentTournamentId === "string"
      ? raw.currentTournamentId
      : null;

  const validFontSizes: readonly string[] = Object.values(FONT_SIZE);
  const isValidFontSize = (value: unknown): value is AppState["fontSize"] =>
    typeof value === "string" && validFontSizes.includes(value);
  const fontSize: AppState["fontSize"] = isValidFontSize(raw.fontSize)
    ? raw.fontSize
    : current.fontSize;

  const validMatchesViews: readonly string[] = Object.values(MATCHES_VIEW);
  const isValidMatchesView = (value: unknown): value is AppState["matchesView"] =>
    typeof value === "string" && validMatchesViews.includes(value);
  const matchesView: AppState["matchesView"] = isValidMatchesView(raw.matchesView)
    ? raw.matchesView
    : current.matchesView;

  const partial: AppState = {
    tournaments,
    participants,
    matches,
    currentTournamentId,
    fontSize,
    matchesView,
  };
  return { ...current, ...sanitizeAppState(partial) };
};

export const useAppStore = create<StoreState>()(
  persist(
    immer((...a) => ({
      ...createUiSlice(...a),
      ...createTournamentSlice(...a),
      ...createParticipantSlice(...a),
      ...createMatchSlice(...a),
    })),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      partialize: (state) => ({
        tournaments: state.tournaments,
        participants: state.participants,
        matches: state.matches,
        currentTournamentId: state.currentTournamentId,
        fontSize: state.fontSize,
        matchesView: state.matchesView,
      }),
      migrate: migratePersistedState,
      merge: (persisted, current) => {
        const parsed = appStateSchema.safeParse(persisted);
        if (parsed.success) {
          return { ...current, ...sanitizeAppState(parsed.data) };
        }

        if (persisted === null || typeof persisted !== "object" || Array.isArray(persisted)) {
          console.warn("[store] persisted state is not an object, starting fresh", persisted);
          return current;
        }

        const salvaged = salvageAppState(persisted, current);
        console.warn("[store] persisted state partially invalid, salvaged valid entries", salvaged);
        return { ...current, ...salvaged };
      },
    },
  ),
);
