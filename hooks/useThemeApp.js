
import { useContext } from 'react';import { ThemeContext, THEME_COLORS } from '../components/Theme';

export const useAppTheme = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return {
    colors,      
    isDark,     
    theme,       
    toggleTheme,
  };
};