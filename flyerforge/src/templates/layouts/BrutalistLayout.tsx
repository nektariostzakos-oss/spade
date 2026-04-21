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
 * Brutalist — 032c / Balenciaga grammar.
 *   Title bleeds off top or right edge, 25–40% canvas height.
 *   Photo cropped to half-bleed on the right (if present).
 *   Accent color block at one edge carries kicker.
 *   Date / venue flush-left in a rigid block; artist opposite alignment.
 *   Scale shock: headline 10× smallest metadata.
 */
export function BrutalistLayout(props: LayoutProps): ReactElement {
  const { width, height, design, photoUrl, tagline, eventName, artistName, venueName, venueAddress, date, time, logoUrl } = props;
  const ctx = buildContext(props);
  const { palette } = ctx;

  const dateStr = [formatDate(date), formatTime(time)].filter(Boolean).join(" · ");
  const photoHeight = Math.round(height * 0.55);

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
      {ctx.hasPhoto ? (
        <img
          src={photoUrl}
          width={width}
          height={photoHeight}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height: photoHeight,
            objectFit: "cover",
          }}
        />
      ) : null}

      {/* Corner accent block — Kruger red bar. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: Math.round(width * 0.38),
          height: scale(width, 120),
          background: palette.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingLeft: scale(width, 24),
          paddingRight: scale(width, 24),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 20, width, { upper: true }),
            color: palette.mode === "dark" ? palette.ink : palette.bg,
          }}
        >
          {tagline || "RAW · RUNS LATE"}
        </div>
      </div>

      {/* Left inked strip separating image from lower block. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: photoHeight - scale(width, 20),
          width,
          height: scale(width, 20),
          background: palette.bg,
        }}
      />

      {/* Main title — bleeds off the left edge. */}
      <div
        style={{
          position: "absolute",
          left: -scale(width, 24),
          top: photoHeight + scale(width, 30),
          width: width + scale(width, 48),
          display: "flex",
          flexDirection: "column",
          gap: scale(width, 8),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "display", 220, width, { upper: true }),
            color: palette.ink,
            lineHeight: 0.88,
            maxWidth: "100%",
            padding: `0 ${scale(width, 40)}px`,
            wordBreak: "break-word",
          }}
        >
          {eventName || "EVENT"}
        </div>
      </div>

      {/* Metadata block — flush-left, rigid. */}
      <div
        style={{
          position: "absolute",
          left: scale(width, 40),
          bottom: scale(width, 60),
          display: "flex",
          flexDirection: "column",
          gap: scale(width, 4),
          maxWidth: Math.round(width * 0.55),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 16, width, { upper: true }),
            color: palette.accent,
          }}
        >
          {dateStr || "DATE · TIME"}
        </div>
        <div
          style={{
            ...roleStyle(design.typePair, "subhead", 24, width),
            color: palette.ink,
          }}
        >
          {venueName || "VENUE"}
        </div>
        <div
          style={{
            ...roleStyle(design.typePair, "body", 18, width),
            color: palette.muted,
          }}
        >
          {venueAddress}
        </div>
      </div>

      {/* Artist / billing flush-right for juxtaposition. */}
      {artistName ? (
        <div
          style={{
            position: "absolute",
            right: scale(width, 40),
            bottom: scale(width, 60),
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            gap: scale(width, 4),
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
              ...roleStyle(design.typePair, "subhead", 26, width, { upper: true }),
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
          width={scale(width, 100)}
          height={scale(width, 100)}
          style={{
            position: "absolute",
            top: scale(width, 140),
            left: scale(width, 40),
            objectFit: "contain",
          }}
        />
      ) : null}
    </div>
  );
}
