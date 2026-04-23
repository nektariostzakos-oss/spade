import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { OnboardingForm } from './OnboardingForm';

export default async function ProOnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
          Pro onboarding
        </p>
        <h1 className="mt-1 text-3xl font-bold">Set up your pro profile</h1>
        <p className="mt-2 text-text-secondary">
          Takes about 4 minutes. You'll need your license number and proof of insurance.
        </p>
      </header>
      <OnboardingForm />
    </main>
  );
}
