import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error cargando tema:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


export const THEME_COLORS = {
  light: {
    background: '#f9fafb',
    cardBg: '#ffffff',
    headerBg: '#F5F5DC',
    navBg: '#fcfbf8',
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#94a3b8',
    border: '#ddd',
    divider: '#e5e7eb',
    profileGradient: ['#7AB3D1', '#7AB3D1'],
    cardGradient: ['#ffffff', '#f8fafc'],
    emptyStateGradient: ['#dbeafe', '#e0e7ff'],
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    buttonPrimary: '#3b82f6',
    buttonSecondary: '#6b7280',
    inputBg: '#f3f4f6',
    shadowColor: '#000',
  },
  dark: {
    background: '#0f172a',
    cardBg: '#1e293b',
    headerBg: '#1e293b',
    navBg: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    border: '#334155',
    divider: '#334155',
    profileGradient: ['#334155', '#475569'],
    cardGradient: ['#1e293b', '#334155'],
    emptyStateGradient: ['#1e293b', '#334155'],
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    buttonPrimary: '#3b82f6',
    buttonSecondary: '#475569',
    inputBg: '#334155',
    shadowColor: '#000',
  }
};
