import { Button } from '@toolbox/ui-web';

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-text-tertiary">
          Phase 0 · Foundation
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight text-text-primary md:text-7xl">
          Toolbox
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-text-secondary">
          Vertical video for the trades. Pros post, homeowners hire, apprentices learn.
        </p>
      </div>
      <Button>Get started</Button>
    </main>
  );
}
