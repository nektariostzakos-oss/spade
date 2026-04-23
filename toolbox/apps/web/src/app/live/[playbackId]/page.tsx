import { LivePlayer } from './LivePlayer';

interface Props {
  params: Promise<{ playbackId: string }>;
}

export default async function LiveViewerPage({ params }: Props) {
  const { playbackId } = await params;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-black">
      <div className="relative aspect-[9/16] h-full max-h-[100dvh] w-full max-w-[480px]">
        <LivePlayer playbackId={playbackId} />
      </div>
    </main>
  );
}
