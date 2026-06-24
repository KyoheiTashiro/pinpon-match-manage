import { CalendarIcon, ChevronDownIcon } from "@/components/icons";
import { useCallback, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 曜日ヘッダの文字色（日=赤 / 土=青 / 平日=line）。
const weekdayColor = (weekday: number) =>
  weekday === 0 ? "text-danger" : weekday === 6 ? "text-primary" : "text-line";

const pad = (value: number) => String(value).padStart(2, "0");

const toISO = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

// "YYYY-MM-DD" → {year, month(0-based), day}。不正値は null。
const parseISO = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  // 2/30 等の桁あふれを弾く
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day)
    return null;
  return { year, month, day };
};

const formatDisplay = (value: string) => {
  const parsed = parseISO(value);
  if (!parsed) return "";
  const { year, month, day } = parsed;
  return `${year}/${pad(month + 1)}/${pad(day)}（${WEEKDAYS[new Date(year, month, day).getDay()]}）`;
};

type Props = {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
};

export const Calendar = ({
  value,
  onChange,
  ariaLabel = "日付を選択",
  placeholder = "日付を選択",
  disabled = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  const today = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }, []);

  const selected = parseISO(value);

  // 表示中の年月。selected を基準、無ければ今日。
  const [view, setView] = useState(() => ({
    year: selected?.year ?? today.year,
    month: selected?.month ?? today.month,
  }));
  // キーボード移動用カーソル日（1始まり）。
  const [cursor, setCursor] = useState(selected?.day ?? today.day);

  // open 時にグリッドへフォーカス（条件レンダーのマウント時のみ発火する callback ref）。
  // 外クリックは全画面オーバーレイの onPointerDown が担うため、document 購読は不要。
  const setGridRef = useCallback((node: HTMLTableElement | null) => {
    gridRef.current = node;
    node?.focus();
  }, []);

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  // 月初までの空セル + 日付セル。末尾も 7 の倍数になるよう null 埋めし週に分割。
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));

  // 開くとき選択日（無ければ今日）の月へ表示を合わせ、カーソルも合わせる。
  const openCalendar = () => {
    const base = selected ?? today;
    setView({ year: base.year, month: base.month });
    setCursor(base.day);
    setIsOpen(true);
  };

  const close = (returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const goMonth = (delta: number) => {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const selectDay = (day: number) => {
    onChange(toISO(view.year, view.month, day));
    close();
  };

  // カーソルを delta 日動かす（月跨ぎは view も更新）。
  const moveCursor = (delta: number) => {
    const next = new Date(view.year, view.month, cursor + delta);
    setView({ year: next.getFullYear(), month: next.getMonth() });
    setCursor(next.getDate());
  };

  const handleGridKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveCursor(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveCursor(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveCursor(-7);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveCursor(7);
        break;
      case "PageUp":
        event.preventDefault();
        goMonth(-1);
        break;
      case "PageDown":
        event.preventDefault();
        goMonth(1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectDay(cursor);
        break;
      case "Escape":
        event.preventDefault();
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
    selected !== null &&
    selected.year === view.year &&
    selected.month === view.month &&
    selected.day === day;
  const isToday = (day: number) =>
    today.year === view.year && today.month === view.month && today.day === day;

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
        onClick={() => (isOpen ? close() : openCalendar())}
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
                {view.year}年{view.month + 1}月
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
              ref={setGridRef}
              tabIndex={-1}
              aria-label={`${view.year}年${view.month + 1}月`}
              className="w-full table-fixed border-separate border-spacing-1 outline-none"
            >
              <thead>
                <tr>
                  {WEEKDAYS.map((weekday, index) => (
                    <th
                      key={weekday}
                      scope="col"
                      className={`text-center text-xs font-bold ${weekdayColor(index)}`}
                    >
                      {weekday}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={`week-${weekIndex.toString()}`}>
                    {week.map((day, dayIndex) =>
                      day === null ? (
                        <td
                          key={`empty-${weekIndex.toString()}-${dayIndex.toString()}`}
                          aria-hidden
                        />
                      ) : (
                        <td key={day} className="p-0">
                          <button
                            type="button"
                            aria-label={`${view.year}年${view.month + 1}月${day}日`}
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
