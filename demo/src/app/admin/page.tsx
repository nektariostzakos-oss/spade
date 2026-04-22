import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { listBookings } from "../../lib/bookings";
import { isSmtpConfigured } from "../../lib/email";
import { loadSettings } from "../../lib/settings";
import { getLaunchChecklist } from "../../lib/launchChecklist";
import AdminDashboard from "../components/AdminDashboard";

export const metadata = {
  title: "Admin · Bookings — Your Salon",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  // Barber role sees only their own bookings (stylists shouldn't see
  // colleagues' clients). Admins see everything.
  const all = await listBookings();
  const bookings =
    user.role === "admin"
      ? all
      : all.filter((b) => b.barberId === user.barberId || b.barberId === "any");
  const smtp = await isSmtpConfigured();
  const settings = await loadSettings();
  const checklist = await getLaunchChecklist();
  return (
    <AdminDashboard
      initial={bookings}
      smtpReady={smtp}
      onboarded={!!settings.onboarded}
      checklist={checklist}
      me={{
        id: user.id,
        email: user.email,
        role: user.role,
        barberId: user.barberId,
        mustChangePassword: !!user.mustChangePassword,
      }}
    />
  );
}
