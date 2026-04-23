import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@toolbox/ui-web';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-text-tertiary">
          Worksite Premium
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight text-text-primary md:text-7xl">
          Toolbox
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-text-secondary">
          Vertical video for the trades. Pros post, homeowners hire, apprentices learn.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <SignedOut>
          <Link href="/sign-up">
            <Button>Join as a pro</Button>
          </Link>
          <Link href="/feed">
            <Button variant="secondary">Browse feed</Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/feed">
            <Button>Open feed</Button>
          </Link>
          <UserButton />
        </SignedIn>
      </div>
    </main>
  );
}
