import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity,} from 'react-native';
import { ActivityIndicator } from 'react-native';

import { Ionicons } from '@expo/vector-icons';



const EventCard = ({ title, department, date, time, location, imageUrl }) => {
 
  const getDepartmentColor = (dept) => {
    const colors = {
      'Sistemas computacionales': '#FFFACD', 
      'Economia': '#FFEBCD', 
      'Ciencias Sociales y Jurídicas': '#E0FFFF', 
      'Agronomía': '#E6FFE6', 
      'Ciencias de la Tierra': '#E0FFFF',
      'Humanidades': '#FFF7A3',

    };
    
    return colors[dept] || '#F0F0F0'; 
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
  
  return (
    <View style={styles.card}>
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
    </View>
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