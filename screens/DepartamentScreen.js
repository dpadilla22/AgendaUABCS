import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
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
  textLight: "#666666"
};

const DepartamentScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("2025-05-23");

  
  const markedDates = {
    [selectedDate]: { selected: true, selectedColor: COLORS.accent }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.accent} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require("../assets/back-arrow.png")} 
            style={[styles.backIcon, {tintColor: "#fff"}]} 
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
  markedDates={markedDates}
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
    indicatorColor: '#fff',
  }}
  style={{
    borderRadius: 20,
    padding: 10,
  }}
/>
        </View>

        
        <View style={styles.eventsContainer}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>Humanidades</Text>
            <Text style={styles.eventsSubtitle}>Eventos {selectedDate.split('-')[2]} de mayo</Text>
          </View>

        

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
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Image 
            source={require('../assets/home.png')} 
            style={[styles.navIcon, styles.homeIcon]} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Profile")}
        >
          <Image 
            source={require('../assets/profile.png')} 
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
    padding: 15,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  calendarMonthYear: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  calendarControls: {
    flexDirection: "row",
  },
  calendarControl: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  calendarControlText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  calendarDaysContainer: {
    paddingVertical: 10,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  selectedCalendarDay: {
    backgroundColor: "#fff",
  },
  calendarDayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedCalendarDayText: {
    color: COLORS.accent,
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
    marginBottom: 20,
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
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  eventColorBar: {
    position: 'absolute',
    left: 0,
    top: 15,
    bottom: 15,
    width: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  eventInfo: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  eventIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
    tintColor: COLORS.textLight,
  },
  eventTime: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  eventLocation: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  bookmarkButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  bookmarkIcon: {
    width: 24,
    height: 24,
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
});

export default DepartamentScreen;