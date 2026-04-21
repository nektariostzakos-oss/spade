export default function PendingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="h-14 w-14 rounded-full border-2 border-semantic-verified" />
      <h1 className="text-2xl font-bold">Verification pending</h1>
      <p className="text-text-secondary">
        Our team reviews license + insurance docs within 24 hours. You'll get a push and email
        when you're live.
      </p>
    </main>
  );
}
