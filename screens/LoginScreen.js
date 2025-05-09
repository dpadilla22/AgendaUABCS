import { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Image } from "react-native"; 

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
                // placeholder="Ingresa tu usuario"
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

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
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
