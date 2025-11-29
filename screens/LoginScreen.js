// screens/LoginScreen.js
import { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator,
  Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Dimensions, Animated, ImageBackground
} from "react-native"
import Toast from "react-native-toast-message"
import { useAppTheme } from "../hooks/useThemeApp"
import { validateForm, isAdminUser, handleUserLogin, handleAdminLogin } from '../utils/loginUtils'

const { width, height } = Dimensions.get("window")

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
  textPrimary: "#003366",
  textSecondary: "#666666",
  borderColor: "#E8E8E8",
  black: "#000000",
}

const API_URL = "https://agendauabcs.up.railway.app"

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")
  const { colors, isDark } = useAppTheme()

  const [scaleAnim] = useState(new Animated.Value(0.95))

  const handleUsernameChange = (text) => {
    setUsername(text)
    if (usernameError) setUsernameError("")
    if (generalError) setGeneralError("")
  }

  const handlePasswordChange = (text) => {
    setPassword(text)
    if (passwordError) setPasswordError("")
    if (generalError) setGeneralError("")
  }

  const handleLogin = async () => {
    const validation = validateForm(username, password)
    if (!validation.isValid) {
      setUsernameError(validation.errors.username)
      setPasswordError(validation.errors.password)
      return
    }

    setLoading(true)
    Keyboard.dismiss()
    setGeneralError("")

    try {
      // Verificar si es admin
      if (isAdminUser(username, password)) {
        const adminResult = await handleAdminLogin()
        
        Toast.show({
          type: "success",
          text1: adminResult.message,
          text2: "Acceso al panel de administración",
        })
        navigation.navigate(adminResult.screen)
        setLoading(false)
        return
      }

      // Login de usuario normal
      const userResult = await handleUserLogin(username, password, API_URL)
      
      if (userResult.success) {
        Toast.show({
          type: "success",
          text1: "¡Bienvenido!",
          text2: userResult.message,
        })
        navigation.navigate("Home", { user: userResult.user })
      } else {
        setGeneralError(userResult.error)
      }
    } catch (error) {
      console.error("Error en login:", error)
      setGeneralError("Error inesperado en el login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground source={require("../assets/uabcs.jpg")} style={styles.backgroundImage} resizeMode="cover">
          <View style={styles.centerContainer}>
            <StatusBar backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} translucent />

            <Animated.View
              style={[
                styles.formWrapper,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.formSection}>
                {/* Error banner */}
                {generalError ? (
                  <View style={[styles.errorContainer, { backgroundColor: "#FFEBEE" }]}>
                    <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} style={styles.errorIcon} />
                    <Text style={styles.errorMessage}>{generalError}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Usuario</Text>
                  <View style={[styles.inputContainer, usernameError && styles.inputContainerError]}>
                    <Ionicons name="person-outline" size={20} color={usernameError ? COLORS.error : COLORS.secondary} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ingresa tu usuario"
                      placeholderTextColor={COLORS.darkGray}
                      value={username}
                      onChangeText={handleUsernameChange}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                  {usernameError ? <Text style={styles.fieldError}>{usernameError}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={passwordError ? COLORS.error : COLORS.secondary}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor={COLORS.darkGray}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={handlePasswordChange}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={COLORS.secondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={styles.loadingContent}>
                      <ActivityIndicator size="small" color={COLORS.white} />
                      <Text style={styles.loadingText}>Iniciando sesión...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.buttonText}>Iniciar sesión</Text>
                      <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={styles.buttonIcon} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

// Los estilos se mantienen igual...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  formWrapper: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  formSection: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorMessage: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 10,
    backgroundColor: COLORS.gray,
    paddingHorizontal: 14,
    height: 48,
  },
  inputContainerError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
    backgroundColor: "#FFF5F5",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    marginLeft: 10,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#09042aff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
})

export default LoginScreen