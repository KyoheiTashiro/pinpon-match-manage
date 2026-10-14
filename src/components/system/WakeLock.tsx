import { useWakeLock } from "@/components/ui/hooks/useWakeLock";
import { useAppStore } from "@/store/useAppStore";

/** ストアの keepScreenOn を Wake Lock に反映する。描画なし。 */
export const WakeLock = () => {
  useWakeLock(useAppStore((state) => state.keepScreenOn));
  return null;
};
