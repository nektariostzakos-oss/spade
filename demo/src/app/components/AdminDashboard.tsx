"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Booking, BookingStatus } from "../../lib/bookings";
import BulkEmail from "./BulkEmail";
import SettingsPanel from "./SettingsPanel";
import UsersPanel from "./UsersPanel";
import ProductsPanel from "./ProductsPanel";
import OrdersPanel from "./OrdersPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import ClientsPanel from "./ClientsPanel";
import ReviewsPanel from "./ReviewsPanel";
import WaitlistPanel from "./WaitlistPanel";
import BookingsCalendar from "./BookingsCalendar";
import SettingsHub from "./SettingsHub";

type Me = {
  id: string;
  email: string;
  role: "admin" | "barber";
  barberId?: string;
};

const STATUSES: { id: "all" | BookingStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const statusStyles: Record<BookingStatus, string> = {
  pending: "border-amber-400/40 bg-amber-500/10 text-amber-300",
  confirmed: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  completed: "border-white/20 bg-white/5 text-white/60",
  cancelled: "border-red-400/40 bg-red-500/10 text-red-300",
};

export default function AdminDashboard({
  initial,
  smtpReady = false,
  onboarded = true,
  me,
}: {
  initial: Booking[];
  smtpReady?: boolean;
  onboarded?: boolean;
  me: Me;
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initial);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [day, setDay] = useState<"today" | "upcoming" | "all">("upcoming");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [tab, setTab] = useState<
    | "bookings" | "waitlist" | "orders" | "products" | "clients"
    | "reviews" | "analytics" | "email" | "settings"
  >("bookings");
  const isAdmin = me.role === "admin";
  void onboarded;

  const filtered = useMemo(() => {
    const today = todayStr();
    return bookings
      .filter((b) => (isAdmin ? true : b.barberId === me.barberId))
      .filter((b) => (filter === "all" ? true : b.status === filter))
      .filter((b) => {
        if (day === "today") return b.date === today;
        if (day === "upcoming") return b.date >= today;
        return true;
      })
      .filter((b) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.phone.includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.barberName.toLowerCase().includes(q) ||
          b.id.includes(q)
        );
      });
  }, [bookings, filter, day, query]);

  const stats = useMemo(() => {
    const today = todayStr();
    const todays = bookings.filter((b) => b.date === today);
    const upcoming = bookings.filter(
      (b) => b.date >= today && b.status !== "cancelled"
    );
    const revenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.price, 0);
    return {
      todayCount: todays.length,
      upcomingCount: upcoming.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      revenue,
    };
  }, [bookings]);

  async function update(id: string, status: BookingStatus) {
    setBusy(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const d = await res.json();
      setBookings((bs) => bs.map((b) => (b.id === id ? d.booking : b)));
    }
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this booking permanently?")) return;
    setBusy(id);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) setBookings((bs) => bs.filter((b) => b.id !== id));
    setBusy(null);
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0806] text-white">
      <header className="border-b border-white/10 bg-white/[0.02] px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a961] sm:text-xs">
              Oakline · Admin
            </p>
            <h1 className="mt-0.5 font-serif text-xl font-semibold sm:mt-1 sm:text-2xl">
              Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isAdmin && (
              <button
                onClick={async () => {
                  const r = await fetch("/api/cron/reminders");
                  const d = await r.json();
                  alert(
                    `Checked ${d.checked} booking(s), ${d.sent} reminder(s) sent.`
                  );
                }}
                className="rounded-full border border-[#c9a961]/40 bg-[#c9a961]/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-[#c9a961] transition-colors hover:bg-[#c9a961]/20 sm:px-4 sm:py-2 sm:text-xs"
              >
                <span className="hidden sm:inline">Run reminders</span>
                <span className="sm:hidden">Reminders</span>
              </button>
            )}
            <a
              href="/"
              className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10 sm:px-4 sm:py-2 sm:text-xs"
            >
              <span className="hidden sm:inline">View site</span>
              <span className="sm:hidden">Site</span>
            </a>
            <button
              onClick={logout}
              className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10 sm:px-4 sm:py-2 sm:text-xs"
            >
              <span className="hidden sm:inline">Sign out</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] p-1 backdrop-blur sm:inline-flex sm:whitespace-normal">
          {(
            isAdmin
              ? [
                  ["bookings", "Bookings"],
                  ["waitlist", "Waitlist"],
                  ["orders", "Orders"],
                  ["products", "Products"],
                  ["clients", "Clients"],
                  ["reviews", "Reviews"],
                  ["email", "Email"],
                  ["analytics", "Analytics"],
                  ["settings", "Settings"],
                ]
              : [["bookings", "Bookings"], ["settings", "Settings"]]
          ).map((entry) => {
            const id = entry[0] as
              | "bookings" | "waitlist" | "orders" | "products" | "clients"
              | "reviews" | "analytics" | "email" | "settings";
            const label = entry[1];
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative isolate rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                  active
                    ? "text-black"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-[#c9a961]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {!smtpReady && isAdmin && (
          <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            <strong>SMTP not configured.</strong> Confirmation and 8-hour
            reminder emails are being logged in <em>preview mode</em> only —
            no actual emails are leaving the server. Set{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              SMTP_HOST
            </code>{" "}
            ·{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              SMTP_PORT
            </code>{" "}
            ·{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              SMTP_USER
            </code>{" "}
            ·{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
              SMTP_PASS
            </code>{" "}
            in your environment, then restart the server.
          </div>
        )}

        {tab === "email" && isAdmin && <BulkEmail bookings={bookings} />}
        {tab === "settings" && <SettingsHub me={me} />}
        {tab === "products" && isAdmin && <ProductsPanel />}
        {tab === "orders" && isAdmin && <OrdersPanel />}
        {tab === "clients" && isAdmin && <ClientsPanel />}
        {tab === "analytics" && isAdmin && <AnalyticsPanel />}
        {tab === "reviews" && isAdmin && <ReviewsPanel />}
        {tab === "waitlist" && isAdmin && <WaitlistPanel />}
        {tab === "bookings" && (
          <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Today" value={stats.todayCount.toString()} />
          <Stat label="Upcoming" value={stats.upcomingCount.toString()} />
          <Stat label="Pending review" value={stats.pending.toString()} />
          <Stat label="Revenue · completed" value={`€${stats.revenue}`} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full border border-white/15 bg-white/[0.04] p-1">
            {(["list", "calendar"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${view === v ? "bg-[#c9a961] text-black" : "text-white/70 hover:bg-white/10"}`}>{v}</button>
            ))}
          </div>
        </div>

        {view === "calendar" ? (
          <BookingsCalendar
            bookings={filtered}
            weekStart={weekStart}
            onShift={(n) => {
              if (n === 0) {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - d.getDay());
                setWeekStart(d);
              } else {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + n);
                setWeekStart(d);
              }
            }}
            onSelect={(b) => alert(`${b.name} — ${b.serviceName}\n${b.date} ${b.time} · ${b.barberName}\n${b.phone} ${b.email}`)}
          />
        ) : (
        <>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => {
              const active = filter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilter(s.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                    active
                      ? "border-[#c9a961] bg-[#c9a961] text-black"
                      : "border-white/15 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={day}
              onChange={(e) =>
                setDay(e.target.value as "today" | "upcoming" | "all")
              }
              style={{ colorScheme: "dark" }}
              className="appearance-none rounded-full border border-white/15 bg-[#14110d] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path fill=%22%23c9a961%22 d=%22M0 0l5 6 5-6z%22/></svg>')] bg-[length:10px_6px] bg-[position:right_14px_center] bg-no-repeat px-4 py-1.5 pr-9 text-xs uppercase tracking-widest text-white/85 outline-none transition-colors hover:bg-white/[0.06] focus:border-white/40"
            >
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="all">All time</option>
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, service…"
              className="w-full min-w-[180px] flex-1 rounded-full border border-white/15 bg-white/[0.03] px-4 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/40 sm:w-64 sm:flex-none"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="hidden grid-cols-[1fr_1.4fr_1.2fr_1fr_1.2fr_120px_180px] gap-4 border-b border-white/10 bg-white/[0.03] px-6 py-3 text-[10px] uppercase tracking-widest text-white/40 lg:grid">
            <span>Date · Time</span>
            <span>Client</span>
            <span>Service</span>
            <span>Barber</span>
            <span>Phone</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center text-white/40">
              No bookings match your filters.
            </div>
          )}

          <AnimatePresence initial={false}>
            {filtered.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid gap-2 border-b border-white/10 px-4 py-4 text-sm last:border-b-0 sm:px-6 sm:py-5 lg:grid-cols-[1fr_1.4fr_1.2fr_1fr_1.2fr_120px_180px] lg:items-center lg:gap-4"
              >
                <div className="font-serif text-base">
                  {b.date}
                  <span className="text-white/40"> · </span>
                  {b.time}
                </div>
                <div>
                  <p className="text-white">{b.name}</p>
                  <p className="text-xs text-white/40">€{b.price} · {b.duration}m</p>
                </div>
                <div className="text-white/85">{b.serviceName}</div>
                <div className="text-white/85">{b.barberName}</div>
                <div className="text-white/70">
                  <a href={`tel:${b.phone}`} className="hover:text-white">
                    {b.phone}
                  </a>
                  {b.email && (
                    <p className="text-xs text-white/40">{b.email}</p>
                  )}
                </div>
                <div>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${
                      statusStyles[b.status]
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                  {b.status === "pending" && (
                    <Btn
                      onClick={() => update(b.id, "confirmed")}
                      busy={busy === b.id}
                      tone="gold"
                    >
                      Confirm
                    </Btn>
                  )}
                  {b.status === "confirmed" && (
                    <Btn
                      onClick={() => update(b.id, "completed")}
                      busy={busy === b.id}
                      tone="gold"
                    >
                      Complete
                    </Btn>
                  )}
                  {b.status !== "cancelled" && b.status !== "completed" && (
                    <Btn
                      onClick={() => update(b.id, "cancelled")}
                      busy={busy === b.id}
                      tone="ghost"
                    >
                      Cancel
                    </Btn>
                  )}
                  <Btn
                    onClick={() => remove(b.id)}
                    busy={busy === b.id}
                    tone="danger"
                  >
                    Delete
                  </Btn>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.some((b) => b.notes) && (
          <p className="mt-4 text-xs text-white/40">
            Tip: bookings with notes are marked in the row above. Hover any
            row to expand details.
          </p>
        )}
        </>
        )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-2 font-serif text-3xl text-white">{value}</p>
    </div>
  );
}

function Btn({
  children,
  onClick,
  busy,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  tone: "gold" | "ghost" | "danger";
}) {
  const cls =
    tone === "gold"
      ? "bg-[#c9a961] text-black hover:bg-[#d4b878]"
      : tone === "danger"
        ? "border border-red-400/40 text-red-300 hover:bg-red-500/10"
        : "border border-white/15 text-white/70 hover:bg-white/10";
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}
