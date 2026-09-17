export const Colors = {
  // Background layers
  bg: {
    primary: '#0A0A0F',
    secondary: '#111118',
    card: '#16161F',
    elevated: '#1C1C28',
    glass: 'rgba(255,255,255,0.06)',
    glassStrong: 'rgba(255,255,255,0.10)',
  },

  // Brand accent
  accent: {
    primary: '#7C5CFC',   // electric violet
    secondary: '#5B8FF9', // sky blue
    glow: 'rgba(124,92,252,0.35)',
    glowBlue: 'rgba(91,143,249,0.30)',
  },

  // Metro brands
  metro: {
    dmrc: {
      primary: '#E63946',
      secondary: '#C1121F',
      gradient: ['#E63946', '#C1121F'],
      text: '#FFFFFF',
      label: 'Delhi Metro',
    },
    bmrc: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      gradient: ['#3B82F6', '#1D4ED8'],
      text: '#FFFFFF',
      label: 'Namma Metro',
    },
    mmrc: {
      primary: '#F77F00',
      secondary: '#D62828',
      gradient: ['#F77F00', '#D62828'],
      text: '#FFFFFF',
      label: 'Mumbai Metro',
    },
    hmr: {
      primary: '#16A34A',
      secondary: '#15803D',
      gradient: ['#22C55E', '#15803D'],
      text: '#FFFFFF',
      label: 'Hyderabad Metro',
    },
    cmrl: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      gradient: ['#8B5CF6', '#6D28D9'],
      text: '#FFFFFF',
      label: 'Chennai Metro',
    },
    generic: {
      primary: '#7C5CFC',
      secondary: '#5B8FF9',
      gradient: ['#7C5CFC', '#5B8FF9'],
      text: '#FFFFFF',
      label: 'Transit Pass',
    },
  },

  // Text
  text: {
    primary: '#F8F8FF',
    secondary: 'rgba(248,248,255,0.65)',
    tertiary: 'rgba(248,248,255,0.38)',
    inverse: '#0A0A0F',
  },

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: {
    subtle: 'rgba(255,255,255,0.07)',
    medium: 'rgba(255,255,255,0.12)',
    strong: 'rgba(255,255,255,0.20)',
  },

  // Transparent
  transparent: 'transparent',
};

export type MetroKey = keyof typeof Colors.metro;
