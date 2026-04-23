'use client';

import MuxPlayer from '@mux/mux-player-react';

export function LivePlayer({ playbackId }: { playbackId: string }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="ll-live"
      autoPlay
      muted={false}
      playsInline
      primaryColor="#FFC107"
      accentColor="#FFC107"
      style={{ aspectRatio: '9 / 16', width: '100%', height: '100%' }}
    />
  );
}
