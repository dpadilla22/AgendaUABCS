import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://feae-200-92-221-53.ngrok-free.app';

export const markAttendance = async (eventId) => {
  try {
    const accountId = await AsyncStorage.getItem('accountId'); 
    if (!accountId || !eventId) {
      throw new Error("Faltan datos necesarios: accountId o eventId");
    }

 

    const response = await fetch(`${API_URL}/markAttendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ 
        accountId: accountId, 
        eventId: parseInt(eventId) 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    
    
    return {
      success: true,
      message: data.message || 'Asistencia marcada correctamente',
      data: data
    };
  } catch (error) {
    console.error("Error al marcar asistencia:", error);
    return {
      success: false,
      message: error.message || 'Error al marcar asistencia',
      error: error
    };
  }
};

export const unmarkAttendance = async (eventId) => {
  try {
    const accountId = await AsyncStorage.getItem('accountId');
    if (!accountId || !eventId) {
      throw new Error("Faltan datos necesarios: accountId o eventId");
    }

   

    const response = await fetch(`${API_URL}/unmarkAttendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ 
        accountId: accountId,
        eventId: parseInt(eventId) 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
   
    
    return {
      success: true,
      message: data.message || 'Asistencia desmarcada correctamente',
      data: data
    };
  } catch (error) {
   
    return {
      success: false,
      message: error.message || 'Error al desmarcar asistencia',
      error: error
    };
  }
};