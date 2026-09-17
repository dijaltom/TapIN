import {MMKV} from 'react-native-mmkv';
import {Pass} from '../types/pass.types';

const storage = new MMKV({id: 'tapin-store'});

const PASSES_KEY = 'passes_v1';
const ONBOARDING_KEY = 'onboarding_done';
const SETTINGS_KEY = 'settings_v1';

// ────────────────────────────────────────────────────────────────────────────
// Passes
// ────────────────────────────────────────────────────────────────────────────

export function getAllPasses(): Pass[] {
  try {
    const raw = storage.getString(PASSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Pass[];
  } catch {
    return [];
  }
}

export function savePass(pass: Pass): void {
  const passes = getAllPasses();
  const existing = passes.findIndex(p => p.id === pass.id);
  if (existing >= 0) {
    passes[existing] = pass;
  } else {
    passes.unshift(pass); // newest first
  }
  storage.set(PASSES_KEY, JSON.stringify(passes));
}

export function deletePass(id: string): void {
  const passes = getAllPasses().filter(p => p.id !== id);
  storage.set(PASSES_KEY, JSON.stringify(passes));
}

export function getPassById(id: string): Pass | undefined {
  return getAllPasses().find(p => p.id === id);
}

export function updatePassLastUsed(id: string): void {
  const passes = getAllPasses();
  const idx = passes.findIndex(p => p.id === id);
  if (idx >= 0) {
    passes[idx].lastUsedAt = Date.now();
    storage.set(PASSES_KEY, JSON.stringify(passes));
  }
}

export function markAddedToWallet(id: string, serial: string): void {
  const passes = getAllPasses();
  const idx = passes.findIndex(p => p.id === id);
  if (idx >= 0) {
    passes[idx].addedToWallet = true;
    passes[idx].walletSerial = serial;
    storage.set(PASSES_KEY, JSON.stringify(passes));
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Onboarding
// ────────────────────────────────────────────────────────────────────────────

export function isOnboardingDone(): boolean {
  return storage.getBoolean(ONBOARDING_KEY) ?? false;
}

export function setOnboardingDone(): void {
  storage.set(ONBOARDING_KEY, true);
}

// ────────────────────────────────────────────────────────────────────────────
// Settings
// ────────────────────────────────────────────────────────────────────────────

export interface AppSettings {
  locationReminders: boolean;
  haptics: boolean;
}

const defaultSettings: AppSettings = {
  locationReminders: true,
  haptics: true,
};

export function getSettings(): AppSettings {
  try {
    const raw = storage.getString(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return {...defaultSettings, ...JSON.parse(raw)};
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  storage.set(SETTINGS_KEY, JSON.stringify({...current, ...settings}));
}
