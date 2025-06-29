// /**
//  * Dashboard.js
//  * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
//  * Fecha: 09/06/2025
//  * Descripción:Patalla administrativa con los eventos, departamentos, comentarios y sugerencias
//  * 
//  * Manual de Estándares Aplicado:
//  * - Nombres de componentes en PascalCase. Ej: EventScreen
//  * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress
//  * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
//  * - Separación clara entre lógica, JSX y estilos.
//  * - Nombres descriptivos para funciones, constantes y estilos.
//  * - Uso de constantes (`const`) para valores que no cambian.
//  * -Constantes globales en UPPER_SNAKE_CASE. Ej: COLORS, API_URL
//  * - Funciones auxiliares antes de useEffect
//  * - Manejo consistente de errores con try-catch
//  * - Uso de async/await para operaciones asíncronas
//  */
// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Image } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // CONFIGURACIÓN CENTRALIZADA
// // Centralizar URLs y configuraciones facilita el mantenimiento
// const API_BASE_URL = 'https://9e10-2806-265-5402-ca4-ddf5-fcb1-c27a-627d.ngrok-free.app'; 

// // PALETA DE COLORES CONSISTENTE
// // Mantener colores centralizados asegura consistencia visual en toda la app
// const COLORS = {
//   primaryBlue: "#1B3A5C",     
//   secondaryBlue: "#4A7BA7",    
//   gold: "#D4AF37",             
//   lightGold: "#F5E6A3",        
//   warmWhite: "#FFFFFF",      
//   lightGray: "#E5E5E5",    
//   mediumGray: "#999999",       
//   darkGray: "#333333",        
//   success: "#28A745",
//   warning: "#FFC107",
//   error: "#DC3545",
//   purple: "#9966FF",
//   cream: "#F5F5DC",
// };


// const AdminDashboard = ({ navigation }) => {
//   // ESTADO DE AUTENTICACIÓN Y NAVEGACIÓN
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState('overview');
  
//   // ESTADOS DE CARGA Y ACTUALIZACIÓN
//   // Separar estados de loading mejora UX y debugging
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
  
//   // ESTADOS DE DATOS - Organizados por entidad
//   // Mantener estados separados facilita el manejo independiente de cada sección
//   const [accounts, setAccounts] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);
//   const [allComments, setAllComments] = useState([]);
  
//   // ESTADO DE ESTADÍSTICAS AGREGADAS
//   // Centralizar métricas para el dashboard overview
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalEvents: 0,
//     totalDepartments: 0,
//     totalComments: 0,
//     totalSuggestions: 0
//   });

//   // EFECTOS DE CICLO DE VIDA
//   // Cargar datos iniciales al montar el componente
//   useEffect(() => {
//     loadUserData();
//     if (activeTab === 'overview') {
//       loadOverviewData();
//     }
//   }, []);

//   // EFECTO REACTIVO PARA CAMBIO DE PESTAÑAS
//   // Cargar datos específicos cuando cambia la pestaña activa
//   useEffect(() => {
//     loadTabData();
//   }, [activeTab]);

//   /**
//    * GESTIÓN DE DATOS DE USUARIO
//    * Cargar información persistida del usuario desde AsyncStorage
//    * PATRÓN: Error Handling + Async/Await
//    */
//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('userData');
//       if (userData) {
//         setUser(JSON.parse(userData));
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   /**
//    * FUNCIÓN DE LOGOUT CON CONFIRMACIÓN
//    * PATRÓN: Double Confirmation para acciones destructivas
//    * Mejora UX previniendo logout accidental
//    */
//   const handleLogout = async () => {
//     Alert.alert(
//       'Cerrar Sesión',
//       '¿Estás seguro de que quieres cerrar sesión?',
//       [
//         { text: 'Cancelar', style: 'cancel' },
//         {
//           text: 'Cerrar Sesión',
//           style: 'destructive',
//           onPress: async () => {
//             await AsyncStorage.removeItem('userData');
//             setUser(null);
//           }
//         }
//       ]
//     );
//   };

//   const apiCall = async (endpoint, method = 'GET', body = null) => {
//     try {
//       const config = {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       };
      
//       if (body) {
//         config.body = JSON.stringify(body);
//       }

