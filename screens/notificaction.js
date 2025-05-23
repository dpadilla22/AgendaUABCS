import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ScrollView, 
  StatusBar
} from "react-native";

const COLORS = {
  darkBlue: "#003366",
  lightBlue: "#7AB3D1",
  accent: "#4A90E2",
  yellow: "#FFF7A3",
  green: "#E6FFE6",
  orange: "#FFEBCD",
  red: "#FFE4E1",
  gray: "#F5F5F5",
  textDark: "#333333",
  textLight: "#666666"
};

const Notificaciones = ({ navigation }) => {
 
  const getDepartmentColor = (dept) => {
    const colors = {
      'Departamento de Sistemas': COLORS.yellow,
      'Departamento de economía': COLORS.orange,
      'Departamento de Ciencias': COLORS.green,
      'Departamento de Agronomía': COLORS.red,
    };
    
    return colors[dept] || '#F0F0F0';
  };
  
  
  const notifications = [
    {
      id: 1,
      department: "Departamento de Sistemas",
      timeAgo: "Hace 2 horas",
      text: "Mañana habrá una conferencia del departamento de sistemas sobre los últimos avances en IA",
      image: require("../assets/code.jpg"),
      isNew: true
    },
    {
      id: 2,
      department: "Departamento de economía",
      timeAgo: "Hace 5 horas",
      text: "Taller práctico de herramientas económicas este viernes a las 16:00 en el Poliforo",
      image: require("../assets/code.jpg"),
      isNew: true
    },
    {
      id: 3,
      department: "Departamento de Ciencias",
      timeAgo: "Hace 1 día",
      text: "Simulacro de campo programado para el próximo lunes a las 9:00 AM",
      image: require("../assets/code.jpg"),
      isNew: false
    },
    {
      id: 4,
      department: "Departamento de Agronomía",
      timeAgo: "Hace 2 días",
      text: "Mini feria de maquinaria agrícola este fin de semana en el campo experimental",
      image: require("../assets/code.jpg"),
      isNew: false
    },
    {
      id: 5,
      department: "Departamento de Sistemas",
      timeAgo: "Hace 3 días",
      text: "Recordatorio: Entrega de proyectos finales el próximo viernes",
      image: require("../assets/code.jpg"),
      isNew: false
    }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

  
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.emptySpace} />
      </View>

     
      <View style={styles.notificationCountContainer}>
        <Text style={styles.notificationCountText}>
          {notifications.length} notificaciones
        </Text>
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Limpiar todo</Text>
        </TouchableOpacity>
      </View>

     
      <ScrollView 
        style={styles.notificationsContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.map((notification) => (
          <View key={notification.id} style={[
            styles.notificationCard,
            notification.isNew && styles.newNotificationCard
          ]}>
            {notification.isNew && <View style={styles.newIndicator} />}
            <Image source={notification.image} style={styles.notificationImage} />
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <View style={[
                  styles.departmentTag, 
                  {backgroundColor: getDepartmentColor(notification.department)}
                ]}>
                  <Text style={styles.departmentName}>{notification.department}</Text>
                </View>
                <Text style={styles.timeAgo}>{notification.timeAgo}</Text>
              </View>
              <Text style={styles.notificationText}>
                {notification.text}
              </Text>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
            source={require("../assets/home.png")} 
            style={[styles.navIcon, styles.homeIcon]} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bottomNavItem} 
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  emptySpace: {
    width: 36,
  },
  notificationCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  notificationCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.gray,
    borderRadius: 15,
  },
  clearButtonText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    position: "relative",
  },
  newNotificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  newIndicator: {
    position: "absolute",
    top: 15,
    left: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  notificationImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  departmentTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  departmentName: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  notificationText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 10,
  },
  detailsButton: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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

export default Notificaciones;