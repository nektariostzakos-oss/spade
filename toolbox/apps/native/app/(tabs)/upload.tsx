import { tokens } from '@toolbox/design-tokens';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function Upload() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.kicker}>UPLOAD · PHASE 2</Text>
        <Text style={styles.title}>Record or pick a clip</Text>
        <Text style={styles.subtitle}>Resumable chunked upload, built for bad job-site signal.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg.base },
  inner: { flex: 1, padding: tokens.size.space[6] },
  kicker: {
    color: tokens.color.text.tertiary,
    fontSize: tokens.size.text.xs,
    letterSpacing: 2,
  },
  title: {
    color: tokens.color.text.primary,
    fontSize: tokens.size.text['3xl'],
    fontWeight: '900',
    marginTop: tokens.size.space[2],
  },
  subtitle: { color: tokens.color.text.secondary, marginTop: tokens.size.space[2] },
});
