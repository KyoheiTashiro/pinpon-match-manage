import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS Safari: navigator.standalone は非標準プロパティ。DOM 境界のため型キャストが避けられない。
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  (navigator as unknown as { standalone?: boolean }).standalone === true;

export type InstallPromptResult = "accepted" | "dismissed" | "unavailable";

// beforeinstallprompt / appinstalled の購読と install 状態を集約する。
// 外部イベント購読は effect が必要なため、ここに閉じ込めて利用側からは排除する。
export const useInstallPrompt = (): {
  installed: boolean;
  promptInstall: () => Promise<InstallPromptResult>;
} => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    if (isStandalone()) return () => {};
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      // beforeinstallprompt イベントは必ず BeforeInstallPromptEvent。DOM 境界のためキャスト不可避。
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // ネイティブ install prompt を表示。未対応時は "unavailable"。
  const promptInstall = async (): Promise<InstallPromptResult> => {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
    return outcome;
  };

  return { installed, promptInstall };
};
