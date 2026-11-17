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

const INSTALL_STATUS = {
  INSTALLED: "installed",
  PROMPTABLE: "promptable",
  PROMPTING: "prompting",
  GUIDE: "guide",
  UNAVAILABLE: "unavailable",
} as const;

type InstallStatus =
  | { kind: typeof INSTALL_STATUS.INSTALLED }
  | { kind: typeof INSTALL_STATUS.PROMPTABLE; event: BeforeInstallPromptEvent }
  | { kind: typeof INSTALL_STATUS.PROMPTING }
  | { kind: typeof INSTALL_STATUS.GUIDE; open: boolean }
  | { kind: typeof INSTALL_STATUS.UNAVAILABLE };

// ネイティブ prompt が使えないときの状態。モバイルは手動手順ガイド、PC は手段なし
// (beforeinstallprompt 無しでは prompt をプログラムから呼べないため)。
const withoutPrompt = (): InstallStatus =>
  isMobile() ? { kind: INSTALL_STATUS.GUIDE, open: false } : { kind: INSTALL_STATUS.UNAVAILABLE };

export const InstallAppButton = () => {
  // effect 内 setState を避けるため初期値で standalone 判定
  const [status, setStatus] = useState<InstallStatus>(() =>
    isStandalone() ? { kind: INSTALL_STATUS.INSTALLED } : withoutPrompt(),
  );

  useEffect(() => {
    // クリーンアップ不要だが consistent-return のため空クリーンアップ関数を返す
    if (isStandalone()) return () => {};
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      // beforeinstallprompt イベントは必ず BeforeInstallPromptEvent。DOM 境界のためキャスト不可避。
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      setStatus({ kind: INSTALL_STATUS.PROMPTABLE, event: event as BeforeInstallPromptEvent });
    };
    const onInstalled = () => setStatus({ kind: INSTALL_STATUS.INSTALLED });
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (status.kind === INSTALL_STATUS.INSTALLED || status.kind === INSTALL_STATUS.UNAVAILABLE) {
    return null;
  }

  const showGuide = status.kind === INSTALL_STATUS.GUIDE && status.open;
  const setGuideOpen = (open: boolean) =>
    setStatus((current) =>
      current.kind === INSTALL_STATUS.GUIDE ? { kind: INSTALL_STATUS.GUIDE, open } : current,
    );

  // prompt() は 1 イベントにつき 1 回しか呼べないため、結果待ちの間は prompting に移して再実行を防ぐ。
  const runPrompt = async (event: BeforeInstallPromptEvent) => {
    setStatus({ kind: INSTALL_STATUS.PROMPTING });
    let next = withoutPrompt();
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === "accepted") next = { kind: INSTALL_STATUS.INSTALLED };
    } catch {
      // prompt 失敗時は手動手順へフォールバック
    }
    // 待機中に appinstalled 等で遷移済みなら上書きしない
    setStatus((current) => (current.kind === INSTALL_STATUS.PROMPTING ? next : current));
  };

  const handleClick = () => {
    if (status.kind === INSTALL_STATUS.PROMPTABLE) void runPrompt(status.event);
    else setGuideOpen(true);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleClick}
        disabled={status.kind === INSTALL_STATUS.PROMPTING}
      >
        <HelpIcon className="mr-2 inline-block align-[-0.125em]" />
        ホーム画面に追加
      </Button>

      <InfoModal open={showGuide} title="ホーム画面に追加" onClose={() => setGuideOpen(false)}>
        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            {/* 閉じると iframe をアンマウントして再生を停止する(InfoModal は children を常時 DOM 保持するため)。 */}
            {/* YouTube 埋め込みは sandbox 無し前提。sandbox を付けると script と same-origin の両立が必要になり再生不可。 */}
            {showGuide && (
              // oxlint-disable-next-line react/iframe-missing-sandbox
              <iframe
                src={isIOS() ? GUIDE_VIDEOS.ios : GUIDE_VIDEOS.android}
                title="ホーム画面に追加 手順動画"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </InfoModal>
    </>
  );
};
