import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

/**
 * Noir Cinematic — A24 / Criterion / Saint Laurent.
 * Pre-baked B&W photo full bleed, oxblood hairlines, Playfair Display
 * title at the bottom third, small slug at top, grain overlay.
 */
export function ClubNight(props: TemplateProps) {
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
    grainUrl,
    width,
    height,
  } = props;

  const s = (px: number) => scale(width, px);
  const oxblood = color(accentColor, "#7A1E1E");
  const bone = "#f4efe7";
  const coal = "#0e0d0c";
  const margin = Math.round(width * 0.06);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        position: "relative",
        backgroundColor: coal,
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
            "linear-gradient(180deg, rgba(14,13,12,0.35) 0%, rgba(14,13,12,0.2) 35%, rgba(14,13,12,0.85) 100%)",
          display: "flex",
        }}
      />

      {grainUrl ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${grainUrl})`,
            backgroundRepeat: "repeat",
            opacity: 0.06,
            display: "flex",
          }}
        />
      ) : null}

      {/* Hairline frame */}
      <div
        style={{
          position: "absolute",
          top: margin,
          left: margin,
          right: margin,
          bottom: margin,
          border: `${s(1)}px solid ${bone}`,
          opacity: 0.35,
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: `${margin + s(28)}px ${margin + s(28)}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: s(10) }}>
            <div
              style={{
                color: bone,
                fontFamily: "Inter",
                fontSize: s(20),
                fontWeight: 700,
                letterSpacing: s(8),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              A FILM · A NIGHT
            </div>
            <div
              style={{
                width: s(40),
                height: s(1),
                backgroundColor: oxblood,
                display: "flex",
              }}
            />
          </div>
          {logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={logoUrl}
              width={s(84)}
              height={s(84)}
              style={{
                width: s(84),
                height: s(84),
                objectFit: "contain",
                opacity: 0.85,
              }}
            />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: s(14),
          }}
        >
          {tagline ? (
            <div
              style={{
                color: oxblood,
                fontFamily: "Inter",
                fontSize: s(22),
                fontWeight: 700,
                letterSpacing: s(6),
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {tagline}
            </div>
          ) : null}

          <div
            style={{
              color: bone,
              fontFamily: "Playfair Display",
              fontWeight: 700,
              fontSize: s(150),
              lineHeight: 0.92,
              letterSpacing: s(-2),
              textAlign: "center",
              maxWidth: width - margin * 2 - s(40),
              display: "flex",
            }}
          >
            {eventName || "Last Light"}
          </div>

          {artistName ? (
            <div
              style={{
                color: bone,
                fontFamily: "Playfair Display",
                fontStyle: "italic",
                fontSize: s(34),
                display: "flex",
              }}
            >
              with {artistName}
            </div>
          ) : null}

          <div
            style={{
              width: s(48),
              height: s(1),
              backgroundColor: oxblood,
              marginTop: s(10),
              display: "flex",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: s(6),
          }}
        >
          <div
            style={{
              color: bone,
              fontFamily: "Inter",
              fontSize: s(22),
              fontWeight: 700,
              letterSpacing: s(10),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {formatDate(date) || "COMING SOON"}
            {time ? `  ·  ${formatTime(time)}` : ""}
          </div>
          <div
            style={{
              color: bone,
              opacity: 0.85,
              fontFamily: "Inter",
              fontSize: s(18),
              letterSpacing: s(6),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {venueName}
            {venueAddress ? `  ·  ${venueAddress}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
