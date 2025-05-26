import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { Share } from 'react-native';


const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  coral: "#FF7B6B",
  darkBlue: "#003366",
  lightBlue: "#7BBFFF",
  lightGray: "#D9D9D9",
  offWhite: "#F5F5F5",
  yellow: "#FFCC33",
  purple: "#9966FF",
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
    longitude: -110.315223,
  },
  'Ciencias marinas y costeras': {
    latitude: 24.100913,
    longitude: -110.315223,
  },
  'Ingeniería en pesquerías': {
    latitude: 24.098834,
    longitude: -110.315974,
  },
  'Foro escénico UABCS': {
    latitude: 24.102828,
    longitude: -110.314879,
  },
  'default': {
    latitude:24.102751,
    longitude: -110.315809,
  }
};

const EventDetailScreen = ({ navigation, route }) => {
  const { event } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
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
              <View 
                style={[
                  styles.departmentTag, 
                  { backgroundColor: getDepartmentColor(event.department) }
                ]}
              >
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
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="standard"
          >
            <Marker
              coordinate={coordinates}
              title={event.title}
              description={event.location}
              pinColor={COLORS.coral}
            >
              <View style={styles.customMarker}>
                <Ionicons name="location" size={30} color={COLORS.coral} />
              </View>
            </Marker>
          </MapView>
          
        
          <View style={styles.mapInfoOverlay}>
            <View style={styles.mapInfoCard}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.mapInfoText}>{event.location}</Text>
            </View>
          </View>
        </View>

       
        {event.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

    
        <View style={styles.actionButtons}>
         
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Asistir</Text>
          </TouchableOpacity>
          
         
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
              <TouchableOpacity 
                style={[styles.bottomNavItem]}
              >
                <Image 
                  source={require('../assets/home.png')} 
                  style={[styles.navIcon, styles.homeIcon]} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bottomNavItem]}
                onPress={() => navigation.navigate("EventScreen")}
              >
                <Image 
                  source={require("../assets/more.png")} 
                  style={[styles.navIcon, styles.moreIcon]} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bottomNavItem]} 
                onPress={() => navigation.navigate("Profile")}
              >
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
  flagContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 30,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  flagIcon: {
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
    marginTop: 20,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapInfoOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  mapInfoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mapInfoText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionButtons: {
    marginTop: 30,
    marginBottom: 30,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.darkBlue,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    backgroundColor: COLORS.coral,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tertiaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.darkBlue,
    height: 65,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  activeNavItem: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 30,
    marginHorizontal: 10,
  },
  navIcon: {
    tintColor: "white",
  },
  moreIcon: {
    width: 40,
    height: 40,
  },
  homeIcon: {
    width: 28,
    height: 28,
  },
  profileIcon: {
    width: 45,
    height: 45,
  },
});

export default EventDetailScreen;