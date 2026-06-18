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

/**
 * スキーマ変更時のデータマイグレーション。
 * バージョン毎に変換を行い、最終的に現バージョンの shape に近い unknown を返す。
 * merge/safeParse がその後に型検証・サニタイズを行うため、完全な型を返す必要はない。
 *
 * 将来スキーマ変更時はここに version 毎の変換を追加し STORAGE_VERSION を上げる。
 */
const migratePersistedState = (persisted: unknown, fromVersion: number): unknown => {
  let state = persisted as Record<string, any>;

  if (fromVersion < 2 && state !== null && typeof state === "object" && state.tournaments) {
    // v1 → v2: Tournament に bestOf フィールドを補完（v1 は5ゲーム制固定）
    const tournaments = { ...state.tournaments };
    for (const id of Object.keys(tournaments)) {
      if (tournaments[id].bestOf === undefined) {
        tournaments[id] = { ...tournaments[id], bestOf: 5 };
      }
    }
    state = { ...state, tournaments };
  }

  // fromVersion >= 2: 現在のバージョン。変換不要。
  // 将来スキーマ変更時はここに version 毎の変換を追加し STORAGE_VERSION を上げる。

  return state;
};

/**
 * persisted が不完全・部分的に壊れていた場合のサルベージ。
 * エンティティを1件ずつ検証し、パースできたものだけ残す。
 * currentTournamentId / fontSize も個別に検証してフォールバック。
 */
export const salvageAppState = (persisted: unknown, current: AppState): AppState => {
  // null / 配列 / プリミティブなど「オブジェクトでない」場合は諦めて current を返す
  if (persisted === null || typeof persisted !== "object" || Array.isArray(persisted)) {
    return current;
  }

  const raw = persisted as Record<string, any>;

  // tournaments
  const tournaments: AppState["tournaments"] = {};
  if (raw.tournaments !== null && typeof raw.tournaments === "object") {
    for (const [id, value] of Object.entries(raw.tournaments as object)) {
      const result = tournamentSchema.safeParse(value);
      if (result.success) tournaments[id] = result.data;
    }
  }

  // participants
  const participants: AppState["participants"] = {};
  if (raw.participants !== null && typeof raw.participants === "object") {
    for (const [id, value] of Object.entries(raw.participants as object)) {
      const result = participantSchema.safeParse(value);
      if (result.success) participants[id] = result.data;
    }
  }

  // matches
  const matches: AppState["matches"] = {};
  if (raw.matches !== null && typeof raw.matches === "object") {
    for (const [id, value] of Object.entries(raw.matches as object)) {
      const result = matchSchema.safeParse(value);
      if (result.success) matches[id] = result.data;
    }
  }

  // currentTournamentId: string | null のみ受け入れる
  const currentTournamentId =
    raw.currentTournamentId === null || typeof raw.currentTournamentId === "string"
      ? (raw.currentTournamentId as string | null)
      : null;

  // fontSize: 有効な FontSize 列挙値のみ受け入れ、それ以外は current の値にフォールバック
  const validFontSizes = Object.values(FONT_SIZE) as string[];
  const fontSize =
    typeof raw.fontSize === "string" && validFontSizes.includes(raw.fontSize)
      ? (raw.fontSize as AppState["fontSize"])
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