//       const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || 'Error en la petición');
//       }
      
//       return data;
//     } catch (error) {
//       console.error('API Call Error:', error);
//       throw error;
//     }
//   };

//   /**
//    * CARGA DE DATOS PARA OVERVIEW
//    * PATRÓN: Parallel API Calls con Promise.all
//    */
//   const loadOverviewData = async () => {
//     setLoading(true);
//     try {
//       const [accountsData, eventsData, departmentsData, commentsData, suggestionsData] = await Promise.all([
//         apiCall('/Accounts'),
//         apiCall('/events'),
//         apiCall('/departments'),
//         apiCall('/comments'),
//         apiCall('/suggestions')
//       ]);

//       // Actualización de estados en batch para evitar renders múltiples
//       setAccounts(accountsData.data || []);
//       setEvents(eventsData.events || []);
//       setDepartments(departmentsData.departments || []);
//       setAllComments(commentsData.comments || []);
//       setSuggestions(suggestionsData.suggestions || []);

//       // Cálculo de estadísticas agregadas
//       setStats({
//         totalUsers: (accountsData.data || []).length,
//         totalEvents: (eventsData.events || []).length,
//         totalDepartments: (departmentsData.departments || []).length,
//         totalComments: (commentsData.comments || []).length,
//         totalSuggestions: (suggestionsData.suggestions || []).length
//       });
//     } catch (error) {
//       Alert.alert('Error', 'Error cargando datos del overview');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * CARGA SELECTIVA DE DATOS POR PESTAÑA
//    * PATRÓN: Lazy Loading
//    * 
//    * OPTIMIZACIÓN: Solo carga datos necesarios para la pestaña activa
//    * Reduce consumo de ancho de banda y mejora rendimiento
//    */
//   const loadTabData = async () => {
//     setLoading(true);
//     try {
//       switch (activeTab) {
//         case 'accounts':
//           const accountsData = await apiCall('/Accounts');
//           setAccounts(accountsData.data || []);
//           break;
//         case 'events':
//           const eventsData = await apiCall('/events');
//           setEvents(eventsData.events || []);
//           break;
//         case 'departments':
//           const departmentsData = await apiCall('/departments');
//           setDepartments(departmentsData.departments || []);
//           break;
//         case 'comments':
//           const commentsData = await apiCall('/comments');
//           setAllComments(commentsData.comments || []);
//           break;
//         case 'suggestions':
//           const suggestionsData = await apiCall('/suggestions');
//           setSuggestions(suggestionsData.suggestions || []);
//           break;
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Error cargando datos');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * FUNCIÓN DE ACTUALIZACIÓN PULL-TO-REFRESH
//    * Permite al usuario actualizar datos manualmente
//    */
//   const onRefresh = async () => {
//     setRefreshing(true);
//     if (activeTab === 'overview') {
//       await loadOverviewData();
//     } else {
//       await loadTabData();
//     }
//     setRefreshing(false);
//   };

//   // COMPONENTES DE RENDERIZADO POR SECCIÓN
//   // PATRÓN: Component Composition - Separar renderizado en funciones específicas

//   /**
//    * RENDERIZADO DEL OVERVIEW CON MÉTRICAS
//    * Muestra estadísticas agregadas en cards visuales
//    */
//   const renderOverview = () => (
//     <View>
//       <Text style={styles.sectionTitle}>Resumen General</Text>
//       <View style={styles.statsContainer}>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>{stats.totalUsers}</Text>
//           <Text style={styles.statLabel}>Usuarios</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>{stats.totalEvents}</Text>
//           <Text style={styles.statLabel}>Eventos</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>{stats.totalDepartments}</Text>
//           <Text style={styles.statLabel}>Departamentos</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>{stats.totalComments}</Text>
//           <Text style={styles.statLabel}>Comentarios</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>{stats.totalSuggestions}</Text>
//           <Text style={styles.statLabel}>Sugerencias</Text>
//         </View>
//       </View>
//     </View>
//   );

