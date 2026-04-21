import { tokens } from '@toolbox/design-tokens';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../lib/api';

interface Video {
  id: string;
  muxPlaybackId: string | null;
  caption: string | null;
  hashtags: string[];
  trade: string | null;
  city: string | null;
}

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api<Video>(`/v1/videos/${id}`).then((r) => {
      if (!live) return;
      if (r.ok) setVideo(r.data);
      else setErr(r.error.message);
    });
    return () => {
      live = false;
    };
  }, [id]);

  const player = useVideoPlayer(
    video?.muxPlaybackId ? `https://stream.mux.com/${video.muxPlaybackId}.m3u8` : null,
    (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    },
  );

  if (err) return <Center text={err} />;
  if (!video) return <Center spinner />;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.playerWrap}>
        <VideoView player={player} style={styles.player} contentFit="cover" nativeControls={false} />
      </View>
      <View style={styles.meta}>
        {video.caption && <Text style={styles.caption}>{video.caption}</Text>}
        {video.hashtags.length > 0 && (
          <Text style={styles.tags}>{video.hashtags.map((h) => `#${h}`).join(' ')}</Text>
        )}
        {(video.trade || video.city) && (
          <Text style={styles.kicker}>
            {video.trade ?? ''} {video.city ? `· ${video.city}` : ''}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function Center({ text, spinner }: { text?: string; spinner?: boolean }) {
  return (
    <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
      {spinner ? <ActivityIndicator color={tokens.color.accent.primary} /> : null}
      {text ? <Text style={{ color: tokens.color.semantic.danger }}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg.base },
  playerWrap: { flex: 1, backgroundColor: '#000' },
  player: { width: '100%', height: '100%' },
  meta: { padding: tokens.size.space[5], gap: tokens.size.space[2] },
  caption: { color: tokens.color.text.primary, fontSize: tokens.size.text.base },
  tags: { color: tokens.color.semantic.info, fontSize: tokens.size.text.sm },
  kicker: {
    color: tokens.color.text.tertiary,
    fontSize: tokens.size.text.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
