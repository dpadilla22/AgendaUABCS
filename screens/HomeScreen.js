import { useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from "react-native"
import { StatusBar } from "expo-status-bar"

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Hoy")

  const handleTabPress = (tabName) => {
    setActiveTab(tabName)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con fondo blanco */}
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

      {/* Sección de pestañas con fondo azul */}
      <View style={styles.blueTabSection}>
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

      <ScrollView style={styles.content}>{/* Aquí irían los eventos */}</ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require("../assets/bookmark.png")} style={styles.bottomNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require("../assets/home.png")} style={styles.bottomNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require("../assets/profile.png")} style={styles.bottomNavIcon} />
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  whiteHeader: {
    backgroundColor: "white",
    paddingTop: 40,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  blueTabSection: {
    backgroundColor: "#2D6FA4",
    paddingVertical: 10,
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
    borderRadius:10,
    paddingHorizontal:10,
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
    width: 24,
    height: 24,
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
    borderRadius: 5,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#1E5C8B",
  },
  tabText: {
    color: "white",
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#2D6FA4",
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
  bottomNavIcon: {
    width: 24,
    height: 24,
    tintColor: "white",
  },
})

export default HomeScreen
