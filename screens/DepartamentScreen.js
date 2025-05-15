import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const DepartamentScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda UABCS</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={require('../assets/notification.png')} style={styles.notificationIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarPlaceholder}>
        </View>

      
        <View style={styles.eventsContainer}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>Humanidades</Text>
            <Text style={styles.eventsSubtitle}>Eventos 23 de mayo</Text>
          </View>

         
          <View style={styles.eventCard}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Concurso de cosplay literario: ir disfrazado de personajes de libros o filosofía</Text>
              
              <View style={styles.eventDetail}>
                <Image source={require('../assets/clock.png')} style={styles.eventIcon} />
                <Text style={styles.eventTime}>14:00 - 16:00</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <Image source={require('../assets/location.png')} style={styles.eventIcon} />
                <Text style={styles.eventLocation}>Poliforo</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.bookmarkButton}>
              <Image source={require('../assets/bookmark.png')} style={styles.bookmarkIcon} />
            </TouchableOpacity>
          </View>

          
          <View style={styles.eventCard}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>Reconocimiento a estudiantes destacados</Text>
              
              <View style={styles.eventDetail}>
                <Image source={require('../assets/clock.png')} style={styles.eventIcon} />
                <Text style={styles.eventTime}>18:00 - 19:00</Text>
              </View>
              
              <View style={styles.eventDetail}>
                <Image source={require('../assets/location.png')} style={styles.eventIcon} />
                <Text style={styles.eventLocation}>Poliforo</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.bookmarkButton}>
              <Image source={require('../assets/bookmark.png')} style={styles.bookmarkIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

    
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require('../assets/location.png')} style={styles.locationIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require('../assets/home.png')} style={styles.homeIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Profile")}>
          <Image source={require('../assets/profile.png')} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: '#3498db',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    color: "#33",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  notificationIcon: {
    margintop:30,
    width: 20,
    height: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  calendarPlaceholder: {
    height: 220, 
    backgroundColor: '#4dabf7', 
    borderRadius: 20,
    margin: 15,
    marginBottom: 0,
  },
  eventsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  eventsHeader: {
    marginBottom: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventsSubtitle: {
    fontSize: 10,
    color: '#666',
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
    paddingRight: 10,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  bookmarkButton: {
    marginTop:30,
    alignItems: 'center',
    width: 40,
  },
  bookmarkIcon: {
    width: 30,
    height: 30,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#003366',
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
  },
  profileText: {
    fontSize: 12,
    color: '#fff',
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