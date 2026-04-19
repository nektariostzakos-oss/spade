import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

export function AfternoonParty(props: TemplateProps) {
  const {
    eventName,
    date,
    time,
    venueName,
    venueAddress,
    artistName,
    photoUrl,
    logoUrl,
    accentColor,
    width,
    height,
  } = props;

  const s = (px: number) => scale(width, px);
  const ink = color(accentColor, "#3a1f1a");

  const photoSize = Math.round(Math.min(width, height) * 0.55);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage:
          "linear-gradient(135deg, #ffd1a3 0%, #ffb199 45%, #ff6f61 100%)",
        padding: s(72),
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: s(8),
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={logoUrl}
            width={s(100)}
            height={s(100)}
            style={{ width: s(100), height: s(100), objectFit: "contain" }}
          />
        ) : null}
        <div
          style={{
            color: ink,
            fontFamily: "Inter",
            fontSize: s(22),
            fontWeight: 700,
            letterSpacing: s(10),
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Afternoon Party
        </div>
        <div
          style={{
            width: s(50),
            height: s(4),
            backgroundColor: ink,
            borderRadius: s(4),
          }}
        />
      </div>

      <div
        style={{
          marginTop: s(40),
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: photoSize,
            height: photoSize,
            borderRadius: photoSize,
            overflow: "hidden",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 40px rgba(58,31,26,0.25)",
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
      </div>

      <div
        style={{
          marginTop: s(40),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: s(14),
        }}
      >
        <div
          style={{
            color: ink,
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: s(96),
            lineHeight: 0.95,
            letterSpacing: s(-2),
            maxWidth: width - s(180),
            textAlign: "center",
            display: "flex",
          }}
        >
          {eventName || "Sunshine Session"}
        </div>

        {artistName ? (
          <div
            style={{
              color: ink,
              fontFamily: "Inter",
              fontSize: s(32),
              fontWeight: 400,
              display: "flex",
            }}
          >
            with {artistName}
          </div>
        ) : null}
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: s(6),
          color: ink,
          fontFamily: "Inter",
        }}
      >
        <div style={{ fontSize: s(32), fontWeight: 700, display: "flex" }}>
          {formatDate(date)}
          {time ? `  ·  ${formatTime(time)}` : ""}
        </div>
        <div style={{ fontSize: s(26), display: "flex" }}>{venueName}</div>
        <div style={{ fontSize: s(22), opacity: 0.8, display: "flex" }}>
          {venueAddress}
        </div>
      </div>
    </div>
  );
}
