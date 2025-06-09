import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://4e06-200-92-221-16.ngrok-free.app'; 

const COLORS = {
  primaryBlue: "#1B3A5C",     
  secondaryBlue: "#4A7BA7",    
  gold: "#D4AF37",             
  lightGold: "#F5E6A3",        
  warmWhite: "#FFFFFF",      
  lightGray: "#E5E5E5",    
  mediumGray: "#999999",       
  darkGray: "#333333",        
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  purple: "#9966FF",
  cream: "#F5F5DC",
};

const AdminDashboard = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  

  const [accounts, setAccounts] = useState([]);
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalDepartments: 0,
    totalComments: 0,
    totalSuggestions: 0
  });

  useEffect(() => {
    loadUserData();
    if (activeTab === 'overview') {
      loadOverviewData();
    }
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            setUser(null);
          }
        }
      ]
    );
  };

  const apiCall = async (endpoint, method = 'GET', body = null) => {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  };

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [accountsData, eventsData, departmentsData, commentsData, suggestionsData] = await Promise.all([
        apiCall('/Accounts'),
        apiCall('/events'),
        apiCall('/departments'),
        apiCall('/comments'),
        apiCall('/suggestions')
      ]);

      setAccounts(accountsData.data || []);
      setEvents(eventsData.events || []);
      setDepartments(departmentsData.departments || []);
      setAllComments(commentsData.comments || []);
      setSuggestions(suggestionsData.suggestions || []);

      setStats({
        totalUsers: (accountsData.data || []).length,
        totalEvents: (eventsData.events || []).length,
        totalDepartments: (departmentsData.departments || []).length,
        totalComments: (commentsData.comments || []).length,
        totalSuggestions: (suggestionsData.suggestions || []).length
      });
    } catch (error) {
      Alert.alert('Error', 'Error cargando datos del overview');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'accounts':
          const accountsData = await apiCall('/Accounts');
          setAccounts(accountsData.data || []);
          break;
        case 'events':
          const eventsData = await apiCall('/events');
          setEvents(eventsData.events || []);
          break;
        case 'departments':
          const departmentsData = await apiCall('/departments');
          setDepartments(departmentsData.departments || []);
          break;
        case 'comments':
          const commentsData = await apiCall('/comments');
          setAllComments(commentsData.comments || []);
          break;
        case 'suggestions':
          const suggestionsData = await apiCall('/suggestions');
          setSuggestions(suggestionsData.suggestions || []);
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'overview') {
      await loadOverviewData();
    } else {
      await loadTabData();
    }
    setRefreshing(false);
  };

  const renderOverview = () => (
    <View>
      <Text style={styles.sectionTitle}>Resumen General</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalEvents}</Text>
          <Text style={styles.statLabel}>Eventos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalDepartments}</Text>
          <Text style={styles.statLabel}>Departamentos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalComments}</Text>
          <Text style={styles.statLabel}>Comentarios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSuggestions}</Text>
          <Text style={styles.statLabel}>Sugerencias</Text>
        </View>
      </View>
    </View>
  );

const renderAccounts = () => (
  <View>
    <Text style={styles.sectionTitle}>Cuentas ({accounts.length})</Text>
    {accounts.map((account, index) => (
      <View key={account.idAccount || index} style={styles.card}>
        <Text style={styles.cardTitle}>{account.nameUser}</Text>
        <Text style={styles.cardText}>{account.identifierUser}</Text>
        <Text style={styles.cardText}>ID: {account.idAccount}</Text>
      </View>
    ))}
  </View>
);

const renderEvents = () => (
  <View>
    <Text style={styles.sectionTitle}>Eventos ({events.length})</Text>
    {events.map((event, index) => (
      <View key={event.id || index} style={styles.card}>
        <Text style={styles.cardTitle}>{event.title}</Text>
        <Text style={styles.cardText}>{event.department}</Text>
        <Text style={styles.cardText}>{event.date}</Text>
        <Text style={styles.cardText}>{event.location}</Text>
        <Text style={styles.cardText}>ID: {event.id}</Text>
      </View>
    ))}
  </View>
);

const renderComments = () => (
  <View>
    <Text style={styles.sectionTitle}>Comentarios ({allComments.length})</Text>
    {allComments.map((comment, index) => (
      <View key={comment.idComment || index} style={styles.card}>
        {/* <Text style={styles.cardTitle}>{comment.titleComment}</Text> */}
        <Text style={styles.cardText}>{comment.descriptionComment}</Text>
        <Text style={styles.cardText}>{comment.nameUser}</Text>
        <Text style={styles.cardDate}>{comment.dateComment}</Text>
      </View>
    ))}
  </View>
);
const renderDepartments = () => (
  <View>
    <Text style={styles.sectionTitle}>Departamentos ({departments.length})</Text>
    {departments.map((dept, index) => (
      <View key={dept.id || dept.idDepartment || index} style={styles.card}>
        <Text style={styles.cardTitle}>{dept.nameDepartment}</Text>
        <Text style={styles.cardText}>ID: {dept.id || dept.idDepartment || 'N/A'}</Text>
      </View>
    ))}
  </View>
);

const renderSuggestions = () => (
  <View>
    <Text style={styles.sectionTitle}>Sugerencias ({suggestions.length})</Text>
    {suggestions.map((suggestion, index) => (
      <View key={suggestion.id || index} style={styles.card}>
        <Text style={styles.cardTitle}>{suggestion.titleEventSuggestion}</Text>
        <Text style={styles.cardText}>{suggestion.dateEventSuggestion} {suggestion.timeEventSuggestion}</Text>
        <Text style={styles.cardText}>{suggestion.locationEventSuggestion}</Text>
        <Text style={styles.cardText}>Depto ID: {suggestion.idDepartment}</Text>
        <Text style={styles.cardText}>Usuario ID: {suggestion.accountId}</Text>
      </View>
    ))}
  </View>
);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          <Text>Cargando...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'accounts': return renderAccounts();
      case 'events': return renderEvents();
      case 'departments': return renderDepartments();
      case 'comments': return renderComments();
      case 'suggestions': return renderSuggestions();
      default: return <Text>Selecciona una pestaña</Text>;
    }
  };

  return (
    <View style={styles.container}>
     
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        
        </View>
      </View>

    
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'Resumen' },
            { key: 'accounts', label: 'Cuentas' },
            { key: 'events', label: 'Eventos' },
            { key: 'departments', label: 'Departamentos' },
            { key: 'comments', label: 'Comentarios' },
            { key: 'suggestions', label: 'Sugerencias' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

   
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}>
       
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation && navigation.navigate("Login")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image source={require("../assets/logout.png")} style={styles.navIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    backgroundColor: COLORS.warmWhite,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
 
  tabContainer: {
    backgroundColor: COLORS.warmWhite,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  activeTab: {
    backgroundColor: COLORS.primaryBlue,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.warmWhite,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.warmWhite,
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginTop: 5,
  },
  card: {
    backgroundColor: COLORS.warmWhite,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 3,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.warmWhite,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.mediumGray,
  },
});

export default AdminDashboard;