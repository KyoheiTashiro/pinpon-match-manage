import { useEffect, useRef, useState } from "react";
import { ScoreProgressChart } from "@/features/tournament/matrix/components/scoreboard/ScoreProgressChart";
import type { MatchResultRow } from "@/features/tournament/ranking/hooks";

// ----- 対戦選択セレクタ（画像対象外、graphモード専用） -----
type GraphMatchSelectorProps = {
  graphMatches: MatchResultRow[];
  selectedMatchId: string | null;
  onSelect: (id: string) => void;
};

export const GraphMatchSelector = ({
  graphMatches,
  selectedMatchId,
  onSelect,
}: GraphMatchSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const labelId = "graph-match-select-label";
  const listboxId = "graph-match-select-listbox";

  const selectedMatch = graphMatches.find((m) => m.id === selectedMatchId) ?? null;

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

  // フォーカス中項目をビューポート内に追従（長いリスト対応）
  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;
    const optionEl = listboxRef.current?.querySelector(
      `#graph-match-option-${focusedIndex.toString()}`,
    );
    optionEl?.scrollIntoView({ block: "nearest" });
  }, [isOpen, focusedIndex]);

  const open = () => {
    const idx = graphMatches.findIndex((m) => m.id === selectedMatchId);
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
    const match = graphMatches[index];
    if (match) {
      onSelect(match.id);
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
      setFocusedIndex((prev) => Math.min(prev + 1, graphMatches.length - 1));
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

  if (graphMatches.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span id={labelId} className="text-sm font-bold text-ink shrink-0">
        対戦を選択
      </span>
      <div ref={wrapperRef} className="relative flex-1">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${labelId} graph-match-select-trigger`}
          id="graph-match-select-trigger"
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={handleTriggerKeyDown}
          className="w-full min-h-btn px-3 rounded-xl border-2 border-line text-ink bg-white text-base font-bold flex items-center justify-between gap-2 text-left"
        >
          <span className="truncate">
            {selectedMatch
              ? `${selectedMatch.leftName} vs ${selectedMatch.rightName}`
              : "選択してください"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {isOpen && (
          <div
            ref={listboxRef}
            role="listbox"
            id={listboxId}
            aria-labelledby={labelId}
            aria-activedescendant={
              focusedIndex >= 0 ? `graph-match-option-${focusedIndex.toString()}` : undefined
            }
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border-2 border-line rounded-xl shadow max-h-64 overflow-y-auto"
          >
            {graphMatches.map((match, index) => {
              const isSelected = match.id === selectedMatchId;
              const isFocused = index === focusedIndex;
              return (
                <button
                  key={match.id}
                  type="button"
                  id={`graph-match-option-${index.toString()}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => selectByIndex(index)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`block w-full text-left px-4 py-3 text-base font-bold ${
                    isSelected ? "bg-primary/10 text-primary" : "text-ink"
                  } ${isFocused && !isSelected ? "bg-line/10" : ""}`}
                >
                  {match.leftName} vs {match.rightName}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ----- 1対戦グラフブロック（表示用・off-screen用の共通コンポーネント） -----
type MatchGraphBlockProps = {
  match: MatchResultRow;
};

export const MatchGraphBlock = ({ match }: MatchGraphBlockProps) => {
  const hasLog = match.games.some((game) => game.pointLog && game.pointLog.length > 0);
  return (
    <div className="pt-2">
      <div className="text-base mb-1">
        <span className={match.winner === "L" ? "font-extrabold" : "text-sub"}>
          {match.leftName}
        </span>
        <span className="text-sub"> vs </span>
        <span className={match.winner === "R" ? "font-extrabold" : "text-sub"}>
          {match.rightName}
        </span>
      </div>
      {hasLog ? (
        <ScoreProgressChart
          games={match.games}
          leftName={match.leftName}
          rightName={match.rightName}
          matchFirstServer={match.firstServer}
        />
      ) : (
        <p className="text-sub">得点記録なし</p>
      )}
    </div>
  );
};
