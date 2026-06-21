import { RadioGroup } from "@/components/ui";
import { FONT_SIZE, type FontSize } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

const FONT_SIZE_OPTIONS = [
  { value: FONT_SIZE.NORMAL, label: "標準" },
  { value: FONT_SIZE.LARGE, label: "大" },
  { value: FONT_SIZE.XLARGE, label: "特大" },
] as const satisfies { value: FontSize; label: string }[];

export const FontSizeRadio = () => {
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);

  useEffect(() => {
    if (fontSize === FONT_SIZE.NORMAL) delete document.documentElement.dataset.fs;
    else document.documentElement.dataset.fs = fontSize;
  }, [fontSize]);

  return (
    <RadioGroup
      legend="文字サイズ"
      name="font-size"
      value={fontSize}
      options={FONT_SIZE_OPTIONS}
      onChange={setFontSize}
    />
  );
};
