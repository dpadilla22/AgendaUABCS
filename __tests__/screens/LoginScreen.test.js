import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  validateForm,
  isAdminUser,
  handleUserLogin,
  handleAdminLogin
} from '../../utils/loginUtils';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

global.fetch = jest.fn();

describe('Login Utils', () => {
  const API_URL = 'https://agendauabcs.up.railway.app'; 

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateForm', () => {
    it('valida formulario correcto', () => {
      const result = validateForm('usuario123', 'password123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors.username).toBe('');
      expect(result.errors.password).toBe('');
    });

    it('detecta usuario vacío', () => {
      const result = validateForm('', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('El usuario es requerido');
      expect(result.errors.password).toBe('');
    });

    it('detecta contraseña vacía', () => {
      const result = validateForm('usuario123', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('');
      expect(result.errors.password).toBe('La contraseña es requerida');
    });

    it('detecta ambos campos vacíos', () => {
      const result = validateForm('', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('El usuario es requerido');
      expect(result.errors.password).toBe('La contraseña es requerida');
    });

    it('valida usuario con espacios', () => {
      const result = validateForm('  usuario  ', 'password123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors.username).toBe('');
    });
  });

  describe('isAdminUser', () => {
    it('identifica credenciales de admin correctas', () => {
      expect(isAdminUser('admin_22', 'admin123')).toBe(true);
    });

    it('rechaza usuario admin incorrecto', () => {
      expect(isAdminUser('admin_wrong', 'admin123')).toBe(false);
    });

    it('rechaza contraseña admin incorrecta', () => {
      expect(isAdminUser('admin_22', 'wrongpass')).toBe(false);
    });

    it('rechaza credenciales completamente incorrectas', () => {
      expect(isAdminUser('wronguser', 'wrongpass')).toBe(false);
    });

    it('maneja espacios en el usuario admin', () => {
      expect(isAdminUser('  admin_22  ', 'admin123')).toBe(true);
    });
  });

  describe('handleAdminLogin', () => {
    it('retorna datos correctos para admin', async () => {
      const result = await handleAdminLogin();
      
      expect(result.success).toBe(true);
      expect(result.isAdmin).toBe(true);
      expect(result.message).toBe('¡Bienvenido Administrador!');
      expect(result.screen).toBe('AdminDashboard');
    });
  });

  describe('handleUserLogin', () => {
    it('maneja login exitoso de usuario', async () => {
      const mockUser = {
        idAccount: 123,
        email: 'usuario@uabcs.mx',
        name: 'Juan Pérez'
      };

   
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      });

      AsyncStorage.setItem.mockResolvedValue();

      const result = await handleUserLogin('usuario123', 'password123', API_URL);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.message).toBe('¡Bienvenido! Juan Pérez');
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifierUser: 'usuario123',
            passwordUser: 'password123'
          })
        }
      );
    });

    it('maneja credenciales incorrectas', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Credenciales inválidas' })
      });

      const result = await handleUserLogin('wronguser', 'wrongpass', API_URL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales inválidas');
    });

    it('maneja error de conexión', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await handleUserLogin('usuario123', 'password123', API_URL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No se pudo conectar al servidor');
    });

    it('maneja error sin mensaje específico', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      const result = await handleUserLogin('usuario123', 'password123', API_URL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales incorrectas');
    });
  });

  describe('Integración de funciones', () => {
    it('flujo completo de login admin', async () => {
      const validation = validateForm('admin_22', 'admin123');
      expect(validation.isValid).toBe(true);

      const isAdmin = isAdminUser('admin_22', 'admin123');
      expect(isAdmin).toBe(true);

      const adminResult = await handleAdminLogin();
      expect(adminResult.success).toBe(true);
    });

    it('flujo completo de login usuario normal', async () => {
      const validation = validateForm('usuario123', 'password123');
      expect(validation.isValid).toBe(true);

      const isAdmin = isAdminUser('usuario123', 'password123');
      expect(isAdmin).toBe(false);

      const mockUser = {
        idAccount: 1, 
        email: 'test@uabcs.mx', 
        name: 'Test User'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      });

      AsyncStorage.setItem.mockResolvedValue();

      const userResult = await handleUserLogin('usuario123', 'password123', API_URL);
      expect(userResult.success).toBe(true);
    });
  });
});