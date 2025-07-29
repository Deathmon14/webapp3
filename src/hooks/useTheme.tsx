import { useEffect } from 'react';

export const useTheme = () => {
  const toggle = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    root.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', saved === 'dark' || (!saved && prefers));
  }, []);

  return { toggle };
};