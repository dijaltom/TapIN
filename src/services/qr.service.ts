import {MetroKey} from '../theme/colors';
import {QRTicketData} from '../types/pass.types';

// ────────────────────────────────────────────────────────────────────────────
// Metro pattern matchers
// ────────────────────────────────────────────────────────────────────────────

interface MetroPattern {
  key: MetroKey;
  patterns: RegExp[];
  parse: (raw: string) => Record<string, string>;
}

const METRO_PATTERNS: MetroPattern[] = [
  {
    key: 'dmrc',
    patterns: [
      /DMRC/i,
      /DELHI.*METRO/i,
      /^DL[0-9A-Z]+/i,
    ],
    parse: (raw) => parseDMRC(raw),
  },
  {
    key: 'bmrc',
    patterns: [
      /BMRC/i,
      /NAMMA.*METRO/i,
      /BENGALURU.*METRO/i,
      /^BLR[0-9A-Z]+/i,
    ],
    parse: (raw) => parseGeneric(raw, 'Namma Metro'),
  },
  {
    key: 'mmrc',
    patterns: [
      /MMRC/i,
      /MUMBAI.*METRO/i,
      /^MUM[0-9A-Z]+/i,
    ],
    parse: (raw) => parseGeneric(raw, 'Mumbai Metro'),
  },
  {
    key: 'hmr',
    patterns: [
      /HMRL/i,
      /HYDERABAD.*METRO/i,
      /^HYD[0-9A-Z]+/i,
    ],
    parse: (raw) => parseGeneric(raw, 'Hyderabad Metro'),
  },
  {
    key: 'cmrl',
    patterns: [
      /CMRL/i,
      /CHENNAI.*METRO/i,
      /^CHN[0-9A-Z]+/i,
    ],
    parse: (raw) => parseGeneric(raw, 'Chennai Metro'),
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Main decode function
// ────────────────────────────────────────────────────────────────────────────

export function decodeQR(raw: string): QRTicketData {
  const trimmed = raw.trim();

  for (const metro of METRO_PATTERNS) {
    if (metro.patterns.some(p => p.test(trimmed))) {
      return {
        raw: trimmed,
        metroKey: metro.key,
        fields: metro.parse(trimmed),
        isTransit: true,
      };
    }
  }

  // Fallback: check if it looks like a transit ticket at all
  const isTransit = /ticket|metro|pass|journey|valid|station/i.test(trimmed);

  return {
    raw: trimmed,
    metroKey: 'generic',
    fields: {
      Content: trimmed.length > 60 ? trimmed.slice(0, 60) + '...' : trimmed,
    },
    isTransit,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// DMRC specific parser
// ────────────────────────────────────────────────────────────────────────────

function parseDMRC(raw: string): Record<string, string> {
  const fields: Record<string, string> = {};

  // Try JSON first
  try {
    const obj = JSON.parse(raw);
    if (obj.src || obj.dst || obj.from || obj.to) {
      if (obj.src || obj.from) fields['From'] = obj.src || obj.from;
      if (obj.dst || obj.to) fields['To'] = obj.dst || obj.to;
      if (obj.date) fields['Date'] = obj.date;
      if (obj.valid) fields['Valid Till'] = obj.valid;
      if (obj.tid || obj.id) fields['Ticket ID'] = obj.tid || obj.id;
      if (obj.fare || obj.amount) fields['Fare'] = `₹${obj.fare || obj.amount}`;
      return fields;
    }
  } catch {
    // not JSON
  }

  // Try pipe-separated or comma-separated
  const parts = raw.includes('|') ? raw.split('|') : raw.split(',');
  if (parts.length >= 3) {
    const labels = ['Ticket ID', 'From', 'To', 'Date', 'Fare', 'Valid Till'];
    parts.slice(0, 6).forEach((p, i) => {
      if (p.trim()) fields[labels[i] || `Field ${i + 1}`] = p.trim();
    });
    return fields;
  }

  return {Content: raw};
}

function parseGeneric(raw: string, name: string): Record<string, string> {
  const fields: Record<string, string> = {'Metro': name};
  try {
    const obj = JSON.parse(raw);
    Object.entries(obj).forEach(([k, v]) => {
      fields[k] = String(v);
    });
    return fields;
  } catch {}

  fields['Ticket Data'] = raw.length > 80 ? raw.slice(0, 80) + '...' : raw;
  return fields;
}

// ────────────────────────────────────────────────────────────────────────────
// Pretty name helper
// ────────────────────────────────────────────────────────────────────────────

export function getDefaultPassName(data: QRTicketData): string {
  if (data.fields['From'] && data.fields['To']) {
    return `${data.fields['From']} → ${data.fields['To']}`;
  }
  if (data.fields['Ticket ID']) {
    return `Ticket #${data.fields['Ticket ID']}`;
  }
  return 'Metro Ticket';
}
