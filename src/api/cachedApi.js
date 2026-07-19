import api from './client';
import { setCache, getCache, buildKey, getDefaultTTL } from './cache';

export async function cachedGet(url, params = {}, opts = {}) {
  const { skipCache = false, ttlSeconds } = opts;

  if (!skipCache) {
    const key = buildKey(url, params);
    const cached = getCache(key);
    if (cached) return cached;
  }

  const response = await api.get(url, { params });
  const data = response.data;

  if (!skipCache) {
    const ttl = ttlSeconds || getDefaultTTL(url);
    setCache(buildKey(url, params), data, ttl);
  }

  return data;
}

export function clearCachedPrefix(prefix) {
  const { clearCache } = require('./cache');
  clearCache(prefix);
}
