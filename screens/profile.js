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
  gradientStart: "#f59e0b",
  gradientEnd: "#fbbf24",
  profileBg: "#f8fafc",
  cream: "#F5F5DC", 
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
        'https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app/events',
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
        `https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app/favorites/${id}`,
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
        `https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app/attendance/${id}`,
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

  const renderEventCard = (event) => (
    <View key={event.id} style={styles.eventCard}>
      <View style={styles.eventRow}>
        <Image 
          source={{ uri: event.imageUrl }} 
          style={styles.eventImage}
          defaultSource={require("../assets/adaptive-icon.png")}
        />
        
        <View style={styles.eventInfo}>
          <View style={[styles.categoryTag, { backgroundColor: getDepartmentColor(event.department) }]}>
            <Text style={styles.categoryText}>{event.department}</Text>
          </View>
          
          <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaRow}>
              <Image source={require("../assets/calendar.png")} style={styles.metaIcon} />
              <Text style={styles.metaText}>{event.date}</Text>
            </View>
            <View style={styles.metaRow}>
              <Image source={require("../assets/clock.png")} style={styles.metaIcon} />
              <Text style={styles.metaText}>{event.time}</Text>
            </View>
            <View style={styles.metaRow}>
              <Image source={require("../assets/location.png")} style={styles.metaIcon} />
              <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
            </View>
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
      <StatusBar backgroundColor={COLORS.lightBlue} barStyle="dark-content" />

    
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

   
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image source={require("../assets/student.png")} style={styles.profileImage} />
        </View>
        
        <Text style={styles.profileTitle}>Estudiante UABCS</Text>
        <Text style={styles.profileEmail}>{userEmail || 'dpadilla_22'}</Text>
      </View>

     
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Eventos guardados ({savedEvents.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'attended' && styles.activeTab]}
          onPress={() => setActiveTab('attended')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'attended' && styles.activeTabText]}>
            Eventos asistidos ({attendanceEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

   
      <ScrollView 
        style={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsContent}
      >
        {getCurrentEvents().length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateCircle}>
               <Image
              source={require("../assets/calendar.png")}
              style={styles.noEventsImage}
              resizeMode="contain"
            />
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
               <View style={[styles.navIconContainer,styles.activeNavItem]}>
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
    backgroundColor: "#ffffff", 
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


 profileSection: {
  alignItems: 'center',
  paddingVertical: 20,
  paddingHorizontal: 20,
  backgroundColor: COLORS.lightBlue,
  borderRadius: 20, 
  margin: 15, 
  elevation: 5, 
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},

  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 35,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '500',
  },


  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.cream,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#1f2937',
    fontWeight: '700',
  },

 
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventsContent: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventMeta: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
    tintColor: '#6b7280',
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
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
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateEmoji: {
    fontSize: 40,
  },
  noEventsImage: {
    width: 80,
    height: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
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