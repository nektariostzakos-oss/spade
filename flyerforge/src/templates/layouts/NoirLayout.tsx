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
 * Noir — A24 / Criterion grammar.
 *   Subject photo full-bleed filling upper 70–80%.
 *   Dark gradient scrim at bottom for legibility.
 *   Title small (5–9% of height), centered at bottom 70% of height.
 *   Kicker directly above title, tracked caps.
 *   Billing strip at 88–96% of height: date · venue · artist.
 */
export function NoirLayout(props: LayoutProps): ReactElement {
  const { width, height, design, photoUrl, tagline, eventName, artistName, venueName, venueAddress, date, time, logoUrl } = props;
  const ctx = buildContext(props);
  const { palette, margins } = ctx;

  const dateStr = [formatDate(date), formatTime(time)].filter(Boolean).join(" · ");
  const titleBaseline = 78; // baseline px @ 1080 — A24-restrained sizing
  const billing = [dateStr, venueName, venueAddress, artistName ? `w/ ${artistName}` : ""].filter(Boolean).join("    ");

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
          height={height}
          style={{
            position: "absolute",
            inset: 0,
            width,
            height,
            objectFit: "cover",
          }}
        />
      ) : null}

      {/* Top vignette to hold the logo + readability for any text up top. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height: Math.round(height * 0.35),
          background: `linear-gradient(180deg, ${palette.bg}cc 0%, ${palette.bg}00 100%)`,
        }}
      />

      {/* Bottom scrim — carries the title + billing. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width,
          height: Math.round(height * 0.55),
          background: `linear-gradient(180deg, ${palette.bg}00 0%, ${palette.bg}e6 55%, ${palette.bg} 100%)`,
        }}
      />

      {/* Letterbox bars — subtle noir signature. */}
      <div style={{ position: "absolute", top: 0, left: 0, width, height: scale(width, 32), background: palette.bg }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width, height: scale(width, 32), background: palette.bg }} />

      {logoUrl ? (
        <img
          src={logoUrl}
          width={scale(width, 120)}
          height={scale(width, 120)}
          style={{
            position: "absolute",
            top: margins.top,
            left: margins.left,
            objectFit: "contain",
          }}
        />
      ) : null}

      {/* Title stack — kicker · TITLE · billing. */}
      <div
        style={{
          position: "absolute",
          left: margins.left,
          right: margins.right,
          bottom: Math.max(margins.bottom, scale(width, 120)),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: scale(width, 16),
        }}
      >
        {tagline ? (
          <div
            style={{
              ...roleStyle(design.typePair, "caption", 14, width, { upper: true }),
              color: palette.accent,
            }}
          >
            {tagline}
          </div>
        ) : null}

        <div
          style={{
            ...roleStyle(design.typePair, "display", titleBaseline, width, { upper: true }),
            color: palette.ink,
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {eventName || "EVENT TITLE"}
        </div>

        {/* Hairline separator. */}
        <div
          style={{
            width: scale(width, 160),
            height: Math.max(1, scale(width, 2)),
            background: palette.accent,
            marginTop: scale(width, 8),
            marginBottom: scale(width, 8),
          }}
        />

        <div
          style={{
            ...roleStyle(design.typePair, "caption", 13, width, { upper: true }),
            color: palette.muted,
            maxWidth: "100%",
          }}
        >
          {billing || "DATE · VENUE"}
        </div>
      </div>
    </div>
  );
}
