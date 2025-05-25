import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, RefreshControl, Dimensions, Animated } from "react-native";
import EventCard from "../components/EventCard";
import { ActivityIndicator } from "react-native";

const { width: screenWidth } = Dimensions.get('window');
const CAROUSEL_WIDTH = screenWidth - 20; 
const CAROUSEL_HEIGHT = 200;

const COLORS = {
  coral: "#FF7B6B",
  darkBlue: "#003366",
  lightBlue: "#7BBFFF",
  lightGray: "#D9D9D9",
  offWhite: "#F5F5F5",
  yellow: "#FFCC33",
  purple: "#9966FF",
};

const carouselData = [
  {
    id: 1,
    image: require("../assets/carrusel1.png"),
    title: "Eventos que inspiran",
    subtitle: "¡Tú puedes ser parte!"
  },
  {
    id: 2,
    image: require("../assets/carrusel2.jpeg"),
    title: "Conferencias, charlas, networking",
    subtitle: "¡Activa tu futuro!"
  },
  {
    id: 3,
    image: require("../assets/carrusel3.jpeg"),
    title: "La cultura vive en la UABCS",
    subtitle: "¡Sé parte!"
  },
  {
    id: 4,
    image: require("../assets/carrusel4.jpeg"),
    title: "Feria de Ciencias",
    subtitle: "Innovación y tecnología"
  }
];

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Hoy");
  const [refreshing, setRefreshing] = useState(false);
  

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const carouselRef = useRef(null);
  const autoScrollTimer = useRef(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('https://9433-2806-265-5402-ca4-8066-f4e4-35fd-2af0.ngrok-free.app/events');
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
        const response = await fetch('https://9433-2806-265-5402-ca4-8066-f4e4-35fd-2af0.ngrok-free.app/events');
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
    if (isAutoScrolling) {
      autoScrollTimer.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % carouselData.length;
          carouselRef.current?.scrollTo({
            x: nextIndex * CAROUSEL_WIDTH,
            animated: true
          });
          return nextIndex;
        });
      }, 4000); 
    }

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [isAutoScrolling]);

  const handleCarouselScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CAROUSEL_WIDTH);
    setCurrentIndex(index);
  };

  const handleCarouselTouchStart = () => {
    setIsAutoScrolling(false);
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  };

  const handleCarouselTouchEnd = () => {
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  };

  const goToSlide = (index) => {
    carouselRef.current?.scrollTo({
      x: index * CAROUSEL_WIDTH,
      animated: true
    });
    setCurrentIndex(index);
  };

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

     
      <ScrollView
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
       
        <View style={styles.carouselSection}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            onTouchStart={handleCarouselTouchStart}
            onTouchEnd={handleCarouselTouchEnd}
            scrollEventThrottle={16}
            style={styles.carouselContainer}
            contentContainerStyle={styles.carouselContent}
          >
            {carouselData.map((item, index) => (
              <View key={item.id} style={styles.carouselSlide}>
                <Image source={item.image} style={styles.carouselImage} />
                <View style={styles.carouselOverlay}>
                  <View style={styles.carouselTextContainer}>
                    <Text style={styles.carouselTitle}>{item.title}</Text>
                    <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {carouselData.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.activeDot : styles.inactiveDot
                ]}
                onPress={() => goToSlide(index)}
              />
            ))}
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

      
        <View style={styles.eventsContent}>
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
          style={[styles.bottomNavItem, activeTab === "Hoy" && styles.activeNavItem]}
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
  
 
  mainScrollView: {
    flex: 1,
  },

  carouselSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  carouselContainer: {
    height: CAROUSEL_HEIGHT,
  },
  carouselContent: {
    paddingHorizontal: 10,
  },
  carouselSlide: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    marginHorizontal: 0,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    justifyContent: 'flex-end',
    padding: 20,
  },
  carouselTextContainer: {
    marginBottom: 10,
  },
  carouselTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  carouselSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.darkBlue,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: COLORS.lightGray,
  },

  tabSection: {
    backgroundColor: '#66B2FF',
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 10,
    marginTop: 5,
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
  
 
  eventsContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
  },
});

export default HomeScreen;