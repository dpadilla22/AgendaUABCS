import { useAppTheme } from '../../hooks/useThemeApp';
import { ThemeContext } from '../../components/Theme';


jest.mock('../../components/Theme', () => {
  const React = require('react');
  const mockContext = React.createContext({
    theme: 'light',
    toggleTheme: jest.fn(),
  });
  
  return {
    ThemeContext: mockContext,
    THEME_COLORS: {
      light: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '#007AFF',
        cardBg: '#F5F5F5',
      },
      dark: {
        background: '#000000',
        text: '#FFFFFF',
        primary: '#0A84FF',
        cardBg: '#1F1F1F',
      },
    },
  };
});

describe('useAppTheme Hook - Tests Básicos', () => {
  

  test('debe existir la función useAppTheme', () => {
    expect(useAppTheme).toBeDefined();
    expect(typeof useAppTheme).toBe('function');
  });


  test('useAppTheme debe ser un hook válido', () => {
  
    expect(typeof useAppTheme).toBe('function');
    

    expect(useAppTheme.name).toMatch(/use/i);
  });


  test('ThemeContext debe estar definido', () => {
    expect(ThemeContext).toBeDefined();
  });
});