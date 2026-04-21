import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const SECRET_FILE = path.join(process.cwd(), "data", "secret.json");

export type Role = "admin" | "barber";

export type User = {
  id: string;
  email: string;
  role: Role;
  /** When role is "barber", this links to a barber slug from services.ts (e.g. "andreas"). */
  barberId?: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

/* === Password hashing (PBKDF2 with random salt) === */

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto
    .pbkdf2Sync(plain, salt, 100_000, 32, "sha256")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

/* === Signed-session secret (auto-generated on first run) === */

export async function getSessionSecret(): Promise<string> {
  try {
    const raw = await fs.readFile(SECRET_FILE, "utf-8");
    const { secret } = JSON.parse(raw);
    if (typeof secret === "string" && secret.length >= 32) return secret;
  } catch {}
  const secret = crypto.randomBytes(48).toString("hex");
  await fs.mkdir(path.dirname(SECRET_FILE), { recursive: true });
  await fs.writeFile(SECRET_FILE, JSON.stringify({ secret }, null, 2), "utf-8");
  return secret;
}

export async function signSession(userId: string): Promise<string> {
  const secret = await getSessionSecret();
  const sig = crypto.createHmac("sha256", secret).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

export async function verifySession(token: string): Promise<string | null> {
  if (!token || typeof token !== "string") return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const secret = await getSessionSecret();
  const expect = crypto.createHmac("sha256", secret).update(userId).digest("hex");
  try {
    if (
      sig.length === expect.length &&
      crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expect, "hex"))
    ) {
      return userId;
    }
  } catch {}
  return null;
}

/* === Users store === */

async function readAll(): Promise<User[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

async function writeAll(list: User[]): Promise<void> {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function ensureSeedAdmin(): Promise<void> {
  const all = await readAll();
  if (all.length > 0) return;
  const seed: User = {
    id: `u_${Date.now().toString(36)}`,
    email: "admin@spade.gr",
    role: "admin",
    passwordHash: hashPassword("spade2026"),
    createdAt: new Date().toISOString(),
  };
  await writeAll([seed]);
}

export async function listUsers(): Promise<PublicUser[]> {
  await ensureSeedAdmin();
  const all = await readAll();
  return all.map(({ passwordHash, ...rest }) => rest);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await ensureSeedAdmin();
  const all = await readAll();
  return all.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  await ensureSeedAdmin();
  const all = await readAll();
  return all.find((u) => u.id === id) ?? null;
}

export async function createUser(input: {
  email: string;
  role: Role;
  password: string;
  barberId?: string;
}): Promise<PublicUser> {
  const all = await readAll();
  if (all.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("A user with that email already exists.");
  }
  const u: User = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    email: input.email.toLowerCase(),
    role: input.role,
    barberId: input.role === "barber" ? input.barberId : undefined,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  all.push(u);
  await writeAll(all);
  const { passwordHash, ...pub } = u;
  return pub;
}

export async function updatePassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const all = await readAll();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  all[idx].passwordHash = hashPassword(newPassword);
  await writeAll(all);
  return true;
}

export async function deleteUser(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((u) => u.id !== id);
  if (next.length === all.length) return false;
  // Never let the last admin be deleted.
  if (!next.some((u) => u.role === "admin")) return false;
  await writeAll(next);
  return true;
}
