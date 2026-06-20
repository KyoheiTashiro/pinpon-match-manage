import { STORAGE_KEY, STORAGE_VERSION } from "@/constants/storage";
import { buildSeedState } from "@/test/seed";

// ---------------------------------------------------------------------------
// localStorage へのseedデータ注入 — VITE_SEED が立っているときのみ実行される。
// このモジュールは src/main.tsx の先頭でimportされる副作用モジュール。
// Zustand persist は module 評価時に同期 rehydrate するため、
// App(→useAppStore)のimportより前に localStorage へ書き込む必要がある。
// ---------------------------------------------------------------------------

if (import.meta.env.VITE_SEED) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state: buildSeedState(), version: STORAGE_VERSION }),
  );
  console.info("[seed] localStorage にseedデータを注入しました");
}
