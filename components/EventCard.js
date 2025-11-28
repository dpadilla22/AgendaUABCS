/**
 * EventCard.js
 * Autor: Danna Cahelca Padilla Nuñez, Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción: Pantalla para mostrar eventos
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useThemeApp';

const EventCard = ({ 
  id, title, department, date, time, location, imageUrl, showBookmark = false 
}) => {

  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();

  const cardBackground = isDark ? colors.cardGradient : colors.cardBg;
  const cardShadow = isDark ? 0 : 5; 
  const cardBorderColor = isDark ? '#333' : 'transparent';

  const getDepartmentColor = (dept) => {
    const colorsitos = {
      'Sistemas computacionales': '#3B82F6', 
      'Economía': '#F59E0B', 
      'Ciencias Sociales y jurídicas': '#06B6D4', 
      'Agronomia': '#10B981', 
      'Ciencias de la tierra': '#8B5CF6',
      'Humanidades': '#F97316',
      'Ingeniería en pesquerías': '#EF4444',
      'Ciencias marinas y costeras': '#478884ff',
      'Ciencia animal y conservación del hábitat': '#FBBF24',
    };
    return colorsitos[dept] || (isDark ? '#145172ff' : '#22033dff');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";

    try {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      return dateString; 
    }
  };

  const handlePress = () => {
    const eventData = { id, title, department, date, time, location, imageUrl };
    navigation.navigate('EventDetailScreen', { 
      eventId: id,    
      event: eventData
    });
  };
 
return (
  <TouchableOpacity 
    style={[
      styles.card,
      {
        backgroundColor: isDark ? colors.cardGradient[5] : colors.cardGradient[0],
        elevation: cardShadow,
        borderWidth: isDark ? 0 : 2,
        borderColor: isDark ? 'transparent' : cardBorderColor,
      }
    ]}
    onPress={handlePress}
  >
    <View style={[styles.cardContent, { backgroundColor: colors.cardBg }]}>

        
        {/* Imagen */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUrl || 'https://via.placeholder.com/100' }} 
            style={styles.image}
          />
        </View>
        
        {/* Info */}
        <View style={styles.infoContainer}>
          
          <View style={[styles.departmentTag, { backgroundColor: getDepartmentColor(department) }]}>
            <Text style={styles.departmentText}>{department}</Text>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.text} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {formatDate(date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={colors.text} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {time || "Horario no especificado"}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={colors.text} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {location || "Ubicación no especificada"}
            </Text>
          </View>
        </View>

        {/* Bookmark */}
        {showBookmark && (
          <TouchableOpacity style={styles.bookmarkButton}>
            <Ionicons name="bookmark-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        )}

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 3,
      borderRadius: 16, 

  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
 imageContainer: {
  width: 80,
  height: 80,
  borderRadius: 40, 
  overflow: 'hidden',
  marginRight: 12,
  borderWidth: 2,
  borderColor: '#ddd', 
},

 image: {
  width: '100%',
  height: '100%',
  borderRadius: 40, 
},

  infoContainer: {
    flex: 1,
  },
  departmentTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  departmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white'
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
    marginLeft: 4,
  },
  bookmarkButton: {
    padding: 4,
    justifyContent: 'flex-start',
  },
});

export default EventCard;
