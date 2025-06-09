/**
 * EventScreen.js
 * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción:Patalla de sugerencias de eventos.
 * 
 * Manual de Estándares Aplicado:
 * - Nombres de componentes en PascalCase. Ej: EventScreen
 * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress
 * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
 * - Separación clara entre lógica, JSX y estilos.
 * - Nombres descriptivos para funciones, constantes y estilos.
 * - Uso de constantes (`const`) para valores que no cambian.
 * -Constantes globales en UPPER_SNAKE_CASE. Ej: COLORS, API_URL
 * - Funciones auxiliares antes de useEffect
 * - Manejo consistente de errores con try-catch
 * - Uso de async/await para operaciones asíncronas
 */
import { useState, useRef, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, TextInput, Alert, Animated, Platform, Modal } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Configuración de la URL base de la API - usar variable de entorno en producción
const API_BASE_URL = "https://9e10-2806-265-5402-ca4-ddf5-fcb1-c27a-627d.ngrok-free.app"

// Paleta de colores centralizada para consistencia visual
const COLORS = {
  coral: "#FF7B6B",
  darkBlue: "#003366",
  lightBlue: "#7BBFFF",
  lightGray: "#D9D9D9",
  offWhite: "#F5F5F5",
  yellow: "#FFCC33",
  purple: "#9966FF",
  mint: "#4ECDC4",
  pink: "#FF6B9D",
  orange: "#FFA726",
  green: "#66BB6A",
  cream: "#F5F5DC", 
}

// Configuración de departamentos con sus respectivos colores e IDs
const DEPARTMENTS = [
  { name: "Agronomía", color: COLORS.green, id: 1 },
  { name: "Ciencia Animal y Conservación del Hábitat", color: COLORS.orange, id: 2 },
  { name: "Ciencias de la Tierra", color: COLORS.coral, id: 3 },
  { name: "Ciencias Marinas y Costeras", color: COLORS.lightBlue, id: 4 },
  { name: "Ciencias Sociales y Jurídicas", color: COLORS.purple, id: 5 },
  { name: "Economía", color: COLORS.yellow, id: 6 },
  { name: "Humanidades", color: COLORS.pink, id: 7 },
  { name: "Ingeniería en Pesquerías", color: COLORS.mint, id: 8 },
  { name: "Sistemas Computacionales", color: COLORS.darkBlue, id: 9 },
]

/**
 * Función utilitaria para cargar el ID de cuenta desde AsyncStorage
 * Maneja la compatibilidad con claves anteriores para migración
 */
export const loadAccountId = async () => {
  try {
    let id = await AsyncStorage.getItem("accountId")
    // Fallback para compatibilidad con versiones anteriores
    if (!id) {
      id = await AsyncStorage.getItem("idAccount")
    }
    console.log("ID encontrado en AsyncStorage:", id)
    return id
  } catch (error) {
    console.error("Error cargando account ID:", error)
    return null
  }
}

