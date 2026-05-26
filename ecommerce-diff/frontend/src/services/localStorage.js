const safeRun = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const localStorageService = {
  get(key) {
    return safeRun(() => {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    });
  },
  set(key, value) {
    safeRun(() =>
      window.localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ),
    );
  },
  remove(key) {
    safeRun(() => window.localStorage.removeItem(key));
  },
  clear() {
    safeRun(() => window.localStorage.clear());
  },
};
