import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { listBookings } from "../../lib/bookings";
import { isSmtpConfigured } from "../../lib/email";
import AdminDashboard from "../components/AdminDashboard";

export const metadata = {
  title: "Admin · Bookings — Spade",
};

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const bookings = await listBookings();
  const smtp = await isSmtpConfigured();
  return (
    <AdminDashboard
      initial={bookings}
      smtpReady={smtp}
      me={{
        id: user.id,
        email: user.email,
        role: user.role,
        barberId: user.barberId,
      }}
    />
  );
}
