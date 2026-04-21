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
 * Swiss — Müller-Brockmann / Vignelli grammar.
 *   Flush-left, ragged-right. Never centered.
 *   6-column grid; title locked to columns 1–4 top-left.
 *   Hairline rule above title as baseline grid marker.
 *   Geometric element (ring or accent strip) aligned to grid.
 *   Date/venue flush-left at same column as title, bottom.
 *   No italics. Single family if possible, weight contrast only.
 */
export function SwissLayout(props: LayoutProps): ReactElement {
  const { width, height, design, photoUrl, tagline, eventName, artistName, venueName, venueAddress, date, time, logoUrl } = props;
  const ctx = buildContext(props);
  const { palette } = ctx;

  const dateStr = [formatDate(date), formatTime(time)].filter(Boolean).join(" · ");

  // 6-col grid
  const gutter = scale(width, 24);
  const colW = (width - scale(width, 120) - gutter * 5) / 6;
  const gridX = scale(width, 60);
  const titleCols = 5; // span 5 of 6
  const titleW = colW * titleCols + gutter * (titleCols - 1);

  const ringSize = Math.min(width, height) * 0.35;

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
      {/* Top hairline rule — full width at margin. */}
      <div
        style={{
          position: "absolute",
          top: scale(width, 60),
          left: gridX,
          width: width - gridX * 2,
          height: Math.max(1, scale(width, 2)),
          background: palette.ink,
        }}
      />

      {/* Kicker — issue number / presents */}
      <div
        style={{
          position: "absolute",
          top: scale(width, 80),
          left: gridX,
          ...roleStyle(design.typePair, "caption", 14, width, { upper: true }),
          color: palette.accent,
        }}
      >
        {tagline || `№ ${new Date().getFullYear()}`}
      </div>

      {/* Title — flush-left, 5 cols wide */}
      <div
        style={{
          position: "absolute",
          top: scale(width, 150),
          left: gridX,
          width: titleW,
          ...roleStyle(design.typePair, "display", 110, width),
          color: palette.ink,
          lineHeight: 0.96,
          wordBreak: "break-word",
        }}
      >
        {eventName || "Event"}
      </div>

      {/* Geometric hero element — ring / photo plate */}
      {ctx.hasPhoto ? (
        <img
          src={photoUrl}
          width={ringSize}
          height={ringSize}
          style={{
            position: "absolute",
            top: Math.round(height * 0.42),
            right: gridX,
            width: ringSize,
            height: ringSize,
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            top: Math.round(height * 0.42),
            right: gridX,
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize,
            border: `${Math.max(3, scale(width, 12))}px solid ${palette.accent}`,
          }}
        />
      )}

      {/* Accent strip in col 5-6 — Swiss color block */}
      <div
        style={{
          position: "absolute",
          left: gridX + colW * 4 + gutter * 4,
          top: scale(width, 150),
          width: colW * 2 + gutter,
          height: scale(width, 60),
          background: palette.accent,
        }}
      />

      {/* Bottom hairline rule */}
      <div
        style={{
          position: "absolute",
          bottom: scale(width, 200),
          left: gridX,
          width: width - gridX * 2,
          height: Math.max(1, scale(width, 2)),
          background: palette.ink,
        }}
      />

      {/* Date / venue / billing — flush-left at gridX, baseline aligned */}
      <div
        style={{
          position: "absolute",
          left: gridX,
          bottom: scale(width, 80),
          display: "flex",
          flexDirection: "column",
          gap: scale(width, 6),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 14, width, { upper: true }),
            color: palette.muted,
          }}
        >
          DATE
        </div>
        <div
          style={{
            ...roleStyle(design.typePair, "subhead", 24, width),
            color: palette.ink,
          }}
        >
          {dateStr || "Date · Time"}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: gridX + colW * 3,
          bottom: scale(width, 80),
          display: "flex",
          flexDirection: "column",
          gap: scale(width, 6),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 14, width, { upper: true }),
            color: palette.muted,
          }}
        >
          VENUE
        </div>
        <div
          style={{
            ...roleStyle(design.typePair, "subhead", 24, width),
            color: palette.ink,
          }}
        >
          {venueName || "Venue"}
        </div>
        {venueAddress ? (
          <div
            style={{
              ...roleStyle(design.typePair, "body", 16, width),
              color: palette.muted,
            }}
          >
            {venueAddress}
          </div>
        ) : null}
      </div>

      {artistName ? (
        <div
          style={{
            position: "absolute",
            right: gridX,
            bottom: scale(width, 80),
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            gap: scale(width, 6),
          }}
        >
          <div
            style={{
              ...roleStyle(design.typePair, "caption", 14, width, { upper: true }),
              color: palette.muted,
            }}
          >
            BILLING
          </div>
          <div
            style={{
              ...roleStyle(design.typePair, "subhead", 24, width),
              color: palette.ink,
            }}
          >
            {artistName}
          </div>
        </div>
      ) : null}

      {logoUrl ? (
        <img
          src={logoUrl}
          width={scale(width, 80)}
          height={scale(width, 80)}
          style={{
            position: "absolute",
            top: scale(width, 80),
            right: gridX,
            objectFit: "contain",
          }}
        />
      ) : null}
    </div>
  );
}
