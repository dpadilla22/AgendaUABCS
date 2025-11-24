/**
 * profile.js
 * Autor: Danna Cahelca Padilla Nuñez, Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción: Pantalla de perfil de usuario con modo oscuro completo
 */

import{ useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  Image, 
  SafeAreaView, 
  Switch, 
  StyleSheet,
  TouchableOpacity, 
  ScrollView,
  Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from 'expo-linear-gradient'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../components/Theme";

// Constantes de colores para modo claro y oscuro
const COLORS = {
  light: {
    background: "#f9fafb",
    cardBg: "#ffffff",
    headerBg: "#F5F5DC",
    text: "#333333",
    textSecondary: "#666666",
    border: "#ddd",
    navBg: "#fcfbf8",
    profileGradient: ["#7AB3D1", "#7AB3D1"],
    emptyStateGradient: ["#dbeafe", "#e0e7ff"],
    cardGradient: ["#ffffff", "#f8fafc"],
  },
  dark: {
    background: "#0f172a",
    cardBg: "#1e293b",
    headerBg: "#1e293b",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
    navBg: "#1e293b",
    profileGradient: ["#334155", "#475569"],
    emptyStateGradient: ["#1e293b", "#334155"],
    cardGradient: ["#1e293b", "#334155"],
  }
};

const API_URL = 'https://agendauabcs.up.railway.app';

const Profile = ({ navigation }) => {
  const [accountId, setAccountId] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('favorites'); 
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isDark = theme === "dark";
  const colors = isDark ? COLORS.dark : COLORS.light;

  // Funciones auxiliares
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
        let email = await AsyncStorage.getItem('userName');
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
      const eventsResponse = await fetch(`${API_URL}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!eventsResponse.ok) {
        throw new Error(`HTTP error! status: ${eventsResponse.status}`);
      }
      
      const eventsData = await eventsResponse.json();

      const favResponse = await fetch(`${API_URL}/favorites/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!favResponse.ok) {
        throw new Error(`HTTP error! status: ${favResponse.status}`);
      }
      
      const favData = await favResponse.json();

      const attendanceResponse = await fetch(`${API_URL}/attendance/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
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

  const renderEventCard = (event) => (
    <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.cardBg }]}>
      <LinearGradient
        colors={colors.cardGradient}
        style={styles.cardGradient}
      >
        <View style={styles.eventHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getDepartmentColor(event.department) }]}>
            <Text style={styles.categoryBadgeText}>{event.department}</Text>
          </View>
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventImageContainer}>
            <Image 
              source={{ uri: event.imageUrl }} 
              style={styles.eventImage}
              defaultSource={require("../assets/adaptive-icon.png")}
            />
            <View style={styles.imageOverlay} />
          </View>
          
          <View style={styles.eventDetails}>
            <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
              {event.title}
            </Text>
            
            <View style={styles.eventMetaContainer}>
              <View style={styles.metaItem}>
                <View style={[styles.metaIconContainer, { backgroundColor: isDark ? '#334155' : '#dbeafe' }]}>
                  <Image source={require("../assets/calendar.png")} style={styles.metaIcon} />
                </View>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event.date}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <View style={[styles.metaIconContainer, { backgroundColor: isDark ? '#334155' : '#dbeafe' }]}>
                  <Image source={require("../assets/clock.png")} style={styles.metaIcon} />
                </View>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event.time}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <View style={[styles.metaIconContainer, { backgroundColor: isDark ? '#334155' : '#dbeafe' }]}>
                  <Image source={require("../assets/location.png")} style={styles.metaIcon} />
                </View>
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const getCurrentEvents = () => {
    return activeTab === 'favorites' ? savedEvents : attendanceEvents;
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <Image
          source={require("../assets/agendaLogo.png")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.headerBg} barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.black }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.cardBg }]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mi perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección del perfil */}
        <LinearGradient
          colors={colors.profileGradient}
          style={styles.profileSection}
        >
          <View style={styles.profileCard}>
           
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileTitle}>Estudiante UABCS</Text>
              <Text style={styles.profileEmail}>{userEmail || 'Usuario'}</Text>
              <View style={[styles.profileStats, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)' }]}>
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

        {/* Switch de modo oscuro */}
        <View style={[styles.themeToggleContainer, { backgroundColor: colors.cardBg }]}>
          <View style={styles.themeToggleContent}>
           
            <Text style={[styles.themeToggleText, { color: colors.text }]}>
              Modo {isDark ? 'oscuro' : 'claro'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#cbd5e1", true: "#3b82f6" }}
            thumbColor={isDark ? "#f1f5f9" : "#ffffff"}
          />
        </View>

        {/* Pestañas */}
        <View style={[styles.tabContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Image 
                source={require("../assets/calendar.png")} 
                style={[
                  styles.tabCalendar, 
                  { tintColor: activeTab === 'favorites' ? '#3b82f6' : colors.textSecondary }
                ]} 
              />
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'favorites' ? '#3b82f6' : colors.textSecondary }
              ]}>
                Guardados
              </Text>
            </View>
            {activeTab === 'favorites' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'attended' && { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
            onPress={() => setActiveTab('attended')}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Image 
                source={require("../assets/clock.png")} 
                style={[
                  styles.tabIcon, 
                  { tintColor: activeTab === 'attended' ? '#3b82f6' : colors.textSecondary }
                ]} 
              />
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'attended' ? '#3b82f6' : colors.textSecondary }
              ]}>
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
                colors={colors.emptyStateGradient}
                style={styles.emptyStateCircle}
              >
                <Image
                  source={require("../assets/calendar.png")}
                  style={styles.noEventsImage}
                  resizeMode="contain"
                />
              </LinearGradient>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                {activeTab === 'favorites' ? '¡Aún no tienes favoritos!' : '¡Aún no has asistido!'}
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
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
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image
              source={require("../assets/home.png")}
              style={[styles.navIcon, { tintColor: colors.textSecondary }]}
            />
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
              style={[styles.navIcon, { tintColor: colors.textSecondary }]} 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconContainer, styles.activeNavItem]}>
            <Image 
              source={require("../assets/profile.png")} 
              style={[styles.navIcon, { tintColor: '#f0e342' }]} 
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    paddingTop: 35,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
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
    alignItems: 'center',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
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
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  themeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
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
  tabCalendar: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  tabIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fb923c',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metaIcon: {
    width: 15,
    height: 15,
    tintColor: '#3b82f6',
  },
  metaText: {
    fontSize: 12,
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
  },
  noEventsImage: {
    width: 50,
    height: 50,
    tintColor: '#3b82f6',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 9, 
    borderTopWidth: 2,
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
});

export default Profile;