import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

/**
 * Duotone Photographic — Peter Saville / Factory Records / New Order.
 * The photo is pre-baked duotone upstream. Composition is sparse:
 * giant ink-plate title stacked vertical, a thin rule, corner IDs, a
 * single accent bar. No gradients, no confetti.
 */
export function FestivalBurst(props: TemplateProps) {
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
  const ink = "#0b0b0b";
  const chalk = "#f6f1e7";
  const accent = color(accentColor, "#ff3b6b");

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        backgroundColor: ink,
        fontFamily: "Inter",
        overflow: "hidden",
      }}
    >
      {photoUrl ? (
        // eslint-disable-next-line jsx-a11y/alt-text
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

      {/* Soft vignette to anchor type */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: s(64),
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: index + logo */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: s(8) }}>
            <div
              style={{
                color: chalk,
                fontFamily: "Inter",
                fontSize: s(20),
                fontWeight: 700,
                letterSpacing: s(6),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              FAC · {new Date().getFullYear()}
            </div>
            <div
              style={{
                width: s(40),
                height: s(2),
                backgroundColor: accent,
                display: "flex",
              }}
            />
          </div>
          {logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={logoUrl}
              width={s(80)}
              height={s(80)}
              style={{ width: s(80), height: s(80), objectFit: "contain", opacity: 0.9 }}
            />
          ) : (
            <div
              style={{
                color: chalk,
                fontFamily: "Inter",
                fontSize: s(20),
                fontWeight: 700,
                letterSpacing: s(6),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              EDITION / 01
            </div>
          )}
        </div>

        {/* Title plate */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: s(18),
          }}
        >
          {tagline ? (
            <div
              style={{
                backgroundColor: accent,
                color: ink,
                padding: `${s(6)}px ${s(14)}px`,
                fontFamily: "Inter",
                fontSize: s(22),
                fontWeight: 700,
                letterSpacing: s(4),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {tagline}
            </div>
          ) : null}

          <div
            style={{
              color: chalk,
              fontFamily: "Anton",
              fontSize: s(230),
              lineHeight: 0.86,
              letterSpacing: s(-4),
              textTransform: "uppercase",
              maxWidth: width - s(128),
              display: "flex",
            }}
          >
            {eventName || "Unknown Pleasures"}
          </div>

          {artistName ? (
            <div
              style={{
                color: chalk,
                fontFamily: "Inter",
                fontSize: s(26),
                fontWeight: 400,
                letterSpacing: s(4),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              ft. {artistName}
            </div>
          ) : null}
        </div>

        {/* Bottom row: meta, split */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: s(32),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: s(4) }}>
            <div
              style={{
                color: accent,
                fontFamily: "Inter",
                fontSize: s(18),
                fontWeight: 700,
                letterSpacing: s(6),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Scheduled
            </div>
            <div
              style={{
                color: chalk,
                fontFamily: "Inter",
                fontSize: s(28),
                fontWeight: 700,
                letterSpacing: s(3),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {formatDate(date) || "TBA"}
              {time ? ` · ${formatTime(time)}` : ""}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: s(4),
              textAlign: "right",
            }}
          >
            <div
              style={{
                color: accent,
                fontFamily: "Inter",
                fontSize: s(18),
                fontWeight: 700,
                letterSpacing: s(6),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Venue
            </div>
            <div
              style={{
                color: chalk,
                fontFamily: "Inter",
                fontSize: s(28),
                fontWeight: 700,
                letterSpacing: s(3),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {venueName}
            </div>
            <div
              style={{
                color: chalk,
                opacity: 0.75,
                fontFamily: "Inter",
                fontSize: s(20),
                letterSpacing: s(3),
                display: "flex",
              }}
            >
              {venueAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