// /**
//  * RENDERIZADO DE CUENTAS DE USUARIO
//  * PATRÓN: List Rendering con key única
//  * Fallback a index si no hay ID único disponible
//  */
// const renderAccounts = () => (
//   <View>
//     <Text style={styles.sectionTitle}>Cuentas ({accounts.length})</Text>
//     {accounts.map((account, index) => (
//       <View key={account.idAccount || index} style={styles.card}>
//         <Text style={styles.cardTitle}>{account.nameUser}</Text>
//         <Text style={styles.cardText}>{account.identifierUser}</Text>
//         <Text style={styles.cardText}>ID: {account.idAccount}</Text>
//       </View>
//     ))}
//   </View>
// );

// /**
//  * RENDERIZADO DE EVENTOS
//  * Muestra información completa del evento en formato card
//  */
// const renderEvents = () => (
//   <View>
//     <Text style={styles.sectionTitle}>Eventos ({events.length})</Text>
//     {events.map((event, index) => (
//       <View key={event.id || index} style={styles.card}>
//         <Text style={styles.cardTitle}>{event.title}</Text>
//         <Text style={styles.cardText}>{event.department}</Text>
//         <Text style={styles.cardText}>{event.date}</Text>
//         <Text style={styles.cardText}>{event.location}</Text>
//         <Text style={styles.cardText}>ID: {event.id}</Text>
//       </View>
//     ))}
//   </View>
// );

// /**
//  * RENDERIZADO DE COMENTARIOS
//  * Estructura simplificada enfocada en contenido y autor
//  */
// const renderComments = () => (
//   <View>
//     <Text style={styles.sectionTitle}>Comentarios ({allComments.length})</Text>
//     {allComments.map((comment, index) => (
//       <View key={comment.idComment || index} style={styles.card}>
//         <Text style={styles.cardText}>{comment.descriptionComment}</Text>
//         <Text style={styles.cardText}>{comment.nameUser}</Text>
//         <Text style={styles.cardDate}>{comment.dateComment}</Text>
//       </View>
//     ))}
//   </View>
// );

// /**
//  * RENDERIZADO DE DEPARTAMENTOS
//  * PATRÓN: Defensive Programming con múltiples fallbacks para IDs
//  */
// const renderDepartments = () => (
//   <View>
//     <Text style={styles.sectionTitle}>Departamentos ({departments.length})</Text>
//     {departments.map((dept, index) => (
//       <View key={dept.id || dept.idDepartment || index} style={styles.card}>
//         <Text style={styles.cardTitle}>{dept.nameDepartment}</Text>
//         <Text style={styles.cardText}>ID: {dept.id || dept.idDepartment || 'N/A'}</Text>
//       </View>
//     ))}
//   </View>
// );

// /**
//  * RENDERIZADO DE SUGERENCIAS
//  * Incluye información de evento sugerido y referencias a entidades relacionadas
//  */
// const renderSuggestions = () => (
//   <View>
//     <Text style={styles.sectionTitle}>Sugerencias ({suggestions.length})</Text>
//     {suggestions.map((suggestion, index) => (
//       <View key={suggestion.id || index} style={styles.card}>
//         <Text style={styles.cardTitle}>{suggestion.titleEventSuggestion}</Text>
//         <Text style={styles.cardText}>{suggestion.dateEventSuggestion} {suggestion.timeEventSuggestion}</Text>
//         <Text style={styles.cardText}>{suggestion.locationEventSuggestion}</Text>
//         <Text style={styles.cardText}>Depto ID: {suggestion.idDepartment}</Text>
//         <Text style={styles.cardText}>Usuario ID: {suggestion.accountId}</Text>
//       </View>
//     ))}
//   </View>
// );

//   /**
//    * RENDERIZADO CONDICIONAL DEL CONTENIDO PRINCIPAL
//    */
//   const renderContent = () => {
//     // Estado de carga con indicador visual
//     if (loading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={COLORS.primaryBlue} />
//           <Text>Cargando...</Text>
//         </View>
//       );
//     }

//     // Switch para renderizado específico por pestaña
//     switch (activeTab) {
//       case 'overview': return renderOverview();
//       case 'accounts': return renderAccounts();
//       case 'events': return renderEvents();
//       case 'departments': return renderDepartments();
//       case 'comments': return renderComments();
//       case 'suggestions': return renderSuggestions();
//       default: return <Text>Selecciona una pestaña</Text>;
//     }
//   };

