import React, { useState, useEffect } from "react"; 
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markAttendance, unmarkAttendance } from '../components/Attendance';
import { checkIfBookmarked, addToFavorites, removeFromFavorites } from '../components/Favorites'; 

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  coral: "#FF7B6B",
  darkBlue: "#003366",
  lightBlue: "#7BBFFF",
  lightGray: "#D9D9D9",
  offWhite: "#F5F5F5",
  yellow: "#FFCC33",
  purple: "#9966FF",
  attendingBlue: "#007bff",
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
      'Sistemas computacionales': '#FFFACD', 
      'Economía': '#FFEBCD', 
      'Ciencias Sociales y urídicas': '#E0FFFF', 
      'Agronomia': '#E6FFE6', 
      'Ciencias de la tierra': '#E0FFFF',
      'Humanidades': '#FFF7A3',
    };
    return colors[dept] || '#F0F0F0'; 
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Eventos</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.eventCard}>
          <View style={styles.eventImageContainer}>
            <Image 
              source={{ uri: event.imageUrl || 'https://via.placeholder.com/400x200' }} 
              style={styles.eventImage}
            />
          </View>
          
          <View style={styles.eventInfo}>
            <View style={styles.eventHeader}>
              <View style={[
                styles.departmentTag, 
                { backgroundColor: getDepartmentColor(event.department) }
              ]}>
                <Text style={styles.departmentText}>{event.department}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={toggleBookmark}
              >
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={isBookmarked ? COLORS.yellow : '#666'} 
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{formatDate(event.date)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{formatTime(event.time)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            </View>
          </View>
        </View>

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
                <Ionicons name="location-sharp" size={30} color={COLORS.yellow} />
              </View>
            </Marker>
          </MapView>
        </View>

        <View style={styles.attendanceContainer}>
          <TouchableOpacity
            style={[
              styles.attendanceButton, 
              isAttending ? styles.attending : styles.notAttending
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
            <Text style={styles.attendanceButtonText}>
              {loading ? "Procesando..." : (isAttending ? "Asistiendo" : "Asistir")}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Home")}>
          <Image 
            source={require('../assets/home.png')} 
            style={[styles.navIcon, styles.homeIcon]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("EventScreen")}>
          <Image 
            source={require("../assets/more.png")} 
            style={[styles.navIcon, styles.moreIcon]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Profile")}>
          <Image 
            source={require("../assets/profile.png")} 
            style={[styles.navIcon, styles.profileIcon]} 
          />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    backgroundColor: "white",
    paddingTop: 30,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  eventImageContainer: {
    position: 'relative',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  departmentTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  departmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  bookmarkButton: {
    padding: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  eventDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  mapContainer: { 
    height: 200, 
    borderRadius: 10, 
    overflow: 'hidden', 
    marginTop: 20,
    marginBottom: 20 
  },
  map: { 
    flex: 1 
  },
  marker: { 
    backgroundColor: 'rgba(219, 241, 53, 0.2)', 
    borderRadius: 100, 
    padding: 5 
  },
  attendanceContainer: { 
    marginBottom: 30, 
    alignItems: 'center' 
  },
  attendanceButton: { 
    paddingVertical: 15, 
    paddingHorizontal: 40, 
    borderRadius: 25, 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  attending: { 
    backgroundColor: COLORS.attendingBlue 
  },
  notAttending: { 
    backgroundColor: COLORS.lightGray 
  },
  attendanceButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
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
    padding: 7
  },
  navIcon: { 
    width: 24, 
    height: 24,
    tintColor: "#131311",
  },
  profileIcon: {
    width: 45, 
    height: 45,
    tintColor: "#131311",
  },
  homeIcon: { 
    width: 28, 
    height: 28, 
    tintColor: "#131311",
  },
  moreIcon: { 
    width: 40, 
    height: 40, 
    tintColor: "#131311",
  },

  activeNavItem: { 
    borderBottomWidth: 2, 
    borderColor: '#f0e342',
  },
});

export default EventDetailScreen;