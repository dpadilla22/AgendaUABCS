/**
 * profile.js
 * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción:Pantalla de perfil de usuario que muestra eventos favoritos y de asistencia con navegación por pestañas.
 * 
 * Manual de Estándares Aplicado:
 * - Nombres de componentes en PascalCase. Ej: WelcomeScreen
 * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress, logoScale
 * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
 * - Separación clara entre lógica, JSX y estilos.
 * - Nombres descriptivos para funciones, constantes y estilos.
 * - Uso de constantes (`const`) para valores que no cambian.
 * -Constantes globales en UPPER_SNAKE_CASE. Ej: COLORS, API_URL
 * - Funciones auxiliares antes de useEffect
 * - Manejo consistente de errores con try-catch
 * - Uso de async/await para operaciones asíncronas
 */
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; 
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constante de colores del tema - UPPER_SNAKE_CASE para constantes globales
const COLORS = {
  darkBlue: "#003366",
  lightBlue: "#7AB3D1",
  accent: "#4A90E2",
  yellow: "#FFF7A3",
  green: "#E6FFE6",
  orange: "#FFEBCD",
  red: "#FFE4E1",
  gray: "#F5F5F5",
  textDark: "#333333",
  textLight: "#666666",
  primary: "#2563eb",
  secondary: "#3b82f6",
  cardBg: "#ffffff",
  shadowColor: "#000",
  gradientStart: "#f59e0b",
  gradientEnd: "#fbbf24",
  profileBg: "#f8fafc",
  cream: "#F5F5DC",
  deepBlue: "#1e3a8a",
  softBlue: "#dbeafe",
  warmGray: "#f9fafb",
  accentOrange: "#fb923c",
  lightPurple: "#e0e7ff",
  darkGray: "#374151",
};

// URL de la API - Constante global en UPPER_SNAKE_CASE
const API_URL = 'https://agendauabcs.up.railway.app';

