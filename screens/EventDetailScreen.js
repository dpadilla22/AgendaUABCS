import { useState, useEffect, useRef } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions, Modal, Animated, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Linking } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { markAttendance, unmarkAttendance } from "../components/Attendance"
import { checkIfBookmarked, addToFavorites, removeFromFavorites } from "../components/Favorites"
import LocationService from "../components/LocationServices" 
// import EventLocationInfo from "../components/EventLocationInfo"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const COLORS = {
  coral: "#FF7B6B",
  darkBlue: "#003366",
  lightBlue: "#7BBFFF",
  lightGray: "#D9D9D9",
  offWhite: "#F5F5F5",
  yellow: "#FFCC33",
  purple: "#9966FF",
  attendingBlue: "#007bff",
  darkBackground: "#1a1a1a",
  cardBackground: "#2a2a2a",
  primaryPurple: "#8B5CF6",
  textLight: "#ffffff",
  textSecondary: "#a0a0a0",
  accent: "#3498db",
  primary: "#003366",
  cream: "#F5F5DC",
  darkGray: "#666666",
}

const UABCS_LOCATIONS = {
  "Poliforo": {
    latitude: 24.103169,
    longitude: -110.315887,
  },
  "Agronomía": {
    latitude: 24.100630834143022,
    longitude: -110.3145877928253,
  },
  "Ciencia animal y conservación del hábitat": {
    latitude: 24.100630834143022,
    longitude: -110.3145877928253,
  },
  "Ciencias de la tierra": {
    latitude: 24.100913,
    longitude: -110.31522,
  },
  "Ciencias marinas y costeras": {
    latitude: 24.100913,
    longitude: -110.315223,
  },
  "Ciencias sociales y jurídicas": {
    latitude: 24.102294938445176,
    longitude: -110.31306796038446,
  },
  "Economía": {
    latitude: 24.102294938445176,
    longitude: -110.31306796038446,
  },
  "Humanidades": {
    latitude: 24.10122,
    longitude: -110.313528,
  },
  "Ingeniería en pesquerías": {
    latitude: 24.098834,
    longitude: -110.315974,
  },
  "Sistemas computacionales": {
    latitude: 24.102736,
    longitude: -110.316148,
  },
  "default": {
    latitude: 24.102751,
    longitude: -110.315809,
  },
}

const CustomModal = ({ visible, title, message, onConfirm, onCancel, type = "info" }) => {
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
        return { name: "information-circle", color: COLORS.lightBlue }
    }
  }

  const icon = getIconByType()

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
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
            <View style={styles.modalIconContainer}>
              <Ionicons name={icon.name} size={50} color={icon.color} />
            </View>

            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalMessage}>{message}</Text>

            <View style={styles.modalButtons}>
              {onCancel && (
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color={COLORS.coral} />
          <Text style={styles.errorText}>Error: No se encontraron datos del evento</Text>
          <TouchableOpacity 
            style={styles.errorButton}
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
    <View style={styles.container}>
      <CustomModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />

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
              <View style={styles.circleDecoration} />
              <Ionicons name="arrow-back" size={24} color={COLORS.textLight} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Detalles del Evento</Text>

            <TouchableOpacity style={styles.headerButton} onPress={toggleBookmark} disabled={bookmarkLoading}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isBookmarked ? COLORS.yellow : COLORS.textLight}
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

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsSection}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.darkBlue} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{formatDate(event?.date)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={20} color={COLORS.darkBlue} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Horario</Text>
                <Text style={styles.detailValue}>{formatTime(event?.time)}</Text>
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
    !locationPermission && styles.disabledIcon
  ]}>
    <Ionicons 
      name="location-outline" 
      size={20} 
      color={locationPermission ? COLORS.darkBlue : COLORS.mediumGray} 
    />
  </View>
  <View style={styles.locationContent}>
    <Text style={[
      styles.detailLabel,
      !locationPermission && styles.disabledText
    ]}>
      Ubicación
    </Text>
    <Text style={[
      styles.detailValue,
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
    color={locationPermission ? COLORS.darkBlue : COLORS.mediumGray} 
    style={styles.openIcon} 
  />
</TouchableOpacity>
          </View>
        </View>

{/* ;<EventLocationInfo
  event={{
    id: event?.id,
    title: event?.title,
    location: event?.location,
    date: formatDate(event?.date),
    time: formatTime(event?.time),
    coordinates: getLocationCoordinates(event?.location), // Usa tu función existente
  }}
/> */}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.attendButton, isAttending && styles.attendingButton]}
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
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Home")} activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Ionicons name="home-outline" size={25} color={COLORS.darkGray} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("EventScreen")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="grid-outline" size={25} color={COLORS.darkGray} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="person-outline" size={25} color={COLORS.darkGray} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
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

  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    zIndex: 2,
  },

  circleDecoration: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(245, 245, 220, 0.4)",
    position: "absolute",
    zIndex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
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
    color: COLORS.textLight,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingTop: 20,
  },

  detailsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cream,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },

  

  actionSection: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
   staticMapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  
  mapPlaceholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkBlue,
    marginTop: 15,
    textAlign: 'center',
  },
  
  mapPlaceholderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  
  coordinatesContainer: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 15,
  },
  
  coordinatesText: {
    fontSize: 12,
    color: COLORS.darkBlue,
    fontFamily: 'monospace',
  },
  
  locationError: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
    maxWidth: 120,
    textAlign: 'center',
  },
  attendButton: {
    backgroundColor: "#efdcbd",
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  attendingButton: {
    backgroundColor: COLORS.lightBlue,
  },
  attendButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
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
  navIcon: {
    width: 25,
    height: 25,
    tintColor: COLORS.darkGray,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderColor: "#f0e342",
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
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
    backgroundColor: "#F8F9FA",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#6B7280",
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
    backgroundColor: COLORS.darkBlue,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },


  userMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  
  locationButtonText: {
    fontSize: 12,
    color: COLORS.darkBlue,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  
  distanceText: {
    fontSize: 14,
    color: COLORS.darkBlue,
    marginLeft: 5,
    fontWeight: '500',
  },
  locationContent: {
    flex: 1,
  },
  tapToOpenText: {
    fontSize: 12,
    color: COLORS.lightBlue,
    marginTop: 2,
    fontStyle: 'italic',
  },
  openIcon: {
    marginLeft: 10,
  },
    disabledDetailItem: {
    opacity: 0.5,
  },
  disabledIcon: {
    backgroundColor: COLORS.lightGray,
  },
  disabledText: {
    color: COLORS.mediumGray,
  },
  disabledTapText: {
    color: COLORS.mediumGray,
    fontStyle: 'italic',
  },
})

export default EventDetailScreen;