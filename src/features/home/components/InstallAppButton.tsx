import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { InfoDialog } from "@/components/ui/InfoDialog";
import { DownloadIcon } from "@/components/icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS Safari
  (navigator as unknown as { standalone?: boolean }).standalone === true;

const isIOS = () => /iPad|iPhone|iPod/u.test(navigator.userAgent);

export const InstallAppButton = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
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
    // deferred 非対応ブラウザ(iOS Safari / Android Firefox 等) → 手動手順ガイド
    setShowGuide(true);
  };

  return (
    <>
      <Button variant="secondary" onClick={handleClick}>
        <DownloadIcon className="inline-block mr-2 align-[-0.125em]" />
        ホーム画面に追加
      </Button>

      <InfoDialog open={showGuide} title="ホーム画面に追加" onClose={() => setShowGuide(false)}>
        {isIOS() ? (
          <ol className="text-base space-y-2 list-decimal list-inside leading-relaxed">
            <li>Safariで このページ を開く</li>
            <li>
              下部 共有ボタン <span aria-hidden>⬆️</span> をタップ
            </li>
            <li>「ホーム画面に追加」を選択</li>
            <li>右上「追加」をタップ</li>
          </ol>
        ) : (
          <ol className="text-base space-y-2 list-decimal list-inside leading-relaxed">
            <li>ブラウザのメニュー（︙ または ⋯）を開く</li>
            <li>「アプリをインストール」または「ホーム画面に追加」を選択</li>
            <li>確認ダイアログで追加</li>
          </ol>
        )}
      </InfoDialog>
    </>
  );
};
