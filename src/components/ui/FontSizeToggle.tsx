import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { FontSize } from '../../store/types';

const labels: Record<FontSize, string> = {
  normal: '標準',
  large: '大',
  xlarge: '特大',
};

export const FontSizeToggle = () => {
  const fontSize = useAppStore((s) => s.fontSize);
  const setFontSize = useAppStore((s) => s.setFontSize);

  useEffect(() => {
    if (fontSize === 'normal') document.documentElement.removeAttribute('data-fs');
    else document.documentElement.setAttribute('data-fs', fontSize);
  }, [fontSize]);

  return (
    <div role="radiogroup" aria-label="文字サイズ" className="flex items-center gap-2">
      <span className="text-base font-bold">文字</span>
      <div className="inline-flex items-center bg-bg border-2 border-line rounded-xl p-1 gap-1">
        {(['normal', 'large', 'xlarge'] as FontSize[]).map((s) => {
          const selected = fontSize === s;
          return (
            <button
              key={s}
              role="radio"
              aria-checked={selected}
              onClick={() => setFontSize(s)}
              className={`min-h-[40px] min-w-[64px] px-3 rounded-lg transition ${
                selected
                  ? 'bg-white text-ink font-extrabold shadow-md'
                  : 'bg-transparent text-sub font-medium hover:text-ink'
              }`}
            >
              {labels[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
