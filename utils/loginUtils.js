import AsyncStorage from '@react-native-async-storage/async-storage';

export const validateForm = (username, password) => {
  let isValid = true;
  const errors = {
    username: '',
    password: '',
  };

  if (!username.trim()) {
    errors.username = 'El usuario es requerido';
    isValid = false;
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
    isValid = false;
  }

  return { isValid, errors };
};

export const isAdminUser = (username, password) => {
  return username.trim() === 'admin_22' && password === 'admin123';
};

export const handleUserLogin = async (username, password, API_URL) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifierUser: username.trim(),
        passwordUser: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar datos en AsyncStorage
      await AsyncStorage.setItem('accountId', data.user.idAccount.toString());
      await AsyncStorage.setItem('userName', data.user.email);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        message: `¡Bienvenido! ${data.user.name}`
      };
    } else {
      return {
        success: false,
        error: data.message || 'Credenciales incorrectas'
      };
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    return {
      success: false,
      error: 'No se pudo conectar al servidor'
    };
  }
};

export const handleAdminLogin = async () => {
  return {
    success: true,
    isAdmin: true,
    message: '¡Bienvenido Administrador!',
    screen: 'AdminDashboard'
  };
};