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

  // Animaciones: posición y opacidad del botón
  const buttonTranslateY = useRef(new Animated.Value(50)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Animación: opacidad de las secciones principales
  const sectionsOpacity = useRef(new Animated.Value(0)).current;

  // Animaciones al montar el componente
  useEffect(() => {
    Animated.sequence([
      // Mostrar secciones
      Animated.timing(sectionsOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Animar aparición y escala del logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
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
      {/* Sección superior con fondo de color y overlay */}
      <Animated.View style={[styles.topSection, { opacity: sectionsOpacity }]}>
        <View style={styles.gradientOverlay} />
      </Animated.View>

      {/* Sección inferior con botón y texto */}
      <Animated.View style={[styles.bottomSection, { opacity: sectionsOpacity }]}>
        <Animated.View 
          style={[
            styles.welcomeTextContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }]
            }
          ]}
        >
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
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
            <Text style={styles.buttonText}>Ingresar</Text>
            <View style={styles.buttonGlow} />
          </TouchableOpacity>
        </Animated.View>

       
        <Animated.View 
          style={[
            styles.decorativeElements,
            { opacity: buttonOpacity }
          ]}
        >
         
        </Animated.View>
      </Animated.View>

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
        <View style={styles.logoShadow} />
        <Image
          source={require('../assets/agendaLogo.png')}
          style={styles.mascotImage}
        />
      </Animated.View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

// Estilos generales del componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efdcbd',
  },
  topSection: {
    height: '50%',
    backgroundColor: '#efdcbd',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(244, 225, 83, 0.1)',
  },
  bottomSection: {
    height: '65%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 180,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  logoContainer: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    zIndex: 10,
  },
  logoShadow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 150,
    zIndex: -1,
  },
  mascotImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#003366',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#F5F5DC',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 25,
    width: '80%',
    position: 'relative',
    shadowColor: '#003366',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
  },
  buttonText: {
    color: '#003366',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  decorativeElements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default WelcomeScreen;
