import { useAuth } from '@clerk/clerk-expo';
import { tokens } from '@toolbox/design-tokens';
import { Button } from '@toolbox/ui-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../lib/api';

export default function Upload() {
  const { getToken } = useAuth();
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pickAndUpload = async () => {
    setErr(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setErr('Media access denied');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoQuality: 1,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];

    const token = await getToken();
    const res = await api<{ uploadUrl: string; videoId: string }>('/v1/videos/upload', {
      method: 'POST',
      token,
      body: { caption: caption || undefined, hashtags: [] },
    });
    if (!res.ok) return setErr(res.error.message);

    setProgress(0);
    const { uploadUrl, videoId } = res.data;

    const fileRes = await fetch(asset.uri);
    const blob = await fileRes.blob();
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('content-type', 'video/mp4');
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) router.push(`/v/${videoId}`);
      else setErr(`Upload failed (${xhr.status})`);
    };
    xhr.onerror = () => {
      setProgress(null);
      setErr('Upload failed');
    };
    xhr.send(blob);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.kicker}>UPLOAD</Text>
        <Text style={styles.title}>Post a clip</Text>
        <TextInput
          placeholder="Caption (optional)"
          placeholderTextColor={tokens.color.text.tertiary}
          value={caption}
          onChangeText={setCaption}
          multiline
          style={styles.input}
        />
        {progress !== null ? (
          <View style={{ gap: tokens.size.space[2] }}>
            <ActivityIndicator color={tokens.color.accent.primary} />
            <Text style={styles.meta}>{progress}%</Text>
          </View>
        ) : (
          <Button label="Pick video & upload" onPress={pickAndUpload} />
        )}
        {err && <Text style={styles.err}>{err}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bg.base },
  inner: { flex: 1, padding: tokens.size.space[6], gap: tokens.size.space[4] },
  kicker: { color: tokens.color.text.tertiary, fontSize: tokens.size.text.xs, letterSpacing: 2 },
  title: { color: tokens.color.text.primary, fontSize: tokens.size.text['3xl'], fontWeight: '900' },
  input: {
    minHeight: 96,
    borderRadius: tokens.size.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border.default,
    backgroundColor: tokens.color.surface[1],
    padding: tokens.size.space[3],
    color: tokens.color.text.primary,
    textAlignVertical: 'top',
  },
  meta: { color: tokens.color.text.secondary, fontFamily: 'monospace' },
  err: { color: tokens.color.semantic.danger },
});
