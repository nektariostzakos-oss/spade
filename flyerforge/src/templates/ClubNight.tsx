import { formatDate, formatTime, scale, type TemplateProps } from "./shared";

export function ClubNight(props: TemplateProps) {
  const {
    eventName,
    date,
    time,
    venueName,
    venueAddress,
    artistName,
    photoUrl,
    width,
    height,
  } = props;

  const s = (px: number) => scale(width, px);
  const gold = "#c4a96a";

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        backgroundColor: "#0a0a0a",
        fontFamily: "Inter",
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.75) 55%, rgba(10,10,10,0.95) 100%)",
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
        <div style={{ display: "flex", flexDirection: "column", gap: s(8) }}>
          <div
            style={{
              color: gold,
              fontSize: s(28),
              letterSpacing: s(6),
              fontFamily: "Inter",
              fontWeight: 700,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Presents
          </div>
          <div style={{ width: s(80), height: s(3), backgroundColor: gold }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: s(16) }}>
          <div
            style={{
              color: gold,
              fontFamily: "Bebas Neue",
              fontSize: s(160),
              lineHeight: 0.95,
              letterSpacing: s(2),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {eventName || "Untitled Night"}
          </div>
          {artistName ? (
            <div
              style={{
                color: "#ffffff",
                fontFamily: "Inter",
                fontSize: s(38),
                fontWeight: 400,
                letterSpacing: s(2),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              with {artistName}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: s(10),
            color: "#ffffff",
            fontFamily: "Inter",
          }}
        >
          <div
            style={{
              color: gold,
              fontSize: s(36),
              fontWeight: 700,
              letterSpacing: s(3),
              display: "flex",
            }}
          >
            {formatDate(date)}
            {time ? `  ·  ${formatTime(time)}` : ""}
          </div>
          <div style={{ fontSize: s(30), fontWeight: 700, display: "flex" }}>
            {venueName}
          </div>
          <div style={{ fontSize: s(24), color: "#cfcfcf", display: "flex" }}>
            {venueAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
