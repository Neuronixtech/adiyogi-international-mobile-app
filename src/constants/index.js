import { Platform } from 'react-native'

// ─── API ────────────────────────────────────────────────────────────────────
export const API_BASE_URL = 'http://10.85.71.237:5001/api'

// ─── Storage keys ────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  CART: 'adiyogi_cart',
  ADMIN_TOKEN: 'adiyogi_admin_token',
}

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
export const GST_RATES = [0, 5, 12, 18, 28]
export const BASE_UNITS = ['PAC', 'NOS']

// ─── Pagination ───────────────────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 12

// ─── Brand colours ────────────────────────────────────────────────────────────
export const COLORS = {
  navy: '#1B3A6B',
  navyDark: '#0F2040',
  navyLight: '#2A4F8F',
  navyBg: '#E8EDF5',
  champagne: '#C9A84C',
  champagneLight: '#E8C86A',
  champagneDark: '#A88730',
  champagneMuted: '#f0d98a',
  ivory: '#F7F4EF',
  white: '#FFFFFF',
  black: '#000000',
  bodyText: '#1A1A2E',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  green: '#22C55E',
  greenLight: '#DCFCE7',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  red: '#EF4444',
  whatsapp: '#25D366',
  whatsappDark: '#128C7E',
  // Semantic status
  statusPendingBg: '#FEF9C3',
  statusPendingText: '#854D0E',
  statusConfirmedBg: '#DBEAFE',
  statusConfirmedText: '#1D4ED8',
  statusShippedBg: '#F3E8FF',
  statusShippedText: '#6D28D9',
  statusDeliveredBg: '#ECFDF5',
  statusDeliveredText: '#047857',
  statusCancelledBg: '#FEE2E2',
  statusCancelledText: '#DC2626',
}

// ─── Typography ───────────────────────────────────────────────────────────────
// Playfair Display (serif) → headings, display, brand name, prices
// DM Sans (sans-serif)     → body text, UI elements, buttons
// JetBrains Mono (mono)    → codes, identifiers, OTP
export const FONTS = {
  display: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  body: Platform.select({ ios: undefined, android: 'Roboto', default: undefined }),
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
}

// Font weight tokens
export const FONT_WEIGHTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
}

// Font size scale
export const FONT_SIZES = {
  micro: 8,
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  heroSm: 30,
  heroMd: 36,
  heroLg: 48,
  heroXl: 60,
}

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  sectionSm: 40,
  sectionMd: 48,
  sectionLg: 64,
}

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  micro: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
}

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 8,
  },
  xl2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
}

// ─── Indian states ───────────────────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Chandigarh', 'Other',
]
