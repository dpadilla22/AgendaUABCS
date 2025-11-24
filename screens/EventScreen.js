import { useState, useRef, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, TextInput, Alert, Animated, Platform, Modal } from "react-native"
import { StatusBar } from 'expo-status-bar'
import DateTimePicker from "@react-native-community/datetimepicker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAppTheme } from '../hooks/useThemeApp'

// Configuración de la URL base de la API
const API_BASE_URL = "https://agendauabcs.up.railway.app"

// Configuración de departamentos con sus respectivos colores e IDs
const DEPARTMENTS = [
  { name: "Agronomía", color: "#66BB6A", id: 1 },
  { name: "Ciencia Animal y Conservación del Hábitat", color: "#FFA726", id: 2 },
  { name: "Ciencias de la Tierra", color: "#FF7B6B", id: 3 },
  { name: "Ciencias Marinas y Costeras", color: "#7BBFFF", id: 4 },
  { name: "Ciencias Sociales y Jurídicas", color: "#9966FF", id: 5 },
  { name: "Economía", color: "#FFCC33", id: 6 },
  { name: "Humanidades", color: "#FF6B9D", id: 7 },
  { name: "Ingeniería en Pesquerías", color: "#4ECDC4", id: 8 },
  { name: "Sistemas Computacionales", color: "#003366", id: 9 },
]

