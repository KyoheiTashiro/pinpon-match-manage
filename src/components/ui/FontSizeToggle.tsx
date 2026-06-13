import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { FontSize } from "@/store/types";

const labels: Record<FontSize, string> = {
  normal: "標準",
  large: "大",
  xlarge: "特大",
};

export const FontSizeToggle = () => {
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);

  useEffect(() => {
    if (fontSize === "normal") delete document.documentElement.dataset.fs;
    else document.documentElement.dataset.fs = fontSize;
  }, [fontSize]);

  return (
    <div role="radiogroup" aria-label="文字サイズ" className="flex items-center gap-2">
      <span className="text-base font-bold">文字</span>
      <div className="inline-flex items-center bg-bg border-2 border-line rounded-xl p-1 gap-1">
        {(["normal", "large", "xlarge"] as FontSize[]).map((size) => {
          const selected = fontSize === size;
          return (
            <button
              key={size}
              role="radio"
              aria-checked={selected}
              onClick={() => setFontSize(size)}
              className={`min-h-[40px] min-w-[64px] px-3 rounded-lg transition ${
                selected
                  ? "bg-white text-ink font-extrabold shadow-md"
                  : "bg-transparent text-sub font-medium hover:text-ink"
              }`}
            >
              {labels[size]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
