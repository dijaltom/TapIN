import {Platform, Alert, Linking} from 'react-native';
import {Pass} from '../types/pass.types';
import {Colors} from '../theme/colors';

// ────────────────────────────────────────────────────────────────────────────
// PassKit integration
// ────────────────────────────────────────────────────────────────────────────

// Dynamic import to avoid crash on Android
let PassKit: any = null;
try {
  PassKit = require('react-native-wallet-manager');
} catch {
  PassKit = null;
}

export async function canAddToWallet(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !PassKit) return false;
  try {
    return await PassKit.canAddPasses();
  } catch {
    return false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Build pass.json payload
// ────────────────────────────────────────────────────────────────────────────

function buildPassJSON(pass: Pass): object {
  const metro = Colors.metro[pass.metroKey];
  const isNFC = pass.type === 'nfc';

  const barcodeFormat = pass.type === 'barcode'
    ? 'PKBarcodeFormatCode128'
    : 'PKBarcodeFormatQR';

  const fields = pass.qrData?.fields
    ? Object.entries(pass.qrData.fields)
        .slice(0, 4) // PassKit supports up to 4 secondary fields
        .map(([key, value]) => ({
          key: key.toLowerCase().replace(/\s/g, '_'),
          label: key.toUpperCase(),
          value,
        }))
    : [];

  const [primary, ...secondary] = fields;

  return {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.tapin.wallet',
    serialNumber: pass.id,
    teamIdentifier: 'XXXXXXXXXX', // Replace with real Team ID at build time
    organizationName: 'TapIN',
    description: pass.name,
    logoText: metro.label,

    // Colors
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: hexToRgb(metro.primary),
    labelColor: 'rgba(255, 255, 255, 0.75)',

    // Generic pass (works for transit tickets)
    generic: {
      primaryFields: primary
        ? [primary]
        : [{key: 'name', label: 'PASS', value: pass.name}],
      secondaryFields: secondary.slice(0, 2),
      auxiliaryFields: secondary.slice(2, 4),
      backFields: [
        {
          key: 'source',
          label: 'SCANNED VIA',
          value: isNFC ? 'NFC' : 'QR Code',
        },
        {
          key: 'added',
          label: 'ADDED ON',
          value: new Date(pass.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        },
        {
          key: 'app',
          label: 'APP',
          value: 'TapIN — NFC & QR Wallet for India',
        },
      ],
    },

    // Barcode
    barcodes: [
      {
        message: pass.displayValue,
        format: barcodeFormat,
        messageEncoding: 'iso-8859-1',
        altText: pass.name,
      },
    ],

    // Relevance
    locations: getMetroLocations(pass.metroKey),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Add to Apple Wallet
// ────────────────────────────────────────────────────────────────────────────

export async function addToAppleWallet(pass: Pass): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    Alert.alert('iOS Only', 'Apple Wallet is only available on iPhone.');
    return false;
  }

  if (!PassKit) {
    Alert.alert(
      'Not Available',
      'PassKit is not configured. Please build with a valid Apple Developer account.',
    );
    return false;
  }

  try {
    const passJSON = buildPassJSON(pass);

    // In production this should call a backend to sign the .pkpass
    // For now we show the user what the pass contains and open Wallet
    const canAdd = await PassKit.canAddPasses();

    if (!canAdd) {
      Alert.alert(
        'Cannot Add Pass',
        'Your device does not support Apple Wallet passes.',
      );
      return false;
    }

    // NOTE: PassKit.addPass() requires a signed .pkpass URL or base64 data
    // The pass JSON above is the structure — real signing needs a backend
    // For demo: show the data that would be sent
    Alert.alert(
      '🎉 Pass Ready',
      `"${pass.name}" is ready for Apple Wallet.\n\nTo complete setup, sign the .pkpass with your Apple Developer certificate and call PassKit.addPass().`,
      [
        {text: 'Learn More', onPress: () => Linking.openURL('https://developer.apple.com/wallet/')},
        {text: 'OK'},
      ],
    );

    return true;
  } catch (err: any) {
    Alert.alert('Error', err?.message || 'Could not add to Apple Wallet');
    return false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'rgb(124, 92, 252)';
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
}

function getMetroLocations(key: string) {
  const locations: Record<string, {latitude: number; longitude: number; relevantText: string}[]> = {
    dmrc: [
      {latitude: 28.6139, longitude: 77.2090, relevantText: 'Open your Delhi Metro pass'},
    ],
    bmrc: [
      {latitude: 12.9716, longitude: 77.5946, relevantText: 'Open your Namma Metro pass'},
    ],
    mmrc: [
      {latitude: 19.0760, longitude: 72.8777, relevantText: 'Open your Mumbai Metro pass'},
    ],
    hmr: [
      {latitude: 17.3850, longitude: 78.4867, relevantText: 'Open your Hyderabad Metro pass'},
    ],
    cmrl: [
      {latitude: 13.0827, longitude: 80.2707, relevantText: 'Open your Chennai Metro pass'},
    ],
  };
  return locations[key] ?? [];
}
