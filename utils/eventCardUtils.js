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
  return colorsitos[dept] || (isDark ? '#145172ff' : '#22033dff');
};

export const formatDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";

  try {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (error) {
    return dateString; 
  }
};

export const prepareNavigationData = (eventData) => {
  const { id, title, department, date, time, location, imageUrl } = eventData;
  
  return {
    eventId: id,    
    event: {
      id,
      title,
      department,
      date,
      time,
      location,
      imageUrl
    }
  };
};

export const getEventDisplayData = (eventData, isDark = false) => {
  const {
    title,
    department,
    date,
    time,
    location,
    imageUrl,
    showBookmark = false
  } = eventData;

  return {
    title: title,
    department: department,
    formattedDate: formatDate(date),
    displayTime: time || "Horario no especificado",
    displayLocation: location || "Ubicación no especificada",
    displayImage: imageUrl || 'https://via.placeholder.com/100',
    hasBookmark: showBookmark,
    departmentColor: getDepartmentColor(department, isDark)
  };
};