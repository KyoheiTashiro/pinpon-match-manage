import { useEffect, useId, useState } from "react";
import { BigButton } from "@/components/ui/BigButton";

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
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const guideTitleId = useId();

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
    if (isIOS()) {
      setShowIOSGuide(true);
      return;
    }
    setShowIOSGuide(true);
  };

  return (
    <>
      <BigButton variant="secondary" className="w-full" onClick={handleClick}>
        📲 ホーム画面にインストール
      </BigButton>

      {showIOSGuide && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="閉じる"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowIOSGuide(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "Escape") setShowIOSGuide(false);
          }}
        >
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="dialog" はランドマークだがstopPropagationが必要 */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={guideTitleId}
            tabIndex={-1}
            className="bg-white rounded-2xl p-6 max-w-md w-full border-4 border-line"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <h2 id={guideTitleId} className="text-xl font-extrabold mb-4">
              ホーム画面に追加
            </h2>
            {isIOS() ? (
              <ol className="text-base space-y-2 mb-6 list-decimal list-inside leading-relaxed">
                <li>Safariで このページ を開く</li>
                <li>
                  下部 共有ボタン <span aria-hidden>⬆️</span> をタップ
                </li>
                <li>「ホーム画面に追加」を選択</li>
                <li>右上「追加」をタップ</li>
              </ol>
            ) : (
              <ol className="text-base space-y-2 mb-6 list-decimal list-inside leading-relaxed">
                <li>ブラウザのメニュー（︙ または ⋯）を開く</li>
                <li>「アプリをインストール」または「ホーム画面に追加」を選択</li>
                <li>確認ダイアログで追加</li>
              </ol>
            )}
            <div className="flex justify-end">
              <BigButton variant="primary" onClick={() => setShowIOSGuide(false)}>
                閉じる
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
