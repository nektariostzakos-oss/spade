import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

export function CorporateLaunch(props: TemplateProps) {
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
  const accent = color(accentColor, "#2b5cff");
  const ink = "#0a0f1c";
  const paper = "#ffffff";
  const muted = "#5a6478";

  const leftWidth = Math.round(width * 0.55);
  const rightWidth = width - leftWidth;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "row",
        backgroundColor: paper,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width: leftWidth,
          height,
          display: "flex",
          flexDirection: "column",
          padding: s(64),
          gap: s(20),
          backgroundColor: paper,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: s(12),
          }}
        >
          {logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={logoUrl}
              width={s(72)}
              height={s(72)}
              style={{ width: s(72), height: s(72), objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: s(72),
                height: s(72),
                backgroundColor: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: paper,
                fontFamily: "Inter",
                fontWeight: 700,
                fontSize: s(32),
              }}
            >
              ●
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: s(40),
            color: accent,
            fontFamily: "Inter",
            fontSize: s(22),
            fontWeight: 700,
            letterSpacing: s(6),
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {tagline || "Product Launch · 2026"}
        </div>

        <div
          style={{
            color: ink,
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: s(96),
            lineHeight: 0.95,
            letterSpacing: s(-2),
            maxWidth: leftWidth - s(80),
            display: "flex",
          }}
        >
          {eventName || "Introducing Atlas"}
        </div>

        {artistName ? (
          <div
            style={{
              color: muted,
              fontFamily: "Inter",
              fontSize: s(28),
              display: "flex",
            }}
          >
            Keynote · {artistName}
          </div>
        ) : null}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: s(8),
          }}
        >
          <div
            style={{
              width: s(48),
              height: s(4),
              backgroundColor: accent,
              display: "flex",
            }}
          />
          <div
            style={{
              color: ink,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: s(28),
              display: "flex",
            }}
          >
            {formatDate(date)}
            {time ? `  ·  ${formatTime(time)}` : ""}
          </div>
          <div style={{ color: ink, fontSize: s(24), display: "flex" }}>
            {venueName}
          </div>
          <div style={{ color: muted, fontSize: s(20), display: "flex" }}>
            {venueAddress}
          </div>
        </div>
      </div>

      <div
        style={{
          width: rightWidth,
          height,
          display: "flex",
          position: "relative",
          backgroundColor: accent,
          overflow: "hidden",
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={photoUrl}
            width={rightWidth}
            height={height}
            style={{
              width: rightWidth,
              height,
              objectFit: "cover",
              opacity: 0.85,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(0,0,0,0) 50%, ${accent} 100%)`,
            opacity: 0.5,
            display: "flex",
          }}
        />
      </div>
    </div>
  );
}
