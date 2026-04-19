import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

/**
 * Editorial Serif — NYT T Magazine / New Yorker.
 * Newsprint cream, masthead rule, byline small-caps, a large Playfair
 * title that breathes, photo treated as a framed plate with a short
 * caption below it.
 */
export function MinimalEditorial(props: TemplateProps) {
  const {
    eventName,
    date,
    time,
    venueName,
    venueAddress,
    artistName,
    tagline,
    photoUrl,
    logoUrl,
    accentColor,
    width,
    height,
  } = props;

  const s = (px: number) => scale(width, px);
  const paper = "#f6f1e7";
  const ink = "#141413";
  const quiet = "#6b6558";
  const rule = color(accentColor, "#8a2b2b");

  const margin = Math.round(width * 0.08);
  const photoH = Math.round(height * 0.38);
  const photoW = width - margin * 2;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: paper,
        fontFamily: "Inter",
        padding: `${margin}px ${margin}px ${Math.round(margin * 0.8)}px`,
      }}
    >
      {/* Masthead */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: s(10),
          borderBottom: `${s(1)}px solid ${ink}`,
          paddingBottom: s(14),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: ink,
              fontFamily: "Playfair Display",
              fontStyle: "italic",
              fontSize: s(28),
              display: "flex",
            }}
          >
            the journal
          </div>
          {logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={logoUrl}
              width={s(56)}
              height={s(56)}
              style={{ width: s(56), height: s(56), objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                color: quiet,
                fontFamily: "Inter",
                fontSize: s(18),
                letterSpacing: s(4),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              VOL · {new Date().getFullYear()}
            </div>
          )}
          <div
            style={{
              color: quiet,
              fontFamily: "Inter",
              fontSize: s(18),
              letterSpacing: s(4),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            No. 01
          </div>
        </div>
      </div>

      {/* Kicker */}
      <div
        style={{
          marginTop: s(24),
          color: rule,
          fontFamily: "Inter",
          fontSize: s(20),
          fontWeight: 700,
          letterSpacing: s(8),
          textTransform: "uppercase",
          display: "flex",
        }}
      >
        {tagline || "An Invitation"}
      </div>

      {/* Title */}
      <div
        style={{
          marginTop: s(14),
          color: ink,
          fontFamily: "Playfair Display",
          fontWeight: 700,
          fontSize: s(108),
          lineHeight: 0.95,
          letterSpacing: s(-1),
          maxWidth: photoW,
          display: "flex",
        }}
      >
        {eventName || "An Evening of Small Wonders"}
      </div>

      {/* Byline */}
      {artistName ? (
        <div
          style={{
            marginTop: s(18),
            color: ink,
            fontFamily: "Playfair Display",
            fontStyle: "italic",
            fontSize: s(36),
            display: "flex",
          }}
        >
          Hosted by {artistName}
        </div>
      ) : null}

      {/* Thin red rule */}
      <div
        style={{
          width: s(48),
          height: s(2),
          backgroundColor: rule,
          marginTop: s(28),
          marginBottom: s(20),
          display: "flex",
        }}
      />

      {/* Plate */}
      <div
        style={{
          width: photoW,
          height: photoH,
          backgroundColor: "#e8e1d3",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={photoUrl}
            width={photoW}
            height={photoH}
            style={{ width: photoW, height: photoH, objectFit: "cover" }}
          />
        ) : null}
      </div>

      {/* Plate caption */}
      <div
        style={{
          color: quiet,
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontSize: s(20),
          marginTop: s(10),
          display: "flex",
        }}
      >
        Fig. 1 — {venueName || "the hall"}.
      </div>

      {/* Footer metadata */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: `${s(1)}px solid ${ink}`,
          paddingTop: s(16),
          color: ink,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: s(4) }}>
          <div
            style={{
              fontSize: s(16),
              letterSpacing: s(4),
              textTransform: "uppercase",
              color: quiet,
              display: "flex",
            }}
          >
            Date
          </div>
          <div
            style={{
              fontSize: s(24),
              fontFamily: "Playfair Display",
              fontWeight: 700,
              display: "flex",
            }}
          >
            {formatDate(date) || "To be announced"}
            {time ? `, ${formatTime(time)}` : ""}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: s(4),
          }}
        >
          <div
            style={{
              fontSize: s(16),
              letterSpacing: s(4),
              textTransform: "uppercase",
              color: quiet,
              display: "flex",
            }}
          >
            Location
          </div>
          <div
            style={{
              fontSize: s(24),
              fontFamily: "Playfair Display",
              fontWeight: 700,
              display: "flex",
            }}
          >
            {venueName}
          </div>
          <div
            style={{
              fontSize: s(18),
              fontStyle: "italic",
              color: quiet,
              fontFamily: "Playfair Display",
              display: "flex",
            }}
          >
            {venueAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
