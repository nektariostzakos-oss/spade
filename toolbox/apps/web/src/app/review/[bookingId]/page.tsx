import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ReviewForm } from './ReviewForm';

interface Props {
  params: Promise<{ bookingId: string }>;
}

export default async function ReviewPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const { bookingId } = await params;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-6 py-12">
      <h1 className="text-2xl font-bold">Rate your pro</h1>
      <ReviewForm bookingId={bookingId} />
    </main>
  );
}
