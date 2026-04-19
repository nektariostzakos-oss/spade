import type { ReactElement } from "react";
import {
  buildContext,
  formatDate,
  formatTime,
  roleStyle,
  scale,
  type LayoutProps,
} from "../shared";

/**
 * Memphis — Paula Scher grammar.
 *   Each title line in its own saturated color.
 *   Condensed wood-type filling 60–80% of canvas.
 *   Geometric shapes (circle, triangle, squiggle) behind type.
 *   Tight left alignment, stacked words, leading 0.88.
 *   If photo is present, it's a circular plate — not full bleed.
 */
export function MemphisLayout(props: LayoutProps): ReactElement {
  const { width, height, design, photoUrl, tagline, eventName, artistName, venueName, venueAddress, date, time, logoUrl } = props;
  const ctx = buildContext(props);
  const { palette } = ctx;

  const dateStr = [formatDate(date), formatTime(time)].filter(Boolean).join(" · ");
  // Memphis palette expands: use palette.accent + a derived complement.
  const complement = palette.mode === "light" ? palette.ink : palette.accent;

  // Split the event name into at most 3 stacked lines; longer words stay whole.
  const words = (eventName || "STACK YOUR TITLE").toUpperCase().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (!current) { current = w; continue; }
    if (current.length + w.length + 1 <= 8 && lines.length < 2) current = `${current} ${w}`;
    else { lines.push(current); current = w; }
  }
  lines.push(current);

  // Each line cycles palette colors for Scher-style chromatic stack.
  const lineColors = [palette.ink, palette.accent, complement];

  return (
    <div
      style={{
        display: "flex",
        width,
        height,
        backgroundColor: palette.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative squiggle background — inline SVG. */}
      <div
        style={{
          position: "absolute",
          top: Math.round(height * 0.06),
          right: scale(width, 80),
          width: scale(width, 280),
          height: scale(width, 280),
          borderRadius: scale(width, 280),
          background: palette.accent,
          opacity: 0.22,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: Math.round(height * 0.18),
          left: scale(width, 40),
          width: scale(width, 180),
          height: scale(width, 180),
          transform: "rotate(45deg)",
          background: complement,
          opacity: 0.18,
        }}
      />

      {/* Big horizontal stripe tying the composition together. */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(height * 0.3),
          left: 0,
          width,
          height: scale(width, 28),
          background: palette.accent,
        }}
      />

      {ctx.hasPhoto ? (
        <img
          src={photoUrl}
          width={scale(width, 320)}
          height={scale(width, 320)}
          style={{
            position: "absolute",
            top: Math.round(height * 0.08),
            right: scale(width, 40),
            width: scale(width, 320),
            height: scale(width, 320),
            borderRadius: scale(width, 320),
            objectFit: "cover",
            border: `${scale(width, 10)}px solid ${palette.ink}`,
          }}
        />
      ) : null}

      {/* Title stack flush-left, each line its own color. */}
      <div
        style={{
          position: "absolute",
          left: scale(width, 48),
          top: Math.round(height * 0.42),
          display: "flex",
          flexDirection: "column",
          maxWidth: width - scale(width, 96),
        }}
      >
        {lines.map((line, i) => (
          <div
            key={`${line}-${i}`}
            style={{
              ...roleStyle(design.typePair, "display", 180, width, { upper: true }),
              color: lineColors[i % lineColors.length],
              lineHeight: 0.88,
              maxWidth: "100%",
              wordBreak: "break-word",
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Billing bottom-left, tight stack. */}
      <div
        style={{
          position: "absolute",
          left: scale(width, 48),
          bottom: scale(width, 60),
          display: "flex",
          flexDirection: "column",
          gap: scale(width, 4),
        }}
      >
        {tagline ? (
          <div
            style={{
              ...roleStyle(design.typePair, "caption", 18, width, { upper: true }),
              color: palette.accent,
            }}
          >
            {tagline}
          </div>
        ) : null}
        <div
          style={{
            ...roleStyle(design.typePair, "subhead", 28, width, { upper: true }),
            color: palette.ink,
          }}
        >
          {dateStr || "DATE · TIME"}
        </div>
        <div
          style={{
            ...roleStyle(design.typePair, "body", 22, width),
            color: palette.ink,
          }}
        >
          {`${venueName || "Venue"}${venueAddress ? ` · ${venueAddress}` : ""}`}
        </div>
        {artistName ? (
          <div
            style={{
              ...roleStyle(design.typePair, "caption", 14, width, { upper: true }),
              color: complement,
            }}
          >
            {`w/ ${artistName}`}
          </div>
        ) : null}
      </div>

      {logoUrl ? (
        <img
          src={logoUrl}
          width={scale(width, 90)}
          height={scale(width, 90)}
          style={{
            position: "absolute",
            top: scale(width, 48),
            left: scale(width, 48),
            objectFit: "contain",
          }}
        />
      ) : null}
    </div>
  );
}
