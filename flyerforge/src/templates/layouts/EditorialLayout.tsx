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
 * Editorial — Gentlewoman / T Magazine grammar.
 *   Masthead top 5–10% centered with hairline rule below.
 *   Italic sub-kicker / deck directly beneath.
 *   Portrait photo centered, 60–75% of canvas.
 *   Metadata bottom, small tracked caps.
 *   Generous 8–12% margins.
 */
export function EditorialLayout(props: LayoutProps): ReactElement {
  const { width, height, design, photoUrl, tagline, eventName, artistName, venueName, venueAddress, date, time, logoUrl } = props;
  const ctx = buildContext(props);
  const { palette } = ctx;

  const dateStr = [formatDate(date), formatTime(time)].filter(Boolean).join(" · ");
  const marginX = scale(width, 90);
  const photoTop = Math.round(height * 0.28);
  const photoHeight = Math.round(height * 0.5);

  return (
    <div
      style={{
        display: "flex",
        width,
        height,
        backgroundColor: palette.bg,
        color: palette.ink,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Masthead */}
      <div
        style={{
          position: "absolute",
          top: Math.round(height * 0.07),
          left: marginX,
          right: marginX,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: scale(width, 10),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 14, width, { upper: true }),
            color: palette.muted,
          }}
        >
          {tagline || "THE EVENT ISSUE"}
        </div>

        <div
          style={{
            ...roleStyle(design.typePair, "display", 80, width),
            color: palette.ink,
            lineHeight: 0.95,
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {eventName || "Event Title"}
        </div>

        {/* Hairline rule */}
        <div
          style={{
            width: scale(width, 220),
            height: Math.max(1, scale(width, 2)),
            background: palette.ink,
            marginTop: scale(width, 6),
            marginBottom: scale(width, 6),
          }}
        />

        {artistName ? (
          <div
            style={{
              ...roleStyle(design.typePair, "subhead", 22, width, { italic: true }),
              color: palette.muted,
            }}
          >
            {`with ${artistName}`}
          </div>
        ) : null}
      </div>

      {/* Portrait / hero photo — framed plate, not full bleed. */}
      {ctx.hasPhoto ? (
        <img
          src={photoUrl}
          width={width - marginX * 2}
          height={photoHeight}
          style={{
            position: "absolute",
            top: photoTop,
            left: marginX,
            width: width - marginX * 2,
            height: photoHeight,
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            top: photoTop,
            left: marginX,
            width: width - marginX * 2,
            height: photoHeight,
            background: palette.mode === "light" ? palette.ink : palette.accent,
            opacity: 0.08,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              ...roleStyle(design.typePair, "caption", 20, width, { upper: true }),
              color: palette.muted,
            }}
          >
            — PLATE —
          </div>
        </div>
      )}

      {/* Footer: date · venue in tracked small caps. */}
      <div
        style={{
          position: "absolute",
          left: marginX,
          right: marginX,
          bottom: Math.round(height * 0.08),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: scale(width, 4),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 16, width, { upper: true }),
            color: palette.ink,
          }}
        >
          {dateStr || "DATE · TIME"}
        </div>
        <div
          style={{
            ...roleStyle(design.typePair, "body", 18, width),
            color: palette.muted,
          }}
        >
          {`${venueName || "Venue"}${venueAddress ? ` · ${venueAddress}` : ""}`}
        </div>
      </div>

      {logoUrl ? (
        <img
          src={logoUrl}
          width={scale(width, 80)}
          height={scale(width, 80)}
          style={{
            position: "absolute",
            bottom: scale(width, 48),
            right: marginX,
            objectFit: "contain",
          }}
        />
      ) : null}
    </div>
  );
}
