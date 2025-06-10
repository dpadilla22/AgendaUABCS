/**
 * Attendance.js
 * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción:Pantalla para obtener asistencia
 * 
 * Manual de Estándares Aplicado:
 * - Nombres de componentes en PascalCase. Ej: EventScreen
 * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress
 * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'https://a023-2806-265-5402-ca4-e919-8d18-acec-634b.ngrok-free.app';

/**
 * Marca la asistencia de un usuario a un evento.
 * @param {number|string} eventId - ID del evento al que se va a marcar asistencia.
 * @returns {object} Objeto con éxito, mensaje y datos si aplica.
 */
export const markAttendance = async (eventId) => {
  try {
    // Obtener el ID de cuenta del almacenamiento local
    const accountId = await AsyncStorage.getItem('accountId'); 

    if (!accountId || !eventId) {
      throw new Error("Faltan datos necesarios: accountId o eventId");
    }

    // Hacer solicitud POST a la API para marcar asistencia
    const response = await fetch(`${API_URL}/markAttendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ 
        accountId: accountId, 
        eventId: parseInt(eventId) // Convertir el ID del evento a número
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
    // Manejar errores
    console.error("Error al marcar asistencia:", error);
    return {
      success: false,
      message: error.message || 'Error al marcar asistencia',
      error: error
    };
  }
};

/**
 * Desmarca la asistencia de un usuario a un evento.
 * @param {number|string} eventId - ID del evento a desmarcar.
 * @returns {object} Objeto con éxito, mensaje y datos si aplica.
 */
export const unmarkAttendance = async (eventId) => {
  try {
    // Obtener el ID de cuenta del almacenamiento local
    const accountId = await AsyncStorage.getItem('accountId');

    // Validar que existan los datos necesarios
    if (!accountId || !eventId) {
      throw new Error("Faltan datos necesarios: accountId o eventId");
    }

    // Hacer solicitud POST a la API para desmarcar asistencia
    const response = await fetch(`${API_URL}/unmarkAttendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ 
        accountId: accountId,
        eventId: parseInt(eventId) // Convertir a número
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // Convertir respuesta a JSON
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
