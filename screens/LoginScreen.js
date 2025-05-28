import { useState } from "react";
import { StatusBar as RNStatusBar} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Image, ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';


const COLORS = {
  primary: "#003366",
  secondary: "#4dabf7",
  white: "#FFFFFF",
  gray: "#F5F5F5",
  darkGray: "#666666",
  lightGray: "#E0E0E0",
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

    try {
  const response = await fetch('https://c492-2806-265-5402-ca4-bdc6-786b-c72a-17ee.ngrok-free.app/login', {
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
      text2: `Hola de nuevo, ${data.user.name}`,
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
    <SafeAreaView style={styles.container}>
    <StatusBar style="light" />
    <View style={{ height: RNStatusBar.currentHeight, backgroundColor: COLORS.primary }} />

      <View style={styles.imageSection}>
        <Image 
          source={require('../assets/uabcs.jpg')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>

      <View style={styles.formSection}>
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

        
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.buttonText}>Cargando...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

         
          <TouchableOpacity style={styles.helpContainer}>
            <Text style={styles.helpText}>¿Problemas para ingresar?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  },
  logo: {
    width: 550,
    height: 500,
  },

  formSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
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
  backgroundColor: 'white',
  borderRadius: 15,
  paddingVertical: 15,
  alignItems: 'center',
  borderWidth: 2,
  borderColor: COLORS.darkBlue,
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 20, 
  },

  loginButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  buttonText: {
  color: COLORS.darkBlue, 
  fontSize: 16,
  fontWeight: 'bold',
},

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  helpContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  helpText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;