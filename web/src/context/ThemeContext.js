import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'peanut-theme-preference';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const getSystemPreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Preference is what the user picked: 'system' | 'light' | 'dark'.
const getInitialPreference = () => {
  if (typeof window === 'undefined') return 'system';

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(getInitialPreference);
  const [themeMode, setThemeMode] = useState(() => {
    const initial = getInitialPreference();
    return initial === 'system' ? getSystemPreference() : initial;
  });

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  // Set the user's preference: 'system', 'light', or 'dark'.
  const setTheme = useCallback((mode) => {
    if (mode !== 'system' && mode !== 'light' && mode !== 'dark') return;

    setPreference(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    setThemeMode(mode === 'system' ? getSystemPreference() : mode);
  }, []);

  // Toggle between light and dark (keeps 'system' users on an explicit choice)
  const toggleTheme = useCallback(() => {
    setTheme(themeMode === 'light' ? 'dark' : 'light');
  }, [themeMode, setTheme]);

  // Follow system preference changes while the user is on 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      if (preference === 'system') {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, themeMode, preference, isDark, toggleTheme, setTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
