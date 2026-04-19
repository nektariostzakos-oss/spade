import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

/**
 * Brutalist Asymmetric — Balenciaga / 032c / Rudnick.
 * Concrete grays, Anton condensed display, an off-center title that hugs
 * the edge, a black info strip sliced across the bottom third.
 */
export function LiveStage(props: TemplateProps) {
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
  const concrete = "#d9d4cb";
  const ink = "#0a0a0a";
  const chalk = "#f4efe7";
  const hot = color(accentColor, "#ff2d16");

  const photoH = Math.round(height * 0.58);
  const stripH = Math.round(height * 0.18);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: concrete,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Photo slab, left-heavy not full width */}
      <div
        style={{
          width,
          height: photoH,
          display: "flex",
          position: "relative",
          backgroundColor: ink,
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={photoUrl}
            width={width}
            height={photoH}
            style={{ width, height: photoH, objectFit: "cover" }}
          />
        ) : null}

        {/* Top tag */}
        <div
          style={{
            position: "absolute",
            top: s(36),
            left: s(36),
            display: "flex",
            alignItems: "center",
            gap: s(12),
          }}
        >
          <div
            style={{
              backgroundColor: hot,
              color: ink,
              padding: `${s(8)}px ${s(14)}px`,
              fontFamily: "Inter",
              fontSize: s(20),
              fontWeight: 700,
              letterSpacing: s(4),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {tagline || "No.042 / Live"}
          </div>
          <div
            style={{
              color: chalk,
              fontFamily: "Inter",
              fontSize: s(20),
              fontWeight: 700,
              letterSpacing: s(4),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {new Date().getFullYear()}
          </div>
        </div>

        {/* Corner index */}
        <div
          style={{
            position: "absolute",
            top: s(36),
            right: s(36),
            color: chalk,
            fontFamily: "Inter",
            fontSize: s(20),
            fontWeight: 700,
            letterSpacing: s(4),
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          SIDE A
        </div>

        {/* Giant title bleeding off bottom */}
        <div
          style={{
            position: "absolute",
            left: s(-10),
            right: s(-10),
            bottom: -s(42),
            display: "flex",
          }}
        >
          <div
            style={{
              color: chalk,
              fontFamily: "Anton",
              fontSize: s(260),
              lineHeight: 0.85,
              letterSpacing: s(-4),
              textTransform: "uppercase",
              maxWidth: width + s(20),
              paddingLeft: s(36),
              display: "flex",
            }}
          >
            {eventName || "Stage / Stage"}
          </div>
        </div>
      </div>

      {/* Middle seam — tiny red bar */}
      <div
        style={{
          width,
          height: s(6),
          backgroundColor: hot,
          display: "flex",
        }}
      />

      {/* Info slab, asymmetric columns */}
      <div
        style={{
          flex: 1,
          width,
          display: "flex",
          flexDirection: "row",
          backgroundColor: concrete,
          padding: `${s(32)}px ${s(36)}px ${s(28)}px`,
          gap: s(32),
        }}
      >
        <div
          style={{
            width: Math.round(width * 0.62),
            display: "flex",
            flexDirection: "column",
            gap: s(10),
          }}
        >
          <div
            style={{
              color: ink,
              fontFamily: "Inter",
              fontSize: s(18),
              fontWeight: 700,
              letterSpacing: s(4),
              textTransform: "uppercase",
              opacity: 0.7,
              display: "flex",
            }}
          >
            DATE / DOORS
          </div>
          <div
            style={{
              color: ink,
              fontFamily: "Anton",
              fontSize: s(64),
              lineHeight: 0.95,
              letterSpacing: s(0),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {formatDate(date) || "TBD"}
            {time ? ` · ${formatTime(time)}` : ""}
          </div>
          <div
            style={{
              color: ink,
              fontFamily: "Inter",
              fontSize: s(22),
              fontWeight: 400,
              letterSpacing: s(2),
              display: "flex",
            }}
          >
            {venueName}
            {venueAddress ? ` — ${venueAddress}` : ""}
          </div>
        </div>

        <div
          style={{
            width: Math.round(width * 0.3),
            display: "flex",
            flexDirection: "column",
            gap: s(10),
            borderLeft: `${s(1)}px solid ${ink}`,
            paddingLeft: s(24),
          }}
        >
          <div
            style={{
              color: ink,
              fontFamily: "Inter",
              fontSize: s(18),
              fontWeight: 700,
              letterSpacing: s(4),
              textTransform: "uppercase",
              opacity: 0.7,
              display: "flex",
            }}
          >
            FEATURING
          </div>
          <div
            style={{
              color: ink,
              fontFamily: "Anton",
              fontSize: s(46),
              lineHeight: 1,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {artistName || "GUEST TBA"}
          </div>
          {logoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={logoUrl}
              width={s(70)}
              height={s(70)}
              style={{
                width: s(70),
                height: s(70),
                objectFit: "contain",
                marginTop: s(6),
              }}
            />
          ) : null}
        </div>
      </div>

      {/* Bottom black strip */}
      <div
        style={{
          width,
          height: stripH,
          backgroundColor: ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${s(36)}px`,
        }}
      >
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
          LIVE — NO REPEATS
        </div>
        <div
          style={{
            color: hot,
            fontFamily: "Inter",
            fontSize: s(20),
            fontWeight: 700,
            letterSpacing: s(6),
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          ADMIT ONE
        </div>
      </div>
    </div>
  );
}
