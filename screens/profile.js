import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar } from "react-native";
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

  useEffect(() => {
    const fetchAccountIdAndFavorites = async () => {
      try {
        const id = await AsyncStorage.getItem("accountId");
        if (id) {
          setAccountId(id);
          await fetchFavorites(id);
        }
      } catch (error) {
        console.error("Error obteniendo accountId:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountIdAndFavorites();
  }, []);

  const fetchFavorites = async (id) => {
  try {
   
    const favResponse = await fetch(`https://c492-2806-265-5402-ca4-bdc6-786b-c72a-17ee.ngrok-free.app/favorites/${id}`);
    const favData = await favResponse.json();
    
    if (!favData.success || !favData.favorites || favData.favorites.length === 0) {
      setSavedEvents([]);
      return;
    }

  
    const eventsResponse = await fetch('https://c492-2806-265-5402-ca4-bdc6-786b-c72a-17ee.ngrok-free.app/events');
    const eventsData = await eventsResponse.json();
    
    if (!eventsData.success || !eventsData.events) {
      setSavedEvents([]);
      return;
    }

  
    const favoriteIds = favData.favorites.map(fav => fav.eventId);
    const favoriteEvents = eventsData.events.filter(event => 
      favoriteIds.includes(event.id) 
    );


    const formattedEvents = favoriteEvents.map(event => ({
      id: event.id,
      title: event.title || "Evento sin título",
      department: event.department || "Sin departamento",
      date: event.date || "Fecha no especificada",
      time: event.time || "Hora no especificada",
      location: event.location || "Ubicación no especificada",
      imageUrl: event.imageUrl || "https://via.placeholder.com/150"
    }));

    setSavedEvents(formattedEvents);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    setSavedEvents([]);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
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
        >
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mi perfil</Text>

        <View style={{ width: 40 }} /> 
      </View>

      <LinearGradient
        colors={[COLORS.lightBlue, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileSection}
      >
        <View style={styles.profileContent}>
          <View style={styles.profileImageContainer}>
            <Image source={require("../assets/student.png")} style={styles.profileImage} />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileTitle}>Estudiante UABCS</Text>
            <Text style={styles.profileUsername}>hola</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{savedEvents.length}</Text>
                <Text style={styles.statLabel}>Guardados</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>
          Eventos guardados ({savedEvents.length})
        </Text>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {savedEvents.length === 0 ? (
            <Text style={styles.noEventsText}>No tienes eventos guardados.</Text>
          ) : (
            savedEvents.map((event, index) => (
              <View key={`saved-${index}`} style={styles.eventCard}>
                <Image 
                  source={{ uri: event.imageUrl }} 
                  style={styles.eventImage} 
                  defaultSource={require("../assets/splash-icon.png")} 
                />
                <View style={styles.eventContent}>
                  <View style={[styles.categoryTag, { backgroundColor: getDepartmentColor(event.department) }]}>
                    <Text style={styles.categoryText}>{event.department}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Image source={require("../assets/calendar.png")} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{event.date}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Image source={require("../assets/clock.png")} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{event.time}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Image source={require("../assets/location.png")} style={styles.detailIcon} />
                      <Text style={styles.detailText}>{event.location}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.bookmarkButton}>
                    <Image 
                      source={require("../assets/bookmark-filled.png")} 
                      style={[styles.bookmarkIcon, { tintColor: COLORS.accent }]} 
                    />
                  </TouchableOpacity>

               
                </View>
              </View>
            ))
          )}
        </ScrollView>

      </View>

      <View style={styles.actionButtons}>
          
         
        </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.bottomNavItem]}
          onPress={() => navigation.navigate("Home")}
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
          style={[styles.bottomNavItem, styles.activeNavItem]} 
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  profileSection: {
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    padding: 3,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  profileTextContainer: {
    justifyContent: "center",
  },
  profileTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },
  profileUsername: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
  },
  eventsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: COLORS.textDark,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: COLORS.textDark,
  },
  eventDetails: {
    marginTop: 5,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: COLORS.textLight,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  bookmarkButton: {
    padding: 5,
    width: 40,
    height: 40,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  bookmarkIcon: {
    width: 24,
    height: 24,
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
    width: 24,
    height: 24,
    tintColor: "white",
  },
  locationIcon: {
    width: 34,
    height: 35,
    tintColor: "white",
  },
  homeIcon: {
    width: 28,
    height: 28,
    tintColor: "white",
  },
  profileIcon: {
    width: 45,
    height: 45,
    tintColor: "white",
  },
  moreIcon: {
    width: 40,
    height: 40,
  },
});

export default Profile;