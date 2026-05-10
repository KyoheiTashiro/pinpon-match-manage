const JST = 'Asia/Tokyo';

const jstParts = (d: Date) => {
  const fmt = new Intl.DateTimeFormat('ja-JP', {
    timeZone: JST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') === '24' ? '00' : get('hour'),
    minute: get('minute'),
  };
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = jstParts(d);
  return `${p.year}年${Number(p.month)}月${Number(p.day)}日`;
};

export const formatTime = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = jstParts(d);
  return `${p.hour}:${p.minute}`;
};

export const toLocalInputValue = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = jstParts(d);
  return `${p.hour}:${p.minute}`;
};

export const fromLocalInputValue = (v: string): string | undefined => {
  if (!v) return undefined;
  const m = /^(\d{2}):(\d{2})$/.exec(v);
  if (!m) return undefined;
  const p = jstParts(new Date());
  const iso = `${p.year}-${p.month}-${p.day}T${m[1]}:${m[2]}:00+09:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

export const nowJstHHMM = (): string => {
  const p = jstParts(new Date());
  return `${p.hour}:${p.minute}`;
};
