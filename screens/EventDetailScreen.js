/**
 * EventDetailScreen.js con Modo Oscuro
 * Autor: Danna Cahelca Padilla Nuñez, Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 */
import { useState, useEffect, useRef } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions, Modal, Animated, Alert } from "react-native"
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from "@expo/vector-icons"
import { Linking } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { markAttendance, unmarkAttendance } from "../components/Attendance"
import { checkIfBookmarked, addToFavorites, removeFromFavorites } from "../components/Favorites"
import LocationService from "../components/LocationServices"
import { useAppTheme } from '../hooks/useThemeApp'

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const UABCS_LOCATIONS = {
  "Poliforo": { latitude: 24.103169, longitude: -110.315887 },
  "Agronomía": { latitude: 24.100630834143022, longitude: -110.3145877928253 },
  "Ciencia animal y conservación del hábitat": { latitude: 24.100630834143022, longitude: -110.3145877928253 },
  "Ciencias de la tierra": { latitude: 24.100913, longitude: -110.31522 },
  "Ciencias marinas y costeras": { latitude: 24.100913, longitude: -110.315223 },
  "Ciencias sociales y jurídicas": { latitude: 24.102294938445176, longitude: -110.31306796038446 },
  "Economía": { latitude: 24.102294938445176, longitude: -110.31306796038446 },
  "Humanidades": { latitude: 24.10122, longitude: -110.313528 },
  "Ingeniería en pesquerías": { latitude: 24.098834, longitude: -110.315974 },
  "Sistemas computacionales": { latitude: 24.102736, longitude: -110.316148 },
  "default": { latitude: 24.102751, longitude: -110.315809 },
}

