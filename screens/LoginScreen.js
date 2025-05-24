import { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Image } from "react-native"; 
import Toast from 'react-native-toast-message';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
  if (!username || !password) {
    alert('Por favor ingresa usuario y contraseña');
    return;
  }

  setLoading(true);

  // try {
  //   const response = await fetch('http://localhost:3000/login', {  
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       identifierUser: username,
  //       passwordUser: password
  //     })
  //   });

   try {
     const response = await fetch('https://60e0-2806-265-5402-ca4-c061-200d-5b0b-6fc4.ngrok-free.app/login', {  
       method: 'POST',
       headers: {
        'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         identifierUser: username,
         passwordUser: password
       })
     });

    // try {
    // const response = await fetch('https://mysql-production-a850.up.railway.app/login', {  
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     identifierUser: username,
    //     passwordUser: password
    //   })
    // });

   const data = await response.json();

    if (response.ok) {

      

      Toast.show({
        type: 'success',
        text1: '¡Bienvenido!',
        text2: `Hola de nuevo, ${data.user.name} `,
      });
      navigation.navigate('Home', { user: data.user });
      
  console.log('idAccount guardado:', idAccount);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error de acceso',
        text2: data.message || 'Credenciales incorrectas',
      });
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error de red',
      text2: 'No se pudo conectar al servidor',
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blueSection}>
        <Image source={require('../assets/uabcs.jpg')} style={styles.people} resizeMode="contain" />
      </View>

      <View style={styles.whiteSection}>
        <View style={styles.formContainer}>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                // placeholder="Ingresa tu contraseña"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              </TouchableOpacity>
            </View>
          </View>

         <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
  <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Iniciar sesión'}</Text>
</TouchableOpacity>


          <TouchableOpacity>
            <Text style={styles.helpText}>¿Problemas para ingresar?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  blueSection: {
    height: 220,
    justifyContent: "center",
    alignItems: "center"
  },
  people: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333", 
    marginBottom: 20,
    textAlign: "center",
  },
  whiteSection: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
  },
  formContainer: {
    width: "90%",
    alignSelf: "center",
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "white",
  },
  inputIcon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#003366",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  helpText: {
    color: "#000000",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});

export default LoginScreen;
