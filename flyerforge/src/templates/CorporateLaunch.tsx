import { color, formatDate, formatTime, scale, type TemplateProps } from "./shared";

/**
 * Swiss Grid — Müller-Brockmann / Vignelli.
 * 12-col conceptual grid, one red accent block, clean typographic
 * hierarchy, photo locked to the right half with a hairline border,
 * generous white.
 */
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
  const paper = "#fbfaf7";
  const ink = "#0a0a0a";
  const quiet = "#575350";
  const red = color(accentColor, "#d7281d");

  const margin = Math.round(width * 0.08);
  const col = Math.round((width - margin * 2) / 12);
  const photoW = col * 7;
  const photoH = Math.round(height * 0.42);

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: paper,
        fontFamily: "Inter",
        padding: margin,
        position: "relative",
      }}
    >
      {/* Top rule */}
      <div
        style={{
          width: width - margin * 2,
          height: s(3),
          backgroundColor: ink,
          display: "flex",
        }}
      />

      {/* Masthead */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: s(14),
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
            display: "flex",
          }}
        >
          {tagline || "Briefing / 2026"}
        </div>
        {logoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={logoUrl}
            width={s(60)}
            height={s(60)}
            style={{ width: s(60), height: s(60), objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              color: quiet,
              fontFamily: "Inter",
              fontSize: s(18),
              fontWeight: 400,
              letterSpacing: s(4),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            ED · 01 / 12
          </div>
        )}
      </div>

      {/* Main grid row: number + title */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: s(60),
          gap: s(24),
        }}
      >
        {/* Number column (2 cols) */}
        <div
          style={{
            width: col * 2,
            display: "flex",
            flexDirection: "column",
            gap: s(8),
          }}
        >
          <div
            style={{
              color: red,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: s(130),
              lineHeight: 0.9,
              letterSpacing: s(-2),
              display: "flex",
            }}
          >
            01
          </div>
          <div
            style={{
              color: quiet,
              fontFamily: "Inter",
              fontSize: s(16),
              fontWeight: 700,
              letterSpacing: s(4),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Section
          </div>
        </div>

        {/* Title column (10 cols) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: s(12),
          }}
        >
          <div
            style={{
              color: ink,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: s(110),
              lineHeight: 0.92,
              letterSpacing: s(-2),
              display: "flex",
            }}
          >
            {eventName || "Announcing Atlas"}
          </div>
          {artistName ? (
            <div
              style={{
                color: quiet,
                fontFamily: "Inter",
                fontSize: s(26),
                fontWeight: 400,
                letterSpacing: s(2),
                display: "flex",
              }}
            >
              Keynote — {artistName}
            </div>
          ) : null}
        </div>
      </div>

      {/* Photo plate row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: s(40),
          gap: s(24),
          alignItems: "flex-start",
        }}
      >
        {/* Left: red accent block (3 cols) */}
        <div
          style={{
            width: col * 3,
            height: photoH,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: s(20),
            backgroundColor: red,
            color: paper,
          }}
        >
          <div
            style={{
              fontFamily: "Inter",
              fontSize: s(16),
              fontWeight: 700,
              letterSpacing: s(4),
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Notice
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: s(28),
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: s(-1),
              display: "flex",
            }}
          >
            One event. One hour. No recording.
          </div>
        </div>

        {/* Right: photo (7 cols) */}
        <div
          style={{
            width: photoW,
            height: photoH,
            display: "flex",
            backgroundColor: "#e5e2dc",
            border: `${s(1)}px solid ${ink}`,
            overflow: "hidden",
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={photoUrl}
              width={photoW}
              height={photoH}
              style={{ width: photoW, height: photoH, objectFit: "cover" }}
            />
          ) : null}
        </div>
      </div>

      {/* Footer data row */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "row",
          gap: s(24),
          borderTop: `${s(1)}px solid ${ink}`,
          paddingTop: s(16),
        }}
      >
        <DataCell label="Date" value={formatDate(date) || "TBA"} width={col * 4} ink={ink} quiet={quiet} s={s} />
        <DataCell label="Time" value={time ? formatTime(time) : "—"} width={col * 2} ink={ink} quiet={quiet} s={s} />
        <DataCell label="Venue" value={venueName} width={col * 3} ink={ink} quiet={quiet} s={s} />
        <DataCell label="Address" value={venueAddress} width={col * 3} ink={ink} quiet={quiet} s={s} />
      </div>
    </div>
  );
}

function DataCell({
  label,
  value,
  width,
  ink,
  quiet,
  s,
}: {
  label: string;
  value: string;
  width: number;
  ink: string;
  quiet: string;
  s: (n: number) => number;
}) {
  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        gap: s(4),
      }}
    >
      <div
        style={{
          color: quiet,
          fontFamily: "Inter",
          fontSize: s(14),
          fontWeight: 700,
          letterSpacing: s(4),
          textTransform: "uppercase",
          display: "flex",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: ink,
          fontFamily: "Inter",
          fontSize: s(22),
          fontWeight: 700,
          letterSpacing: s(-0.5),
          display: "flex",
        }}
      >
        {value}
      </div>
    </div>
  );
}
