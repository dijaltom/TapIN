import NfcManager, {
  NfcTech,
  TagEvent,
  NdefRecord,
} from 'react-native-nfc-manager';
import {NFCTagData, NDEFRecord} from '../types/pass.types';

// ────────────────────────────────────────────────────────────────────────────
// Init & cleanup
// ────────────────────────────────────────────────────────────────────────────

export async function initNFC(): Promise<boolean> {
  try {
    const supported = await NfcManager.isSupported();
    if (!supported) return false;
    await NfcManager.start();
    return true;
  } catch (e: any) {
    // Gracefully handles missing NFC entitlement (free Apple ID builds)
    console.warn('[NFC] Not available:', e?.message);
    return false;
  }
}


export async function isNFCEnabled(): Promise<boolean> {
  try {
    return await NfcManager.isEnabled();
  } catch {
    return false;
  }
}

export function cancelNFCScan(): void {
  NfcManager.cancelTechnologyRequest().catch(() => {});
}

// ────────────────────────────────────────────────────────────────────────────
// Read NFC tag
// ────────────────────────────────────────────────────────────────────────────

export async function readNFCTag(): Promise<NFCTagData> {
  try {
    // Try NDEF first (most transit cards support it or ISO 14443-A)
    await NfcManager.requestTechnology([
      NfcTech.NdefFormatable,
      NfcTech.Ndef,
      NfcTech.IsoDep,
      NfcTech.NfcA,
      NfcTech.NfcB,
      NfcTech.NfcV,
    ]);

    const tag: TagEvent = await NfcManager.getTag() as TagEvent;

    const uid = tag.id
      ? byteArrayToHex(tag.id as unknown as number[])
      : 'unknown';

    const techTypes: string[] = tag.techTypes ?? [];

    const ndefRecords: NDEFRecord[] = [];

    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
      for (const record of tag.ndefMessage) {
        const decoded = parseNdefRecord(record);
        ndefRecords.push(decoded);
      }
    }

    const standard = detectStandard(techTypes);

    return {uid, techTypes, ndefRecords, standard};
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function byteArrayToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
}

function parseNdefRecord(record: NdefRecord): NDEFRecord {
  const tnf = record.tnf;
  const type = record.type
    ? String.fromCharCode(...(record.type as unknown as number[]))
    : '';

  let payloadText: string | undefined;
  let payload = '';

  try {
    if (record.payload) {
      const bytes = record.payload as unknown as number[];
      // Text record: TNF=1, type="T"
      if (tnf === 1 && type === 'T') {
        const langLen = bytes[0] & 0x3f;
        payloadText = String.fromCharCode(...bytes.slice(1 + langLen));
      }
      // URI record: TNF=1, type="U"
      else if (tnf === 1 && type === 'U') {
        const prefixes = [
          '', 'http://www.', 'https://www.', 'http://', 'https://',
          'tel:', 'mailto:', 'ftp://anonymous:anonymous@', 'ftp://ftp.',
          'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://', 'dav://',
          'news:', 'telnet://', 'imap:', 'rtsp://', 'urn:', 'pop:',
          'sip:', 'sips:', 'tftp:', 'btspp://', 'btl2cap://', 'btgoep://',
          'tcpobex://', 'irdaobex://', 'file://', 'urn:epc:id:',
          'urn:epc:tag:', 'urn:epc:pat:', 'urn:epc:raw:', 'urn:epc:',
          'urn:nfc:',
        ];
        const prefix = prefixes[bytes[0]] || '';
        payloadText = prefix + String.fromCharCode(...bytes.slice(1));
      } else {
        payloadText = String.fromCharCode(...bytes);
      }
      payload = Buffer.from(bytes).toString('base64');
    }
  } catch {
    // ignore decode errors
  }

  return {tnf, type, id: '', payload, payloadText};
}

function detectStandard(techTypes: string[]): string {
  if (techTypes.some(t => t.includes('IsoDep'))) return 'ISO 14443-4';
  if (techTypes.some(t => t.includes('NfcA'))) return 'ISO 14443-A';
  if (techTypes.some(t => t.includes('NfcB'))) return 'ISO 14443-B';
  if (techTypes.some(t => t.includes('NfcV'))) return 'ISO 15693';
  if (techTypes.some(t => t.includes('Ndef'))) return 'NDEF';
  return 'Unknown';
}