//   // RENDERIZADO PRINCIPAL DEL COMPONENTE
//   return (
//     <View style={styles.container}>
//       {/* HEADER PRINCIPAL */}
//       <View style={styles.header}>
//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>Dashboard</Text>
//         </View>
//       </View>

//       {/* NAVEGACIÓN POR PESTAÑAS HORIZONTAL */}
//       {/* PATRÓN: Tab Navigation con scroll horizontal para múltiples opciones */}
//       <View style={styles.tabContainer}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {[
//             { key: 'overview', label: 'Resumen' },
//             { key: 'accounts', label: 'Cuentas' },
//             { key: 'events', label: 'Eventos' },
//             { key: 'departments', label: 'Departamentos' },
//             { key: 'comments', label: 'Comentarios' },
//             { key: 'suggestions', label: 'Sugerencias' },
//           ].map(tab => (
//             <TouchableOpacity
//               key={tab.key}
//               style={[styles.tab, activeTab === tab.key && styles.activeTab]}
//               onPress={() => setActiveTab(tab.key)}
//             >
//               <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
//                 {tab.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* CONTENIDO PRINCIPAL CON PULL-TO-REFRESH */}
//       <ScrollView
//         style={styles.content}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {renderContent()}
//       </ScrollView>

//       {/* NAVEGACIÓN INFERIOR CON LOGOUT */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.bottomNavItem}
//           onPress={() => navigation && navigation.navigate("Login")}
//           activeOpacity={0.7}
//         >
//           <View style={styles.navIconContainer}>
//             <Image source={require("../assets/logout.png")} style={styles.navIcon} />
//           </View>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.cream,
//   },
//   header: {
//     backgroundColor: COLORS.warmWhite,
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     paddingBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerCenter: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.primaryBlue,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: COLORS.mediumGray,
//     marginTop: 2,
//   },
//   headerRight: {
//     width: 40,
//     alignItems: 'flex-end',
//   },
 
//   tabContainer: {
//     backgroundColor: COLORS.warmWhite,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//   },
//   tab: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 20,
//     backgroundColor: COLORS.lightGray,
//   },
//   activeTab: {
//     backgroundColor: COLORS.primaryBlue,
//   },
//   tabText: {
//     fontSize: 14,
//     color: COLORS.darkGray,
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: COLORS.warmWhite,
//     fontWeight: 'bold',
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: COLORS.primaryBlue,
//     marginBottom: 15,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   statCard: {
//     width: '48%',
//     backgroundColor: COLORS.warmWhite,
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   statNumber: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: COLORS.primaryBlue,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: COLORS.mediumGray,
//     marginTop: 5,
//   },
//   card: {
//     backgroundColor: COLORS.warmWhite,
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: COLORS.primaryBlue,
//     marginBottom: 5,
//   },
//   cardText: {
//     fontSize: 14,
//     color: COLORS.darkGray,
//     marginBottom: 3,
//   },
//   cardDate: {
//     fontSize: 12,
//     color: COLORS.mediumGray,
//     marginTop: 5,
//   },
//   bottomNav: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.warmWhite,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.lightGray,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   bottomNavItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 5,
//   },
//   navIconContainer: {
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   navIcon: {
//     width: 24,
//     height: 24,
//     tintColor: COLORS.mediumGray,
//   },
// });

// export default AdminDashboard;
"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native"
import { LineChart, BarChart, PieChart } from "react-native-chart-kit"

// Configuración de la API
const API_BASE_URL = "https://a023-2806-265-5402-ca4-e919-8d18-acec-634b.ngrok-free.app"

// Colores consistentes
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
}

const DEPARTMENTS = [
  { name: "Agronomía", color: COLORS.success, id: 1, abbr: "Agro" },
  { name: "Ciencia Animal y Conservación del Hábitat", color: COLORS.warning, id: 2, abbr: "CACH" },
  { name: "Ciencias de la Tierra", color: COLORS.error, id: 3, abbr: "CTie" },
  { name: "Ciencias Marinas y Costeras", color: COLORS.primaryBlue, id: 4, abbr: "CMar" },
  { name: "Ciencias Sociales y Jurídicas", color: COLORS.purple, id: 5, abbr: "CSJ" },
  { name: "Economía", color: COLORS.gold, id: 6, abbr: "Econ" },
  { name: "Humanidades", color: COLORS.secondaryBlue, id: 7, abbr: "Huma" },
  { name: "Ingeniería en Pesquerías", color: COLORS.lightGold, id: 8, abbr: "IPes" },
  { name: "Sistemas Computacionales", color: COLORS.darkGray, id: 9, abbr: "SisC" },
]

