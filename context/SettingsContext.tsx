import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/registry';
import { loadSettings, saveSettings } from '@/lib/storage';

interface SettingsContextValue {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);
  };

  const value = useMemo(
    () => ({ settings, loading, updateSettings }),
    [settings, loading],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}