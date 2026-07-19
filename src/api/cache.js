const store = new Map();

const DEFAULTS = {
  collections: 600,
  products: 300,
};

export function setCache(key, data, ttlSeconds = 300) {
  store.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function clearCache(keyPrefix = null) {
  if (keyPrefix === null) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
    }
  }
}

export function buildKey(url, params = {}) {
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  return sorted ? `${url}?${sorted}` : url;
}

export function getDefaultTTL(url) {
  if (url.includes('collections')) return DEFAULTS.collections;
  if (url.includes('products')) return DEFAULTS.products;
  return 300;
}
