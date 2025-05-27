import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const EventCard = ({ title, department, date, time, location, imageUrl }) => {
  const navigation = useNavigation();
 
const getDepartmentColor = (dept) => {
  const colors = {
    'Agronomía': '#32CD32',                          
    'Ciencia animal y conservación del hábitat': '#8FBC8F',  
    'Ciencias de la tierra': '#20B2AA',                 
    'Ciencias marinas y costeras': '#1E90FF',          
    'Ciencias sociales y jurídicas': '#6495ED',        
    'Economía': '#FF8C00',                            
    'Humanidades': '#FF69B4',                           
    'Ingeniería en pesquerías': '#4682B4',            
    'Sistemas computacionales': '#FFD700',            
  };
  return colors[dept] || '#CCCCCC';  
};


  
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    
    try {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString; 
    }
  };

  const handlePress = () => {
    const eventData = {
      title,
      department,
      date,
      time,
      location,
      imageUrl
    };
    
    navigation.navigate('EventDetailScreen', { event: eventData });
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl || 'https://via.placeholder.com/100' }} 
            style={styles.image}
            onError={(e) => console.log("Error al cargar imagen:", e.nativeEvent.error)}
          />
        </View>
        
        <View style={styles.infoContainer}>
          <View style={[styles.departmentTag, { backgroundColor: getDepartmentColor(department) }]}>
           <Text style={styles.departmentText}>{department}</Text>
          </View>
          
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{formatDate(date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{time || "Horario no especificado"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{location || "Ubicación no especificada"}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  departmentTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
    color:'white',
  },
  departmentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  bookmarkButton: {
    padding: 4,
    justifyContent: 'flex-start',
  },
});

export default EventCard;