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
  textLight: "#666666",
  primary: "#2563eb",
  secondary: "#3b82f6",
  cardBg: "#ffffff",
  shadowColor: "#000",
  gradientStart: "#2563eb",
  gradientEnd: "#60a5fa"
};

const Profile = ({ navigation }) => {
  const [accountId, setAccountId] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('favorites'); 

  const getHour = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(`${year}-${month}-${day}T12:00:00`);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
        'https://feae-200-92-221-53.ngrok-free.app/events',
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
        `https://feae-200-92-221-53.ngrok-free.app/favorites/${id}`,
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
        `https://feae-200-92-221-53.ngrok-free.app/attendance/${id}`,
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

        formattedFavorites = favoriteEvents.map(event => {
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
      'Sistemas computacionales': '#FF6B6B',
      'Economía': '#4ECDC4',
      'Ciencias de la tierra': '#45B7D1',
      'Agronomía': '#96CEB4',
    };
    return colors[dept] || '#A8E6CF';
  };

  const renderEventCard = (event) => (
    <View key={event.id} style={styles.eventCard}>
      <View style={styles.eventImageContainer}>
        <Image 
          source={{ uri: event.imageUrl }} 
          style={styles.eventImage}
          defaultSource={require("../assets/adaptive-icon.png")}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageOverlay}
        />
      </View>
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[styles.categoryTag, { backgroundColor: getDepartmentColor(event.department) }]}>
            <Text style={styles.categoryText}>{event.department}</Text>
          </View>
          {activeTab === 'favorites' && (
            <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7}>
              <View style={styles.bookmarkContainer}>
                <Image source={require("../assets/bookmark-filled.png")} style={styles.bookmarkIcon} />
              </View>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <View style={styles.iconContainer}>
              <Image source={require("../assets/calendar.png")} style={styles.detailIcon} />
            </View>
            <Text style={styles.detailText} numberOfLines={1}>{event.date}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <View style={styles.iconContainer}>
              <Image source={require("../assets/clock.png")} style={styles.detailIcon} />
            </View>
            <Text style={styles.detailText} numberOfLines={1}>{event.time}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <View style={styles.iconContainer}>
              <Image source={require("../assets/location.png")} style={styles.detailIcon} />
            </View>
            <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>
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

 
      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
      >

        <View style={styles.profileWrapper}>
          <LinearGradient 
            colors={[COLORS.gradientStart, COLORS.gradientEnd]} 
            style={styles.profileSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileContent}>
              <View style={styles.profileImageWrapper}>
                <View style={styles.profileImageContainer}>
                  <Image source={require("../assets/student.png")} style={styles.profileImage} />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileTitle}>Estudiante UABCS</Text>
                <Text style={styles.profileEmail}>{userEmail || 'Email no disponible'}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statCircle}>
                  <Text style={styles.statNumber}>{savedEvents.length}</Text>
                </View>
                <Text style={styles.statLabel}>Favoritos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statCircle}>
                  <Text style={styles.statNumber}>{attendanceEvents.length}</Text>
                </View>
                <Text style={styles.statLabel}>Asistidos</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

       
        <View style={styles.eventsSection}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
              onPress={() => setActiveTab('favorites')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={activeTab === 'favorites' ? [COLORS.gradientStart, COLORS.gradientEnd] : ['transparent', 'transparent']}
                style={styles.tabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
                   Guardados ({savedEvents.length})
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'attended' && styles.activeTab]}
              onPress={() => setActiveTab('attended')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={activeTab === 'attended' ? [COLORS.gradientStart, COLORS.gradientEnd] : ['transparent', 'transparent']}
                style={styles.tabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.tabText, activeTab === 'attended' && styles.activeTabText]}>
                   Asistidos ({attendanceEvents.length})
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.eventsContent}>
            {getCurrentEvents().length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateCircle}>
                  <Text style={styles.emptyStateEmoji}>
                    {activeTab === 'favorites' ? '💔' : '📅'}
                  </Text>
                </View>
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
              getCurrentEvents().map((event) => renderEventCard(event))
            )}
          </View>
        </View>
      </ScrollView>

  
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
    backgroundColor: "#f8fafc" 
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
    paddingTop: 20,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#000", 
    paddingTop: 30,
  },

  profileWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: { 
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  profileContent: { 
    flexDirection: "row", 
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  profileImageContainer: { 
    borderRadius: 50,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  profileImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 40,
    backgroundColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileTextContainer: { 
    flex: 1 
  },
  profileTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: { 
    fontSize: 15, 
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  statsContainer: { 
    flexDirection: "row", 
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  statItem: { 
    alignItems: "center",
    flex: 1,
  },
  statCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: { 
    fontSize: 20, 
    fontWeight: "900", 
    color: "#fff" 
  },
  statLabel: { 
    fontSize: 13, 
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },


  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 20,
  },


  eventsSection: { 
    paddingHorizontal: 20, 
    paddingTop: 24,
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600'
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '800'
  },

 
  eventsContent: {
    gap: 12, 
  },
  eventCard: { 
    backgroundColor: COLORS.cardBg,
    borderRadius: 16, 
    marginBottom: 12,
    elevation: 4, 
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 6,
    overflow: 'hidden',
  },
  eventImageContainer: {
    position: 'relative',
    height: 80, 
  },
  eventImage: { 
    width: '100%', 
    height: 80, 
    backgroundColor: COLORS.gray
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40, 
  },
  eventContent: { 
    padding: 14, 
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8, 
  },
  categoryTag: { 
    borderRadius: 16, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: { 
    fontSize: 11,
    color: "#333",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  eventTitle: { 
    fontSize: 16, 
    fontWeight: "800", 
    color: COLORS.textDark, 
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: { 
    gap: 8, 
  },
  eventDetailRow: { 
    flexDirection: "row", 
    alignItems: "center",
  },
  iconContainer: {
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, 
  },
  detailIcon: { 
    width: 14, 
    height: 14, 
    tintColor: COLORS.gradientStart
  },
  detailText: { 
    fontSize: 13, 
    color: COLORS.textLight,
    flex: 1,
    fontWeight: '500',
  },
  bookmarkButton: { 
    padding: 4,
  },
  bookmarkContainer: {
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookmarkIcon: { 
    width: 16, 
    height: 16, 
    tintColor: COLORS.gradientStart
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
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateEmoji: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: '#3ca6ec', 
    zIndex: -1, 
  },
});

export default Profile;