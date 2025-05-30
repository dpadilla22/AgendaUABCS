import { useState, useEffect } from "react";
import { StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Image, ActivityIndicator, Animated, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Dimensions } from "react-native";
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
};

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const formOpacity = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
  
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos requeridos',
        text2: 'Por favor ingresa usuario y contraseña',
      });
      return;
    }

    handleButtonPress();
    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch('https://feae-200-92-221-53.ngrok-free.app/login', {
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

      
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.navigate('Home', { user: data.user });
        });
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
          <View style={{ height: RNStatusBar.currentHeight, backgroundColor: COLORS.primary }} />

    
          <Animated.View 
            style={[
              styles.imageSection,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            {<Image 
              source={require('../assets/uabcs.jpg')}
              style={styles.logo} 
              resizeMode="contain" 
            /> }
            
          
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
          </Animated.View>

          <Animated.View 
            style={[
              styles.formSection,
              { 
                opacity: formOpacity,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.formContainer}>
             
              
              
           
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

             
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
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
                      <ActivityIndicator size="small" color={COLORS.white} />
                      <Text style={styles.buttonTextLoading}>Cargando...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Iniciar sesión</Text>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.primary} style={styles.buttonIcon} />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              
              <TouchableOpacity style={styles.helpContainer}>
                <Text style={styles.helpText}>¿Problemas para ingresar?</Text>
              </TouchableOpacity>
              
           
              
            </View>
          </Animated.View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  imageSection: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
  },
  logo: {
    width: 550,
    height: 500,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    left: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 20,
    right: -20,
  },
  formSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 25,
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
    backgroundColor: COLORS.white,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
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
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextLoading: {
    color: COLORS.white,
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
  helpContainer: {
    alignItems: 'center',
    marginTop: 25,
    paddingVertical: 5,
  },
  helpText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  securityText: {
    color: COLORS.darkGray,
    fontSize: 12,
    marginLeft: 5,
  },
});

export default LoginScreen;