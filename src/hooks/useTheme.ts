import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const system = () => matchMedia('(prefers-color-scheme: dark)');

const readStored = (): Theme | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
};

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f0e0c' : '#f3f0ea');
}

/** The current theme, kept in sync with the system until the visitor picks one. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));

  useEffect(() => {
    const media = system();
    const onChange = () => {
      if (readStored()) return;
      const next = media.matches ? 'dark' : 'light';
      apply(next);
      setTheme(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const choose = useCallback((next: Theme) => {
    apply(next);
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode: the choice simply won't persist.
    }
  }, []);

  return [theme, choose] as const;
}
