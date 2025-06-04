import React, { useState, useEffect } from "react"; 
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markAttendance, unmarkAttendance } from '../components/Attendance';
import { checkIfBookmarked, addToFavorites, removeFromFavorites } from '../components/Favorites'; 

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
};

const UABCS_LOCATIONS = {
  'Poliforo': {
    latitude: 24.103169,
    longitude: -110.315887,
  },
  'Agronomía':{
    latitude: 24.100630834143022,
    longitude: -110.3145877928253,
  },
  'Ciencia animal y conservación del hábitat': {
    latitude: 24.100630834143022,
    longitude: -110.3145877928253,
  },
  'Ciencias de la tierra': {
    latitude: 24.100913,
    longitude: -110.315220,
  },
  'Ciencias marinas y costeras': {
    latitude: 24.100913,
    longitude: -110.315223,
  },
  'Ciencias sociales y jurídicas': {
    latitude: 24.102294938445176,  
    longitude: -110.31306796038446,
  },
  'Economía': {
    latitude: 24.102294938445176,  
    longitude: -110.31306796038446,
  },
  'Humanidades': {
    latitude: 24.101220,  
    longitude: -110.313528,
  },
  'Ingeniería en pesquerías': {
    latitude: 24.098834,
    longitude: -110.315974,
  },
  'Sistemas computacionales': {
    latitude: 24.102736,
    longitude: -110.316148,
  },
  'default': {
    latitude:24.102751,
    longitude: -110.315809,
  }
};

const EventDetailScreen = ({ navigation, route }) => {
  const { eventId, event, date, time } = route.params;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkAttendanceStatus = async (userId, eventId) => {
    try {
      const attendanceKey = `attendance_${userId}_${eventId}`;
      const attendanceStatus = await AsyncStorage.getItem(attendanceKey);
      return attendanceStatus === 'true';
    } catch (error) {
      console.error('Error checking attendance status:', error);
      return false;
    }
  };

  const saveAttendanceStatus = async (userId, eventId, status) => {
    try {
      const attendanceKey = `attendance_${userId}_${eventId}`;
      await AsyncStorage.setItem(attendanceKey, status.toString());
    } catch (error) {
      console.error('Error saving attendance status:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = await AsyncStorage.getItem("accountId");
        if (id) {
          setAccountId(id);
          await checkIfBookmarked(id, event.id, setIsBookmarked);
          
          const attendingStatus = await checkAttendanceStatus(id, event.id);
          setIsAttending(attendingStatus);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);

  const handleAttendanceToggle = async () => {
    if (loading) return; 
    if (!accountId) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para marcar asistencia");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isAttending) {
        result = await unmarkAttendance(event.id);
      } else {
        result = await markAttendance(event.id);
      }

      if (result.success) {
        const newAttendingStatus = !isAttending;
        setIsAttending(newAttendingStatus);
        
        await saveAttendanceStatus(accountId, event.id, newAttendingStatus);
        
        Alert.alert(
          newAttendingStatus ? 'Asistencia marcada' : 'Asistencia desmarcada',
          result.message
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err) {
      console.error('Error en handleAttendanceToggle:', err);

      if (err.message && err.message.includes('Asitencia ya marcada')) {
        Alert.alert('Aviso', 'Ya has marcado tu asistencia para este evento.');
        setIsAttending(true);
        await saveAttendanceStatus(accountId, event.id, true);
      } else {
        Alert.alert('Error', 'No se pudo procesar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!accountId) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para guardar eventos");
      return;
    }
    if (isBookmarked) {
      await removeFromFavorites(accountId, event.id, setIsBookmarked);
    } else {
      await addToFavorites(accountId, event.id, setIsBookmarked);
    }
  };

const getDepartmentColor = (dept) => {
    const colors = {
      'Sistemas computacionales': '#3B82F6', 
      'Economía': '#F59E0B', 
      'Ciencias Sociales y jurídicas': '#06B6D4', 
      'Agronomia': '#10B981', 
      'Ciencias de la tierra': '#8B5CF6',
      'Humanidades': '#F97316',
      'Ingeniería en pesquerías': '#EF4444',
      'Ciencias marinas y costeras': '#34D399',
      'Ciencia animal y conservación del hábitat': '#FBBF24',
    };
    return colors[dept] || '#6B7280'; 
  };


  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Horario no especificado";
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const startHour = parseInt(hours);
      const endHour = startHour + 2; 
      return `${timeString} - ${endHour.toString().padStart(2, '0')}:${minutes}`;
    }
    return timeString;
  };

  const getLocationCoordinates = (locationName) => {
    const location = Object.keys(UABCS_LOCATIONS).find(key => 
      locationName?.toLowerCase().includes(key.toLowerCase())
    );
    return UABCS_LOCATIONS[location] || UABCS_LOCATIONS.default;
  };

  const coordinates = getLocationCoordinates(event.location);

  return (
    <View style={styles.container}>
     
      <View style={styles.heroSection}>
        <Image 
          source={{ uri: event.imageUrl || 'https://via.placeholder.com/400x300' }} 
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        
      
        <SafeAreaView style={styles.headerContainer}>
          <View style={styles.headerNav}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Detalles del Evento</Text>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={toggleBookmark}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked ? COLORS.yellow : COLORS.textLight} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

    
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{event.title}</Text>
          <Text style={styles.heroSubtitle}>Por {event.department}</Text>
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
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={20} color={COLORS.darkBlue} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Horario</Text>
                <Text style={styles.detailValue}>{formatTime(event.time)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color={COLORS.darkBlue} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Ubicación</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>
          </View>
        </View>

      
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={coordinates}
                title={event.title}
                description={event.location}
              >
                <View style={styles.marker}>
                  <Ionicons name="location-sharp" size={30} color={COLORS.darkBlue} />
                </View>
              </Marker>
            </MapView>
          </View>
        </View>

    
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
              {loading ? "Procesando..." : (isAttending ? "Asistiendo" : "Asistir al Evento")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
                <View style={styles.navIconContainer}>
                  <Image source={require("../assets/profile.png")} style={styles.navIcon} />
                </View>
              </TouchableOpacity>
            </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    
  },
  

  heroSection: {
    height: screenHeight * 0.45,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 15,
  },
  detailsGrid: {
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },


  mapSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },


  actionSection: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  attendButton: {
    backgroundColor: "#efdcbd",
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: 'bold',
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
  }
});

export default EventDetailScreen;