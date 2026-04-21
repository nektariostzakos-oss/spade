import { tokens } from '@toolbox/design-tokens';
import { Button } from '@toolbox/ui-native';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.kicker}>PHASE 0 · FOUNDATION</Text>
        <Text style={styles.title}>Toolbox</Text>
        <Text style={styles.subtitle}>
          Vertical video for the trades. Pros post, homeowners hire, apprentices learn.
        </Text>
        <View style={{ height: tokens.size.space[6] }} />
        <Button label="Get started" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg.base },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.size.space[6],
  },
  kicker: {
    color: tokens.color.text.tertiary,
    fontSize: tokens.size.text.xs,
    letterSpacing: 2,
    marginBottom: tokens.size.space[2],
  },
  title: {
    color: tokens.color.text.primary,
    fontSize: tokens.size.text['5xl'],
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: tokens.color.text.secondary,
    fontSize: tokens.size.text.base,
    textAlign: 'center',
    marginTop: tokens.size.space[4],
    maxWidth: 320,
  },
});
