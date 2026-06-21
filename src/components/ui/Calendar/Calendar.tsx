import { CalendarIcon, ChevronDownIcon } from "@/components/icons";
import { useEffect, useId, useMemo, useRef, useState } from "react";

// 汎用日付ピッカー（ポップオーバー）。native <input type="date"> ではなく
// スタイル統一・表示フォーマット統一のため独自実装。
// value / onChange は "YYYY-MM-DD" 文字列で扱う（ローカルタイム基準）。

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 曜日ヘッダの文字色（日=赤 / 土=青 / 平日=line）。
const weekdayColor = (weekday: number) =>
  weekday === 0 ? "text-danger" : weekday === 6 ? "text-primary" : "text-line";

const pad = (n: number) => String(n).padStart(2, "0");

const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

// "YYYY-MM-DD" → {y, m(0-based), d}。不正値は null。
const parseISO = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  const date = new Date(y, m, d);
  // 2/30 等の桁あふれを弾く
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
  return { y, m, d };
};

const formatDisplay = (value: string) => {
  const parsed = parseISO(value);
  if (!parsed) return "";
  const { y, m, d } = parsed;
  const w = WEEKDAYS[new Date(y, m, d).getDay()];
  return `${y}/${pad(m + 1)}/${pad(d)}（${w}）`;
};

type Props = {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string; // 省略時 useId() で自動採番
};

export const Calendar = ({
  value,
  onChange,
  ariaLabel = "日付を選択",
  placeholder = "日付を選択",
  disabled = false,
  id,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const autoId = useId();
  const uid = id ?? autoId;

  const today = useMemo(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  }, []);

  const selected = parseISO(value);

  // 表示中の年月。selected を基準、無ければ今日。
  const [view, setView] = useState(() => ({
    y: selected?.y ?? today.y,
    m: selected?.m ?? today.m,
  }));
  // キーボード移動用カーソル日（1始まり）。
  const [cursor, setCursor] = useState(selected?.d ?? today.d);

  // 開いたとき選択日（無ければ今日）の月へ合わせ、グリッドへフォーカス。
  useEffect(() => {
    if (!isOpen) return;
    const base = selected ?? today;
    setView({ y: base.y, m: base.m });
    setCursor(base.d);
    gridRef.current?.focus();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // 外クリックで閉じる。
  useEffect(() => {
    if (!isOpen) return () => {};
    const handlePointerDown = (e: PointerEvent) => {
      if (
        wrapperRef.current &&
        e.target instanceof Node &&
        !wrapperRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  // 月初までの空セル + 日付セル。末尾も 7 の倍数になるよう null 埋めし週に分割。
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const close = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const goMonth = (delta: number) => {
    setView((prev) => {
      const next = new Date(prev.y, prev.m + delta, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });
  };

  const selectDay = (day: number) => {
    onChange(toISO(view.y, view.m, day));
    close();
  };

  // カーソルを delta 日動かす（月跨ぎは view も更新）。
  const moveCursor = (delta: number) => {
    const next = new Date(view.y, view.m, cursor + delta);
    setView({ y: next.getFullYear(), m: next.getMonth() });
    setCursor(next.getDate());
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveCursor(-1);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveCursor(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveCursor(-7);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveCursor(7);
        break;
      case "PageUp":
        e.preventDefault();
        goMonth(-1);
        break;
      case "PageDown":
        e.preventDefault();
        goMonth(1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        selectDay(cursor);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        break;
    }
  };

  const isSelected = (day: number) =>
    selected !== null && selected.y === view.y && selected.m === view.m && selected.d === day;
  const isToday = (day: number) => today.y === view.y && today.m === view.m && today.d === day;

  const dayClass = (day: number) => {
    const base = "min-h-btn flex w-full items-center justify-center rounded-lg text-base font-bold";
    if (isSelected(day)) return `${base} bg-primary text-white`;
    if (isToday(day)) return `${base} border-primary text-primary border-2 bg-white`;
    return `${base} text-ink hover:bg-line/10 bg-white`;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className="min-h-input border-line text-ink flex w-full items-center justify-between gap-2 rounded-xl border-2 bg-white px-3 text-left text-lg disabled:opacity-50"
      >
        <span className={selected ? "" : "text-line"}>
          {selected ? formatDisplay(value) : placeholder}
        </span>
        <CalendarIcon className="text-line shrink-0 text-2xl" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden
            onPointerDown={() => close()}
          />
          <dialog
            open
            aria-label={ariaLabel}
            onKeyDown={handleGridKeyDown}
            className="border-line fixed top-1/2 left-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 bg-white p-4 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="前の月"
                onClick={() => goMonth(-1)}
                className="text-ink min-h-btn flex w-10 items-center justify-center rounded-lg"
              >
                <ChevronDownIcon width={28} height={28} className="rotate-90" />
              </button>
              <span aria-live="polite" className="text-ink text-base font-bold">
                {view.y}年{view.m + 1}月
              </span>
              <button
                type="button"
                aria-label="次の月"
                onClick={() => goMonth(1)}
                className="text-ink min-h-btn flex w-10 items-center justify-center rounded-lg"
              >
                <ChevronDownIcon width={28} height={28} className="-rotate-90" />
              </button>
            </div>

            <table
              ref={gridRef}
              tabIndex={-1}
              aria-label={`${view.y}年${view.m + 1}月`}
              className="w-full table-fixed border-separate border-spacing-1 outline-none"
            >
              <thead>
                <tr>
                  {WEEKDAYS.map((w, i) => (
                    <th
                      key={w}
                      scope="col"
                      className={`text-center text-xs font-bold ${weekdayColor(i)}`}
                    >
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={`week-${uid}-${wi.toString()}`}>
                    {week.map((day, di) =>
                      day === null ? (
                        <td key={`empty-${uid}-${wi.toString()}-${di.toString()}`} aria-hidden />
                      ) : (
                        <td key={day} className="p-0">
                          <button
                            type="button"
                            aria-label={`${view.y}年${view.m + 1}月${day}日`}
                            aria-pressed={isSelected(day)}
                            aria-current={isToday(day) ? "date" : undefined}
                            onClick={() => selectDay(day)}
                            className={dayClass(day)}
                          >
                            {day}
                          </button>
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </dialog>
        </>
      )}
    </div>
  );
};
