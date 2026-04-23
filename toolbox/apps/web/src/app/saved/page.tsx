import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SavedClient } from './SavedClient';

export default async function SavedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">Library</p>
        <h1 className="mt-1 text-3xl font-bold">Saved videos</h1>
      </header>
      <SavedClient />
    </main>
  );
}
