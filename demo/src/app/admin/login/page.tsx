import LoginForm from "../../components/LoginForm";
import { loadSettings } from "../../../lib/settings";

export const metadata = {
  title: "Sign in — Oakline Admin",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Show the seed-credentials hint only before the wizard has marked the
  // site as onboarded. Leaking the default password to the whole internet
  // on a production login page is a social-engineering gift.
  const settings = await loadSettings();
  const showSeed = !settings.onboarded;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0806] px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[#c9a961]">
          Oakline · Admin
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-white">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Enter the staff password to manage today&rsquo;s bookings.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-4 text-right">
          <a
            href="/admin/reset"
            className="text-xs text-white/40 hover:text-[#c9a961]"
          >
            Forgot password?
          </a>
        </p>
        {showSeed && (
          <p className="mt-6 text-xs text-white/30">
            Default admin: <code className="text-[#c9a961]">admin@oakline.studio</code> /{" "}
            <code className="text-[#c9a961]">oakline2026</code>.
            Change it from the Settings tab after first login.
          </p>
        )}
      </div>
    </main>
  );
}
