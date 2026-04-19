import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

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
  const paper = "#faf7f2";
  const ink = "#1a1a1a";
  const accent = color(accentColor, "#8a2b2b");

  const photoHeight = Math.round(height * 0.48);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: paper,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${s(48)}px ${s(56)}px ${s(24)}px`,
          borderBottom: `${s(1)}px solid ${ink}`,
        }}
      >
        <div
          style={{
            color: ink,
            fontFamily: "Playfair Display",
            fontSize: s(28),
            fontWeight: 700,
            letterSpacing: s(4),
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          The Event
        </div>
        {logoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={logoUrl}
            width={s(80)}
            height={s(80)}
            style={{ width: s(80), height: s(80), objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              color: accent,
              fontFamily: "Inter",
              fontSize: s(22),
              fontWeight: 700,
              letterSpacing: s(4),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Vol. 01
          </div>
        )}
      </div>

      <div style={{ display: "flex", width, height: photoHeight, backgroundColor: "#ddd" }}>
        {photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={photoUrl}
            width={width}
            height={photoHeight}
            style={{ width, height: photoHeight, objectFit: "cover" }}
          />
        ) : null}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: `${s(48)}px ${s(56)}px`,
          gap: s(20),
        }}
      >
        <div
          style={{
            color: accent,
            fontFamily: "Inter",
            fontSize: s(22),
            fontWeight: 700,
            letterSpacing: s(8),
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {tagline || "A Quiet Evening"}
        </div>

        <div
          style={{
            color: ink,
            fontFamily: "Playfair Display",
            fontWeight: 700,
            fontSize: s(96),
            lineHeight: 0.95,
            letterSpacing: s(-1),
            maxWidth: width - s(112),
            display: "flex",
          }}
        >
          {eventName || "An Untitled Gathering"}
        </div>

        {artistName ? (
          <div
            style={{
              color: ink,
              fontFamily: "Playfair Display",
              fontSize: s(38),
              fontStyle: "italic",
              display: "flex",
            }}
          >
            with {artistName}
          </div>
        ) : null}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: ink,
            fontFamily: "Inter",
            borderTop: `${s(1)}px solid ${ink}`,
            paddingTop: s(20),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: s(4) }}>
            <div style={{ fontSize: s(26), fontWeight: 700, display: "flex" }}>
              {formatDate(date)}
            </div>
            {time ? (
              <div style={{ fontSize: s(22), color: "#555", display: "flex" }}>
                Doors {formatTime(time)}
              </div>
            ) : null}
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
            <div style={{ fontSize: s(26), fontWeight: 700, display: "flex" }}>
              {venueName}
            </div>
            <div style={{ fontSize: s(20), color: "#555", display: "flex" }}>
              {venueAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
