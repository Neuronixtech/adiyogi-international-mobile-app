import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

let adminToken = null;

api.interceptors.request.use(async (config) => {
  if (!adminToken) {
    try {
      adminToken = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    } catch {}
  }
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export function setAdminToken(token) {
  adminToken = token;
  if (token) {
    AsyncStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token).catch(() => {});
  } else {
    AsyncStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN).catch(() => {});
  }
}

export function getAdminToken() {
  return adminToken;
}

export default api;
