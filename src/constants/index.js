import { Platform } from 'react-native';

// ─── API ────────────────────────────────────────────────────────────────────
// UPDATE THIS to match your backend server address:
//   Android Emulator  → 10.0.2.2:5001
//   iOS Simulator     → localhost:5001
//   Physical device   → your machine's LAN IP, e.g. 192.168.1.100:5001
export const API_BASE_URL = 'http://10.0.2.2:5001/api';

// ─── Storage keys ────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  CART: 'adiyogi_cart',
  ADMIN_TOKEN: 'adiyogi_admin_token',
};

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
export const GST_RATES = [0, 5, 12, 18, 28];
export const BASE_UNITS = ['PAC', 'NOS'];

// ─── Pagination ───────────────────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 12;

// ─── Brand colours ────────────────────────────────────────────────────────────
export const COLORS = {
  navy: '#1B3A6B',
  navyDark: '#0F2040',
  navyLight: '#2A4F8F',
  navyBg: '#E8EDF5',
  champagne: '#C9A84C',
  champagneLight: '#D4B96A',
  champagneDark: '#A88730',
  ivory: '#F7F4EF',
  white: '#FFFFFF',
  black: '#000000',
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
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONTS = {
  display: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  body: Platform.select({ ios: undefined, android: 'Roboto', default: undefined }),
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ─── Indian states ───────────────────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Puducherry', 'Chandigarh', 'Other',
];
