import { useAuth } from '@clerk/clerk-expo';
import { tokens } from '@toolbox/design-tokens';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../lib/api';

interface Lead {
  id: string;
  status: string;
  feeAmountCents: number;
  matchScore: number;
  distanceKm: number;
  expiresAt: string;
  job: { description: string; urgency: string; address: string | null };
}

export default function Inbox() {
  const { getToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const token = await getToken().catch(() => null);
    const res = await api<Lead[]>('/v1/leads/inbox', { token });
    if (res.ok) setLeads(res.data);
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const respond = async (id: string, accept: boolean) => {
    setBusy(id);
    const token = await getToken();
    await api(`/v1/leads/${id}/respond`, { method: 'POST', token, body: { accept } });
    setBusy(null);
    void load();
  };

  if (loading)
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator color={tokens.color.accent.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.kicker}>INBOX</Text>
        <Text style={styles.title}>Leads</Text>
      </View>
      <FlatList
        data={leads}
        keyExtractor={(l) => l.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void load()}
            tintColor={tokens.color.accent.primary}
          />
        }
        contentContainerStyle={{ padding: tokens.size.space[5], gap: tokens.size.space[3] }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.urgency}>{item.job.urgency}</Text>
            <Text style={styles.desc}>{item.job.description}</Text>
            <Text style={styles.meta}>
              {item.distanceKm.toFixed(1)}km · match {(item.matchScore * 100).toFixed(0)}% · fee $
              {(item.feeAmountCents / 100).toFixed(0)}
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, styles.decline]}
                onPress={() => void respond(item.id, false)}
                disabled={busy === item.id}
              >
                <Text style={styles.declineText}>Pass</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.accept]}
                onPress={() => void respond(item.id, true)}
                disabled={busy === item.id}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: tokens.size.space[6] }}>
            <Text style={{ color: tokens.color.text.secondary, textAlign: 'center' }}>
              No leads yet. Keep posting work — we surface you to homeowners nearby.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg.base },
  header: { padding: tokens.size.space[5] },
  kicker: { color: tokens.color.text.tertiary, fontSize: 11, letterSpacing: 2 },
  title: {
    color: tokens.color.text.primary,
    fontSize: tokens.size.text['3xl'],
    fontWeight: '900',
    marginTop: 4,
  },
  card: {
    backgroundColor: tokens.color.surface[1],
    borderRadius: tokens.size.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border.subtle,
    padding: tokens.size.space[4],
    gap: tokens.size.space[2],
  },
  urgency: {
    color: tokens.color.accent.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  desc: { color: tokens.color.text.primary, fontSize: tokens.size.text.base },
  meta: { color: tokens.color.text.tertiary, fontFamily: 'monospace', fontSize: 12 },
  actions: { flexDirection: 'row', gap: tokens.size.space[2], marginTop: tokens.size.space[2] },
  btn: {
    flex: 1,
    minHeight: tokens.size.tap,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.size.radius.md,
  },
  decline: {
    backgroundColor: tokens.color.surface[2],
    borderWidth: 1,
    borderColor: tokens.color.border.default,
  },
  accept: { backgroundColor: tokens.color.accent.primary },
  declineText: { color: tokens.color.text.primary, fontWeight: '700' },
  acceptText: { color: tokens.color.text.inverse, fontWeight: '900' },
});
