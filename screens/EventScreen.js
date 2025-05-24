import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView, TextInput, Alert, Platform, Animated, Dimensions } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

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
};

const DEPARTMENTS = [
  { name: "Agronomía", color: COLORS.green },
  { name: "Ciencia Animal y Conservación del Hábitat",  color: COLORS.orange },
  { name: "Ciencias de la Tierra",  color: COLORS.coral },
  { name: "Ciencias Marinas y Costeras",  color: COLORS.lightBlue },
  { name: "Ciencias Sociales y Jurídicas", color: COLORS.purple },
  { name: "Economía",  color: COLORS.yellow },
  { name: "Humanidades",  color: COLORS.pink },
  { name: "Ingeniería en Pesquerías",  color: COLORS.mint },
  { name: "Sistemas Computacionales",  color: COLORS.darkBlue },
];

const EventScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    departamento: '',
    ubicacion: '',
    descripcion: ''
  });
  
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      Alert.alert("Necesitamos un título para tu evento");
      return false;
    }
    if (!formData.departamento.trim()) {
      Alert.alert("¡Espera!", "¿De qué departamento es tu evento?");
      return false;
    }
    if (!formData.ubicacion.trim()) {
      Alert.alert("¿Dónde se realizará tu evento?");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
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
    ]).start();
    
    try {
      const eventData = {
        ...formData,
        fecha: date.toISOString(),
        hora: time.toISOString(),
        fechaCreacion: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "Envio exitoso", 
        "Tu evento ha sido enviado",
        [
          {
            text: "¡Genial!",
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      Alert.alert("Algo salió mal. ¿Intentamos de nuevo?");
    } finally {
      setIsSubmitting(false);
    }
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
            style={[styles.departmentItem, { borderLeftColor: dept.color }]}
            onPress={() => {
              handleInputChange('departamento', dept.name);
              setSelectedDepartment(dept);
              setShowDepartmentPicker(false);
            }}
          >
            <View style={styles.departmentContent}>
              <Text style={styles.departmentIcon}>{dept.icon}</Text>
              <Text style={styles.departmentText}>{dept.name}</Text>
            </View>
            <View style={[styles.departmentIndicator, { backgroundColor: dept.color }]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.pickerCloseButton}
        onPress={() => setShowDepartmentPicker(false)}
      >
        <Text style={styles.pickerCloseText}>Cancelar</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
     
      <View style={styles.simpleHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back-arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sugerir evento</Text>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputIcon}></Text>
            <Text style={styles.label}>Título del Evento</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="¿Cómo se llama tu evento?"
            value={formData.titulo}
            onChangeText={(value) => handleInputChange('titulo', value)}
            maxLength={100}
            placeholderTextColor="#999"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.characterCount}>{formData.titulo.length}/100</Text>
          </View>
        </Animated.View>

        
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputIcon}></Text>
            <Text style={styles.label}>Departamento</Text>
          </View>
          <TouchableOpacity
            style={[styles.selectInput, selectedDepartment && { borderColor: selectedDepartment.color }]}
            onPress={() => setShowDepartmentPicker(true)}
          >
            <View style={styles.selectContent}>
              {selectedDepartment && (
                <Text style={styles.selectedIcon}>{selectedDepartment.icon}</Text>
              )}
              <Text style={[styles.selectText, !formData.departamento && styles.placeholderText]}>
                {formData.departamento || "Toca para elegir departamento"}
              </Text>
            </View>
            <Text style={styles.chevronIcon}></Text>
          </TouchableOpacity>
        </Animated.View>

      
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputIcon}></Text>
            <Text style={styles.label}>Fecha del Evento</Text>
          </View>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.selectText}>{formatDate(date)}</Text>
            <Text style={styles.chevronIcon}></Text>
          </TouchableOpacity>
        </Animated.View>

       
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputIcon}></Text>
            <Text style={styles.label}>Hora del Evento</Text>
          </View>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.selectText}>{formatTime(time)}</Text>
            <Text style={styles.chevronIcon}></Text>
          </TouchableOpacity>
        </Animated.View>

   
        <Animated.View style={[styles.inputCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputIcon}></Text>
            <Text style={styles.label}>Ubicación</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Poliforo"
            value={formData.ubicacion}
            onChangeText={(value) => handleInputChange('ubicacion', value)}
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
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Enviando..." : "Crear Evento"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerNote}>
          Tu evento será revisado por nuestro equipo
        </Text>
      </Animated.ScrollView>

    
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

     
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
              <TouchableOpacity 
                style={[styles.bottomNavItem]}
                onPress={() => navigation.navigate("Home")}
              >
                <Image 
                  source={require('../assets/home.png')} 
                  style={[styles.navIcon, styles.homeIcon]} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bottomNavItem, styles.activeNavItem]}
                
              >
                <Image 
                  source={require("../assets/more.png")} 
                  style={[styles.navIcon, styles.moreIcon]} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bottomNavItem]} 
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
    backgroundColor: '#F8F9FF',
  },
 
  simpleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkBlue,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  selectText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  chevronIcon: {
    fontSize: 16,
    color: '#666',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    overflow: 'hidden',
  },
  pickerContainer: {
    padding: 20,
  },
  pickerHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
    marginBottom: 5,
  },
  pickerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  pickerScrollView: {
    maxHeight: 400,
  },
  departmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#F8F9FF',
    borderRadius: 15,
    borderLeftWidth: 4,
  },
  departmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  departmentIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  departmentText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  departmentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pickerCloseButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
  },
  pickerCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    tintColor: "white",
  },
  moreIcon: {
    width: 40,
    height: 40,
  },
  homeIcon: {
    width: 28,
    height: 28,
  },
  profileIcon: {
    width: 45,
    height: 45,
  },
});

export default EventScreen;