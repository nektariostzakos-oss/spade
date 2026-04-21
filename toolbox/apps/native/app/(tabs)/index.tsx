import { useAuth } from '@clerk/clerk-expo';
import { tokens } from '@toolbox/design-tokens';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Bookmark, Heart, Share2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { api } from '../../lib/api';

const { height: H } = Dimensions.get('window');

interface FeedItem {
  id: string;
  muxPlaybackId: string | null;
  caption: string | null;
  hashtags: string[];
  trade: string | null;
  city: string | null;
  likeCount: number;
  liked?: boolean;
  saved?: boolean;
  creator: { id: string; displayName: string; avatarUrl: string | null; city: string | null };
}

export default function FeedHome() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [activeIndex, setActive] = useState(0);

  const load = useCallback(
    async (c?: string | null) => {
      const qs = c ? `&cursor=${c}` : '';
      const res = await api<{ items: FeedItem[]; nextCursor: string | null }>(
        `/v1/feed?limit=8${qs}`,
        { token: await getToken().catch(() => null) },
      );
      if (!res.ok) return;
      setItems((prev) => (c ? [...prev, ...res.data.items] : res.data.items));
      setCursor(res.data.nextCursor);
    },
    [getToken],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (typeof first?.index === 'number') setActive(first.index);
  }).current;

  const renderItem = ({ item, index }: ListRenderItemInfo<FeedItem>) => (
    <Slide item={item} active={index === activeIndex} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={H}
        decelerationRate="fast"
        onEndReachedThreshold={0.8}
        onEndReached={() => cursor && void load(cursor)}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: tokens.color.text.secondary }}>
              No videos yet. Be the first.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function Slide({ item, active }: { item: FeedItem; active: boolean }) {
  const { getToken, isSignedIn } = useAuth();
  const [liked, setLiked] = useState(Boolean(item.liked));
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [saved, setSaved] = useState(Boolean(item.saved));

  const src = item.muxPlaybackId
    ? `https://stream.mux.com/${item.muxPlaybackId}.m3u8`
    : null;
  const player = useVideoPlayer(src, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (!player) return;
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  const onLike = async () => {
    if (!isSignedIn) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    const token = await getToken();
    await api(`/v1/videos/${item.id}/like`, { method: 'POST', token });
  };

  const onSave = async () => {
    if (!isSignedIn) return;
    setSaved((s) => !s);
    const token = await getToken();
    await api(`/v1/videos/${item.id}/save`, { method: 'POST', token });
  };

  return (
    <View style={styles.slide}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <View style={styles.overlay}>
        <View style={{ flex: 1 }}>
          <Text style={styles.handle}>
            @{item.creator.displayName}
            {item.creator.city ? ` · ${item.creator.city}` : ''}
          </Text>
          {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
          {item.hashtags.length > 0 && (
            <Text style={styles.tags}>{item.hashtags.map((h) => `#${h}`).join(' ')}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <Action onPress={onLike} active={liked} label={String(likeCount)}>
            <Heart color={liked ? tokens.color.accent.primary : '#fff'} size={28} strokeWidth={2} />
          </Action>
          <Action onPress={onSave} active={saved} label="Save">
            <Bookmark color={saved ? tokens.color.accent.primary : '#fff'} size={28} strokeWidth={2} />
          </Action>
          <Action onPress={() => undefined} label="Share">
            <Share2 color="#fff" size={28} strokeWidth={2} />
          </Action>
        </View>
      </View>
    </View>
  );
}

function Action({
  children,
  onPress,
  active,
  label,
}: {
  children: React.ReactNode;
  onPress: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      {children}
      <Text
        style={{
          color: active ? tokens.color.accent.primary : '#fff',
          fontSize: 11,
          fontFamily: 'monospace',
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slide: { width: '100%', height: H, backgroundColor: '#000' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: tokens.size.space[5],
    paddingBottom: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  handle: {
    color: tokens.color.text.tertiary,
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  caption: { color: '#fff', fontSize: 16, marginTop: 6 },
  tags: { color: tokens.color.semantic.info, fontSize: 14, marginTop: 4 },
  actions: { alignItems: 'center', gap: tokens.size.space[4] },
  action: {
    minWidth: tokens.size.tap,
    minHeight: tokens.size.tap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { width: '100%', height: H, alignItems: 'center', justifyContent: 'center' },
});
