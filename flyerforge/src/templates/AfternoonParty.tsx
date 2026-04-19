import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

/**
 * Memphis Refined — Paula Scher / Pentagram / 1980s Memphis.
 * Flat cream ground, terracotta accent, one stacked-type block with a
 * circle behind the title, small geometric punctuation, circular photo
 * at the foot.
 */
export function AfternoonParty(props: TemplateProps) {
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
  const cream = "#f4e6c3";
  const ink = "#1d1b1a";
  const tomato = color(accentColor, "#e8502a");
  const peach = "#f4b88a";

  const margin = Math.round(width * 0.06);
  const photoSize = Math.round(Math.min(width, height) * 0.34);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        backgroundColor: cream,
        fontFamily: "Inter",
        overflow: "hidden",
      }}
    >
      {/* Background circle */}
      <div
        style={{
          position: "absolute",
          top: height * 0.1,
          left: -width * 0.15,
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width,
          backgroundColor: tomato,
          display: "flex",
        }}
      />

      {/* Small peach square */}
      <div
        style={{
          position: "absolute",
          top: margin + s(20),
          right: margin + s(20),
          width: s(90),
          height: s(90),
          backgroundColor: peach,
          display: "flex",
        }}
      />

      {/* Tiny ink dot */}
      <div
        style={{
          position: "absolute",
          top: margin + s(30),
          right: margin + s(130),
          width: s(30),
          height: s(30),
          borderRadius: s(30),
          backgroundColor: ink,
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: margin,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top row */}
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
              fontFamily: "Inter",
              fontSize: s(22),
              fontWeight: 700,
              letterSpacing: s(6),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {tagline || "Afternoon / Party"}
          </div>
          {logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={logoUrl}
              width={s(80)}
              height={s(80)}
              style={{
                width: s(80),
                height: s(80),
                objectFit: "contain",
                opacity: 0.9,
              }}
            />
          ) : null}
        </div>

        {/* Middle block — stacked type */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: s(-6),
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              color: cream,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: s(150),
              lineHeight: 0.88,
              letterSpacing: s(-4),
              maxWidth: width - margin * 2,
              display: "flex",
            }}
          >
            {(eventName || "Sunday Bloom").split(" ")[0]?.toUpperCase()}
          </div>
          <div
            style={{
              color: ink,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: s(150),
              lineHeight: 0.88,
              letterSpacing: s(-4),
              maxWidth: width - margin * 2,
              display: "flex",
            }}
          >
            {(eventName || "Sunday Bloom").split(" ").slice(1).join(" ").toUpperCase() ||
              "PARTY"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: s(14), marginTop: s(18) }}>
            <div
              style={{
                width: s(40),
                height: s(40),
                borderRadius: s(40),
                border: `${s(4)}px solid ${ink}`,
                display: "flex",
              }}
            />
            <div
              style={{
                color: ink,
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: s(28),
                letterSpacing: s(4),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {artistName ? `w/ ${artistName}` : "all-day lineup"}
            </div>
          </div>
        </div>

        {/* Bottom row — photo + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: s(28),
          }}
        >
          <div
            style={{
              width: photoSize,
              height: photoSize,
              borderRadius: photoSize,
              overflow: "hidden",
              backgroundColor: ink,
              border: `${s(6)}px solid ${ink}`,
              display: "flex",
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img
                src={photoUrl}
                width={photoSize}
                height={photoSize}
                style={{ width: photoSize, height: photoSize, objectFit: "cover" }}
              />
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
              gap: s(6),
              color: ink,
              fontFamily: "Inter",
            }}
          >
            <div
              style={{
                fontSize: s(30),
                fontWeight: 700,
                letterSpacing: s(2),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {formatDate(date) || "ANY SUNDAY"}
            </div>
            {time ? (
              <div
                style={{
                  fontSize: s(26),
                  fontWeight: 400,
                  display: "flex",
                }}
              >
                from {formatTime(time)}
              </div>
            ) : null}
            <div
              style={{
                fontSize: s(24),
                fontWeight: 700,
                display: "flex",
              }}
            >
              {venueName}
            </div>
            <div
              style={{
                fontSize: s(20),
                opacity: 0.7,
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
