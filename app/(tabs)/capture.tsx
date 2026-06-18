import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { DetectionPrompt } from '@/components/DetectionPrompt';
import { Button } from '@/components/ui';
import { useMLKit } from '@/context/MLKitProvider';
import { useSettings } from '@/context/SettingsContext';
import { getScanIntervalMs } from '@/lib/detection';
import { analyzeImageForCandidates, isMlKitAvailable } from '@/lib/ml-detection';
import { DetectionCandidate } from '@/types/registry';
import { theme } from '@/constants/theme';

export default function CaptureScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { detector, isReady } = useMLKit();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidate, setCandidate] = useState<DetectionCandidate | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [lastDetectionLabel, setLastDetectionLabel] = useState<string | null>(null);
  const dismissedRef = useRef<Set<string>>(new Set());
  const cameraRef = useRef<CameraView>(null);
  const analyzingRef = useRef(false);

  useEffect(() => {
    if (!scanning || promptVisible || !cameraReady || analyzingRef.current) {
      return;
    }

    const interval = setInterval(async () => {
      if (!cameraRef.current || analyzingRef.current || promptVisible) return;

      analyzingRef.current = true;
      setIsAnalyzing(true);

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.35,
          skipProcessing: true,
          shutterSound: false,
        });

        if (!photo?.uri) return;

        const results = await analyzeImageForCandidates(photo.uri, settings, detector);
        const next = results.find((entry) => {
          const fingerprint = `${entry.label}-${entry.mlLabel ?? entry.category}`;
          return !dismissedRef.current.has(entry.id) && fingerprint !== lastDetectionLabel;
        });

        if (next) {
          setCandidate(next);
          setPromptVisible(true);
          setLastDetectionLabel(`${next.label}-${next.mlLabel ?? next.category}`);
        }
      } catch (error) {
        console.warn('Scan frame failed', error);
      } finally {
        analyzingRef.current = false;
        setIsAnalyzing(false);
      }
    }, getScanIntervalMs(settings));

    return () => clearInterval(interval);
  }, [
    scanning,
    promptVisible,
    cameraReady,
    settings,
    detector,
    lastDetectionLabel,
  ]);

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
        mlLabel: candidate.mlLabel ?? '',
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

  const engineLabel =
    Platform.OS === 'android' && isMlKitAvailable() && isReady
      ? 'ML Kit on-device'
      : Platform.OS === 'android' && isMlKitAvailable()
        ? 'ML Kit loading…'
        : 'Simulator fallback';

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setCameraReady(true)}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scanning mode</Text>
            <Text style={styles.headerSubtitle}>
              Walk slowly. ML Kit analyzes camera frames for high-value items.
            </Text>
            <Text style={styles.engineBadge}>Engine: {engineLabel}</Text>
          </View>

          <View style={styles.reticle}>
            <View style={styles.reticleCorner} />
            <Text style={styles.reticleText}>
              {isAnalyzing ? 'Analyzing frame…' : scanning ? 'Watching scene…' : 'Scan paused'}
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
  engineBadge: {
    color: '#9FD0FF',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
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