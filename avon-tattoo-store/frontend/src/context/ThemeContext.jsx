import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { festivalThemes } from '../config/festivalThemes';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState('default');
  const [loading, setLoading] = useState(true);

  const fetchActiveTheme = async () => {
    try {
      const response = await api.get('/settings/theme.php');
      if (response.data && response.data.active_theme) {
        setThemeKey(response.data.active_theme);
      }
    } catch (err) {
      console.warn('Could not fetch active theme setting from server, falling back to default theme:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const updateTheme = async (newThemeKey) => {
    if (!festivalThemes[newThemeKey]) return;
    try {
      setThemeKey(newThemeKey);
      await api.post('/settings/theme.php', { theme: newThemeKey });
      return true;
    } catch (err) {
      console.error('Failed to update active festival theme:', err);
      throw err;
    }
  };

  const currentTheme = festivalThemes[themeKey] || festivalThemes.default;

  return (
    <ThemeContext.Provider
      value={{
        themeKey,
        currentTheme,
        festivalThemes,
        loading,
        setThemeKey,
        updateTheme,
        refreshTheme: fetchActiveTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
