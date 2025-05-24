import React, { useState, useEffect,useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView,RefreshControl } from "react-native";
import EventCard from "../components/EventCard";
import { ActivityIndicator, Animated } from "react-native";


const COLORS = {
  coral: "#FF7B6B",
  darkBlue: "#003366",
  lightBlue: "#7BBFFF",
  lightGray: "#D9D9D9",
  offWhite: "#F5F5F5",
  yellow: "#FFCC33",
  purple: "#9966FF",
};

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Hoy");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
  setRefreshing(true);
  try {
    const response = await fetch('https://80d3-2806-265-5402-ca4-c061-200d-5b0b-6fc4.ngrok-free.app/events');
    const data = await response.json();
    setEvents(data.events || []);
  } catch (error) {
    console.error("Error al refrescar eventos:", error);
    setEvents([]);
  } finally {
    setRefreshing(false);
  }
};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://80d3-2806-265-5402-ca4-c061-200d-5b0b-6fc4.ngrok-free.app/events');
        const data = await response.json();
        console.log("Eventos cargados:", data);
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error al obtener eventos:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };


    fetchEvents();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading, fadeAnim]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const getHour = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getFilteredEvents = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  return events.filter(event => {
  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0); 

  if (eventDate < today) return false;

    if (activeTab === "Hoy") {
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    } else if (activeTab === "Esta semana") {
      const startOfWeek = new Date(today);
      const endOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); 

      startOfWeek.setDate(today.getDate() - dayOfWeek);
      endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    } else if (activeTab === "Este mes") {
      return (
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    }

    return false;
  });
};


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Image
          source={require("../assets/agendaLogo.png")} 
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={COLORS.coral} />
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.whiteHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
            <View style={styles.menuLine}></View>
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Agenda UABCS</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={require("../assets/search.png")} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate("Notificaciones")}
          >
            <Image
              source={require("../assets/notification.png")} 
              style={styles.headerIcon} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Hoy" && styles.activeTab]}
            onPress={() => handleTabPress("Hoy")}
          >
            <Text style={[styles.tabText, activeTab === "Hoy" && styles.activeTabText]}>Hoy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Esta semana" && styles.activeTab]}
            onPress={() => handleTabPress("Esta semana")}
          >
            <Text style={[styles.tabText, activeTab === "Esta semana" && styles.activeTabText]}>Esta semana</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Este mes" && styles.activeTab]}
            onPress={() => handleTabPress("Este mes")}
          >
            <Text style={[styles.tabText, activeTab === "Este mes" && styles.activeTabText]}>Este mes</Text>
          </TouchableOpacity>
        </View>
      </View>

    <ScrollView
  style={styles.container}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  <View style={{ paddingHorizontal: 10 }}>
    {events.length === 0 ? (
      <Text style={styles.noEventsText}>No hay eventos disponibles.</Text>
    ) : (
      getFilteredEvents().map((event, index) => {
        const time = getHour(event.date);
        return (
          <EventCard
            key={index}
            title={event.title}
            department={event.department}
            date={event.date}
            time={time}
            location={event.location}
            imageUrl={event.imageUrl}
          />
        );
      })
    )}
  </View>
</ScrollView>


      <View style={styles.bottomNav}>
              <TouchableOpacity 
                style={styles.bottomNavItem} 
                onPress={() => navigation.navigate("LocationScreen")}
              >
                <Image 
                  source={require('../assets/location.png')} 
                  style={[styles.navIcon, styles.locationIcon]} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bottomNavItem, activeTab === "Hoy" && styles.activeNavItem]}
                onPress={() => navigation.navigate("Home")}
              >
                <Image 
                  source={require("../assets/home.png")} 
                  style={[styles.navIcon, styles.homeIcon]} 
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
  whiteHeader: {
    backgroundColor: "white",
    paddingTop: 40,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabSection: {
    backgroundColor: '#66B2FF',
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 10,
    marginTop: 10,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  menuLine: {
    height: 3,
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 5,
  },
  headerTitle: {
    color: "#333",
    fontSize: 15,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabText: {
    color: "white",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000000",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 30,
    padding: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  categoryTag: {
    backgroundColor: '#FFF7A3',
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "500",
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventDetails: {
    marginTop: 5,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  detailIcon: {
    width: 14,
    height: 14,
    marginRight: 5,
    tintColor: "#666",
  },
  detailText: {
    fontSize: 12,
    color: "#666",
  },
  bookmarkButton: {
    padding: 5,
    width: 40,
    height: 40,
  },
  bookmarkIcon: {
    width: 35,
    height: 35,
    tintColor: "#666",
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
  loaderContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: COLORS.offWhite,
},
loadingText: {
  marginTop: 15,
  fontSize: 18,
  fontWeight: "600",
  color: COLORS.coral,
},

});

export default HomeScreen;