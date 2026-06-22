import { ChevronDownIcon } from "@/components/icons";
import { useEffect, useId, useRef, useState } from "react";

// 汎用カスタムセレクト（listbox パターン）。native <select> ではなく
// スタイル統一・キーボード操作のため独自実装。
export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

type Props<T extends string | number> = {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string; // 可視ラベル（横並び）。省略時は ariaLabel を使用
  ariaLabel?: string; // label 省略時の a11y 名
  placeholder?: string;
  disabled?: boolean;
  id?: string; // 省略時 useId() で自動採番（複数マウント時の id 衝突回避）
};

export const Select = <T extends string | number>({
  options,
  value,
  onChange,
  label,
  ariaLabel,
  placeholder = "選択してください",
  disabled = false,
  id,
}: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const baseId = id ?? autoId;
  const labelId = `${baseId}-label`;
  const triggerId = `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;

  const selectedOption = options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    // クリーンアップ不要だが consistent-return のため空クリーンアップ関数を返す
    if (!isOpen) return () => {};
    const handlePointerDown = (event: PointerEvent) => {
      if (
        wrapperRef.current &&
        event.target instanceof Node &&
        !wrapperRef.current.contains(event.target)
      ) {
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
    const index = options.findIndex((option) => option.value === value);
    setFocusedIndex(Math.max(index, 0));
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

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      open();
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectByIndex(focusedIndex);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      // Tab はブラウザのデフォルト移動に任せる → focus は戻さず閉じるだけ
      close(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span id={labelId} className="text-ink shrink-0 text-sm font-bold">
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
          className="min-h-btn border-line text-ink flex w-full items-center justify-between gap-2 rounded-xl border-2 bg-white px-3 text-left text-base font-bold disabled:opacity-50"
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
              focusedIndex >= 0 ? `${baseId}-option-${focusedIndex.toString()}` : undefined
            }
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="border-line absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border-2 bg-white shadow"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isFocused = index === focusedIndex;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  id={`${baseId}-option-${index.toString()}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => selectByIndex(index)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`block w-full px-4 py-3 text-left text-base font-bold ${
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
