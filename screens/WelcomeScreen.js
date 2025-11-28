/**
 * WelcomeScreen.js
 * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción: Pantalla de bienvenida con animaciones para el logo y el botón de ingreso.
 * 
 * Manual de Estándares Aplicado:
 * - Nombres de componentes en PascalCase. Ej: WelcomeScreen
 * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress, logoScale
 * - Uso consistente de indentación con 2 espacios.
 * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
 * - Separación clara entre lógica, JSX y estilos.
 * - Nombres descriptivos para funciones, constantes y estilos.
 * - Uso de constantes (`const`) para valores que no cambian.
 */

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';

const { width, height } = Dimensions.get('window');

// Componente principal de la pantalla de bienvenida
const WelcomeScreen = ({ navigation }) => {
  // Animaciones: escala y opacidad del logo
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Animaciones: posición y opacidad del texto
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Animaciones: posición y opacidad del botón
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Animaciones al montar el componente
  useEffect(() => {
    Animated.sequence([
      // Animar aparición y escala del logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Animar texto descriptivo
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Animar botón de ingreso
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Acción cuando se presiona el botón "Ingresar"
  const handleButtonPress = () => {
    // Pequeña animación de rebote al presionar
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navegar a la pantalla de Login
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo animado */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }]
            }
          ]}
        >
          <Image
            source={require('../assets/agendaLogo.png')}
            style={styles.mascotImage}
          />
        </Animated.View>

        {/* Texto descriptivo */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }]
            }
          ]}
        >
          <Text style={styles.mainText}>Encuentra eventos{'\n'}increíbles cerca de ti</Text>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Animated.View>

        {/* Botón de ingreso */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleButtonPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  mascotImage: {
    width: width * 0.8,
    height: height * 0.45,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#09042aff',
    width: 24,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    width: '100%',
    paddingRight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#09042aff',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
});

export default WelcomeScreen;