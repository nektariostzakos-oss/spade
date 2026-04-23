import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <SignUp signInUrl="/sign-in" forceRedirectUrl="/onboarding/pro" />
    </main>
  );
}