const CustomModal = ({ visible, title, message, onConfirm, onCancel, type = "info", isDark, colors }) => {
  const slideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const getIconByType = () => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" }
      case "error":
        return { name: "alert-circle", color: "#EF4444" }
      case "warning":
        return { name: "warning", color: "#F59E0B" }
      default:
        return { name: "information-circle", color: "#5B8DEF" }
    }
  }

  const icon = getIconByType()

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.cardBg },
            {
              transform: [
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { backgroundColor: isDark ? colors.text : '#F8F9FA' }]}>
              <Ionicons name={icon.name} size={50} color={icon.color} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>{message}</Text>

            <View style={styles.modalButtons}>
              {onCancel && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton, { 
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border
                  }]} 
                  onPress={onCancel}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton,  { backgroundColor: isDark ? colors.buttonPrimary : colors.buttonSecondary }]} 
                onPress={onConfirm}
              >
                
                <Text style={styles.confirmButtonText}>{onCancel ? "Confirmar" : "Entendido"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const EventDetailScreen = ({ navigation, route }) => {
  const { colors, isDark } = useAppTheme()

  if (!route?.params?.event) {
    useEffect(() => {
      const timer = setTimeout(() => {
        Alert.alert(
          "Error",
          "No se pudieron cargar los datos del evento",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }, 100);
      
      return () => clearTimeout(timer);
    }, [navigation]);
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar 
          backgroundColor={colors.headerBg} 
          barStyle={isDark ? "light-content" : "dark-content"} 
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color="#FF7B6B" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Error: No se encontraron datos del evento
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { eventId, event, date, time } = route.params
  
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isAttending, setIsAttending] = useState(false)
  const [accountId, setAccountId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [distance, setDistance] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    onCancel: null,
  })

  const getUserLocation = async () => {
    if (loadingLocation) return;
    
    setLoadingLocation(true)
    setLocationError(null)
    
    try {
      if (!LocationService || typeof LocationService.getCurrentLocation !== 'function') {
        throw new Error('LocationService no está disponible')
      }

      const location = await LocationService.getCurrentLocation()
      
      if (location?.latitude && location?.longitude) {
        setUserLocation(location)
        
        const eventCoords = getLocationCoordinates(event?.location)
        if (eventCoords?.latitude && eventCoords?.longitude) {
          const dist = LocationService.calculateDistance(
            location.latitude,
            location.longitude,
            eventCoords.latitude,
            eventCoords.longitude
          )
          setDistance(dist)
        }
      } else {
        setLocationError('No se pudo obtener tu ubicación')
      }
    } catch (error) {
      console.error('Error getting user location:', error)
      setLocationError('Error al obtener ubicación: ' + (error.message || 'Desconocido'))
    } finally {
      setLoadingLocation(false)
    }
  }

  const requestLocationPermission = async () => {
    if (!LocationService || typeof LocationService.requestLocationPermission !== 'function') {
      setLocationError('Servicio de ubicación no disponible')
      return
    }

    try {
      const granted = await LocationService.requestLocationPermission()
      setLocationPermission(granted)
      
      if (granted) {
        getUserLocation()
      } else {
        setLocationError('Permisos de ubicación denegados')
      }
    } catch (error) {
      console.error('Error requesting location permission:', error)
      setLocationError('Error al solicitar permisos')
    }
  }

  const showModal = (title, message, type = "info", onConfirm = null, onCancel = null) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setModalConfig((prev) => ({ ...prev, visible: false }))),
      onCancel: onCancel || null,
    })
  }

  const checkAttendanceStatus = async (userId, eventId) => {
    try {
      const attendanceKey = `attendance_${userId}_${eventId}`
      const attendanceStatus = await AsyncStorage.getItem(attendanceKey)
      return attendanceStatus === "true"
    } catch (error) {
      console.error("Error checking attendance status:", error)
      return false
    }
  }

  const saveAttendanceStatus = async (userId, eventId, status) => {
    try {
      const attendanceKey = `attendance_${userId}_${eventId}`
      await AsyncStorage.setItem(attendanceKey, status.toString())
    } catch (error) {
      console.error("Error saving attendance status:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = await AsyncStorage.getItem("accountId")
        if (id) {
          setAccountId(id)

          try {
            await checkIfBookmarked(id, event.id, setIsBookmarked)
          } catch (error) {
            console.error("Error checking bookmark:", error)
          }

          try {
            const attendingStatus = await checkAttendanceStatus(id, event.id)
            setIsAttending(attendingStatus)
          } catch (error) {
            console.error("Error checking attendance:", error)
          }
        }
        
        if (LocationService && typeof LocationService.checkPermissionStatus === 'function') {
          try {
            const hasPermission = await LocationService.checkPermissionStatus()
            setLocationPermission(hasPermission)
            
            if (hasPermission) {
              setTimeout(() => {
                getUserLocation()
              }, 1000)
            }
          } catch (error) {
            console.error("Error checking location permission:", error)
            setLocationError('Error verificando permisos de ubicación')
          }
        } else {
          setLocationError('Servicio de ubicación no disponible')
        }
        
      } catch (error) {
        console.error("Error in fetchData:", error)
      }
    }

    const timer = setTimeout(fetchData, 100)
    return () => clearTimeout(timer)
  }, [event?.id])

  const handleLocationPress = () => {
    if (!locationPermission) {
      showModal(
        "Permisos de Ubicación Requeridos", 
        "Para abrir la ubicación en Maps, necesitas otorgar permisos de ubicación primero.", 
        "warning",
        () => {
          setModalConfig(prev => ({ ...prev, visible: false }));
          requestLocationPermission();
        },
        () => setModalConfig(prev => ({ ...prev, visible: false }))
      );
      return;
    }

    const coords = getLocationCoordinates(event?.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
  };

  const handleAttendanceToggle = async () => {
    if (loading) return
    if (!accountId) {
      showModal("Iniciar Sesión Requerido", "Debes iniciar sesión para marcar tu asistencia al evento", "warning")
      return
    }

    setLoading(true)

    try {
      let result
      if (isAttending) {
        result = await unmarkAttendance(event.id)
      } else {
        result = await markAttendance(event.id)
      }

      if (result.success) {
        const newAttendingStatus = !isAttending
        setIsAttending(newAttendingStatus)
        await saveAttendanceStatus(accountId, event.id, newAttendingStatus)

        showModal(
          newAttendingStatus ? "Asistencia Confirmada" : "Asistencia Cancelada",
          result.message ||
            (newAttendingStatus ? "Tu asistencia ha sido registrada exitosamente" : "Tu asistencia ha sido cancelada"),
          "success",
        )
      } else {
        showModal("Error al Procesar", result.message || "No se pudo procesar tu solicitud de asistencia", "error")
      }
    } catch (err) {
      console.error("Error en handleAttendanceToggle:", err)

      if (err.message && err.message.includes("Asitencia ya marcada")) {
        showModal("Asistencia Ya Registrada", "Ya has marcado tu asistencia para este evento anteriormente", "info")
        setIsAttending(true)
        await saveAttendanceStatus(accountId, event.id, true)
      } else {
        showModal(
          "Error de Conexión",
          "No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente",
          "error",
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async () => {
    if (!accountId) {
      showModal("Iniciar Sesión Requerido", "Debes iniciar sesión para guardar eventos en tus favoritos", "warning")
      return
    }

    if (bookmarkLoading) return

    setBookmarkLoading(true)

    try {
      if (isBookmarked) {
        await removeFromFavorites(accountId, event.id, setIsBookmarked)
        showModal("Eliminado de Favoritos", "El evento ha sido eliminado de tus favoritos", "success")
      } else {
        await addToFavorites(accountId, event.id, setIsBookmarked)
        showModal("Agregado a Favoritos", "El evento ha sido agregado a tus favoritos", "success")
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      showModal("Error de Conexión", "No se pudo procesar tu solicitud. Por favor, intenta nuevamente", "error")
    } finally {
      setBookmarkLoading(false)
    }
  }

  const getDepartmentColor = (dept) => {
    const colors = {
      "Sistemas computacionales": "#4a6eff",
      "Economía": "#ffb16c",
      "Ciencias Sociales y jurídicas": "#97795e",
      "Agronomia": "#f9f285",
      "Ciencias de la tierra": "#1fd514",
      "Humanidades": "#a980f2",
      "Ingeniería en pesquerías": "#fb6d51",
      "Ciencias marinas y costeras": "#a8ecff",
      "Ciencia animal y conservación del hábitat": "#f7b2f0",
    }
    return colors[dept] || "#6b7280"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible"

    try {
      let dateToFormat

      if (dateString.includes("T")) {
        const localDate = dateString.split("T")[0]
        const [year, month, day] = localDate.split("-")
        dateToFormat = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      } else {
        const [year, month, day] = dateString.split("-")
        dateToFormat = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      }

      return dateToFormat.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return dateString
    }
  }

  const formatTime = (timeInput) => {
    if (!timeInput) return "Horario no especificado"

    if (typeof timeInput === "string" && timeInput.includes(":") && !timeInput.includes("T")) {
      const [hours, minutes] = timeInput.split(":")
      const startHour = Number.parseInt(hours)
      const endHour = startHour + 2

      return `${timeInput} - ${endHour.toString().padStart(2, "0")}:${minutes}`
    }

    try {
      const date = new Date(timeInput)
      const timeString = date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Mazatlan",
      })

      const [hours, minutes] = timeString.split(":")
      const startHour = Number.parseInt(hours)
      const endHour = startHour + 2

      return `${timeString} - ${endHour.toString().padStart(2, "0")}:${minutes}`
    } catch (error) {
      console.error("Error al formatear hora:", error)
      return "Horario no especificado"
    }
  }

  const getLocationCoordinates = (locationName) => {
    if (!locationName) return UABCS_LOCATIONS.default

    const location = Object.keys(UABCS_LOCATIONS).find((key) => 
      locationName?.toLowerCase().includes(key.toLowerCase())
    )
    return UABCS_LOCATIONS[location] || UABCS_LOCATIONS.default
  }

  const coordinates = getLocationCoordinates(event?.location)

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content"
        translucent
      />
      
      <CustomModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        isDark={isDark}
        colors={colors}
      />

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: event?.imageUrl || "https://via.placeholder.com/400x300" }} 
          style={styles.heroImage}
          defaultSource={{ uri: "https://via.placeholder.com/400x300" }}
        />
        <View style={styles.heroOverlay} />

        <SafeAreaView style={styles.headerContainer}>
          <View style={styles.headerNav}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <View style={[styles.circleDecoration, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(245, 245, 220, 0.4)' }]} />
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Detalles del Evento</Text>

            <TouchableOpacity style={styles.headerButton} onPress={toggleBookmark} disabled={bookmarkLoading}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isBookmarked ? "#FFD700" : "#fff"}
                style={{ opacity: bookmarkLoading ? 0.5 : 1 }}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{event?.title || "Evento"}</Text>
          <Text style={styles.heroSubtitle}>Por {event?.department || "Departamento"}</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Details Section */}
        <View style={[styles.detailsSection, { 
          backgroundColor: colors.cardBg,
          borderColor: colors.border
        }]}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(91, 141, 239, 0.15)' : 'rgba(91, 141, 239, 0.1)' }]}>
                <Ionicons name="calendar-outline" size={22} color="#5B8DEF" />
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fecha</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(event?.date)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="time-outline" size={22} color="#5B8DEF"/>
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Horario</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatTime(event?.time)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.detailItem,
                !locationPermission && styles.disabledDetailItem
              ]}
              onPress={handleLocationPress}
              activeOpacity={locationPermission ? 0.7 : 1}
              disabled={!locationPermission}
            >
              <View style={[
                styles.detailIcon,
                { backgroundColor: locationPermission 
                  ? (isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)')
                  : (isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.1)')
                }
              ]}>
                <Ionicons 
                  name="location-outline" 
                  size={22} 
                  color={locationPermission ? "#5B8DEF" : colors.textSecondary} 
                />
              </View>
              <View style={styles.locationContent}>
                <Text style={[
                  styles.detailLabel,
                  { color: colors.textSecondary },
                  !locationPermission && styles.disabledText
                ]}>
                  Ubicación
                </Text>
                <Text style={[
                  styles.detailValue,
                  { color: colors.text },
                  !locationPermission && styles.disabledText
                ]}>
                  {event?.location || "Ubicación no especificada"}
                </Text>
                <Text style={[
                  styles.tapToOpenText,
                  !locationPermission && styles.disabledTapText
                ]}>
                  {locationPermission 
                    ? "Toca para abrir en Maps" 
                    : "Permisos de ubicación requeridos"
                  }
                </Text>
              </View>
              <Ionicons 
                name="open-outline" 
                size={16} 
                color={locationPermission ?"#5B8DEF": colors.textSecondary} 
                style={styles.openIcon} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
        <TouchableOpacity
  style={[
    styles.attendButton, 
    { 
      backgroundColor: isAttending 
        ? (isDark ? colors.buttonSecondary : '#1a0f3dff')
        : (isDark ? colors.buttonPrimary : '#09042aff'),
      opacity: loading ? 0.7 : 1
    }
  ]}
  onPress={handleAttendanceToggle}
  disabled={loading}
