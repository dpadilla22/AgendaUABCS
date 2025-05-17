import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, StatusBar } from "react-native"

const COLORS = {
  darkBlue: "#003366",
  lightBlue: "#7AB3D1",
}

const Notificaciones = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />


      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView style={styles.notificationsContainer} showsVerticalScrollIndicator={false}>
       
        <View style={styles.notificationCard}>
          <Image source={require("../assets/code.jpg")} style={styles.notificationImage} />
          <View style={styles.notificationContent}>
            <Text style={styles.departmentName}>Departamento de Sistemas</Text>
            <Text style={styles.timeAgo}>Hace 2 horas</Text>
            <Text style={styles.notificationText}>
              Mañana habrá una conferencia del departamento de sistemas sobre los últimos avances en IA
            </Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>

  
        <View style={styles.notificationCard}>
          <Image source={require("../assets/code.jpg")} style={styles.notificationImage} />
          <View style={styles.notificationContent}>
            <Text style={styles.departmentName}>Departamento de economía</Text>
            <Text style={styles.timeAgo}>Hace 5 horas</Text>
            <Text style={styles.notificationText}>
              Mañana habrá una conferencia del departamento de sistemas sobre los últimos avances en IA.
            </Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>

  
        <View style={styles.notificationCard}>
          <Image source={require("../assets/code.jpg")} style={styles.notificationImage} />
          <View style={styles.notificationContent}>
            <Text style={styles.departmentName}>Departamento de economía</Text>
            <Text style={styles.timeAgo}>Hace 5 horas</Text>
            <Text style={styles.notificationText}>
              Mañana habrá una conferencia del departamento de sistemas sobre los últimos avances en IA.
            </Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>

        
        <View style={styles.notificationCard}>
          <Image source={require("../assets/code.jpg")} style={styles.notificationImage} />
          <View style={styles.notificationContent}>
            <Text style={styles.departmentName}>Departamento de economía</Text>
            <Text style={styles.timeAgo}>Hace 5 horas</Text>
            <Text style={styles.notificationText}>
              Mañana habrá una conferencia del departamento de sistemas sobre los últimos avances en IA.
            </Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>

       
        <View style={styles.notificationCard}>
          <Image source={require("../assets/code.jpg")} style={styles.notificationImage} />
          <View style={styles.notificationContent}>
            <Text style={styles.departmentName}>Departamento de economía</Text>
            <Text style={styles.timeAgo}>Hace 5 horas</Text>
            <Text style={styles.notificationText}>
              Mañana habrá una conferencia del departamento de sistemas sobre los últimos avances en IA.
            </Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

   
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <Image source={require("../assets/location.png")} style={styles.locationIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Home")}>
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
  },
  emptySpace: {
    width: 24,
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
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
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  departmentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  notificationText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    marginBottom: 8,
  },
  detailsButton: {
    alignSelf: "flex-end",
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
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

export default Notificaciones