const SuggestionScreen = ({ navigation, route }) => {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    departamento: "",
    ubicacion: "",
  })

  // Estados para los selectores y datos del evento
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState(new Date())
  
  // Estados para controlar la visibilidad de los pickers
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false)
  
  // Estados para el manejo de la UI y autenticación
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountId, setAccountId] = useState(null) 

  // Configuración del modal personalizado
  const [showModal, setShowModal] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "error",
    onConfirm: null,
    showCancel: false
  })

  // Referencias para animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  /**
   * Función para mostrar modales personalizados con diferentes configuraciones
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje del modal
   * @param {string} type - Tipo de modal (error, success, info)
   * @param {function} onConfirm - Función callback al confirmar
   * @param {boolean} showCancel - Mostrar botón de cancelar
   */
  const showCustomModal = (title, message, type = "error", onConfirm = null, showCancel = false) => {
    setModalConfig({
      title,
      message,
      type,
      onConfirm,
      showCancel
    })
    setShowModal(true)
  }

  const hideModal = () => {
    setShowModal(false)
    setModalConfig({
      title: "",
      message: "",
      type: "error",
      onConfirm: null,
      showCancel: false
    })
  }

  const handleModalConfirm = () => {
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm()
    }
    hideModal()
  }

  /**
   * Hook de inicialización de la pantalla
   * Carga el ID de cuenta y ejecuta animaciones de entrada
   */
  useEffect(() => {
    const initializeScreen = async () => {
      const id = await loadAccountId()
      if (id) {
        setAccountId(id) 
        console.log("Account ID inicializado:", id)
      } else {
        console.error("No se encontró accountId")
        showCustomModal(
          "Error de autenticación", 
          "No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente."
        )
      }

      // Animaciones paralelas para entrada suave
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()
    }

    initializeScreen()
  }, [])

  /**
   * Función genérica para actualizar campos del formulario
   * @param {string} field - Campo a actualizar
   * @param {string} value - Nuevo valor
   */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Manejadores para los date/time pickers nativos
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime) {
      setTime(selectedTime)
    }
  }

  // Funciones de formateo para mostrar fecha y hora al usuario
  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time) => {
    return time.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  // Funciones de formateo para enviar datos a la API
  const formatDateForAPI = (date) => {
    return date.toISOString().split("T")[0] // Formato YYYY-MM-DD
  }

  const formatTimeForAPI = (time) => {
    return time.toTimeString().split(" ")[0] // Formato HH:MM:SS
  }

  /**
   * Validación del formulario antes del envío
   * Verifica que todos los campos requeridos estén completos
   * @returns {boolean} - true si el formulario es válido
   */
  const validateForm = () => {
    if (!formData.titulo.trim()) {
      showCustomModal("Campo requerido", "Es necesario proporcionar un título para el evento.")
      return false
    }
    if (!selectedDepartment) {
      showCustomModal("Campo requerido", "Debe seleccionar el departamento al que pertenece el evento.")
      return false
    }
    if (!formData.ubicacion.trim()) {
      showCustomModal("Campo requerido", "Es necesario especificar la ubicación donde se realizará el evento.")
      return false
    }
    if (!accountId) {
      showCustomModal(
        "Error de autenticación", 
        "No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente."
      )
      return false
    }
    return true
  }

  /**
   * Función para crear sugerencia de evento en el backend
   * @param {Object} eventData - Datos del evento a crear
   * @throws {Error} - Error si la petición falla
   */
  const createEventSuggestion = async (eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/createSuggestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Header específico para ngrok
        },
        body: JSON.stringify(eventData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}: ${response.statusText}`)
      }

      return result
    } catch (error) {
      console.error("Error creating event suggestion:", error)
      throw error
    }
  }

  /**
   * Manejador principal del envío del formulario
   * Valida, envía datos y maneja respuestas/errores
   */
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    // Animación de feedback visual al enviar
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    try {
      // Preparación de datos para la API
      const eventData = {
        titleEventSuggestion: formData.titulo.trim(),
        idDepartment: selectedDepartment.id,
        dateEventSuggestion: formatDateForAPI(date),
        timeEventSuggestion: formatTimeForAPI(time),
        locationEventSuggestion: formData.ubicacion.trim(),
        accountId: accountId,
      }

      console.log("Datos del evento que se enviarán:", eventData)

      const result = await createEventSuggestion(eventData)

      // Éxito: mostrar confirmación y resetear formulario
      showCustomModal(
        "Sugerencia enviada",
        "Su sugerencia de evento ha sido enviada correctamente. Será revisada por nuestro equipo antes de su publicación.",
        "success",
        () => {
          // Reset del formulario
          setFormData({
            titulo: "",
            departamento: "",
            ubicacion: "",
          })
          setSelectedDepartment(null)
          setDate(new Date())
          setTime(new Date())

          navigation.goBack()
        }
      )
    } catch (error) {
      console.error("Error submitting event:", error)
      showCustomModal(
        "Error al enviar", 
        error.message || "Ha ocurrido un error al enviar su sugerencia. Por favor, inténtelo nuevamente."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Manejador para la selección de departamento
   * Actualiza tanto el estado local como el formulario
   */
  const handleDepartmentSelect = (dept) => {
    console.log("Departamento seleccionado:", dept)
    
    handleInputChange("departamento", dept.name)
    setSelectedDepartment(dept)
    
    setShowDepartmentPicker(false)
  }

  /**
   * Función para obtener color específico de cada departamento
   * Mapeo personalizado para mejor diferenciación visual
   * @param {string} deptName - Nombre del departamento
   * @returns {string} - Código de color hexadecimal
   */
  const getDepartmentColor = (deptName) => {
    const colors = {
      'Sistemas Computacionales': '#3B82F6', 
      'Economía': '#F59E0B', 
      'Ciencias Sociales y Jurídicas': '#06B6D4', 
      'Agronomía': '#10B981', 
      'Ciencias de la Tierra': '#8B5CF6',
      'Humanidades': '#F97316',
      'Ingeniería en Pesquerías': '#EF4444',
      'Ciencias Marinas y Costeras': '#34D399',
      'Ciencia Animal y Conservación del Hábitat': '#FBBF24',
    };
    return colors[deptName] || '#6B7280'; // Color por defecto
  };

  /**
   * Componente Modal para selección de departamento
   * Interfaz mejorada con iconos y colores diferenciados
   */
  const DepartmentPickerModal = () => (
    <Modal
      visible={showDepartmentPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDepartmentPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.departmentModalContainer}>
          <View style={styles.modalHandle} />
          
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Seleccionar departamento</Text>
            <Text style={styles.pickerSubtitle}>Elija el área académica correspondiente</Text>
          </View>
          
          <ScrollView 
            style={styles.pickerScrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {DEPARTMENTS.map((dept, index) => (
              <TouchableOpacity
                key={`dept-${dept.id}-${index}`} // Key única para evitar warnings
                style={[
                  styles.departmentItem, 
                  { 
                    borderLeftColor: getDepartmentColor(dept.name),
                  }
                ]}
                onPress={() => handleDepartmentSelect(dept)}
                activeOpacity={0.7}
              >
                <View style={styles.departmentContent}>
                  <View style={[styles.departmentIcon, { backgroundColor: getDepartmentColor(dept.name) }]}>
                    <Text style={styles.departmentIconText}>
                      {dept.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.departmentText}>{dept.name}</Text>
                </View>
                <View style={[styles.departmentIndicator, { backgroundColor: getDepartmentColor(dept.name) }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.pickerCloseButton} 
            onPress={() => setShowDepartmentPicker(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerCloseText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  /**
   * Componente Modal personalizado para mensajes del sistema
   * Soporta diferentes tipos: success, error, info
   */
  const CustomModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      onRequestClose={hideModal}
    >
      <View style={styles.customModalOverlay}>
        <View style={styles.customModalContainer}>
          <View style={[
            styles.modalHeader, 
            { backgroundColor: modalConfig.type === 'success' ? '#10B981' : modalConfig.type === 'info' ? '#3B82F6' : '#EF4444' }
          ]}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
          </View>
          
          <View style={styles.modalFooter}>
            {modalConfig.showCancel && (
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={hideModal}>
                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleModalConfirm}>
              <Text style={styles.modalButtonPrimaryText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header simplificado con navegación */}
      <View style={styles.simpleHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Sugerir Evento</Text>
        </View>
      </View>

      {/* Contenido principal con animaciones */}
      <Animated.ScrollView
        style={[styles.scrollContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Campo de título */}
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={styles.label}>Título del Evento</Text>
              <Text style={styles.sublabel}>Proporcione un nombre descriptivo para el evento</Text>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Nombre del evento"
            value={formData.titulo}
            onChangeText={(value) => handleInputChange("titulo", value)}
            maxLength={100}
            placeholderTextColor="#999"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.characterCount}>{formData.titulo.length}/100</Text>
          </View>
        </Animated.View>

        {/* Selector de departamento con indicador visual */}
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={styles.label}>Departamento</Text>
              <Text style={styles.sublabel}>Área académica a la que pertenece el evento</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.selectInput, 
              selectedDepartment && { 
                borderColor: getDepartmentColor(selectedDepartment.name),
                shadowColor: getDepartmentColor(selectedDepartment.name),
                shadowOpacity: 0.2,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 3
              }
            ]}
            onPress={() => setShowDepartmentPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.selectContent}>
              {selectedDepartment && (
                <View style={[styles.selectedDeptIcon, { backgroundColor: getDepartmentColor(selectedDepartment.name) }]}>
                  <Text style={styles.selectedDeptIconText}>
                    {selectedDepartment.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={[styles.selectText, !formData.departamento && styles.placeholderText]}>
                {formData.departamento || "Seleccionar departamento"}
              </Text>
            </View>
            <Text style={styles.chevronIcon}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Selector de fecha */}
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={styles.label}>Fecha del Evento</Text>
              <Text style={styles.sublabel}>Fecha programada para la realización del evento</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.selectText}>{formatDate(date)}</Text>
            <Text style={styles.chevronIcon}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Selector de hora */}
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={styles.label}>Hora del Evento</Text>
              <Text style={styles.sublabel}>Hora de inicio del evento</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.selectText}>{formatTime(time)}</Text>
            <Text style={styles.chevronIcon}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Campo de ubicación */}
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={styles.label}>Ubicación</Text>
              <Text style={styles.sublabel}>Lugar donde se realizará el evento</Text>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Poliforo"
            value={formData.ubicacion}
            onChangeText={(value) => handleInputChange("ubicacion", value)}
            maxLength={100}
            placeholderTextColor="#999"
          />
        </Animated.View>

        {/* Botón de envío con estado de carga */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Enviando..." : "Enviar Sugerencia"}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Nota informativa */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerNote}>
            Su sugerencia será evaluada por nuestro equipo antes de ser publicada
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Date/Time Pickers nativos - solo se muestran cuando son necesarios */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      {/* Modales personalizados */}
      <DepartmentPickerModal />
      <CustomModal />

      {/* Navegación inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} 
        onPress={() => navigation.navigate("Home")}
        activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Image
              source={require("../assets/home.png")}
              style={styles.navIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, styles.activeNavItem]}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  simpleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: COLORS.cream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: "#333",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 30, 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000", 
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  inputCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000", 
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 12,
    color: "#000000", 
    opacity: 0.6,
  },
  textInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9ff",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#e8eaff",
    minHeight: 50,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9ff",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#e8eaff",
    minHeight: 50,
  },
  selectContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedDeptIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedDeptIconText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  selectText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  placeholderText: {
    color: "#999",
    fontWeight: "normal",
  },
  chevronIcon: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
    shadowColor: "#999",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },
  footerNote: {
    fontSize: 14,
    color: "#000000", 
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.7,
  },
  

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  

  departmentModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingTop: 10,
  },
  
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  
  pickerHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 25,
  },
  
  pickerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000", 
    marginBottom: 8,
  },
  
  pickerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: 'center',
  },
  
  pickerScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  
  scrollContentContainer: {
    paddingBottom: 20,
  },
  
  departmentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#f8f9ff",
    borderRadius: 15,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  departmentContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  departmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  
  departmentIconText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  
  departmentText: {
    fontSize: 16,
    color: "#000000", 
    flex: 1,
    fontWeight: "500",
  },
  
  departmentIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  
  pickerCloseButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
  },
  
  pickerCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000", 
  },
  
 
  customModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  customModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    minWidth: 280,
    maxWidth: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 60,
    justifyContent: 'center',
  },
  
  modalMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  
  // Bottom navigation
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
    tintColor: '#666',
  },
  
  activeNavItem: { 
    borderBottomWidth: 2, 
    borderColor: '#f0e342',
  },
})

export default SuggestionScreen;