export const loadAccountId = async () => {
  try {
    let id = await AsyncStorage.getItem("accountId")
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
  // HOOK DE TEMA
  const { colors, isDark } = useAppTheme()
  
  // Estados principales
  const [formData, setFormData] = useState({
    titulo: "",
    departamento: "",
    ubicacion: "",
  })

  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountId, setAccountId] = useState(null)
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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

  const formatDateForAPI = (date) => {
    return date.toISOString().split("T")[0]
  }

  const formatTimeForAPI = (time) => {
    return time.toTimeString().split(" ")[0]
  }

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

  const createEventSuggestion = async (eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/createSuggestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
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

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

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

      showCustomModal(
        "Sugerencia enviada",
        "Su sugerencia de evento ha sido enviada correctamente. Será revisada por nuestro equipo antes de su publicación.",
        "success",
        () => {
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

  const handleDepartmentSelect = (dept) => {
    console.log("Departamento seleccionado:", dept)
    handleInputChange("departamento", dept.name)
    setSelectedDepartment(dept)
    setShowDepartmentPicker(false)
  }

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
    }
    return colors[deptName] || '#6B7280'
  }

  const DepartmentPickerModal = () => (
    <Modal
      visible={showDepartmentPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDepartmentPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.departmentModalContainer, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Seleccionar departamento</Text>
            <Text style={[styles.pickerSubtitle, { color: colors.textSecondary }]}>
              Elija el área académica correspondiente
            </Text>
          </View>

          <ScrollView
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {DEPARTMENTS.map((dept, index) => (
              <TouchableOpacity
                key={`dept-${dept.id}-${index}`}
                style={[
                  styles.departmentItem,
                  {
                    borderLeftColor: getDepartmentColor(dept.name),
                    backgroundColor: isDark ? colors.inputBg : '#f8f9ff'
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
                  <Text style={[styles.departmentText, { color: colors.text }]}>{dept.name}</Text>
                </View>
                <View style={[styles.departmentIndicator, { backgroundColor: getDepartmentColor(dept.name) }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.pickerCloseButton, { backgroundColor: colors.inputBg }]}
            onPress={() => setShowDepartmentPicker(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pickerCloseText, { color: colors.text }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  const CustomModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="fade"
      onRequestClose={hideModal}
    >
      <View style={styles.customModalOverlay}>
        <View style={[styles.customModalContainer, { backgroundColor: colors.cardBg }]}>
          <View style={[
            styles.modalHeader,
            { backgroundColor: modalConfig.type === 'success' ? '#10B981' : modalConfig.type === 'info' ? '#3B82F6' : '#EF4444' }
          ]}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.modalMessage, { color: colors.text }]}>{modalConfig.message}</Text>
          </View>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            {modalConfig.showCancel && (
              <TouchableOpacity
                style={[styles.modalButtonSecondary, {
                  backgroundColor: colors.inputBg,
                  borderRightColor: colors.border
                }]}
                onPress={hideModal}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.modalButtonPrimary, { backgroundColor: colors.inputBg }]}
              onPress={handleModalConfirm}
            >
              <Text style={[styles.modalButtonPrimaryText, { color: colors.text }]}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.headerBg}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={[styles.simpleHeader, { backgroundColor: colors.black }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.cardBg }]}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../assets/back-arrow.png")}
            style={[styles.backIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sugerir Evento</Text>
        </View>
      </View>

      {/* Contenido principal */}
      <Animated.ScrollView
        style={[styles.scrollContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Campo de título */}
        <Animated.View style={[styles.inputCard, {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }]
        }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={[styles.label, { color: colors.text }]}>Título del Evento</Text>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
                Proporcione un nombre descriptivo para el evento
              </Text>
            </View>
          </View>
          <TextInput
            style={[styles.textInput, {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="Nombre del evento"
            placeholderTextColor={colors.textSecondary}
            value={formData.titulo}
            onChangeText={(value) => handleInputChange("titulo", value)}
            maxLength={100}
          />
          <View style={styles.inputFooter}>
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {formData.titulo.length}/100
            </Text>
          </View>
        </Animated.View>

        {/* Selector de departamento */}
        <Animated.View style={[styles.inputCard, {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }]
        }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={[styles.label, { color: colors.text }]}>Departamento</Text>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
                Área académica a la que pertenece el evento
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.selectInput,
              {
                backgroundColor: colors.inputBg,
                borderColor: selectedDepartment ? getDepartmentColor(selectedDepartment.name) : colors.border
              },
              selectedDepartment && {
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
              <Text style={[
                styles.selectText,
                { color: formData.departamento ? colors.text : colors.textSecondary }
              ]}>
                {formData.departamento || "Seleccionar departamento"}
              </Text>
            </View>
            <Text style={[styles.chevronIcon, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Selector de fecha */}
        <Animated.View style={[styles.inputCard, {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }]
        }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={[styles.label, { color: colors.text }]}>Fecha del Evento</Text>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
                Fecha programada para la realización del evento
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.selectInput, {
              backgroundColor: colors.inputBg,
              borderColor: colors.border
            }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>{formatDate(date)}</Text>
            <Text style={[styles.chevronIcon, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Selector de hora */}
        <Animated.View style={[styles.inputCard, {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }]
        }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={[styles.label, { color: colors.text }]}>Hora del Evento</Text>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>Hora de inicio del evento</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.selectInput, {
              backgroundColor: colors.inputBg,
              borderColor: colors.border
            }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>{formatTime(time)}</Text>
            <Text style={[styles.chevronIcon, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Campo de ubicación */}
        <Animated.View style={[styles.inputCard, {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          transform: [{ scale: scaleAnim }]
        }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={[styles.label, { color: colors.text }]}>Ubicación</Text>
              <Text style={[styles.sublabel, { color: colors.textSecondary }]}>
                Lugar donde se realizará el evento
              </Text>
            </View>
          </View>
          <TextInput
            style={[styles.textInput, {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="Ej: Poliforo"
            placeholderTextColor={colors.textSecondary}
            value={formData.ubicacion}
            onChangeText={(value) => handleInputChange("ubicacion", value)}
            maxLength={100}
          />
        </Animated.View>

        {/* Botón de envío */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: isDark ? colors.buttonPrimary : '#F5F5DC' },
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <View style={styles.submitButtonContent}>
              <Text style={[styles.submitButtonText, { color: isDark ? '#fff' : '#000' }]}>
                {isSubmitting ? "Enviando..." : "Enviar Sugerencia"}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Nota informativa */}
        <View style={[styles.footerContainer, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            Su sugerencia será evaluada por nuestro equipo antes de ser publicada
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Date/Time Pickers */}
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

      {/* Modales */}
      <DepartmentPickerModal />
      <CustomModal />

      {/* Navegación inferior */}
      <View style={[styles.bottomNav, {
        backgroundColor: colors.navBg,
        borderTopColor: colors.border
      }]}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image
              source={require("../assets/home.png")}
              style={[styles.navIcon, { tintColor: colors.textSecondary }]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomNavItem, styles.activeNavItem]}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image
              source={require("../assets/more.png")}
              style={[styles.navIcon, { tintColor: '#f0e342' }]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Image
              source={require("../assets/profile.png")}
              style={[styles.navIcon, { tintColor: colors.textSecondary }]}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  simpleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 2,
    minHeight: 50,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 2,
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
    flex: 1,
    fontWeight: "500",
  },
  chevronIcon: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  submitButton: {
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
    fontSize: 18,
    fontWeight: "bold",
  },
  footerContainer: {
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },
  footerNote: {
    fontSize: 14,
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingTop: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
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
    marginBottom: 8,
  },
  pickerSubtitle: {
    fontSize: 14,
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
    borderRadius: 15,
  },
  pickerCloseText: {
    fontSize: 16,
    fontWeight: "600",
  },
  customModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customModalContainer: {
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
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 9,
    borderTopWidth: 3,
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
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderColor: '#f0e342',
  },
});

export default SuggestionScreen;