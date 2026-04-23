import { useSignIn } from '@clerk/clerk-expo';
import { tokens } from '@toolbox/design-tokens';
import { Button } from '@toolbox/ui-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailOrPhone, setValue] = useState('');
  const [code, setCode] = useState('');
  const [awaitingCode, setAwaiting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = async () => {
    if (!isLoaded) return;
    setErr(null);
    try {
      await signIn.create({ identifier: emailOrPhone });
      const phoneFactor = signIn.supportedFirstFactors?.find(
        (f) => f.strategy === 'phone_code',
      );
      const emailFactor = signIn.supportedFirstFactors?.find(
        (f) => f.strategy === 'email_code',
      );
      const factor = phoneFactor ?? emailFactor;
      if (!factor) throw new Error('No phone or email factor available');
      await signIn.prepareFirstFactor(
        factor.strategy === 'phone_code'
          ? { strategy: 'phone_code', phoneNumberId: factor.phoneNumberId }
          : { strategy: 'email_code', emailAddressId: factor.emailAddressId },
      );
      setAwaiting(true);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const verify = async () => {
    if (!isLoaded) return;
    setErr(null);
    try {
      const res = await signIn.attemptFirstFactor({
        strategy: emailOrPhone.includes('@') ? 'email_code' : 'phone_code',
        code,
      });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.replace('/');
      }
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.title}>Sign in</Text>
        {!awaitingCode ? (
          <>
            <TextInput
              placeholder="email or +phone"
              placeholderTextColor={tokens.color.text.tertiary}
              value={emailOrPhone}
              onChangeText={setValue}
              autoCapitalize="none"
              keyboardType="default"
              style={styles.input}
            />
            <Button label="Send code" onPress={start} />
          </>
        ) : (
          <>
            <TextInput
              placeholder="code"
              placeholderTextColor={tokens.color.text.tertiary}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              style={styles.input}
            />
            <Button label="Verify" onPress={verify} />
          </>
        )}
        {err && <Text style={styles.err}>{err}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg.base },
  inner: { flex: 1, padding: tokens.size.space[6], gap: tokens.size.space[4], justifyContent: 'center' },
  title: { color: tokens.color.text.primary, fontSize: tokens.size.text['3xl'], fontWeight: '900' },
  input: {
    minHeight: tokens.size.tap,
    borderRadius: tokens.size.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border.default,
    backgroundColor: tokens.color.surface[1],
    paddingHorizontal: tokens.size.space[4],
    color: tokens.color.text.primary,
    fontSize: tokens.size.text.base,
  },
  err: { color: tokens.color.semantic.danger },
});
