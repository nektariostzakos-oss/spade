export type TemplateProps = {
  eventName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  artistName?: string;
  photoUrl: string;
  width: number;
  height: number;
};

export function formatDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function formatTime(raw: string): string {
  if (!raw) return "";
  const [hh, mm] = raw.split(":");
  const h = Number(hh);
  if (Number.isNaN(h)) return raw;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${mm ?? "00"} ${suffix}`;
}

/** Scale a px value relative to a 1080-wide baseline so one template renders
 *  cleanly at 1080, 1200, and 1748 widths. */
export function scale(width: number, px: number): number {
  return Math.max(1, Math.round((px * width) / 1080));
}
