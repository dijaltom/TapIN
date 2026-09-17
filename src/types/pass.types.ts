import {MetroKey} from '../theme/colors';

// ────────────────────────────────────────────────────────────────────────────
// Pass / Card types
// ────────────────────────────────────────────────────────────────────────────

export type PassType = 'nfc' | 'qr' | 'barcode';

export type PassSource = 'nfc_scan' | 'qr_scan' | 'manual';

export interface NFCTagData {
  /** Hardware UID of the NFC tag (hex string) */
  uid: string;
  /** NFC tech types detected */
  techTypes: string[];
  /** NDEF records if available */
  ndefRecords: NDEFRecord[];
  /** Raw bytes (hex) */
  rawData?: string;
  /** Tag standard (ISO 14443-A/B, ISO 15693, etc.) */
  standard?: string;
}

export interface NDEFRecord {
  tnf: number;
  type: string;
  id: string;
  payload: string; // base64 or decoded text
  payloadText?: string; // decoded human-readable
}

export interface QRTicketData {
  /** Raw QR string */
  raw: string;
  /** Detected metro operator */
  metroKey: MetroKey;
  /** Parsed fields (route, date, validity, etc.) */
  fields: Record<string, string>;
  /** Whether it looks like a transit ticket */
  isTransit: boolean;
}

export interface Pass {
  /** Unique ID (uuid) */
  id: string;
  /** Display name (editable by user) */
  name: string;
  /** Card type */
  type: PassType;
  /** How it was created */
  source: PassSource;
  /** Metro operator key */
  metroKey: MetroKey;
  /** Creation timestamp */
  createdAt: number;
  /** Last used timestamp */
  lastUsedAt?: number;
  /** NFC-specific data (if type === 'nfc') */
  nfcData?: NFCTagData;
  /** QR-specific data (if type === 'qr' | 'barcode') */
  qrData?: QRTicketData;
  /** The value to encode as QR/barcode for display */
  displayValue: string;
  /** Notes */
  notes?: string;
  /** Whether added to Apple Wallet */
  addedToWallet: boolean;
  /** Wallet pass serial number */
  walletSerial?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Navigation types
// ────────────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  PassDetail: {passId: string};
  NFCScan: undefined;
  QRScan: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  NFCScan: undefined;
  QRScan: undefined;
  Settings: undefined;
};

// ────────────────────────────────────────────────────────────────────────────
// Wallet / PassKit types
// ────────────────────────────────────────────────────────────────────────────

export interface PassKitConfig {
  passTypeIdentifier: string; // e.g. pass.com.tapin.wallet
  teamIdentifier: string;     // Apple Developer Team ID
  organizationName: string;   // TapIN
  description: string;
  logoText: string;
  foregroundColor: string;
  backgroundColor: string;
  labelColor: string;
}
