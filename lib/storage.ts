import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  RegistryItem,
} from '@/types/registry';

const ITEMS_KEY = '@asset-capture/items';
const SETTINGS_KEY = '@asset-capture/settings';

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadItems(): Promise<RegistryItem[]> {
  const raw = await AsyncStorage.getItem(ITEMS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as RegistryItem[];
}

export async function saveItems(items: RegistryItem[]): Promise<void> {
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export async function upsertItem(item: RegistryItem): Promise<RegistryItem[]> {
  const items = await loadItems();
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  await saveItems(items);
  return items;
}

export async function deleteItem(id: string): Promise<RegistryItem[]> {
  const items = (await loadItems()).filter((entry) => entry.id !== id);
  await saveItems(items);
  return items;
}

export async function getItem(id: string): Promise<RegistryItem | null> {
  const items = await loadItems();
  return items.find((entry) => entry.id === id) ?? null;
}