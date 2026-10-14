import { useEffect } from "react";

/** Screen Wake Lock API の対応有無。非対応端末では設定を無効化し OS 側設定を案内する。 */
export const isWakeLockSupported = (): boolean => "wakeLock" in navigator;

// Wake Lock はタブ非表示で OS が自動解放するため、visibilitychange で再取得する。
// 命令的 DOM API の effect はここに集約し、利用側コンポーネントからは排除する。
export const useWakeLock = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled || !isWakeLockSupported()) return () => {};

    let sentinel: WakeLockSentinel | null = null;
    let active = true;

    const acquire = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        // 待機中に OFF/unmount されていたら即解放
        if (active) sentinel = lock;
        else await lock.release();
      } catch {
        // 省電力モード等で拒否される。再取得は次の visibilitychange に任せる
      }
    };

    const onVisibilityChange = () => {
      void acquire();
    };
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release();
      sentinel = null;
    };
  }, [enabled]);
};
