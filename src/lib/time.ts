const JST = "Asia/Tokyo";

const jstParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const partValue = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: partValue("year"),
    month: partValue("month"),
    day: partValue("day"),
  };
};

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = jstParts(date);
  return `${parts.year}年${Number(parts.month)}月${Number(parts.day)}日`;
};
