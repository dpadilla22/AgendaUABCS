import { useState } from "react";
import { StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Image, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Dimensions } from "react-native";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: "#003366",
  secondary: "#4dabf7",
  accent: "#f4e153", 
  white: "#FFFFFF",
  gray: "#F5F5F5",
  darkGray: "#666666",
  lightGray: "#E0E0E0",
  error: "#FF3B30",
  success: "#34C759",
  darkBlue: "#003366",
  lightBlue: "#7BBFFF",
  cream: "#F5F5DC",
  black: "#000000",
};

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos requeridos',
        text2: 'Por favor ingresa usuario y contraseña',
      });
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch('https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifierUser: username.trim(),
          passwordUser: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Usuario recibido:", data.user); 
        await AsyncStorage.setItem('accountId', data.user.idAccount.toString()); 
        console.log("ID guardado:", data.user.idAccount); 

        Toast.show({
          type: 'success',
          text1: '¡Bienvenido!',
          text2: `Alumno, ${data.user.name}`,
        });

        navigation.navigate('Home', { user: data.user });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error de acceso',
          text2: data.message || 'Credenciales incorrectas',
        });
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      Toast.show({
        type: 'error',
        text1: 'Error de conexión',
        text2: 'No se pudo conectar al servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* Sección del logo - ahora con fondo blanco */}
          <View style={styles.imageSection}>
            <Image 
              source={require('../assets/uabcs.jpg')}
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>

          {/* Formulario */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              {/* Campo Usuario */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Usuario</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu usuario"
                    placeholderTextColor={COLORS.darkGray}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                  />
                </View>
              </View>

              {/* Campo Contraseña */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor={COLORS.darkGray}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={COLORS.darkGray} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botón de Login */}
              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  loading && styles.loginButtonDisabled
                ]} 
                onPress={handleLogin} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.black} />
                    <Text style={styles.buttonTextLoading}>Cargando...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.black} style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageSection: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: 40,
  },
  logo: {
    width: 450,
    height: 400,
  },
  formSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 30,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.primary,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: COLORS.cream,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cream,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextLoading: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen;