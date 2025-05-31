import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Image, StatusBar, RefreshControl } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

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
  shadow: "rgba(0, 0, 0, 0.08)"
};

const Notificaciones = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return "Hoy";
    } else if (diffDays === 2) {
      return "Ayer";
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getNotificationIcon = (message) => {
    if (message.toLowerCase().includes('pago') || message.toLowerCase().includes('cobro')) {
      return ';p';
    } else if (message.toLowerCase().includes('evento') || message.toLowerCase().includes('cita')) {
      return ':0';
    } else if (message.toLowerCase().includes('mensaje') || message.toLowerCase().includes('chat')) {
      return 'D:';
    } else if (message.toLowerCase().includes('alerta') || message.toLowerCase().includes('importante')) {
      return ':D';
    } else {
      return ':v';
    }
  };

  const getNotificationColor = (message) => {
    if (message.toLowerCase().includes('pago') || message.toLowerCase().includes('cobro')) {
      return COLORS.success;
    } else if (message.toLowerCase().includes('alerta') || message.toLowerCase().includes('importante')) {
      return COLORS.warning;
    } else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('problema')) {
      return COLORS.error;
    } else {
      return COLORS.primary;
    }
  };

  const fetchNotifications = async () => {
  try {
    const accountId = await AsyncStorage.getItem("accountId");
    if (!accountId) return;

    const response = await fetch(`https://b141-200-92-221-53.ngrok-free.app/notifications/${accountId}`);
    const data = await response.json();

    if (data.success) {
     
      const latestNotification = data.notifications[0];
      if (notifications.length === 0 || latestNotification.id !== notifications[0]?.id) {
        Toast.show({
          type: 'info',
          text1: getNotificationIcon(latestNotification.message) + " Nueva notificación",
          text2: latestNotification.message,
          visibilityTime: 4000,
        });
      }

      setNotifications(data.notifications);
    }
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderNotificationItem = ({ item, index }) => {
    const icon = getNotificationIcon(item.message);
    const accentColor = getNotificationColor(item.message);
    
    return (
      <View style={[styles.card, { borderLeftColor: accentColor }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
            <Text style={styles.notificationIcon}>{icon}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(item.dateCreated)}</Text>
          </View>
        </View>
        
        <Text style={styles.message}>{item.message}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.date}>{formatDate(item.dateCreated)}</Text>
          <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}></Text>
      </View>
      <Text style={styles.emptyTitle}>Sin notificaciones</Text>
      <Text style={styles.emptySubtitle}>
        No tienes notificaciones nuevas.{'\n'}
        Te avisaremos cuando llegue algo importante.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

 
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.emptySpace} />
      </View>


      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
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
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("Home")}>
          <Image source={require('../assets/home.png')} style={[styles.navIcon, styles.homeIcon]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("EventScreen")}>
          <Image source={require("../assets/more.png")} style={[styles.navIcon, styles.moreIcon]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => navigation.navigate("profile")}>
          <Image source={require("../assets/profile.png")} style={[styles.navIcon, styles.profileIcon]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  timeContainer: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 36,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
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
    padding: 7
  },
  navIcon: { 
    width: 24, 
    height: 24,
    tintColor: "#131311",
  },
  profileIcon: {
    width: 45, 
    height: 45,
    tintColor: "#131311",
  },
  homeIcon: { 
    width: 28, 
    height: 28, 
    tintColor: "#131311",
  },
  moreIcon: { 
    width: 40, 
    height: 40, 
    tintColor: "#131311",
  },
});

export default Notificaciones;