/**
 * HomeScreen.js
 * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción:Pantalla de login de la app.
 * 
 * Manual de Estándares Aplicado:
 * - Nombres de componentes en PascalCase. Ej: HomeScreen
 * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress
 * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
 * - Separación clara entre lógica, JSX y estilos.
 * - Nombres descriptivos para funciones, constantes y estilos.
 * - Uso de constantes (`const`) para valores que no cambian.
 * -Constantes globales en UPPER_SNAKE_CASE. Ej: COLORS, API_URL
 * - Funciones auxiliares antes de useEffect
 * - Manejo consistente de errores con try-catch
 * - Uso de async/await para operaciones asíncronas
 */
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, RefreshControl, Dimensions, Animated, TextInput, Modal } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; 
import EventCard from "../components/EventCard";
import { ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadAccountId } from './EventScreen';
import LocationPermissionModal from "../components/LocationPermissionModal";

// CONSTANTES GLOBALES - Declaradas fuera del componente para evitar re-renders
const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_WIDTH = screenWidth - 32; 
const CAROUSEL_HEIGHT = 220; 

// PALETA DE COLORES CENTRALIZADA - Uso consistente en toda la aplicación
const COLORS = {
  primaryBlue: "#1B3A5C",     
  secondaryBlue: "#4A7BA7",    
  gold: "#D4AF37",             
  lightGold: "#F5E6A3",        
  warmWhite: "#FFFFFF",      
  lightGray: "#E5E5E5",    
  mediumGray: "#999999",       
  darkGray: "#333333",        
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  purple: "#9966FF",
  cream: "#F5F5DC",
};

// DATOS ESTÁTICOS - Separados del componente para mejor performance
const carouselData = [
  {
    id: 1,
    image: require("../assets/carrusel1.png"),
    title: "Eventos que inspiran",
    subtitle: "¡Tú puedes ser parte!"
  },
  {
    id: 2,
    image: require("../assets/carrusel2.jpeg"),
    title: "Conferencias, charlas, networking",
    subtitle: "¡Activa tu futuro!"
  },
  {
    id: 3,
    image: require("../assets/carrusel3.jpeg"),
    title: "La cultura vive en la UABCS",
    subtitle: "¡Sé parte!"
  },
  {
    id: 4,
    image: require("../assets/carrusel4.jpeg"),
    title: "Feria de Ciencias",
    subtitle: "Innovación y tecnología"
  },
  {
    id: 5,
    image: require("../assets/carrusel5.png"),
    title: "Aquí se estudia...",
    subtitle: "y también se vive la cultura"
  },
];

