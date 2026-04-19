import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

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
  const accent = color(accentColor, "#ff3b6b");
  const ink = "#0e0030";

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        backgroundImage:
          "linear-gradient(135deg, #ff3b6b 0%, #ff8a3d 45%, #ffd23d 100%)",
        fontFamily: "Inter",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -s(120),
          right: -s(120),
          width: s(480),
          height: s(480),
          borderRadius: s(480),
          backgroundColor: accent,
          opacity: 0.35,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -s(160),
          left: -s(100),
          width: s(500),
          height: s(500),
          borderRadius: s(500),
          backgroundColor: "#4a148c",
          opacity: 0.25,
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: ink,
              color: "#ffd23d",
              padding: `${s(12)}px ${s(20)}px`,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: s(26),
              letterSpacing: s(4),
              textTransform: "uppercase",
            }}
          >
            Festival
          </div>
          {logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={logoUrl}
              width={s(110)}
              height={s(110)}
              style={{ width: s(110), height: s(110), objectFit: "contain" }}
            />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: s(16),
          }}
        >
          {photoUrl ? (
            <div
              style={{
                display: "flex",
                width: s(300),
                height: s(300),
                borderRadius: s(300),
                overflow: "hidden",
                border: `${s(8)}px solid ${ink}`,
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img
                src={photoUrl}
                width={s(300)}
                height={s(300)}
                style={{ width: s(300), height: s(300), objectFit: "cover" }}
              />
            </div>
          ) : null}

          <div
            style={{
              color: ink,
              fontFamily: "Bebas Neue",
              fontSize: s(180),
              lineHeight: 0.9,
              letterSpacing: s(2),
              textTransform: "uppercase",
              textAlign: "center",
              maxWidth: width - s(120),
              display: "flex",
            }}
          >
            {eventName || "Summer Fest"}
          </div>

          {tagline ? (
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
              {tagline}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: s(6),
            color: ink,
            fontFamily: "Inter",
          }}
        >
          <div style={{ fontSize: s(36), fontWeight: 700, display: "flex" }}>
            {formatDate(date)}
            {time ? `  ·  ${formatTime(time)}` : ""}
          </div>
          <div style={{ fontSize: s(28), fontWeight: 700, display: "flex" }}>
            {venueName}
          </div>
          <div style={{ fontSize: s(22), opacity: 0.75, display: "flex" }}>
            {venueAddress}
          </div>
          {artistName ? (
            <div
              style={{
                marginTop: s(8),
                fontSize: s(24),
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: s(3),
                display: "flex",
              }}
            >
              Headlining · {artistName}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
