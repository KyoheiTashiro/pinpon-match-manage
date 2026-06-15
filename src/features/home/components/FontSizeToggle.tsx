import { Toggle, type ToggleOption } from "@/components/ui/Toggle";
import { FONT_SIZE, type FontSize } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

const FONT_SIZE_OPTIONS: ToggleOption<FontSize>[] = Object.values(FONT_SIZE).map((size) => ({
  value: size,
  label: size === FONT_SIZE.NORMAL ? "標準" : size === FONT_SIZE.LARGE ? "大" : "特大",
}));

export const FontSizeToggle = () => {
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);

  useEffect(() => {
    if (fontSize === FONT_SIZE.NORMAL) delete document.documentElement.dataset.fs;
    else document.documentElement.dataset.fs = fontSize;
  }, [fontSize]);

  return (
    <Toggle
      label="文字"
      ariaLabel="文字サイズ"
      value={fontSize}
      options={FONT_SIZE_OPTIONS}
      onChange={setFontSize}
    />
  );
};
