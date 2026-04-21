import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { listBookings } from "../../lib/bookings";
import { isSmtpConfigured } from "../../lib/email";
import { loadSettings } from "../../lib/settings";
import AdminDashboard from "../components/AdminDashboard";

export const metadata = {
  title: "Admin · Bookings — Oakline",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const bookings = await listBookings();
  const smtp = await isSmtpConfigured();
  const settings = await loadSettings();
  return (
    <AdminDashboard
      initial={bookings}
      smtpReady={smtp}
      onboarded={!!settings.onboarded}
      me={{
        id: user.id,
        email: user.email,
        role: user.role,
        barberId: user.barberId,
      }}
    />
  );
}
