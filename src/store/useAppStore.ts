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
import { FONT_SIZE, type AppState } from "@/store/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type StoreState = UiSlice & TournamentSlice & ParticipantSlice & MatchSlice;

/** unknown を「プレーンなレコード」へ安全に絞り込む型述語（配列・null は除外）。 */
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

/**
 * fromVersion → fromVersion+1 の変換テーブル。キー = 変換元バージョン。
 * 将来スキーマ変更時は migrateVNToVN+1 を追加・登録し STORAGE_VERSION を上げる。
 *
 * @see {@link STORAGE_VERSION} 現バージョン定義（src/constants/storage.ts）
 */
const migrations: Readonly<Record<number, Migration>> = {
  1: migrateV1ToV2,
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

/**
 * persisted が不完全・部分的に壊れていた場合のサルベージ。
 * エンティティを1件ずつ検証し、パースできたものだけ残す。
 * currentTournamentId / fontSize も個別に検証してフォールバック。
 */
export const salvageAppState = (persisted: unknown, current: AppState): AppState => {
  // null / 配列 / プリミティブなど「オブジェクトでない」場合は諦めて current を返す
  if (!isRecord(persisted)) {
    return current;
  }

  const raw = persisted;

  // tournaments
  const tournaments: AppState["tournaments"] = {};
  if (raw.tournaments !== null && typeof raw.tournaments === "object") {
    for (const [id, value] of Object.entries(raw.tournaments)) {
      const result = tournamentSchema.safeParse(value);
      if (result.success) tournaments[id] = result.data;
    }
  }

  // participants
  const participants: AppState["participants"] = {};
  if (raw.participants !== null && typeof raw.participants === "object") {
    for (const [id, value] of Object.entries(raw.participants)) {
      const result = participantSchema.safeParse(value);
      if (result.success) participants[id] = result.data;
    }
  }

  // matches
  const matches: AppState["matches"] = {};
  if (raw.matches !== null && typeof raw.matches === "object") {
    for (const [id, value] of Object.entries(raw.matches)) {
      const result = matchSchema.safeParse(value);
      if (result.success) matches[id] = result.data;
    }
  }

  // currentTournamentId: string | null のみ受け入れる
  const currentTournamentId =
    raw.currentTournamentId === null || typeof raw.currentTournamentId === "string"
      ? raw.currentTournamentId
      : null;

  // fontSize: 有効な FontSize 列挙値のみ受け入れ、それ以外は current の値にフォールバック
  const validFontSizes: readonly string[] = Object.values(FONT_SIZE);
  const isValidFontSize = (value: unknown): value is AppState["fontSize"] =>
    typeof value === "string" && validFontSizes.includes(value);
  const fontSize: AppState["fontSize"] = isValidFontSize(raw.fontSize)
    ? raw.fontSize
    : current.fontSize;

  const partial: AppState = { tournaments, participants, matches, currentTournamentId, fontSize };
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
      }),
      migrate: migratePersistedState,
      merge: (persisted, current) => {
        const parsed = appStateSchema.safeParse(persisted);
        if (parsed.success) {
          // ハッピーパス: スキーマ検証 OK → サニタイズして結合
          return { ...current, ...sanitizeAppState(parsed.data) };
        }

        // persisted がオブジェクトでもない場合はフォールバック
        if (persisted === null || typeof persisted !== "object" || Array.isArray(persisted)) {
          console.warn("[store] persisted state is not an object, starting fresh", persisted);
          return current;
        }

        // 部分的に壊れている場合: エンティティ単位でサルベージ
        const salvaged = salvageAppState(persisted, current as AppState);
        console.warn("[store] persisted state partially invalid, salvaged valid entries", salvaged);
        return { ...current, ...salvaged };
      },
    },
  ),
);
