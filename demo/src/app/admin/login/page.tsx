import LoginForm from "../../components/LoginForm";

export const metadata = {
  title: "Sign in — Spade Admin",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0806] px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-[#c9a961]">
          Spade · Admin
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
        <p className="mt-6 text-xs text-white/30">
          Default admin: <code className="text-[#c9a961]">admin@spade.gr</code> /{" "}
          <code className="text-[#c9a961]">spade2026</code>.
          Change it from the Settings tab after first login.
        </p>
      </div>
    </main>
  );
}
