import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
          Pro dashboard
        </p>
        <h1 className="mt-1 text-3xl font-bold">Your 30-day pulse</h1>
      </header>
      <DashboardClient />
    </main>
  );
}