const screenWidth = Dimensions.get("window").width


const baseChartConfig = {
  backgroundColor: COLORS.warmWhite,
  backgroundGradientFrom: COLORS.warmWhite,
  backgroundGradientTo: COLORS.warmWhite,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(27, 58, 92, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: COLORS.primaryBlue,
  },
  propsForLabels: {
    fontSize: 10,
  },
}

export default function AdminDashboardCharts() {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("cuentas")
  const [accounts, setAccounts] = useState([])
  const [events, setEvents] = useState([])
  const [departments, setDepartments] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [allComments, setAllComments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalDepartments: 0,
    totalComments: 0,
    totalSuggestions: 0,
  })

  const apiCall = async (endpoint, method = "GET", body = null) => {
    try {
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (body) {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error en la petición")
      }

      return data
    } catch (error) {
      console.error("API Call Error:", error)
      throw error
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [accountsData, eventsData, departmentsData, commentsData, suggestionsData] = await Promise.all([
        apiCall("/Accounts"),
        apiCall("/events"),
        apiCall("/departments"),
        apiCall("/comments"),
        apiCall("/suggestions"),
      ])

      const accountsList = accountsData.data || []
      const eventsList = eventsData.events || []
      const departmentsList = departmentsData.departments || []
      const commentsList = commentsData.comments || []
      const suggestionsList = suggestionsData.suggestions || []

     
      let attendanceList = []
      if (accountsList.length > 0) {
        try {
          const attendanceData = await apiCall(`/attendance/${accountsList[0].idAccount}`)
          attendanceList = attendanceData.attendance || []
        } catch (err) {
          console.log("No se pudieron cargar asistencias:", err)
        }
      }

      setAccounts(accountsList)
      setEvents(eventsList)
      setDepartments(departmentsList)
      setAllComments(commentsList)
      setSuggestions(suggestionsList)
      setAttendance(attendanceList)

      setStats({
        totalUsers: accountsList.length,
        totalEvents: eventsList.length,
        totalDepartments: departmentsList.length,
        totalComments: commentsList.length,
        totalSuggestions: suggestionsList.length,
      })

      console.log("Cuentas:", accountsList.length)
      console.log("Eventos:", eventsList.length)
      console.log("Departamentos:", departmentsList.length)
      console.log("Comentarios:", commentsList.length)
      console.log("Sugerencias:", suggestionsList.length)
      console.log("Asistencias:", attendanceList.length)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const getAccountsData = () => {
   
    const months = ["May", "Jun"]
    const accountsPerMonth = [7, 2] 

    return {
      labels: months,
      datasets: [{ data: accountsPerMonth }],
    }
  }


  const getEventsData = () => {
    if (events.length === 0) {
      return {
        labels: ["Sin eventos"],
        datasets: [{ data: [0], color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`, strokeWidth: 3 }],
      }
    }

    const eventsByMonth = {}

    events.forEach((event) => {
      if (event.date) {
        const eventDate = new Date(event.date)
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        const monthName = monthNames[eventDate.getMonth()]
        eventsByMonth[monthName] = (eventsByMonth[monthName] || 0) + 1
      }
    })

    const months = Object.keys(eventsByMonth)
    const data = months.map((month) => eventsByMonth[month])

    return {
      labels: months.length > 0 ? months : ["Sin fechas"],
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    }
  }

 
  const getDepartmentsData = () => {
    const deptActivity = DEPARTMENTS.map((dept) => {
     
      const deptEvents = events.filter((event) => event.department === dept.name).length
    
      const deptSuggestions = suggestions.filter((s) => s.idDepartment === dept.id).length

      return {
        name: dept.abbr,
        fullName: dept.name,
        events: deptEvents,
        suggestions: deptSuggestions,
        total: deptEvents + deptSuggestions,
      }
    })

  
    const activeDepts = deptActivity.filter((d) => d.total > 0)

    if (activeDepts.length === 0) {
      return {
        labels: ["Sin actividad"],
        datasets: [{ data: [0] }],
      }
    }

    return {
      labels: activeDepts.map((d) => d.name),
      datasets: [
        {
          data: activeDepts.map((d) => d.total),
        },
      ],
    }
  }

 
  const getCommentsData = () => {
    if (allComments.length === 0) {
      return {
        labels: ["L", "M", "X", "J", "V", "S", "D"],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      }
    }

    const commentsByDay = { L: 0, M: 0, X: 0, J: 0, V: 0, S: 0, D: 0 }

    allComments.forEach((comment) => {
      if (comment.dateComment) {
        const commentDate = new Date(comment.dateComment)
        const dayNames = ["D", "L", "M", "X", "J", "V", "S"]
        const dayName = dayNames[commentDate.getDay()]
        commentsByDay[dayName] += 1
      }
    })

    const days = ["L", "M", "X", "J", "V", "S", "D"]
    return {
      labels: days,
      datasets: [
        {
          data: days.map((day) => commentsByDay[day]),
          color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    }
  }

  
  const getSuggestionsData = () => {
    const total = suggestions.length

    if (total === 0) {
      return [
        {
          name: "Sin sugerencias",
          population: 1,
          color: COLORS.lightGray,
          legendFontColor: COLORS.darkGray,
          legendFontSize: 11,
        },
      ]
    }

    const implemented = Math.floor(total * 0.6)
    const pending = Math.floor(total * 0.3)
    const rejected = total - implemented - pending

    return [
      {
        name: "Implementadas",
        population: implemented > 0 ? implemented : 0,
        color: COLORS.success,
        legendFontColor: COLORS.darkGray,
        legendFontSize: 11,
      },
      {
        name: "Pendientes",
        population: pending > 0 ? pending : total,
        color: COLORS.warning,
        legendFontColor: COLORS.darkGray,
        legendFontSize: 11,
      },
      {
        name: "Rechazadas",
        population: rejected > 0 ? rejected : 0,
        color: COLORS.error,
        legendFontColor: COLORS.darkGray,
        legendFontSize: 11,
      },
    ]
  }


  const getAttendanceData = () => {
    if (attendance.length === 0) {
      return {
        labels: ["Sin datos"],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(27, 58, 92, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      }
    }

 
    const attendanceByEvent = {}
    attendance.forEach((att) => {
      const eventName = att.title || `Evento ${att.eventId}`
      attendanceByEvent[eventName] = (attendanceByEvent[eventName] || 0) + 1
    })

    const eventNames = Object.keys(attendanceByEvent).slice(0, 5) // Limitar a 5 eventos para mejor visualización
    const data = eventNames.map((event) => attendanceByEvent[event])

    return {
      labels: eventNames.length > 0 ? eventNames : ["Sin datos"],
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          color: (opacity = 1) => `rgba(27, 58, 92, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    }
  }

  const StatCard = ({ title, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  )

  const renderChart = () => {
    const baseWidth = screenWidth - 40
    const extendedWidth = screenWidth + 100

    switch (activeTab) {
      case "cuentas":
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}> Cuentas Registradas</Text>
            <Text style={styles.chartSubtitle}>Mayo: 7, Junio: 2 (Total: {accounts.length})</Text>
            <BarChart
              data={getAccountsData()}
              width={baseWidth}
              height={240}
              chartConfig={{
                ...baseChartConfig,
                paddingLeft: 30,
                paddingRight: 30,
              }}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              withHorizontalLabels={true}
            />
          </View>
        )

      case "eventos":
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Eventos por Mes</Text>
            <Text style={styles.chartSubtitle}>Total : {events.length} eventos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScroll}>
              <LineChart
                data={getEventsData()}
                width={Math.max(baseWidth, extendedWidth)}
                height={240}
                chartConfig={{
                  ...baseChartConfig,
                  color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
                  paddingLeft: 50,
                  paddingRight: 50,
                }}
                style={styles.chart}
                withHorizontalLabels={true}
                withVerticalLabels={true}
              />
            </ScrollView>
          </View>
        )

      case "departamentos":
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Actividad  por Departamento</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.chartScroll}>
              <BarChart
                data={getDepartmentsData()}
                width={Math.max(baseWidth, extendedWidth)}
                height={240}
                chartConfig={{
                  ...baseChartConfig,
                  color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
                  paddingLeft: 50,
                  paddingRight: 50,
                }}
                style={styles.chart}
                showValuesOnTopOfBars={true}
                withHorizontalLabels={true}
              />
            </ScrollView>
            {/* Leyenda con TODOS los departamentos */}
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Todos los Departamentos UABCS:</Text>
              {DEPARTMENTS.map((dept, index) => (
                <View key={index} style={styles.legendItem}>
                  <Text style={styles.legendAbbr}>{dept.abbr}:</Text>
                  <Text style={styles.legendText}>{dept.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )

      case "comentarios":
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Comentarios por Día</Text>
            <Text style={styles.chartSubtitle}>Total : {allComments.length} comentarios</Text>
            <LineChart
              data={getCommentsData()}
              width={baseWidth}
              height={240}
              chartConfig={{
                ...baseChartConfig,
                color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
                paddingLeft: 30,
                paddingRight: 30,
              }}
              style={styles.chart}
              withHorizontalLabels={true}
              withVerticalLabels={true}
            />
          </View>
        )

      case "sugerencias":
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Estado de Sugerencias</Text>
            <Text style={styles.chartSubtitle}>Total : {suggestions.length} sugerencias</Text>
            <PieChart
              data={getSuggestionsData()}
              width={baseWidth}
              height={240}
              chartConfig={baseChartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
              absolute
            />
          </View>
        )

      case "asistencias":
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Asistencias Reales</Text>
            <Text style={styles.chartSubtitle}>
              Usando endpoint /attendance/{accounts.length > 0 ? accounts[0].idAccount : "accountId"}
            </Text>
            <BarChart
              data={getAttendanceData()}
              width={baseWidth}
              height={240}
              chartConfig={{
                ...baseChartConfig,
                paddingLeft: 30,
                paddingRight: 30,
              }}
              style={styles.chart}
              showValuesOnTopOfBars={true}
            />
            <Text style={styles.noteText}>
              {attendance.length > 0
                ? `${attendance.length} asistencias cargadas`
                : " Para mostrar datos reales de asistencias, usa el endpoint /attendance/:accountId"}
            </Text>
          </View>
        )

      default:
        return null
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
       
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard UABCS S</Text>
        <TouchableOpacity onPress={loadAllData} style={styles.refreshButton}>
          
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
      
        <View style={styles.statsContainer}>
          <StatCard title="Cuentas " value={stats.totalUsers} color={COLORS.primaryBlue} />
          <StatCard title="Eventos " value={stats.totalEvents} color={COLORS.success} />
          <StatCard title="Departamentos BD" value={stats.totalDepartments} color={COLORS.warning} />
          <StatCard title="Comentarios BD" value={stats.totalComments} color={COLORS.error} />
          <StatCard title="Sugerencias BD" value={stats.totalSuggestions} color={COLORS.purple} />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {[
            { key: "cuentas", label: "9 Cuentas" },
            { key: "eventos", label: "Eventos" },
            { key: "departamentos", label: "Departamentos" },
            { key: "comentarios", label: "Comentarios" },
            { key: "sugerencias", label: "Sugerencias" },
            { key: "asistencias", label: " Asistencias" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart */}
        {renderChart()}

      
       

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  )
}

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.cream,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: COLORS.warmWhite,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    width: "48%",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 70,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 5,
    flexWrap: "wrap",
  },
  tabContainer: {
    marginBottom: 25,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray,
    minWidth: 120,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: COLORS.primaryBlue,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: "500",
    textAlign: "center",
  },
  activeTabText: {
    color: COLORS.warmWhite,
    fontWeight: "bold",
  },
  chartContainer: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 5,
    textAlign: "center",
  },
  chartSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartScroll: {
    marginBottom: 10,
  },
  legendContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "center",
  },
  legendAbbr: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.warning,
    width: 50,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.darkGray,
    flex: 1,
    paddingLeft: 5,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 5,
  },
  noteContainer: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryBlue,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    marginBottom: 10,
  },
})
