import React, { useState, useEffect } from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet,ScrollView, SafeAreaView, StatusBar, FlatList, ActivityIndicator} from 'react-native';
import { Calendar } from 'react-native-calendars';

const today = new Date();
const todayString = today.toISOString().split('T')[0];

const COLORS = {
  darkBlue: "#003366",
  lightBlue: "#4dabf7",
  accent: "#3498db",
  yellow: "#FFF7A3",
  green: "#E6FFE6",
  orange: "#FFEBCD",
  red: "#FFE4E1",
  gray: "#F5F5F5",
  textDark: "#333333",
  textLight: "#666666",
  white: "#FFFFFF",
  lightGray: "#E0E0E0"
};

const DepartamentScreen = ({ navigation, route }) => {
  const { nombreDepartamento } = route.params;
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('https://feae-200-92-221-53.ngrok-free.app/events');
        const data = await response.json();
        setEventos(data.events || []);
      } catch (error) {
        console.error('Error al obtener eventos:', error);
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  useEffect(() => {
  const fetchAccountId = async () => {
    const id = await AsyncStorage.getItem('accountId');
    setAccountId(id);
    // console.log("accountId en EventDetailScreen:", id);
  };

  fetchAccountId();
}, []);


  const getMarkedDates = () => {
    const marked = {};
    const eventosDelDepartamento = eventos.filter(evento => evento.department === nombreDepartamento);
    eventosDelDepartamento.forEach(evento => {
      const eventDate = evento.date.split('T')[0];
      marked[eventDate] = {
        marked: true,
        dotColor: COLORS.yellow,
        activeOpacity: 0.8
      };
    });

    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.accent,
      selectedTextColor: '#fff'
    };
    return marked;
  };

  const eventosFiltrados = eventos.filter(evento =>
    evento.department === nombreDepartamento &&
    evento.date.split('T')[0] === selectedDate
  );

  const formatTime = (dateString) => {
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

  const renderEvento = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetailScreen', {
        eventId: item.id,
        event: {
          ...item,
          time: formatTime(item.date),
          formattedDate: formatDate(item.date)
        },
        date: item.date,
        time: formatTime(item.date),
      })}
      activeOpacity={0.7}
    >
      <View style={styles.eventImageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventInfoRow}>
            <Image source={require("../assets/clock.png")} style={styles.eventIcon} />
            <Text style={styles.eventInfoText}>
              {formatTime(item.date)}
            </Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Image source={require("../assets/location.png")} style={styles.eventIcon} />
            <Text style={styles.eventInfoText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.eventBadge}>
        <Text style={styles.eventBadgeText}>
          {nombreDepartamento.substring(0, 3).toUpperCase()}
        </Text>
      </View>
      <View style={styles.eventColorIndicator} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      

      {loading ? (
        <View style={styles.fullScreenLoading}>
          <Image
         source={require("../assets/agendaLogo.png")}
          style={styles.loadingImage}
          resizeMode="contain"
          />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/back-arrow.png")}
                style={[styles.backIcon, { tintColor: "#fff" }]}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Calendario</Text>
            <View style={styles.emptySpace} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                minDate={todayString}
                onDayPress={day => setSelectedDate(day.dateString)}
                markedDates={getMarkedDates()}
                theme={{
                  backgroundColor: COLORS.lightBlue,
                  calendarBackground: COLORS.lightBlue,
                  textSectionTitleColor: '#fff',
                  selectedDayBackgroundColor: COLORS.accent,
                  selectedDayTextColor: '#fff',
                  todayTextColor: COLORS.yellow,
                  dayTextColor: '#fff',
                  textDisabledColor: 'rgba(255, 255, 255, 0.5)',
                  arrowColor: '#fff',
                  monthTextColor: '#fff',
                  dotColor: COLORS.yellow,
                  selectedDotColor: '#fff',
                }}
                style={{ borderRadius: 20, padding: 10 }}
              />
            </View>

            <View style={styles.eventsContainer}>
              <View style={styles.eventsHeader}>
                <Text style={styles.eventsTitle}>{nombreDepartamento}</Text>
                <Text style={styles.eventsSubtitle}>
                  Eventos del {formatDate(selectedDate)}
                </Text>
                {eventosFiltrados.length > 0 && (
                  <Text style={styles.eventsCount}>
                    {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>

              {eventosFiltrados.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Image source={require("../assets/calendar.png")} style={styles.emptyImage} />
                  <Text style={styles.emptyText}>No hay eventos para esta fecha</Text>
                  <Text style={styles.emptySubtext}>Selecciona otra fecha en el calendario</Text>
                </View>
              ) : (
                <FlatList
                  data={eventosFiltrados}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderEvento}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={styles.eventSeparator} />}
                />
              )}
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

        </>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.accent,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySpace: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 20,
    margin: 15,
    marginBottom: 0,
    padding: 20,
  },
  eventsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 100,
  },
  eventsHeader: {
    marginBottom: 25,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 5,
  },
  eventsSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  eventsCount: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  
 
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row', 
    height: 120, 
  },
  eventImageContainer: {
    width: 80,
    height: '100%',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 20,
  },
  eventInfo: {
    gap: 4, 
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 12,
    height: 12,
    tintColor: COLORS.textLight,
    marginRight: 8,
  },
  eventInfoText: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
    fontWeight: '500',
  },
  eventBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '600',
  },
  eventColorIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  eventSeparator: {
    height: 4, 
  },
  

  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
    loadingImage: {
  width: 120,   
  height: 120,
  marginBottom: 20,
  },
  loadingText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyImage: {
    width: 60,
    height: 60,
    marginBottom: 12,
    tintColor: COLORS.lightGray,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
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
  fullScreenLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.offWhite,
  },
});

export default DepartamentScreen;