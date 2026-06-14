import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

// 汎用カスタムセレクト（listbox パターン）。native <select> ではなく
// スタイル統一・キーボード操作のため独自実装。
export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

type SelectMenuProps<T extends string | number> = {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string; // 可視ラベル（横並び）。省略時は ariaLabel を使用
  ariaLabel?: string; // label 省略時の a11y 名
  placeholder?: string;
  disabled?: boolean;
  id?: string; // 省略時 useId() で自動採番（複数マウント時の id 衝突回避）
};

export const SelectMenu = <T extends string | number>({
  options,
  value,
  onChange,
  label,
  ariaLabel,
  placeholder = "選択してください",
  disabled = false,
  id,
}: SelectMenuProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const uid = id ?? autoId;
  const labelId = `${uid}-label`;
  const triggerId = `${uid}-trigger`;
  const listboxId = `${uid}-listbox`;

  const selectedOption = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      listboxRef.current?.focus();
    }
  }, [isOpen]);

  // フォーカス中項目をビューポート内に追従（長いリスト対応）。
  // useId はコロンを含み CSS セレクタに使えないため id ではなく
  // role="option" の index でDOMを引く。
  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;
    const optionEls = listboxRef.current?.querySelectorAll('[role="option"]');
    optionEls?.[focusedIndex]?.scrollIntoView({ block: "nearest" });
  }, [isOpen, focusedIndex]);

  const open = () => {
    const idx = options.findIndex((o) => o.value === value);
    setFocusedIndex(Math.max(idx, 0));
    setIsOpen(true);
  };

  const close = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  };

  const selectByIndex = (index: number) => {
    const option = options[index];
    if (option) {
      onChange(option.value);
    }
    close();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      open();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectByIndex(focusedIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // Tab はブラウザのデフォルト移動に任せる → focus は戻さず閉じるだけ
      close(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span id={labelId} className="text-sm font-bold text-ink shrink-0">
          {label}
        </span>
      )}
      <div ref={wrapperRef} className="relative flex-1">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
          aria-label={label ? undefined : ariaLabel}
          id={triggerId}
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={handleTriggerKeyDown}
          className="w-full min-h-btn px-3 rounded-xl border-2 border-line text-ink bg-white text-base font-bold flex items-center justify-between gap-2 text-left disabled:opacity-50"
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDownIcon
            width={20}
            height={20}
            className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </button>
        {isOpen && (
          <div
            ref={listboxRef}
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : ariaLabel}
            aria-activedescendant={
              focusedIndex >= 0 ? `${uid}-option-${focusedIndex.toString()}` : undefined
            }
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border-2 border-line rounded-xl shadow max-h-64 overflow-y-auto"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isFocused = index === focusedIndex;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  id={`${uid}-option-${index.toString()}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => selectByIndex(index)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`block w-full text-left px-4 py-3 text-base font-bold ${
                    isSelected ? "bg-primary/10 text-primary" : "text-ink"
                  } ${isFocused && !isSelected ? "bg-line/10" : ""}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
