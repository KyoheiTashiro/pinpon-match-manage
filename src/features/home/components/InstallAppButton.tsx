import { HelpIcon } from "@/components/icons";
import { Button, InfoModal } from "@/components/ui";
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

const isIOS = () => /iPad|iPhone|iPod/u.test(navigator.userAgent);

const isMobile = () => /iPad|iPhone|iPod|Android/u.test(navigator.userAgent);

const GUIDE_VIDEOS = {
  ios: "https://www.youtube.com/embed/LplfyGg_-Ao?si=WXXfWK_YvlzbnJTM",
  android: "https://www.youtube.com/embed/RGQRNjhP7mk?si=mj_8ys1vmjxE0be3",
} as const;

export const InstallAppButton = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      // クリーンアップ不要だが consistent-return のため空クリーンアップ関数を返す
      return () => {};
    }
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

  if (installed) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    // deferred 非対応はモバイルのみ手動手順ガイド。PC はネイティブ install prompt 専用で
    // フォールバックなし(beforeinstallprompt 無しでは prompt をプログラムから呼べないため)。
    if (isMobile()) setShowGuide(true);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          void handleClick();
        }}
      >
        <HelpIcon className="mr-2 inline-block align-[-0.125em]" />
        ホーム画面に追加
      </Button>

      <InfoModal open={showGuide} title="ホーム画面に追加" onClose={() => setShowGuide(false)}>
        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            {/* YouTube 埋め込みは sandbox 無し前提。sandbox を付けると script と same-origin の両立が必要になり再生不可。 */}
            {/* oxlint-disable-next-line react/iframe-missing-sandbox */}
            <iframe
              src={isIOS() ? GUIDE_VIDEOS.ios : GUIDE_VIDEOS.android}
              title="ホーム画面に追加 手順動画"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </InfoModal>
    </>
  );
};
