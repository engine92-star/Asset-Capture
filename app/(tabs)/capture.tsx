import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DetectionPrompt } from '@/components/DetectionPrompt';
import { Button } from '@/components/ui';
import { useSettings } from '@/context/SettingsContext';
import { getScanIntervalMs, scanForCandidates } from '@/lib/detection';
import { DetectionCandidate } from '@/types/registry';
import { theme } from '@/constants/theme';

export default function CaptureScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [candidate, setCandidate] = useState<DetectionCandidate | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const dismissedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!scanning || promptVisible) return;

    const interval = setInterval(() => {
      const results = scanForCandidates(settings);
      const next = results.find((entry) => !dismissedRef.current.has(entry.id));
      if (next) {
        setCandidate(next);
        setPromptVisible(true);
      }
    }, getScanIntervalMs(settings));

    return () => clearInterval(interval);
  }, [scanning, promptVisible, settings]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>Camera access required</Text>
        <Text style={styles.permissionText}>
          Asset-Capture uses your camera to identify potential assets and liabilities while you walk
          through a location.
        </Text>
        <Button label="Grant camera permission" onPress={requestPermission} />
      </View>
    );
  }

  const handleAccept = () => {
    if (!candidate) return;
    setPromptVisible(false);
    setScanning(false);
    router.push({
      pathname: '/capture/workflow',
      params: {
        label: candidate.label,
        category: candidate.category,
        estimatedValue: String(candidate.estimatedValue),
        meetsThreshold: String(candidate.meetsThreshold),
      },
    });
    setCandidate(null);
  };

  const handleDismiss = () => {
    if (candidate) {
      dismissedRef.current.add(candidate.id);
    }
    setPromptVisible(false);
    setCandidate(null);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scanning mode</Text>
            <Text style={styles.headerSubtitle}>
              Walk slowly. High-value items will trigger capture prompts.
            </Text>
          </View>

          <View style={styles.reticle}>
            <View style={styles.reticleCorner} />
            <Text style={styles.reticleText}>
              {scanning ? 'Analyzing scene…' : 'Scan paused'}
            </Text>
          </View>

          <View style={styles.footer}>
            <Button
              label={scanning ? 'Pause scanning' : 'Resume scanning'}
              onPress={() => setScanning((value) => !value)}
              variant="secondary"
            />
          </View>
        </View>
      </CameraView>

      <DetectionPrompt
        candidate={candidate}
        visible={promptVisible}
        onAccept={handleAccept}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  header: {
    marginTop: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#D7E4F4',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  reticle: {
    alignSelf: 'center',
    width: 240,
    height: 180,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,108,189,0.15)',
  },
  reticleCorner: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.colors.accent,
  },
  reticleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    marginBottom: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
});