>
  <Ionicons
    name={isAttending ? "checkmark-circle" : "person-add"}
    size={20}
    color="#fff"
    style={styles.buttonIcon}
  />
  <Text style={styles.attendButtonText}>
    {loading ? "Procesando..." : isAttending ? "Asistiendo" : "Asistir al Evento"}
  </Text>
</TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { 
        backgroundColor: colors.navBg,
        borderTopColor: colors.border
      }]}>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Home")} 
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="home-outline" size={25} color={colors.text} />
          </View>
        </TouchableOpacity>

       <TouchableOpacity
  style={styles.bottomNavItem}
  onPress={() => navigation.navigate("EventScreen")}
  activeOpacity={0.7}
>
  <View style={styles.navIconContainer}>
    <Image
      source={require("../assets/more.png")}
      style={[
        styles.navIcon,
        { tintColor: colors.text } 
      ]}
    />
  </View>
</TouchableOpacity>


        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="person-outline" size={25} color={colors.text} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    height: screenHeight * 0.45,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  headerButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circleDecoration: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "absolute",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  heroContent: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },
  detailsSection: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailsGrid: {
    gap: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderRadius: 8,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionSection: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  attendButton: {
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
shadowColor: "#000",
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
},
attendButtonText: {
color: "#fff",
fontSize: 16,
fontWeight: "bold",
marginLeft: 8,
},
buttonIcon: {
marginRight: 4,
},
locationContent: {
flex: 1,
},
tapToOpenText: {
fontSize: 12,
color: "#5769d1ff",
marginTop: 2,
fontStyle: 'italic',
},
openIcon: {
marginLeft: 10,
},
disabledDetailItem: {
opacity: 0.6,
},
disabledText: {
opacity: 0.5,
},
disabledTapText: {
color: '#999',
fontStyle: 'italic',
},
bottomNav: {
flexDirection: "row",
justifyContent: "space-around",
paddingVertical: 9,
borderTopWidth: 3,
elevation: 5,
shadowColor: "#000",
shadowOffset: { width: 0, height: -2 },
shadowOpacity: 0.1,
shadowRadius: 4,
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
modalOverlay: {
flex: 1,
backgroundColor: "rgba(0, 0, 0, 0.5)",
justifyContent: "center",
alignItems: "center",
padding: 20,
},
modalContainer: {
borderRadius: 20,
width: "100%",
maxWidth: 340,
elevation: 10,
shadowColor: "#000",
shadowOffset: { width: 0, height: 10 },
shadowOpacity: 0.25,
shadowRadius: 20,
},
modalContent: {
padding: 30,
alignItems: "center",
},
modalIconContainer: {
marginBottom: 20,
padding: 15,
borderRadius: 50,
},
modalTitle: {
fontSize: 20,
fontWeight: "bold",
marginBottom: 12,
textAlign: "center",
},
modalMessage: {
fontSize: 16,
textAlign: "center",
lineHeight: 24,
marginBottom: 30,
},
modalButtons: {
flexDirection: "row",
gap: 12,
width: "100%",
},
modalButton: {
flex: 1,
paddingVertical: 12,
paddingHorizontal: 20,
borderRadius: 12,
alignItems: "center",
justifyContent: "center",
},
confirmButton: {
backgroundColor: "#09042aff",
},
cancelButton: {
borderWidth: 1,
},
confirmButtonText: {
color: "white",
fontSize: 16,
fontWeight: "600",
},
cancelButtonText: {
fontSize: 16,
fontWeight: "600",
},
errorContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
padding: 20,
},
errorText: {
fontSize: 16,
marginTop: 20,
marginBottom: 20,
textAlign: 'center',
},
errorButton: {
paddingHorizontal: 30,
paddingVertical: 12,
borderRadius: 8,
},
errorButtonText: {
color: '#fff',
fontSize: 16,
fontWeight: '600',
},
});
export default EventDetailScreen;