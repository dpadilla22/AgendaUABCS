/**
 * profile.js - Versión Mejorada
 * Autor: Danna Cahelca Padilla Nuñez, Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción: Pantalla de perfil con cuadros desplegables y cerrar sesión
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
import { useAppTheme } from '../hooks/useThemeApp';

import { 
  getHour, 
  formatDate, 
  getDepartmentColor, 
  processEventsData,
  getUserEmail,
  getAccountId 
} from '../utils/profileUtils';

const API_URL = 'https://agendauabcs.up.railway.app';

const Profile = ({ navigation }) => {
  const { colors, isDark, theme, toggleTheme } = useAppTheme();
  const [accountId, setAccountId] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);
  const [attendanceExpanded, setAttendanceExpanded] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      const email = await getUserEmail();
      setUserEmail(email);
    };
    loadEmail();
  }, []);

  useEffect(() => {
    const fetchAccountIdAndFavorites = async () => {
      try {
        const id = await getAccountId();
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

      const processedData = processEventsData(eventsData, favData, attendanceData);
      
      setSavedEvents(processedData.favorites);
      setAttendanceEvents(processedData.attendance);
    } catch (error) {
      console.error("Error al obtener favoritos y asistencia:", error);
      setSavedEvents([]);
      setAttendanceEvents([]);
      Alert.alert("Error", "No se pudieron cargar los eventos guardados");
    }
  };
const handleLogout = async () => {
  Alert.alert(
    "Cerrar sesión",
    "¿Estás seguro de que quieres cerrar sesión?",
    [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            // Limpiar AsyncStorage completamente
            await AsyncStorage.clear();
            
            navigation.navigate('Welcome');
            
           
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
            
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
            Alert.alert("Error", "No se pudo cerrar la sesión");
          }
        }
      }
    ]
  );
};
  const renderEventCard = (event) => (
    <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.cardBg }]}>
      <View style={styles.eventHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getDepartmentColor(event.department, isDark) }]}>
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
        </View>
        
        <View style={styles.eventDetails}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {event.title}
          </Text>
          
          <View style={styles.eventMetaContainer}>
            <View style={styles.metaItem}>
              <Image source={require("../assets/calendar.png")} style={[styles.metaIcon, { tintColor: '#3b82f6' }]} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event.date}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Image source={require("../assets/clock.png")} style={[styles.metaIcon, { tintColor: '#3b82f6' }]} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event.time}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Image source={require("../assets/location.png")} style={[styles.metaIcon, { tintColor: '#3b82f6' }]} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

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
      <StatusBar 
        backgroundColor={colors.headerBg} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />

      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.headerBg,
          borderBottomWidth: 1,    
          borderBottomColor: '#fff' 
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.backButton, 
            { 
              backgroundColor: colors.cardBg,
              borderWidth: 1,
              borderColor: '#fff',
              borderRadius: 20
            }
          ]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/back-arrow.png")}
            style={[
              styles.backIcon,
              { tintColor: colors.text }  
            ]}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Mi perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cuadro del perfil */}
        <LinearGradient
          colors={colors.profileGradient}
          style={styles.profileSection}
        >
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
        </LinearGradient>

        {/* Cuadro de modo oscuro */}
        <View style={[styles.sectionCard, { backgroundColor: colors.sectionBg, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Modo {isDark ? 'oscuro' : 'claro'}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#cbd5e1", true: "#3b82f6" }}
              thumbColor={isDark ? "#f1f5f9" : "#ffffff"}
            />
          </View>
        </View>

        {/* Cuadro desplegable: Guardados/Favoritos */}
        <View style={[styles.sectionCard, { backgroundColor: colors.sectionBg, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setFavoritesExpanded(!favoritesExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Favoritos ({savedEvents.length})
              </Text>
            </View>
          </TouchableOpacity>
          
          {favoritesExpanded && (
            <View style={styles.eventsContainer}>
              {savedEvents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No tienes eventos guardados
                  </Text>
                </View>
              ) : (
                savedEvents.map((event) => renderEventCard(event))
              )}
            </View>
          )}
        </View>

        {/* Cuadro desplegable: Asistencia */}
        <View style={[styles.sectionCard, { backgroundColor: colors.sectionBg, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setAttendanceExpanded(!attendanceExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Asistencia ({attendanceEvents.length})
              </Text>
            </View>
          </TouchableOpacity>
          {attendanceExpanded && (
            <View style={styles.eventsContainer}>
              {attendanceEvents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No tienes eventos de asistencia
                  </Text>
                </View>
              ) : (
                attendanceEvents.map((event) => renderEventCard(event))
              )}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { backgroundColor: isDark ? colors.buttonPrimary : colors.buttonSecondary }
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/home.png")}
            style={[styles.navIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("EventScreen")}
          activeOpacity={0.7}
        >
          <Image 
            source={require("../assets/more.png")} 
            style={[styles.navIcon, { tintColor: colors.text }]} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={styles.activeNavItem}>
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
    shadowColor: "#000",
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
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    borderColor: '#000000ff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  eventCard: {
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 1,
  },
  eventHeader: {
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventContent: {
    flexDirection: 'row',
  },
  eventImageContainer: {
    marginRight: 12,
  },
  eventImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 18,
  },
  eventMetaContainer: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  emptyState: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
  navIcon: { 
    width: 25, 
    height: 25,
  },
  activeNavItem: { 
    borderBottomWidth: 2, 
    borderColor: '#f0e342',
    paddingBottom: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;