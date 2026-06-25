import { SegmentedControl } from "@/components/ui";
import { FONT_SIZE, type FontSize } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

const FONT_SIZE_OPTIONS = [
  { value: FONT_SIZE.XSMALL, label: "極小" },
  { value: FONT_SIZE.SMALL, label: "小" },
  { value: FONT_SIZE.NORMAL, label: "標準" },
  { value: FONT_SIZE.LARGE, label: "大" },
  { value: FONT_SIZE.XLARGE, label: "特大" },
] as const satisfies { value: FontSize; label: string }[];

export const FontSizeControl = () => {
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);

  useEffect(() => {
    if (fontSize === FONT_SIZE.NORMAL) delete document.documentElement.dataset.fs;
    else document.documentElement.dataset.fs = fontSize;
  }, [fontSize]);

  return (
    <>
      <span className="text-base font-bold">文字サイズ</span>
      <SegmentedControl
        ariaLabel="文字サイズ"
        value={fontSize}
        options={FONT_SIZE_OPTIONS}
        onChange={setFontSize}
      />
    </>
  );
};
