export const Colors = {
  primary: '#003366',
  accent: '#C8960C',
  success: '#1A6B3C',
  danger: '#8B0000',

  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F5F7FA',
  backgroundCard: '#FFFFFF',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B7B',

  border: '#E2E4E9',

  supportMilitaryBlue: '#D6E4F0',
  supportGoldLight: '#FEF9EC',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  buyerVeteran: '#003366',
  buyerVeteranLight: '#D6E4F0',
  buyerFirstTime: '#0D7377',
  buyerFirstTimeLight: '#D1F0EF',
  buyerRelocation: '#B45309',
  buyerRelocationLight: '#FEF3C7',
  buyerSenior: '#B45069',
  buyerSeniorLight: '#FEE2E2',

  statusNotStarted: '#6B6B7B',
  statusInProgress: '#003366',
  statusComplete: '#1A6B3C',
  statusNeedsAttention: '#8B0000',

  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export type ColorKey = keyof typeof Colors;
