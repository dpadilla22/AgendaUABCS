// src/utils/profileUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getHour = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('T')[0].split('-');
  const date = new Date(`${year}-${month}-${day}T12:00:00`);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const getDepartmentColor = (dept, isDark = false) => {
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
  return colorsitos[dept] || (isDark ? '#999' : '#6B7280');
};

export const processEventsData = (eventsData, favData, attendanceData) => {
  let formattedFavorites = [];
  if (favData.success && favData.favorites && favData.favorites.length > 0 && eventsData.success && eventsData.events) {
    const favoriteIds = favData.favorites.map(fav => fav.eventId);
    const favoriteEvents = eventsData.events.filter(event => favoriteIds.includes(event.id));

    formattedFavorites = favoriteEvents.map(event => {
      let rawDateTime = event.date;
      if (rawDateTime.includes('T:')) {
        rawDateTime = rawDateTime.replace('T:', 'T');
      }

      return {
        id: event.id,
        title: event.title || "Evento sin título",
        department: event.department || "Sin departamento",
        date: formatDate(rawDateTime),
        time: getHour(rawDateTime),
        location: event.location || "Ubicación no especificada",
        imageUrl: event.imageUrl || "https://via.placeholder.com/150"
      };
    });
  }

  let formattedAttendance = [];
  if (attendanceData.success && attendanceData.attendance && attendanceData.attendance.length > 0 && eventsData.success && eventsData.events) {
    const attendanceIds = attendanceData.attendance.map(att => att.eventId);
    const attendedEvents = eventsData.events.filter(event => attendanceIds.includes(event.id));

    formattedAttendance = attendedEvents.map(event => {
      let rawDateTime = event.date;
      if (rawDateTime.includes('T:')) {
        rawDateTime = rawDateTime.replace('T:', 'T');
      }

      return {
        id: event.id,
        title: event.title || "Evento sin título",
        department: event.department || "Sin departamento",
        date: formatDate(rawDateTime),
        time: getHour(rawDateTime),
        location: event.location || "Ubicación no especificada",
        imageUrl: event.imageUrl || "https://via.placeholder.com/150"
      };
    });
  }

  return {
    favorites: formattedFavorites,
    attendance: formattedAttendance
  };
};

export const getUserEmail = async () => {
  try {
    let email = await AsyncStorage.getItem('userName');
    if (!email) {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        email = user.email;
      }
    }
    return email || '';
  } catch (error) {
    console.error("Error obteniendo email:", error);
    return '';
  }
};

export const getAccountId = async () => {
  try {
    const id = await AsyncStorage.getItem("accountId");
    return id;
  } catch (error) {
    console.error("Error obteniendo accountId:", error);
    return null;
  }
};