import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../hooks/useThemeApp';

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
const API_URL = "https://agendauabcs.up.railway.app";

const DepartamentScreen = ({ navigation, route }) => {
  const { nombreDepartamento } = route.params;
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState(null);
  const { colors, isDark } = useAppTheme();

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
        dotColor: '#3498db',
        activeOpacity: 0.8
      };
    });

    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: '#3498db',
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
      style={[styles.eventCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
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
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventInfoRow}>
            <Image 
              source={require("../assets/clock.png")} 
              style={[styles.eventIcon, { tintColor: colors.textSecondary }]} 
            />
            <Text style={[styles.eventInfoText, { color: colors.textSecondary }]}>
              {formatTimeFromDate(item.date)}
            </Text>
          </View>
          <View style={styles.eventInfoRow}>
            <Image 
              source={require("../assets/location.png")} 
              style={[styles.eventIcon, { tintColor: colors.textSecondary }]} 
            />
            <Text style={[styles.eventInfoText, { color: colors.textSecondary }]} numberOfLines={1}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.black }]}>
      <StatusBar 
        backgroundColor={colors.headerBg} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />

      {loading ? (
        <View style={[styles.fullScreenLoading, { backgroundColor: colors.background }]}>
          <Image
            source={require("../assets/agendaLogo.png")}
            style={styles.loadingImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: isDark ? 'rgba(90, 90, 90, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} 
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require("../assets/back-arrow.png")}
                style={[styles.backIcon, { tintColor: colors.text }]}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Calendario</Text>
            <View style={styles.emptySpace} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.calendarContainer, { backgroundColor: colors.cardBg }]}>
              <Calendar
                current={selectedDate}
                minDate={todayString}
                onDayPress={day => {
                  console.log('Selected date:', day.dateString);
                  setSelectedDate(day.dateString);
                }}
                markedDates={getMarkedDates()}
                theme={{
                  backgroundColor: colors.cardBg,
                  calendarBackground: colors.cardBg,
                  textSectionTitleColor: colors.text,
                  selectedDayBackgroundColor: '#3498db',
                  selectedDayTextColor: '#fff',
                  todayTextColor: '#3498db',
                  dayTextColor: colors.text,
                  textDisabledColor: colors.textSecondary,
                  arrowColor: colors.text,
                  monthTextColor: colors.text,
                  dotColor: '#3498db',
                  selectedDotColor: '#fff',
                  textDayFontWeight: '400',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                }}
                style={{ borderRadius: 20, padding: 10 }}
              />
            </View>

            <View style={[styles.eventsContainer, { backgroundColor: colors.cardBg }]}>
              <View style={styles.eventsHeader}>
                <Text style={[styles.eventsTitle, { color: colors.text }]}>{nombreDepartamento}</Text>
                <Text style={[styles.eventsSubtitle, { color: colors.textSecondary }]}>
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
                  <Image 
                    source={require("../assets/calendar.png")} 
                    style={[styles.emptyImage, { tintColor: colors.border }]} 
                  />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    No hay eventos para esta fecha
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                    Selecciona otra fecha en el calendario
                  </Text>
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

          <View style={[styles.bottomNav, { 
            backgroundColor: colors.navBg,
            borderTopColor: colors.border
          }]}>
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
              <View style={styles.navIconContainer}>
                <Image 
                  source={require("../assets/profile.png")} 
                  style={[styles.navIcon, { tintColor: colors.textSecondary }]} 
                />
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
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
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
    borderRadius: 20,
    margin: 15,
    marginBottom: 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsContainer: {
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
    marginBottom: 5,
  },
  eventsSubtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  eventsCount: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  eventCard: {
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
    borderWidth: 1,
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
    marginRight: 8,
  },
  eventInfoText: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  eventBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3498db',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
  eventColorIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    backgroundColor: '#3498db',
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
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomNav: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    paddingVertical: 9, 
    borderTopWidth: 3, 
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
  fullScreenLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DepartamentScreen;