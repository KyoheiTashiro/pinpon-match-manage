import { useEffect, useRef, useState } from 'react';
import { BigButton } from './BigButton';

const ITEM_H = 56;
const VISIBLE = 5;
const PADDING = ((VISIBLE - 1) / 2) * ITEM_H;

type Props = {
  open: boolean;
  value: string;
  title?: string;
  step?: number;
  onChange: (v: string) => void;
  onClose: () => void;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const pad = (n: number) => String(n).padStart(2, '0');

const Wheel = ({
  values,
  selected,
  onSelect,
}: {
  values: number[];
  selected: number;
  onSelect: (n: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const userScrolling = useRef(false);

  useEffect(() => {
    const idx = values.indexOf(selected);
    if (idx >= 0 && ref.current && !userScrolling.current) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  }, [selected, values]);

  const handleScroll = () => {
    userScrolling.current = true;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      const target = clamped * ITEM_H;
      if (Math.abs(el.scrollTop - target) > 1) {
        el.scrollTo({ top: target, behavior: 'smooth' });
      }
      const v = values[clamped];
      userScrolling.current = false;
      if (v !== selected) onSelect(v);
    }, 120);
  };

  const tap = (v: number) => {
    const idx = values.indexOf(v);
    ref.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    onSelect(v);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ height: VISIBLE * ITEM_H }}
    >
      <div style={{ height: PADDING }} />
      {values.map((v) => {
        const sel = v === selected;
        return (
          <div
            key={v}
            onClick={() => tap(v)}
            className={`snap-center flex items-center justify-center text-3xl font-extrabold cursor-pointer ${
              sel ? 'text-ink' : 'text-sub opacity-50'
            }`}
            style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
          >
            {pad(v)}
          </div>
        );
      })}
      <div style={{ height: PADDING }} />
    </div>
  );
};

const parseHHMM = (v: string): [number, number] => {
  const [hh, mm] = v.split(':');
  return [parseInt(hh ?? '', 10) || 0, parseInt(mm ?? '', 10) || 0];
};

const TimePickerInner = ({
  value,
  title,
  step,
  onChange,
  onClose,
}: Required<Omit<Props, 'open'>>) => {
  const [initH, initM] = parseHHMM(value);
  const [h, setH] = useState(initH);
  const [m, setM] = useState(initM);

  const hours = range(24);
  const minutes = range(Math.floor(60 / step)).map((i) => i * step);
  const mSel = minutes.includes(m)
    ? m
    : minutes.reduce(
        (p, c) => (Math.abs(c - m) < Math.abs(p - m) ? c : p),
        minutes[0],
      );

  const confirm = () => {
    onChange(`${pad(h)}:${pad(mSel)}`);
    onClose();
  };

  const clear = () => {
    onChange('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border-4 border-line w-full max-w-sm p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold mb-3 text-center">{title}</h3>
        <div className="relative">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <Wheel values={hours} selected={h} onSelect={setH} />
            <span className="text-3xl font-extrabold">:</span>
            <Wheel values={minutes} selected={mSel} onSelect={setM} />
          </div>
          <div
            className="absolute left-0 right-0 pointer-events-none border-y-4 border-primary rounded"
            style={{ top: PADDING, height: ITEM_H }}
          />
          <div
            className="absolute left-0 right-0 top-0 pointer-events-none bg-gradient-to-b from-white to-transparent"
            style={{ height: PADDING }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none bg-gradient-to-t from-white to-transparent"
            style={{ height: PADDING }}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-end mt-4">
          <BigButton variant="secondary" onClick={onClose}>
            キャンセル
          </BigButton>
          <BigButton variant="danger" onClick={clear}>
            クリア
          </BigButton>
          <BigButton variant="primary" onClick={confirm}>
            決定
          </BigButton>
        </div>
      </div>
    </div>
  );
};

export const TimePickerModal = ({
  open,
  value,
  title = '時刻を選ぶ',
  step = 1,
  onChange,
  onClose,
}: Props) => {
  if (!open) return null;
  return (
    <TimePickerInner
      key={value}
      value={value}
      title={title}
      step={step}
      onChange={onChange}
      onClose={onClose}
    />
  );
};
