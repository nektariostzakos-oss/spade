import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { isStaff } from "../../../lib/auth";
import { allowAction, clientIp } from "../../../lib/rateLimit";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 4 * 1024 * 1024; // 4MB after client-side resize

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = clientIp(req);
  if (!allowAction(`upload:${ip}`, 60, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many uploads. Try again shortly." },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too big (max ${MAX_BYTES / 1024 / 1024} MB after resize).` },
      { status: 413 }
    );
  }
  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Only jpg, png, webp, avif, gif are allowed." },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 12);
  const filename = `${Date.now().toString(36)}_${hash}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
