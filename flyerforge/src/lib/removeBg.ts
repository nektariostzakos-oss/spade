export type RemoveBgResult = {
  photoBase64: string;
  ok: boolean;
  warning?: string;
};

/** Strips the `data:image/...;base64,` prefix. */
function stripDataUrl(input: string): { mime: string; b64: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(input);
  if (match) return { mime: match[1], b64: match[2] };
  return { mime: "image/png", b64: input };
}

export async function removeBackground(
  photoDataUrl: string,
): Promise<RemoveBgResult> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return {
      photoBase64: photoDataUrl,
      ok: false,
      warning: "REMOVE_BG_API_KEY not set; using original photo.",
    };
  }

  const { b64 } = stripDataUrl(photoDataUrl);

  try {
    const form = new FormData();
    form.append("image_file_b64", b64);
    form.append("size", "auto");
    form.append("format", "png");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        photoBase64: photoDataUrl,
        ok: false,
        warning: `Remove.bg returned ${res.status}; used original photo. ${text.slice(0, 200)}`,
      };
    }

    const arrayBuf = await res.arrayBuffer();
    const outB64 = Buffer.from(arrayBuf).toString("base64");
    return {
      photoBase64: `data:image/png;base64,${outB64}`,
      ok: true,
    };
  } catch (e) {
    return {
      photoBase64: photoDataUrl,
      ok: false,
      warning:
        e instanceof Error
          ? `Remove.bg error: ${e.message}. Used original photo.`
          : "Remove.bg error. Used original photo.",
    };
  }
}
