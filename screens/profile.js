import { useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar } from "react-native"


const COLORS = {
  darkBlue: "#003366",
  lightBlue: "#7AB3D1",
}

const Profile = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

   
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <View style={styles.emptySpace} />
      </View>


      <View style={styles.profileSection}>
        <View style={styles.profileContent}>
          <Image source={require("../assets/student.png")} style={styles.profileImage} />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileTitle}>Estudiante UABCS</Text>
            <Text style={styles.profileUsername}>dpadilla_22</Text>
          </View>
        </View>
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Eventos guardados (5)</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
      
          <View style={styles.eventCard}>
            <Image source={require("../assets/code.jpg")} style={styles.eventImage} />
            <View style={styles.eventContent}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>Ciencias de la tierra</Text>
              </View>
              <Text style={styles.eventTitle}>Simulacro de campo</Text>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                  <Image source={require("../assets/calendar.png")} style={styles.detailIcon} />
                  <Text style={styles.detailText}>01 de mayo,2025</Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Image source={require("../assets/clock.png")} style={styles.detailIcon} />
                  <Text style={styles.detailText}>09:00 - 11:00</Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Image source={require("../assets/location.png")} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Departamento de ciencias de la ti...</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Image source={require("../assets/bookmark.png")} style={styles.bookmarkIcon} />
            </TouchableOpacity>
          </View>

        
          <View style={styles.eventCard}>
            <Image source={require("../assets/code.jpg")} style={styles.eventImage} />
            <View style={styles.eventContent}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>Ciencias de la tierra</Text>
              </View>
              <Text style={styles.eventTitle}>Simulacro de campo</Text>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                  <Image source={require("../assets/calendar.png")} style={styles.detailIcon} />
                  <Text style={styles.detailText}>01 de mayo,2025</Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Image source={require("../assets/clock.png")} style={styles.detailIcon} />
                  <Text style={styles.detailText}>09:00 - 11:00</Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Image source={require("../assets/location.png")} style={styles.detailIcon} />
                  <Text style={styles.detailText}>Departamento de ciencias de la ti...</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Image source={require("../assets/bookmark.png")} style={styles.bookmarkIcon} />
            </TouchableOpacity>
          </View>

         
        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
         <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("LocationScreen")}>
                 <Image source={require('../assets/location.png')} style={styles.locationIcon} />
                </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={()=> navigation.navigate("Home")}>
          <Image source={require("../assets/home.png")} style={styles.homeIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Profile")}>
          <Image source={require("../assets/profile.png")} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

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
    paddingTop: 50,
    paddingBottom: 25,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptySpace: {
    width: 24, 
  },
  profileSection: {
    backgroundColor: COLORS.lightBlue, 
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 20,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profileTextContainer: {
    justifyContent: "center",
  },
  profileTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 5,
  },
  profileUsername: {
    color: "#fff",
    fontSize: 12,
  },
  eventsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 15,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  categoryTag: {
    backgroundColor: "#FFF7A3", 
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
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
    height: 60,
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
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
})

export default Profile