// Componente principal - PascalCase para nombres de componentes
const Profile = ({ navigation }) => {
 
  const [accountId, setAccountId] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('favorites'); 

  // Función auxiliar para obtener hora - camelCase para funciones
  const getHour = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Función auxiliar para formatear fecha - camelCase para funciones
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(`${year}-${month}-${day}T12:00:00`);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // useEffect para obtener email del usuario - Operación asíncrona al cargar componente
  useEffect(() => {
    const getEmail = async () => {
      try {
        // Intenta obtener email de AsyncStorage
        let email = await AsyncStorage.getItem('userName');
        
        // Si no existe, busca en userData
        if (!email) {
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            email = user.email;
          }
        }
        
        setUserEmail(email || '');
      } catch (error) {
        console.error("Error obteniendo email:", error);
      }
    };
    getEmail();
  }, []);

  // useEffect principal para cargar datos del perfil
  useEffect(() => {
    const fetchAccountIdAndFavorites = async () => {
      try {
        const id = await AsyncStorage.getItem("accountId");
        if (id) {
          setAccountId(id);
          await fetchFavoritesAndAttendance(id);
        } else {
          console.log("No accountId found");
        }
      } catch (error) {
        console.error("Error obteniendo accountId:", error);
        Alert.alert("Error", "No se pudo cargar la información del perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchAccountIdAndFavorites();
  }, []);

  // Función principal para obtener favoritos y asistencia - camelCase para función
  const fetchFavoritesAndAttendance = async (id) => {
    try {
      // Petición para obtener todos los eventos
      const eventsResponse = await fetch(
        `${API_URL}/events`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      
      if (!eventsResponse.ok) {
        throw new Error(`HTTP error! status: ${eventsResponse.status}`);
      }
      
      const eventsData = await eventsResponse.json();

      // Petición para obtener eventos favoritos
      const favResponse = await fetch(
        `${API_URL}/favorites/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      
      if (!favResponse.ok) {
        throw new Error(`HTTP error! status: ${favResponse.status}`);
      }
      
      const favData = await favResponse.json();

      // Petición para obtener eventos de asistencia
      const attendanceResponse = await fetch(
        `${API_URL}/attendance/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );
      
      if (!attendanceResponse.ok) {
        throw new Error(`HTTP error! status: ${attendanceResponse.status}`);
      }
      
      const attendanceData = await attendanceResponse.json();

      // Procesamiento de eventos favoritos - Lógica de transformación de datos
      let formattedFavorites = [];
      if (favData.success && favData.favorites && favData.favorites.length > 0 && eventsData.success && eventsData.events) {
        const favoriteIds = favData.favorites.map(fav => fav.eventId);
        const favoriteEvents = eventsData.events.filter(event => favoriteIds.includes(event.id));

        formattedFavorites = favoriteEvents.map(event => {
          let rawDateTime = event.date;

          // Corrección de formato de fecha si es necesario
          if (rawDateTime.includes('T:')) {
            rawDateTime = rawDateTime.replace('T:', 'T');
          }

          return {
            id: event.id,
            title: event.title || "Evento sin título",
            department: event.department || "Sin departamento",
            date: formatDate(rawDateTime),
            time: getHour(rawDateTime),
            location: event.location || "Ubicación no especificada",
            imageUrl: event.imageUrl || "https://via.placeholder.com/150"
          };
        });
      }

      // Procesamiento de eventos de asistencia - Similar lógica para consistencia
      let formattedAttendance = [];
      if (attendanceData.success && attendanceData.attendance && attendanceData.attendance.length > 0 && eventsData.success && eventsData.events) {
        const attendanceIds = attendanceData.attendance.map(att => att.eventId);
        const attendedEvents = eventsData.events.filter(event => attendanceIds.includes(event.id));

        formattedAttendance = attendedEvents.map(event => {
          let rawDateTime = event.date;

          if (rawDateTime.includes('T:')) {
            rawDateTime = rawDateTime.replace('T:', 'T');
          }

          return {
            id: event.id,
            title: event.title || "Evento sin título",
            department: event.department || "Sin departamento",
            date: formatDate(rawDateTime),
            time: getHour(rawDateTime),
            location: event.location || "Ubicación no especificada",
            imageUrl: event.imageUrl || "https://via.placeholder.com/150"
          };
        });
      }

      // Actualización de estados con datos procesados
      setSavedEvents(formattedFavorites);
      setAttendanceEvents(formattedAttendance);
    } catch (error) {
      console.error("Error al obtener favoritos y asistencia:", error);
      setSavedEvents([]);
      setAttendanceEvents([]);
      Alert.alert("Error", "No se pudieron cargar los eventos guardados");
    }
  };

  // Función para obtener color por departamento - camelCase para función
  const getDepartmentColor = (dept) => {
    // Objeto de mapeo de colores por departamento
    const colors = {
      'Sistemas computacionales': '#4a6eff', 
      'Economía': '#ffb16c', 
      'Ciencias Sociales y jurídicas': '#97795e', 
      'Agronomia': '#f9f285', 
      'Ciencias de la tierra': '#1fd514',
      'Humanidades': '#a980f2',
      'Ingeniería en pesquerías': '#fb6d51',
      'Ciencias marinas y costeras': '#a8ecff',
      'Ciencia animal y conservación del hábitat': '#f7b2f0',
    };
    return colors[dept] || '#6b7280';
  };

  // Función helper para renderizar tarjetas de eventos - Separación de lógica de renderizado
  const renderEventCard = (event) => (
    <View key={event.id} style={styles.eventCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
      >
        {/* Header de la tarjeta con badge del departamento */}
        <View style={styles.eventHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getDepartmentColor(event.department) }]}>
            <Text style={styles.categoryBadgeText}>{event.department}</Text>
          </View>
        </View>
        
        {/* Contenido principal de la tarjeta */}
        <View style={styles.eventContent}>
         
          <View style={styles.eventImageContainer}>
            <Image 
              source={{ uri: event.imageUrl }} 
              style={styles.eventImage}
              defaultSource={require("../assets/adaptive-icon.png")}
            />
            <View style={styles.imageOverlay} />
          </View>
          
          {/* Detalles del evento */}
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
            
           
            <View style={styles.eventMetaContainer}>
             
              <View style={styles.metaItem}>
                <View style={styles.metaIconContainer}>
                  <Image source={require("../assets/calendar.png")} style={styles.metaIcon} />
                </View>
                <Text style={styles.metaText}>{event.date}</Text>
              </View>
              
            
              <View style={styles.metaItem}>
                <View style={styles.metaIconContainer}>
                  <Image source={require("../assets/clock.png")} style={styles.metaIcon} />
                </View>
                <Text style={styles.metaText}>{event.time}</Text>
              </View>
              
           
              <View style={styles.metaItem}>
                <View style={styles.metaIconContainer}>
                  <Image source={require("../assets/location.png")} style={styles.metaIcon} />
                </View>
                <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Handler para navegación - camelCase para función
  const handleNavigation = (screenName) => {
    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.error(`Error navegando a ${screenName}:`, error);
    }
  };

  // Función para obtener eventos actuales según pestaña activa
  const getCurrentEvents = () => {
    return activeTab === 'favorites' ? savedEvents : attendanceEvents;
  };

  // Renderizado condicional para estado de carga
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.fullScreenLoading}></View>
        <Image
          source={require("../assets/agendaLogo.png")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Renderizado principal del componente
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.lightBlue} barStyle="dark-content" />

      {/* Header con botón de retroceso y título */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ScrollView principal */}
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección del perfil con gradiente */}
        <LinearGradient
          colors={[COLORS.lightBlue, COLORS.lightBlue]}
          style={styles.profileSection}
        >
          <View style={styles.profileCard}>
            {/* Imagen de perfil */}
            <View style={styles.profileImageContainer}>
              <Image source={require("../assets/student.png")} style={styles.profileImage} />
            </View>
            
            {/* Información del perfil */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileTitle}>Estudiante UABCS</Text>
              <Text style={styles.profileEmail}>{userEmail || 'Usuario'}</Text>
              {/* Estadísticas del perfil */}
              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{savedEvents.length}</Text>
                  <Text style={styles.statLabel}>Favoritos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{attendanceEvents.length}</Text>
                  <Text style={styles.statLabel}>Asistir</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Contenedor de pestañas */}
        <View style={styles.tabContainer}>
          {/* Pestaña de favoritos */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Image 
                source={require("../assets/calendar.png")} 
                style={[styles.tabCalendar, activeTab === 'favorites' && styles.activeTabIcon]} 
              />
              <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
                Guardados
              </Text>
            </View>
            {activeTab === 'favorites' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          
          {/* Pestaña de asistencia */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'attended' && styles.activeTab]}
            onPress={() => setActiveTab('attended')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Image 
                source={require("../assets/clock.png")} 
                style={[styles.tabIcon, activeTab === 'attended' && styles.activeTabIcon]} 
              />
              <Text style={[styles.tabText, activeTab === 'attended' && styles.activeTabText]}>
                Asistir
              </Text>
            </View>
            {activeTab === 'attended' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Contenedor de eventos */}
        <View style={styles.eventsContainer}>
          {getCurrentEvents().length === 0 ? (
           
            <View style={styles.emptyStateContainer}>
              <LinearGradient
                colors={[COLORS.softBlue, COLORS.lightPurple]}
                style={styles.emptyStateCircle}
              >
                <Image
                  source={require("../assets/calendar.png")}
                  style={styles.noEventsImage}
                  resizeMode="contain"
                />
              </LinearGradient>
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'favorites' ? '¡Aún no tienes favoritos!' : '¡Aún no has asistido!'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {activeTab === 'favorites' 
                  ? 'Marca tus eventos favoritos para verlos aquí' 
                  : 'Los eventos a los que asistas aparecerán aquí'
                }
              </Text>
            </View>
          ) : (
            // Renderizado de eventos cuando existen
            getCurrentEvents().map((event) => renderEventCard(event))
          )}
        </View>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNav}>
       
        <TouchableOpacity style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Image
              source={require("../assets/home.png")}
              style={styles.navIcon}
            />
          </View>
        </TouchableOpacity>

       
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("EventScreen")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image source={require("../assets/more.png")} style={styles.navIcon} />
          </View>
        </TouchableOpacity>

        
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconContainer, styles.activeNavItem]}>
            <Image source={require("../assets/profile.png")} style={styles.navIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.warmGray, 
  },
  
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    paddingTop: 35,
    backgroundColor: COLORS.cream,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#333"
  },
  tabCalendar: {
    width: 30,
    height: 30,
    marginRight: 5,
    },

  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  profileSection: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 12,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tabIcon: {
    width: 16,
    height: 16, 
    marginTop:8,
    marginRight: 8,
    tintColor: COLORS.textLight,
  },
  activeTabIcon: {
    tintColor: COLORS.deepBlue,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    marginTop:5,
  },
  activeTabText: {
    color: COLORS.deepBlue,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.accentOrange,
    borderRadius: 1,
  },

  eventsContainer: {
    paddingHorizontal: 20,
  },
  eventCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 0,
  },
  eventHeader: {
    padding: 12,
    paddingBottom: 0,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  eventContent: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 8,
  },
  eventImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 252, 252, 0.05)',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventMetaContainer: {
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metaIcon: {
    width: 15,
    height: 15,
    tintColor: COLORS.primary,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    flex: 1,
  },

  emptyStateContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyStateCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noEventsImage: {
    width: 50,
    height: 50,
    tintColor: COLORS.primary,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },

  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 9, 
    borderTopWidth: 3, 
    borderColor: "#ddd", 
    backgroundColor: "#fcfbf8",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  bottomNavItem: { 
    alignItems: "center",
    padding: 8,
    flex: 1,
  },
  navIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 32, 
    width: 32,  
  },
  navIcon: { 
    width: 25, 
    height: 25,
    tintColor: COLORS.darkGray,
  },
  activeNavItem: { 
    borderBottomWidth: 2, 
    borderColor: '#f0e342',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.cream, 
    zIndex: -1, 
  },
});

export default Profile;