import { DownloadIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { InfoModal } from "@/components/ui/InfoModal";
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
    // deferred 非対応ブラウザ(iOS Safari / Android Firefox 等) → 手動手順ガイド
    setShowGuide(true);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => {
          void handleClick();
        }}
      >
        <DownloadIcon className="mr-2 inline-block align-[-0.125em]" />
        ホーム画面に追加
      </Button>

      <InfoModal open={showGuide} title="ホーム画面に追加" onClose={() => setShowGuide(false)}>
        {isIOS() ? (
          <ol className="list-inside list-decimal space-y-2 text-base leading-relaxed">
            <li>Safariで このページ を開く</li>
            <li>
              下部 共有ボタン <span aria-hidden>⬆️</span> をタップ
            </li>
            <li>「ホーム画面に追加」を選択</li>
            <li>右上「追加」をタップ</li>
          </ol>
        ) : (
          <ol className="list-inside list-decimal space-y-2 text-base leading-relaxed">
            <li>ブラウザのメニュー（︙ または ⋯）を開く</li>
            <li>「アプリをインストール」または「ホーム画面に追加」を選択</li>
            <li>確認ダイアログで追加</li>
          </ol>
        )}
      </InfoModal>
    </>
  );
};