const HomeScreen = ({ navigation }) => {
  
  // ESTADOS PRINCIPALES - Agrupados por funcionalidad
  // Estados de datos
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de UI y navegación
  const [activeTab, setActiveTab] = useState("Hoy");
  
  // Estados de búsqueda - Agrupados por funcionalidad relacionada
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados del carousel - Agrupados por funcionalidad
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  
  // Estados de ubicación - Agrupados por funcionalidad
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // REFERENCIAS - useRef para elementos que necesitan acceso directo
  const carouselRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const searchInputRef = useRef(null);

  // CONFIGURACIÓN API - Centralizada para fácil mantenimiento
  const API_URL = "https://a023-2806-265-5402-ca4-e919-8d18-acec-634b.ngrok-free.app";

  // FUNCIONES UTILITARIAS - Funciones puras para transformación de datos
  
  // Función para formatear hora - Naming descriptivo con prefijo 'get'
  const getHour = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Función para formatear fecha - Consistente con getHour
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Función para obtener color por departamento - Lógica de mapeo centralizada
  const getDepartmentColor = (dept) => {
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

  // Función para filtrar eventos - Lógica compleja separada del render
  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < today) return false;

      if (activeTab === "Hoy") {
        return (
          eventDate.getDate() === today.getDate() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear()
        );
      } else if (activeTab === "Esta semana") {
        const startOfWeek = new Date(today);
        const endOfWeek = new Date(today);
        const dayOfWeek = today.getDay();

        startOfWeek.setDate(today.getDate() - dayOfWeek);
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      } else if (activeTab === "Este mes") {
        return (
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear()
        );
      }

      return false;
    });
  };

  // Función para mensaje de estado vacío - Manejo centralizado de mensajes
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "Hoy":
        return "No hay eventos programados para hoy";
      case "Esta semana":
        return "No hay eventos programados para esta semana";
      case "Este mes":
        return "No hay eventos programados para este mes";
      default:
        return "No hay eventos disponibles";
    }
  };

  // EVENT HANDLERS - Prefijo 'handle' consistente para manejadores de eventos

  // Handler para refresh - Manejo de errores consistente
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error al refrescar eventos:", error);
      setEvents([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Handler para búsqueda - Lógica de filtrado compleja separada
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const queryLower = query.toLowerCase().trim();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const results = events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        return false;
      }
      
      return (
        event.title?.toLowerCase().includes(queryLower) ||
        event.department?.toLowerCase().includes(queryLower) ||
        event.location?.toLowerCase().includes(queryLower) ||
        event.description?.toLowerCase().includes(queryLower)
      );
    });

    setTimeout(() => {
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    performSearch(text);
  };

  // Handlers de modal de búsqueda - Funciones específicas y descriptivas
  const openSearchModal = () => {
    setSearchModalVisible(true);
    setSearchQuery("");
    setSearchResults([]);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  // Handler para navegación - Async/await para operaciones asíncronas
  const navigateToEventDetail = async (event) => {
    closeSearchModal();

    const accountId = await AsyncStorage.getItem('accountId'); 
    navigation.navigate('EventDetailScreen', {
      eventId: event.id,
      event: {
        id: event.id, 
        ...event,
        time: getHour(event.date),
        formattedDate: formatDate(event.date)
      },
      date: event.date,
      time: getHour(event.date),
      accountId,
    });
  };

  // Handlers del carousel - Agrupados por funcionalidad relacionada
  const handleCarouselScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CAROUSEL_WIDTH + 16));
    setCurrentIndex(index);
  };

  const handleCarouselTouchStart = () => {
    setIsAutoScrolling(false);
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  };

  const handleCarouselTouchEnd = () => {
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  };

  const goToSlide = (index) => {
    carouselRef.current?.scrollTo({
      x: index * (CAROUSEL_WIDTH + 16),
      animated: true
    });
    setCurrentIndex(index);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  // FUNCIONES DE PERMISOS - Agrupadas por funcionalidad relacionada
  const checkLocationPermission = async () => {
    try {
      const permissionGranted = await AsyncStorage.getItem("locationPermissionGranted");

      if (permissionGranted === "true") {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          setHasLocationPermission(true);
          loadSavedLocation();
        } else {
          setHasLocationPermission(false);
        }
      } else {
        setHasLocationPermission(false);
      }
    } catch (error) {
      console.error("Error checking permission status:", error);
      setHasLocationPermission(false);
    }
  };

  const loadSavedLocation = async () => {
    try {
      const locationString = await AsyncStorage.getItem("userLocation");
      if (locationString) {
        const location = JSON.parse(locationString);
        setUserLocation(location);
      }
    } catch (error) {
      console.error("Error loading saved location:", error);
    }
  };

  const checkLoginAndPermissions = async () => {
    try {
      const accountId = await AsyncStorage.getItem("accountId");

      if (accountId) {
        const locationPermission = await AsyncStorage.getItem("locationPermissionGranted");

        if (locationPermission !== "true") {
          setTimeout(() => {
            setShowLocationModal(true);
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error checking login and permissions:", error);
    }
  };

  const handleLocationPermissionGranted = (location) => {
    setShowLocationModal(false);
    setHasLocationPermission(true);
    setUserLocation(location);
    console.log("Ubicación obtenida:", location);
  };

  const handleLocationPermissionDenied = () => {
    setShowLocationModal(false);
    setHasLocationPermission(false);
    console.log("Permisos de ubicación denegados");
  };

  // EFFECTS - useEffect al final del componente, agrupados por funcionalidad

  // Effect principal para cargar eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events`);
        const data = await response.json();
        
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error al obtener eventos:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Effect para auto-scroll del carousel
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollTimer.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % carouselData.length;
          carouselRef.current?.scrollTo({
            x: nextIndex * (CAROUSEL_WIDTH + 16), 
            animated: true
          });
          return nextIndex;
        });
      }, 4000); 
    }

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [isAutoScrolling]);

  // Effect para inicializar permisos
  useEffect(() => {
    const initLocationPermissions = async () => {
      await checkLocationPermission();
      await checkLoginAndPermissions();
    };
    
    initLocationPermissions();
  }, []);

  // RENDER CONDICIONAL PARA LOADING - Separado del render principal
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

  // VARIABLES DERIVADAS - Calculadas justo antes del render
  const filteredEvents = getFilteredEvents();
  
  // JSX PRINCIPAL - Estructura clara y organizada
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.whiteHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Agenda UABCS</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={openSearchModal}>
            <Image source={require("../assets/search.png")} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate("Notificaciones")}
          >
            <Image
              source={require("../assets/notification.png")} 
              style={styles.headerIcon} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL DE BÚSQUEDA - Componente separado para mejor organización */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSearchModal}
      >
        <SafeAreaView style={styles.searchModalContainer}>
          <View style={styles.searchHeader}>
            <TouchableOpacity style={styles.searchBackButton} onPress={closeSearchModal}>
              <Image 
                source={require("../assets/back-arrow.png")} 
                style={styles.searchBackIcon} 
              />
            </TouchableOpacity>
            <View style={styles.searchInputContainer}>
              <Image 
                source={require("../assets/search.png")} 
                style={styles.searchInputIcon} 
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Buscar eventos, departamentos, ubicaciones..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearSearchButton} 
                  onPress={() => handleSearchChange("")}
                >
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.searchContent} showsVerticalScrollIndicator={false}>
            {/* RENDERIZADO CONDICIONAL - Estados claros y específicos */}
            {isSearching ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.gold} />
                <Text style={styles.searchLoadingText}>Buscando...</Text>
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.searchEmptyContainer}>
                <Image 
                  source={require("../assets/search.png")} 
                  style={styles.searchEmptyIcon} 
                />
                <Text style={styles.searchEmptyTitle}>Buscar Eventos</Text>
                <Text style={styles.searchEmptyText}>
                  Ingresa el nombre de un evento, departamento o ubicación para encontrar lo que buscas
                </Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.searchEmptyContainer}>
                <Image 
                  source={require("../assets/search.png")} 
                  style={styles.searchEmptyIcon} 
                />
                <Text style={styles.searchEmptyTitle}>Sin resultados</Text>
                <Text style={styles.searchEmptyText}>
                  No se encontraron eventos que coincidan con "{searchQuery}"
                </Text>
              </View>
            ) : (
              <View style={styles.searchResultsContainer}>
                <Text style={styles.searchResultsTitle}>
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </Text>
                {searchResults.map((event, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => navigateToEventDetail(event)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultImageContainer}>
                      <Image
                        source={{ uri: event.imageUrl }}
                        style={styles.searchResultImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={styles.searchResultInfo}>
                        <View style={styles.searchResultInfoRow}>
                          <Image 
                            source={require("../assets/clock.png")} 
                            style={styles.searchResultIcon} 
                          />
                          <Text style={styles.searchResultInfoText}>
                            {getHour(event.date)} • {formatDate(event.date)}
                          </Text>
                        </View>
                        <View style={styles.searchResultInfoRow}>
                          <Image 
                            source={require("../assets/location.png")} 
                            style={styles.searchResultIcon} 
                          />
                          <Text style={styles.searchResultInfoText} numberOfLines={1}>
                            {event.location}
                          </Text>
                        </View>
                        <View style={styles.searchResultInfoRow}>
                          <Text style={styles.searchResultDepartment}>
                            {event.department}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* CONTENIDO PRINCIPAL - ScrollView con RefreshControl */}
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* SECCIÓN DEL CAROUSEL */}
        <View style={styles.carouselSection}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            onTouchStart={handleCarouselTouchStart}
            onTouchEnd={handleCarouselTouchEnd}
            scrollEventThrottle={16}
            style={styles.carouselContainer}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={CAROUSEL_WIDTH + 16}
            decelerationRate="fast"
          >
            {carouselData.map((item, index) => (
              <View key={item.id} style={styles.carouselSlide}>
                <Image source={item.image} style={styles.carouselImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(27,58,92,0.3)', 'rgba(27,58,92,0.8)']}
                  style={styles.carouselOverlay}
                >
                  <View style={styles.carouselTextContainer}>
                    <Text style={styles.carouselTitle}>{item.title}</Text>
                    <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {carouselData.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.activeDot : styles.inactiveDot
                ]}
                onPress={() => goToSlide(index)}
              />
            ))}
          </View>
        </View>

        {/* SECCIÓN DE TABS */}
        <View style={styles.tabSection}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Hoy" && styles.activeTab]}
              onPress={() => handleTabPress("Hoy")}
            >
              <Text style={[styles.tabText, activeTab === "Hoy" && styles.activeTabText]}>Hoy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Esta semana" && styles.activeTab]}
              onPress={() => handleTabPress("Esta semana")}
            >
              <Text style={[styles.tabText, activeTab === "Esta semana" && styles.activeTabText]}>Esta semana</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Este mes" && styles.activeTab]}
              onPress={() => handleTabPress("Este mes")}
            >
              <Text style={[styles.tabText, activeTab === "Este mes" && styles.activeTabText]}>Este mes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTENIDO DE EVENTOS - Renderizado condicional según estado */}
        <View style={styles.eventsContent}>
          {events.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image 
                source={require("../assets/agendaLogo.png")} 
                style={styles.emptyStateIcon} 
              />
              <Text style={styles.emptyStateTitle}>No hay eventos disponibles</Text>
              <Text style={styles.emptyStateText}>
                Actualmente no hay eventos programados. ¡Mantente atento para futuras actividades!
              </Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image 
                source={require("../assets/agendaLogo.png")} 
                style={styles.emptyStateIcon} 
              />
              <Text style={styles.emptyStateTitle}>{getEmptyStateMessage()}</Text>
              <Text style={styles.emptyStateText}>
                Prueba seleccionando otro período de tiempo o revisa más tarde.
              </Text>
            </View>
          ) : (
            filteredEvents.map((event, index) => {
              const time = getHour(event.date);
              return (
                <EventCard
                  key={index}
                  id={event.id} 
                  title={event.title}
                  department={event.department}
                  date={event.date}
                  time={time}
                  location={event.location}
                  imageUrl={event.imageUrl}
                  showBookmark={false}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* NAVEGACIÓN INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.bottomNavItem, styles.activeNavItem]} activeOpacity={0.7}>
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
          <View style={styles.navIconContainer}>
            <Image source={require("../assets/profile.png")} style={styles.navIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* MODAL DE PERMISOS DE UBICACIÓN - Componente reutilizable */}
      <LocationPermissionModal
        visible={showLocationModal}
        onPermissionGranted={handleLocationPermissionGranted}
        onPermissionDenied={handleLocationPermissionDenied}
      />
    </SafeAreaView>
  );
};

   
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmWhite, 
  },
  whiteHeader: {
    backgroundColor: COLORS.cream, 
    paddingTop: 40,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  menuLine: {
    height: 3,
    width: "100%",
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 5,
  },
  headerTitle: {
    color: COLORS.primaryBlue,
    fontSize: 18,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  headerIcon: {
    width: 22,
    height: 22,
    tintColor: COLORS.primaryBlue,
  },
  
  searchModalContainer: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.warmWhite,
  },
  searchBackButton: {
    padding: 8,
    marginRight: 8,
  },
  searchBackIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.primaryBlue,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.lightGold,
  },
  searchInputIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.mediumGray,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkGray,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearSearchText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    fontWeight: 'bold',
  },
  searchContent: {
    flex: 1,
  },
  searchLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  searchLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.mediumGray,
  },
  searchEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  searchEmptyIcon: {
    width: 60,
    height: 60,
    tintColor: COLORS.lightGray,
    marginBottom: 24,
  },
  searchEmptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchEmptyText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchResultsContainer: {
    padding: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.warmWhite,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    height: 120,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  searchResultImageContainer: {
    width: 100,
    height: '100%',
  },
  searchResultImage: {
    width: '100%',
    height: '100%',
  },
  searchResultContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    lineHeight: 20,
    marginBottom: 8,
  },
  searchResultInfo: {
    gap: 4,
  },
  searchResultInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultIcon: {
    width: 12,
    height: 12,
    tintColor: COLORS.mediumGray,
    marginRight: 8,
  },
  searchResultInfoText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    flex: 1,
  },
  searchResultDepartment: {
    fontSize: 12,
    color: COLORS.primaryBlue,
    fontWeight: '600',
    backgroundColor: COLORS.lightGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  
  mainScrollView: {
    flex: 1,
  },

  carouselSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  carouselContainer: {
    height: CAROUSEL_HEIGHT,
  },
  carouselContent: {
    paddingHorizontal: 16,
  },
  carouselSlide: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  carouselTextContainer: {
    marginBottom: 10,
  },
  carouselTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 24,
  },
  carouselSubtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  activeDot: {
    backgroundColor: COLORS.primaryBlue,
    width: 24,
  },
  inactiveDot: {
    backgroundColor: COLORS.lightGray,
    width: 8,
  },

  tabSection: {
    backgroundColor: COLORS.secondaryBlue,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 16,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "#333",
    fontWeight: "bold",
  },
  
  eventsContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginTop: 10,
  },
  

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    opacity: 0.3,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  

  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderColor: COLORS.lightGray, 
    backgroundColor: COLORS.warmWhite,
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
    borderColor: COLORS.gold,
  },
  
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cream,
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

export default HomeScreen;