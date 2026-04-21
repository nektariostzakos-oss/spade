import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UploadForm } from './UploadForm';

export default async function UploadPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-6 py-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">Upload</p>
        <h1 className="mt-1 text-3xl font-bold">Post a clip</h1>
        <p className="mt-2 text-text-secondary">
          Vertical is best. We chunk the upload so bad job-site signal won't kill you.
        </p>
      </header>
      <UploadForm />
    </main>
  );
}
