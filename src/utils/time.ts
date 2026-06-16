const JST = "Asia/Tokyo";

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const partValue = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${partValue("year")}年${Number(partValue("month"))}月${Number(partValue("day"))}日`;
};
