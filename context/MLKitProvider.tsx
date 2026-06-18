import React, { createContext, useContext, useMemo } from 'react';
import {
  useObjectDetection,
  useObjectDetectionModels,
  useObjectDetectionProvider,
} from '@infinitered/react-native-mlkit-object-detection';
import type { RNMLKitObjectDetector } from '@infinitered/react-native-mlkit-object-detection';

interface MLKitContextValue {
  detector?: RNMLKitObjectDetector;
  isReady: boolean;
}

const MLKitContext = createContext<MLKitContextValue>({
  isReady: false,
});

function MLKitBridge({ children }: { children: React.ReactNode }) {
  const detector = useObjectDetection('default');

  const value = useMemo(
    () => ({
      detector,
      isReady: Boolean(detector?.isLoaded?.()),
    }),
    [detector],
  );

  return <MLKitContext.Provider value={value}>{children}</MLKitContext.Provider>;
}

export function MLKitProvider({ children }: { children: React.ReactNode }) {
  const models = useObjectDetectionModels({
    loadDefaultModel: true,
    defaultModelOptions: {
      shouldEnableClassification: true,
      shouldEnableMultipleObjects: true,
      detectorMode: 'singleImage',
    },
  });

  const { ObjectDetectionProvider } = useObjectDetectionProvider(models);

  return (
    <ObjectDetectionProvider>
      <MLKitBridge>{children}</MLKitBridge>
    </ObjectDetectionProvider>
  );
}

export function useMLKit() {
  return useContext(MLKitContext);
}