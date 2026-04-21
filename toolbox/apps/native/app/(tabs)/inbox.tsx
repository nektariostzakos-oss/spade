import { tokens } from '@toolbox/design-tokens';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function Inbox() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.kicker}>INBOX · PHASE 4</Text>
        <Text style={styles.title}>Leads & messages</Text>
        <Text style={styles.subtitle}>Accept or pass. You get 60 seconds.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg.base },
  inner: { flex: 1, padding: tokens.size.space[6] },
  kicker: { color: tokens.color.text.tertiary, fontSize: tokens.size.text.xs, letterSpacing: 2 },
  title: { color: tokens.color.text.primary, fontSize: tokens.size.text['3xl'], fontWeight: '900', marginTop: tokens.size.space[2] },
  subtitle: { color: tokens.color.text.secondary, marginTop: tokens.size.space[2] },
});
