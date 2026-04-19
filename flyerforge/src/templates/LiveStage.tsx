import { formatDate, formatTime, scale, type TemplateProps } from "./shared";

export function LiveStage(props: TemplateProps) {
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
  const cream = "#f5f0e8";
  const ink = "#2a2a2a";

  const photoHeight = Math.round(height * 0.6);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: cream,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          width,
          height: photoHeight,
          position: "relative",
          display: "flex",
          backgroundColor: ink,
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={photoUrl}
            width={width}
            height={photoHeight}
            style={{ width, height: photoHeight, objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)",
            display: "flex",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: s(56),
          gap: s(18),
        }}
      >
        <div
          style={{
            color: ink,
            fontFamily: "Inter",
            fontSize: s(22),
            fontWeight: 700,
            letterSpacing: s(8),
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Live on Stage
        </div>

        <div
          style={{
            color: ink,
            fontFamily: "Playfair Display",
            fontWeight: 700,
            fontSize: s(110),
            lineHeight: 1,
            maxWidth: width - s(160),
            textAlign: "center",
            display: "flex",
          }}
        >
          {eventName || "An Evening Of Music"}
        </div>

        {artistName ? (
          <div
            style={{
              color: ink,
              fontFamily: "Playfair Display",
              fontSize: s(40),
              display: "flex",
            }}
          >
            featuring {artistName}
          </div>
        ) : null}

        <div
          style={{
            width: s(60),
            height: s(2),
            backgroundColor: ink,
            marginTop: s(8),
            marginBottom: s(8),
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: s(6),
            color: ink,
            fontFamily: "Inter",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: s(30), fontWeight: 700, display: "flex" }}>
            {formatDate(date)}
            {time ? `  ·  ${formatTime(time)}` : ""}
          </div>
          <div style={{ fontSize: s(26), display: "flex" }}>{venueName}</div>
          <div style={{ fontSize: s(22), color: "#555", display: "flex" }}>
            {venueAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
