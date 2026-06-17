import { Button } from "@/components/ui/Button";
import { useRegisterSW } from "virtual:pwa-register/react";

export const SwUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-white shadow-lg">
      <span className="text-sm">新しいバージョンがあります</span>
      <Button variant="white" size="sm" onClick={() => void updateServiceWorker(true)}>
        更新
      </Button>
      <button
        type="button"
        aria-label="閉じる"
        className="ml-1 text-white/70 hover:text-white"
        onClick={() => setNeedRefresh(false)}
      >
        ✕
      </button>
    </div>
  );
};
