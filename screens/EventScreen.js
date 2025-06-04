import { useState, useRef, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, TextInput, Alert, Animated, Platform } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import AsyncStorage from "@react-native-async-storage/async-storage"


const API_BASE_URL = "https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app"

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


  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

 
  useEffect(() => {
    const initializeScreen = async () => {
    
      const id = await loadAccountId()
      if (id) {
        setAccountId(id) 
        console.log("Account ID inicializado:", id)
      } else {
        console.error("No se encontró accountId")
        Alert.alert("Error", "No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.")
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
      Alert.alert("Error", "Necesitamos un título para tu evento")
      return false
    }
    if (!selectedDepartment) {
      Alert.alert("¡Espera!", "¿De qué departamento es tu evento?")
      return false
    }
    if (!formData.ubicacion.trim()) {
      Alert.alert("Error", "¿Dónde se realizará tu evento?")
      return false
    }
    if (!accountId) {
      Alert.alert("Error", "No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.")
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

      console.log("Datos del evento que se enviarán:", {
        titleEventSuggestion: formData.titulo.trim(),
        idDepartment: selectedDepartment.id,
        dateEventSuggestion: formatDateForAPI(date),
        timeEventSuggestion: formatTimeForAPI(time),
        locationEventSuggestion: formData.ubicacion.trim(),
        accountId: accountId,
      })

      const result = await createEventSuggestion(eventData)

      Alert.alert(
        "¡Éxito!", 
        "Tu sugerencia de evento ha sido enviada exitosamente. Será revisada por nuestro equipo.", 
        [
          {
            text: "¡Genial!",
            onPress: () => {
           
              setFormData({
                titulo: "",
                departamento: "",
                ubicacion: "",
              })
              setSelectedDepartment(null)
              setDate(new Date())
              setTime(new Date())

              navigation.goBack()
            },
          },
        ]
      )
    } catch (error) {
      console.error("Error submitting event:", error)
      Alert.alert(
        "Error", 
        error.message || "Algo salió mal al enviar tu sugerencia. ¿Intentamos de nuevo?", 
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDepartmentSelect = (dept) => {
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
    };
    return colors[deptName] || '#6B7280'; 
  };

  const DepartmentPicker = () => (
    <Animated.View style={[styles.pickerContainer, { opacity: fadeAnim }]}>
      <View style={styles.pickerHeader}>
        <Text style={styles.pickerTitle}>Elige tu departamento</Text>
        <Text style={styles.pickerSubtitle}>Selecciona el área de tu evento</Text>
      </View>
      <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
        {DEPARTMENTS.map((dept, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.departmentItem, 
              { 
                borderLeftColor: getDepartmentColor(dept.name),
                shadowColor: getDepartmentColor(dept.name)
              }
            ]}
            onPress={() => handleDepartmentSelect(dept)}
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
      <TouchableOpacity style={styles.pickerCloseButton} onPress={() => setShowDepartmentPicker(false)}>
        <Text style={styles.pickerCloseText}>Cancelar</Text>
      </TouchableOpacity>
    </Animated.View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.simpleHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Sugerir Evento</Text>
         
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scrollContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
           
            <View>
              <Text style={styles.label}>Título del Evento</Text>
              <Text style={styles.sublabel}>Dale un nombre atractivo a tu evento</Text>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="¿Cómo se llama tu evento?"
            value={formData.titulo}
            onChangeText={(value) => handleInputChange("titulo", value)}
            maxLength={100}
            placeholderTextColor="#999"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.characterCount}>{formData.titulo.length}/100</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <View>
              <Text style={styles.label}>Departamento</Text>
              <Text style={styles.sublabel}>¿A qué área académica pertenece?</Text>
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
                {formData.departamento || "Toca para elegir departamento"}
              </Text>
            </View>
            <Text style={styles.chevronIcon}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            
            <View>
              <Text style={styles.label}>Fecha del Evento</Text>
              <Text style={styles.sublabel}>¿Cuándo será tu evento?</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.selectText}>{formatDate(date)}</Text>
            <Text style={styles.chevronIcon}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
           
            <View>
              <Text style={styles.label}>Hora del Evento</Text>
              <Text style={styles.sublabel}>¿A qué hora comenzará?</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.selectText}>{formatTime(time)}</Text>
            <Text style={styles.chevronIcon}>▼</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
           
            <View>
              <Text style={styles.label}>Ubicación</Text>
              <Text style={styles.sublabel}>¿Dónde se realizará?</Text>
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

        <View style={styles.footerContainer}>
          <Text style={styles.footerNote}>
            Tu sugerencia será revisada por nuestro equipo antes de ser publicada
          </Text>
        </View>
      </Animated.ScrollView>

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

      {showDepartmentPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <DepartmentPicker />
          </View>
        </View>
      )}

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
  headerSubtitle: {
    fontSize: 14,
    color: "#000000", 
    textAlign: "center",
    marginTop: 2,
    opacity: 0.7,
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  inputIcon: {
    fontSize: 20,
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
  submitButtonIcon: {
    fontSize: 20,
    marginRight: 8,
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 25,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
    overflow: "hidden",
  },
  pickerContainer: {
    padding: 25,
  },
  pickerHeader: {
    alignItems: "center",
    marginBottom: 25,
  },
  pickerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000", 
    marginBottom: 8,
  },
  pickerSubtitle: {
    fontSize: 14,
    color: "#000000", 
    opacity: 0.7,
  },
  pickerScrollView: {
    maxHeight: 400,
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
    marginTop: 20,
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
    tintColor: COLORS.darkGray,
  },
  activeNavItem: { 
    borderBottomWidth: 2, 
    borderColor: '#f0e342',
  }
})

export default SuggestionScreen