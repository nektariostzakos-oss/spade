import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { QuoteForm } from './QuoteForm';

export default async function QuotePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">Get a quote</p>
        <h1 className="mt-1 text-3xl font-bold">What do you need done?</h1>
        <p className="mt-2 text-text-secondary">
          We'll match you with up to 5 verified pros nearby. They get 60 seconds to respond.
        </p>
      </header>
      <QuoteForm />
    </main>
  );
}
