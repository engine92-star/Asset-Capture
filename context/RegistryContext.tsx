import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RegistryItem } from '@/types/registry';
import { deleteItem, loadItems, upsertItem } from '@/lib/storage';

interface RegistryContextValue {
  items: RegistryItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  saveItem: (item: RegistryItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

export function RegistryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const next = await loadItems();
    setItems(next);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const saveItem = async (item: RegistryItem) => {
    const next = await upsertItem(item);
    setItems(next);
  };

  const removeItem = async (id: string) => {
    const next = await deleteItem(id);
    setItems(next);
  };

  const value = useMemo(
    () => ({ items, loading, refresh, saveItem, removeItem }),
    [items, loading],
  );

  return (
    <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>
  );
}

export function useRegistry() {
  const context = useContext(RegistryContext);
  if (!context) {
    throw new Error('useRegistry must be used within RegistryProvider');
  }
  return context;
}