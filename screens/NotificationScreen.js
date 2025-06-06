import { useEffect, useState, useRef } from "react"
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Image, StatusBar, RefreshControl } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import Toast from "react-native-toast-message"

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
  textLight: "#666666",
  primary: "#4A90E2",
  secondary: "#E8F4FD",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  cardBg: "#FFFFFF",
  shadow: "rgba(0, 0, 0, 0.08)",
  cream: "#F5F5DC",
  darkGray: "#666666",
}

const API_URL = "https://92d8-2806-265-5402-ca4-9c21-53fd-292c-aa68.ngrok-free.app"

const Notificaciones = () => {
  const navigation = useNavigation()
  const [notifications, setNotifications] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const previousNotificationsRef = useRef([])


  const convertUTCToLocal = (utcDateString) => {
    if (!utcDateString) return null

    try {
    
      const utcDate = new Date(utcDateString)

      const localDate = new Date(utcDate.getTime() - 7 * 60 * 60 * 1000)

      

      return localDate
    } catch (error) {
      console.error("Error converting UTC to local:", error)
      return new Date(utcDateString)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""

    try {
    
      const localDate = convertUTCToLocal(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - localDate)

      const diffSeconds = Math.floor(diffTime / 1000)
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffSeconds < 60) {
        return "Hace unos segundos"
      } else if (diffMinutes < 60) {
        return diffMinutes === 1 ? "Hace 1 minuto" : `Hace ${diffMinutes} minutos`
      } else if (diffHours < 24) {
        return diffHours === 1 ? "Hace 1 hora" : `Hace ${diffHours} horas`
      } else if (diffDays === 0) {
        return "Hoy"
      } else if (diffDays === 1) {
        return "Ayer"
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`
      } else {
        return localDate.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      }
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha no válida"
    }
  }


  const formatTime = (dateString) => {
    if (!dateString) return ""

    try {
    
      const localDate = convertUTCToLocal(dateString)

   
      const hours = localDate.getHours().toString().padStart(2, "0")
      const minutes = localDate.getMinutes().toString().padStart(2, "0")

    

      return `${hours}:${minutes}`
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Hora no válida"
    }
  }

  const checkForNewNotifications = (newNotifications) => {
    const previousNotifications = previousNotificationsRef.current

    if (previousNotifications.length === 0) {
      return
    }

    const newOnes = newNotifications.filter(
      (newNotif) => !previousNotifications.some((prevNotif) => prevNotif.id === newNotif.id),
    )

    newOnes.forEach((notification, index) => {
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: "📅 Nueva notificación",
          text2: notification.message,
          visibilityTime: 4000,
          position: "top",
          topOffset: 60,
        })
      }, index * 500)
    })
  }

  const fetchNotifications = async () => {
    try {
      let accountId = await AsyncStorage.getItem("accountId")
      if (!accountId) {
        accountId = await AsyncStorage.getItem("idAccount")
      }

      if (!accountId) {
        console.log("No account ID found")
        setLoading(false)
        setRefreshing(false)
        return
      }

      console.log("Fetching notifications for account:", accountId)

      const response = await fetch(`${API_URL}/notifications/${accountId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })

      const data = await response.json()
      console.log("Notifications response:", data)

      if (data.success && data.notifications) {
        const sortedNotifications = data.notifications.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))

        checkForNewNotifications(sortedNotifications)
        previousNotificationsRef.current = notifications
        setNotifications(sortedNotifications)
      } else {
        console.log("No notifications found or error:", data.message)
        setNotifications([])
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error)
      setNotifications([])
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las notificaciones",
        visibilityTime: 3000,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchNotifications()
  }

  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(() => {
      if (!refreshing && !loading) {
        fetchNotifications()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const renderNotificationItem = ({ item, index }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Image source={require("../assets/calendar.png")} style={styles.calendarIcon} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(item.dateCreated)}</Text>
          </View>
        </View>

        <Text style={styles.message}>{item.message}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.date}>{formatDate(item.dateCreated)}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.isRead ? COLORS.textLight : COLORS.primary }]} />
        </View>

       
      </View>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Image source={require("../assets/calendar.png")} style={styles.emptyCalendarIcon} />
      </View>
      <Text style={styles.emptyTitle}>Sin notificaciones</Text>
      <Text style={styles.emptySubtitle}>
        No tienes notificaciones nuevas.{"\n"}
        Te avisaremos cuando llegue algo importante.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing}>
          <Image
           
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderNotificationItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Home")} activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Image source={require("../assets/home.png")} style={styles.navIcon} />
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

      <Toast />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.cream,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  refreshIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cream,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  calendarIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.primary,
  },
  timeContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: COLORS.textDark,
    marginBottom: 16,
    textAlign: "left",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 12,
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
 
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cream,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCalendarIcon: {
    width: 50,
    height: 50,
    tintColor: COLORS.primary,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 24,
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
    shadowRadius: 4,
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
})

export default Notificaciones
