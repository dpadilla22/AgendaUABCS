import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';


const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalDateString = (dateString) => {
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
};


const extractTimeString = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Mazatlan'
    });
  } catch (error) {
    console.error('Error al extraer hora:', error);
    return null;
  }
};


const formatTimeFromDate = (dateString) => {
  if (!dateString) return "Horario no especificado";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Mazatlan'
    });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return "Horario no especificado";
  }
};


const formatDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";
  
  try {
    let dateToFormat;
    

    if (dateString.includes('T')) {
      const localDate = getLocalDateString(dateString);
      const [year, month, day] = localDate.split('-');
      dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
    
      const [year, month, day] = dateString.split('-');
      dateToFormat = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return dateToFormat.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return dateString;
  }
};

const todayString = getTodayString();

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
  lightGray: "#E0E0E0",
  darkGray: "#666666",
  cream: "#F5F5DC", 
};

const API_URL = "https://92d8-2806-265-5402-ca4-9c21-53fd-292c-aa68.ngrok-free.app";

const DepartamentScreen = ({ navigation, route }) => {
  const { nombreDepartamento } = route.params;
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        console.log('Fetching events from:', API_URL);
        const response = await fetch(`${API_URL}/events`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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
      try {
        const id = await AsyncStorage.getItem('accountId');
        setAccountId(id);
        console.log("accountId en DepartamentScreen:", id);
      } catch (error) {
        console.error('Error getting accountId:', error);
      }
    };

    fetchAccountId();
  }, []);


  const getMarkedDates = () => {
    const marked = {};
    const eventosDelDepartamento = eventos.filter(evento => evento.department === nombreDepartamento);
    
    eventosDelDepartamento.forEach(evento => {
  
      const eventDate = getLocalDateString(evento.date);
      marked[eventDate] = {
        marked: true,
        dotColor: COLORS.darkBlue,
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
    getLocalDateString(evento.date) === selectedDate
  );

  const renderEvento = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetailScreen', {
        eventId: item.id,
        event: {
          ...item,
          time: extractTimeString(item.date), 
          formattedDate: formatDate(item.date)
        },
        date: getLocalDateString(item.date),
        time: extractTimeString(item.date), 
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
              {formatTimeFromDate(item.date)}
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.lightBlue} />

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
                onDayPress={day => {
                  console.log('Selected date:', day.dateString);
                  setSelectedDate(day.dateString);
                }}
                markedDates={getMarkedDates()}
                theme={{
                  backgroundColor: COLORS.cream,
                  calendarBackground: COLORS.cream,
                  textSectionTitleColor: COLORS.textDark,
                  selectedDayBackgroundColor: COLORS.accent,
                  selectedDayTextColor: '#fff',
                  todayTextColor: COLORS.accent,
                  dayTextColor: COLORS.textDark,
                  textDisabledColor: 'rgba(51, 51, 51, 0.5)',
                  arrowColor: COLORS.textDark,
                  monthTextColor: COLORS.textDark,
                  dotColor: COLORS.darkBlue,
                  selectedDotColor: '#fff',
                }}
                style={{ borderRadius: 20, padding: 10 }}
              />
            </View>

            <View style={styles.eventsContainer}>
              <View style={styles.eventsHeader}>
                <Text style={styles.eventsTitle}>{nombreDepartamento}</Text>
                <Text style={styles.eventsSubtitle}>
                  Eventos del {formatDate(selectedDate + 'T12:00:00')}
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
            <TouchableOpacity 
              style={styles.bottomNavItem} 
              onPress={() => navigation.navigate("Home")}
              activeOpacity={0.7}
            >
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
              <View style={styles.navIconContainer}>
                <Image source={require("../assets/profile.png")} style={styles.navIcon} />
              </View>
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
    backgroundColor: COLORS.lightBlue,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: "600",
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
  emptySpace: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    margin: 15,
    marginBottom: 0,
    padding: 20,
  },
  eventsContainer: {
    backgroundColor: COLORS.white,
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
  loadingImage: {
    width: 120,   
    height: 120,
    marginBottom: 20,
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
  fullScreenLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cream,
  },
});

export default DepartamentScreen;