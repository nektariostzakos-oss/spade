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
 * Duotone — Peter Saville / Factory grammar.
 *   Duotoned photo occupies ~80% of canvas, anchored to one edge.
 *   Type stays small — image carries the poster.
 *   Catalog-number style metadata in mono type, museum-plate feel.
 *   Title flush-left, small, bottom corner.
 *   If no photo: a large accent-color field with tiny type set inside.
 */
export function DuotoneLayout(props: LayoutProps): ReactElement {
  const { width, height, design, photoUrl, tagline, eventName, artistName, venueName, venueAddress, date, time, logoUrl } = props;
  const ctx = buildContext(props);
  const { palette } = ctx;

  const dateStr = [formatDate(date), formatTime(time)].filter(Boolean).join(" · ");

  // Plate frame — image sits inside a generous margin of palette.bg.
  const frameX = scale(width, 80);
  const frameTop = scale(width, 200);
  const frameBottom = scale(width, 280);
  const plateW = width - frameX * 2;
  const plateH = height - frameTop - frameBottom;

  // Catalog number — decorative; mimics FAC-10 museum-plate feel.
  const catalog = `FF ${String(Math.abs(hashCode(eventName || "untitled")) % 900 + 100)}`;

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
      {/* Plate — duotone photo or accent-color field. */}
      <div
        style={{
          position: "absolute",
          top: frameTop,
          left: frameX,
          width: plateW,
          height: plateH,
          background: palette.accent,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        {ctx.hasPhoto ? (
          <img
            src={photoUrl}
            width={plateW}
            height={plateH}
            style={{ width: plateW, height: plateH, objectFit: "cover" }}
          />
        ) : (
          // Saville-move: small color key square in the corner
          <div
            style={{
              margin: scale(width, 24),
              width: scale(width, 60),
              height: scale(width, 60),
              background: palette.ink,
            }}
          />
        )}
      </div>

      {/* Top-right catalog number — museum plate. */}
      <div
        style={{
          position: "absolute",
          top: scale(width, 60),
          right: scale(width, 80),
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: scale(width, 4),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 14, width, { upper: true, family: "Space Mono" }),
            color: palette.ink,
          }}
        >
          {catalog}
        </div>
        {tagline ? (
          <div
            style={{
              ...roleStyle(design.typePair, "caption", 12, width, { upper: true }),
              color: palette.muted,
            }}
          >
            {tagline}
          </div>
        ) : null}
      </div>

      {/* Top-left: tiny artist/credit line — Factory-style. */}
      <div
        style={{
          position: "absolute",
          top: scale(width, 60),
          left: scale(width, 80),
          display: "flex",
          flexDirection: "column",
          gap: scale(width, 4),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 12, width, { upper: true, family: "Space Mono" }),
            color: palette.muted,
          }}
        >
          PRESENTS
        </div>
        {artistName ? (
          <div
            style={{
              ...roleStyle(design.typePair, "subhead", 20, width, { italic: true }),
              color: palette.ink,
            }}
          >
            {artistName}
          </div>
        ) : null}
      </div>

      {/* Bottom-left title — small, restrained. */}
      <div
        style={{
          position: "absolute",
          bottom: scale(width, 100),
          left: scale(width, 80),
          right: scale(width, 80),
          display: "flex",
          flexDirection: "column",
          gap: scale(width, 6),
        }}
      >
        <div
          style={{
            ...roleStyle(design.typePair, "display", 56, width),
            color: palette.ink,
            lineHeight: 0.95,
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {eventName || "Untitled"}
        </div>
        <div
          style={{
            ...roleStyle(design.typePair, "caption", 13, width, { upper: true, family: "Space Mono" }),
            color: palette.muted,
          }}
        >
          {`${dateStr || "DATE · TIME"}${venueName ? ` · ${venueName}` : ""}`}
        </div>
        {venueAddress ? (
          <div
            style={{
              ...roleStyle(design.typePair, "caption", 11, width, { family: "Space Mono" }),
              color: palette.muted,
            }}
          >
            {venueAddress}
          </div>
        ) : null}
      </div>

      {logoUrl ? (
        <img
          src={logoUrl}
          width={scale(width, 80)}
          height={scale(width, 80)}
          style={{
            position: "absolute",
            bottom: scale(width, 60),
            right: scale(width, 80),
            objectFit: "contain",
          }}
        />
      ) : null}
    </div>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
