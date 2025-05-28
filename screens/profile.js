import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient'; 
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  textLight: "#666666"
};

const Profile = ({ navigation }) => {
  const [accountId, setAccountId] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('favorites'); 

  useEffect(() => {
    const getEmail = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email || '');
        }
      } catch (error) {
        console.error("Error obteniendo email:", error);
      }
    };
    getEmail();
  }, []);

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

  const fetchFavoritesAndAttendance = async (id) => {
    try {
   
      const eventsResponse = await fetch(
        'https://c492-2806-265-5402-ca4-bdc6-786b-c72a-17ee.ngrok-free.app/events',
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

   
      const favResponse = await fetch(
        `https://c492-2806-265-5402-ca4-bdc6-786b-c72a-17ee.ngrok-free.app/favorites/${id}`,
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

   
      const attendanceResponse = await fetch(
        `https://c492-2806-265-5402-ca4-bdc6-786b-c72a-17ee.ngrok-free.app/attendance/${id}`,
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

      let formattedFavorites = [];
      if (favData.success && favData.favorites && favData.favorites.length > 0 && eventsData.success && eventsData.events) {
        const favoriteIds = favData.favorites.map(fav => fav.eventId);
        const favoriteEvents = eventsData.events.filter(event => favoriteIds.includes(event.id));

        formattedFavorites = favoriteEvents.map(event => ({
          id: event.id,
          title: event.title || "Evento sin título",
          department: event.department || "Sin departamento",
          date: event.date || "Fecha no especificada",
          time: event.time || "Hora no especificada",
          location: event.location || "Ubicación no especificada",
          imageUrl: event.imageUrl || "https://via.placeholder.com/150"
        }));
      }

     
      let formattedAttendance = [];
      if (attendanceData.success && attendanceData.attendance && attendanceData.attendance.length > 0 && eventsData.success && eventsData.events) {
        const attendanceIds = attendanceData.attendance.map(att => att.eventId);
        const attendedEvents = eventsData.events.filter(event => attendanceIds.includes(event.id));

        formattedAttendance = attendedEvents.map(event => ({
          id: event.id,
          title: event.title || "Evento sin título",
          department: event.department || "Sin departamento",
          date: event.date || "Fecha no especificada",
          time: event.time || "Hora no especificada",
          location: event.location || "Ubicación no especificada",
          imageUrl: event.imageUrl || "https://via.placeholder.com/150"
        }));
      }

      setSavedEvents(formattedFavorites);
      setAttendanceEvents(formattedAttendance);
    } catch (error) {
      console.error("Error al obtener favoritos y asistencia:", error);
      setSavedEvents([]);
      setAttendanceEvents([]);
      Alert.alert("Error", "No se pudieron cargar los eventos guardados");
    }
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      'Sistemas computacionales': COLORS.yellow,
      'Economía': COLORS.orange,
      'Ciencias de la tierra': COLORS.green,
      'Agronomía': COLORS.red,
    };
    return colors[dept] || '#F0F0F0';
  };

  const renderEventCard = (event) => (
    <View key={event.id} style={styles.eventCard}>
      <Image 
        source={{ uri: event.imageUrl }} 
        style={styles.eventImage}
        defaultSource={require("../assets/adaptive-icon.png")}
      />
      <View style={styles.eventContent}>
        <View style={[styles.categoryTag, { backgroundColor: getDepartmentColor(event.department) }]}>
          <Text style={styles.categoryText}>{event.department}</Text>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Image source={require("../assets/calendar.png")} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={1}>{event.date}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Image source={require("../assets/clock.png")} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={1}>{event.time}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Image source={require("../assets/location.png")} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>
        {activeTab === 'favorites' && (
          <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
            <Image source={require("../assets/bookmark-filled.png")} style={styles.bookmarkIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleNavigation = (screenName) => {
    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.error(`Error navegando a ${screenName}:`, error);
    }
  };
  const getCurrentEvents = () => {
  return activeTab === 'favorites' ? savedEvents : attendanceEvents;
};

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


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

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

      <LinearGradient colors={[COLORS.lightBlue, COLORS.accent]} style={styles.profileSection}>
        <View style={styles.profileContent}>
          <View style={styles.profileImageContainer}>
            <Image source={require("../assets/student.png")} style={styles.profileImage} />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileTitle}>Estudiante UABCS</Text>
            <Text style={styles.profileEmail}>{userEmail || 'Email no disponible'}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{savedEvents.length}</Text>
                <Text style={styles.statLabel}>Favoritos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{attendanceEvents.length}</Text>
                <Text style={styles.statLabel}>Asistidos</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.eventsSection}>
        {/* Pestañas */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Guardados ({savedEvents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'attended' && styles.activeTab]}
            onPress={() => setActiveTab('attended')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'attended' && styles.activeTabText]}>
              Asistidos ({attendanceEvents.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido de las pestañas */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {getCurrentEvents().length === 0 ? (
            <Text style={styles.noEventsText}>
              {activeTab === 'favorites' 
                ? 'No tienes eventos guardados.' 
                : 'No has asistido a ningún evento aún.'
              }
            </Text>
          ) : (
            getCurrentEvents().map((event) => renderEventCard(event))
          )}
        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => handleNavigation("Home")}
          activeOpacity={0.7}
        >
          <Image source={require('../assets/home.png')} style={styles.homeIcon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => handleNavigation("EventScreen")}
          activeOpacity={0.7}
        >
          <Image source={require("../assets/more.png")} style={styles.moreIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomNavItem, styles.activeNavItem]} activeOpacity={0.7}>
          <Image source={require("../assets/profile.png")} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textDark
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  backButton: { 
    padding: 8 
  },
  backIcon: { 
    width: 24, 
    height: 24, 
    tintColor: "#000", 
    paddingTop:20,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#000", 
    paddingTop:30,
  },
  profileSection: { 
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12
  },
  profileContent: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  profileImageContainer: { 
    marginRight: 16 
  },
  profileImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff"
  },
  profileTextContainer: { 
    flex: 1 
  },
  profileTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  profileEmail: { 
    fontSize: 14, 
    color: "#eee",
    marginTop: 4
  },
  statsContainer: { 
    flexDirection: "row", 
    marginTop: 12 
  },
  statItem: { 
    marginRight: 20 
  },
  statNumber: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  statLabel: { 
    fontSize: 12, 
    color: "#eee" 
  },
  eventsSection: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 16 
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500'
  },
  activeTabText: {
    color: COLORS.accent,
    fontWeight: 'bold'
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 12,
    color: COLORS.textDark
  },
  scrollView: {
    flex: 1
  },
  scrollContent: { 
    paddingBottom: 20 
  },
  noEventsText: { 
    textAlign: "center", 
    marginTop: 40, 
    color: "#888",
    fontSize: 16
  },
  eventCard: { 
    flexDirection: "row", 
    marginBottom: 12, 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 12
  },
  eventImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 8, 
    marginRight: 12,
    backgroundColor: COLORS.gray
  },
  eventContent: { 
    flex: 1,
    position: 'relative'
  },
  categoryTag: { 
    alignSelf: "flex-start", 
    borderRadius: 6, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    marginBottom: 6 
  },
  categoryText: { 
    fontSize: 12, 
    color: "#333",
    fontWeight: "500"
  },
  eventTitle: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#333", 
    marginBottom: 8,
    lineHeight: 18
  },
  eventDetails: { 
    marginTop: 4 
  },
  eventDetailRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 4 
  },
  detailIcon: { 
    width: 14, 
    height: 14, 
    marginRight: 6,
    tintColor: COLORS.textLight
  },
  detailText: { 
    fontSize: 12, 
    color: "#666",
    flex: 1
  },
  bookmarkButton: { 
    position: "absolute", 
    top: 4, 
    right: 4,
    padding: 4
  },
  bookmarkIcon: { 
    width: 20, 
    height: 20,
    tintColor: COLORS.accent
  },
  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 9, 
    borderTopWidth: 3, 
    borderColor: "#ddd", 
    backgroundColor: "#1271af",
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
    height: 24 
  },
  profileIcon: {
    width: 45, 
    height: 45,
    tintColor: "#fff",
  },
  homeIcon: { 
    width: 28, 
    height: 28, 
    tintColor: "#fff"
  },
  moreIcon: { 
    width: 40, 
    height: 40, 
    tintColor: "#fff"
  },
  activeNavItem: { 
    borderBottomWidth: 2, 
    borderColor: '#f0e342',
  },
   loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
  },
  fullScreenLoading: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#3ca6ec', 
  zIndex: -1, 
},
loaderContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}
});

export default Profile;