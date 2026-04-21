import { promises as fs } from "fs";
import path from "path";
import { BARBERS } from "./services";

const FILE = path.join(process.cwd(), "data", "staff.json");

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  specialties: string[];
  enabled: boolean;
  workDays: number[];
  startTime: string;
  endTime: string;
  order: number;
};

async function readAll(): Promise<StaffMember[] | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf-8"));
    return Array.isArray(parsed) ? (parsed as StaffMember[]) : null;
  } catch {
    return null;
  }
}
async function writeAll(items: StaffMember[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function getActiveStaff() {
  const custom = await readAll();
  if (custom && custom.length > 0) {
    return custom
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ id: s.id, name: s.name, role: s.role }));
  }
  return BARBERS;
}

export async function listAdminStaff(): Promise<StaffMember[]> {
  const custom = await readAll();
  if (custom) return custom.sort((a, b) => a.order - b.order);
  return BARBERS.filter((b) => b.id !== "any").map((b, i) => ({
    id: b.id,
    name: b.name,
    role: b.role,
    bio: "",
    photo: "",
    specialties: [],
    enabled: true,
    workDays: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "21:00",
    order: i,
  }));
}

export async function upsertStaff(item: StaffMember): Promise<StaffMember> {
  const all = await listAdminStaff();
  const idx = all.findIndex((s) => s.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  await writeAll(all);
  return item;
}

export async function deleteStaff(id: string): Promise<boolean> {
  const all = await listAdminStaff();
  const next = all.filter((s) => s.id !== id);
  await writeAll(next);
  return true;
}
