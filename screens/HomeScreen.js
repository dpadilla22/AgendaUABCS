import { useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"

const COLORS = {
  coral: "#FF7B6B", 
  darkBlue: "#003366", 
  lightBlue: "#7BBFFF", 
  lightGray: "#D9D9D9", 
  offWhite: "#F5F5F5", 
  yellow: "#FFCC33",
  purple: "#9966FF", 
}

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Hoy")

  const handleTabPress = (tabName) => {
    setActiveTab(tabName)
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
          <TouchableOpacity style={styles.iconButton}>
            <Image source={require("../assets/notification.png")} style={styles.headerIcon} />
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

      <ScrollView style={styles.content}>
      
        <View style={styles.eventCard}>
          <Image
            source={require("../assets/code.jpg")}
            style={styles.eventImage}

          />
          <View style={styles.eventContent}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>Sistemas computacionales</Text>
            </View>
            <Text style={styles.eventTitle}>Conferencia:Avances en la inteligencia artificial</Text>
            <View style={styles.eventDetails}>
              <View style={styles.eventDetailRow}>
                <Image source={require("../assets/calendar.png")} style={styles.detailIcon} />
                <Text style={styles.detailText}>01 de mayo 2025</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Image source={require("../assets/clock.png")} style={styles.detailIcon} />
                <Text style={styles.detailText}>14:00 - 16:00</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Image source={require("../assets/location.png")} style={styles.detailIcon} />
                <Text style={styles.detailText}>Poliforo</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Image source={require("../assets/bookmark.png")} style={styles.bookmarkIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require("../assets/bookmark.png")} style={styles.bookMarkIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require("../assets/home.png")} style={styles.homeIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require("../assets/profile.png")} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  )
}

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
    backgroundColor: COLORS.darkBlue,
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
    fontSize: 18,
    fontWeight: "bold",
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
    color:"#000000" ,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  bookMarkIcon: {
    width: 45,
    height: 45,
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

export default HomeScreen
