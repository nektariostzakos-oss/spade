import { useUser } from '@clerk/clerk-expo';
import { tokens } from '@toolbox/design-tokens';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function Profile() {
  const { user } = useUser();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.kicker}>PROFILE</Text>
        <Text style={styles.title}>{user?.firstName ?? 'Signed out'}</Text>
        <Text style={styles.subtitle}>
          {user?.primaryEmailAddress?.emailAddress ??
            user?.primaryPhoneNumber?.phoneNumber ??
            'Sign in to build your pro profile.'}
        </Text>
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
