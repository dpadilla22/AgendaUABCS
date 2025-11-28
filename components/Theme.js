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
    background: '#F4F4F4',
    cardBg: '#FFFFFF',
    headerBg: '#f7f7efff',
    navBg: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#4A5568',
    textTertiary: '#718096',
    border: '#c1dcffff',
    divider: '#E2E8F0',
    
    profileGradient: ['#4A90A4', '#5B9FB8'],
    cardGradient: ['#FFFFFF', '#F7FAFC'],
    emptyStateGradient: ['#EBF8FF', '#E6FFFA'],
    
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    info: '#4299E1',
    
    buttonPrimary: '#281f5fff',
    buttonSecondary:'#281f5fff',
    inputBg: '#F7FAFC',
    shadowColor: '#000',
    drawerBg: '#FFFFFF',
    drawerActiveBg: '#FFF7A3',
    drawerActiveText: '#4A96BD',
    drawerInactiveText: '#000000',
  },

  dark: {
    background: '#1f2a3fff',
    cardBg: '#222c41ff',
    headerBg: '#212d44ff',
    navBg: '#1A202C',
    text: '#F7FAFC',
    textSecondary: '#fbfbd9ff',
    textTertiary: '#A0AEC0',
    border: '#2D3748',
    divider: '#2D3748',
    
    profileGradient: ['#1A202C', '#2D3748'],
    cardGradient: ['#282d37ff', '#2D3748'],
    emptyStateGradient: ['#002244', '#1A365D'],
    
    success: '#48BB78',
    warning: '#ED8936',
    error: '#FC8181',
    info: '#63B3ED',
    
    buttonSecondary: '#09042aff',
    inputBg: '#2D3748',
    buttonPrimary: '#300262ff',
    shadowColor: '#000',
     drawerBg: '#1A202C',
    drawerActiveBg: '#3B82F6',
    drawerActiveText: '#FFFFFF',
    drawerInactiveText: '#AAAAAA',
  },

 

};
