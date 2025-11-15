/**
 * Favorites.js
 * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción:Pantalla para obtener favoritos y asistencia
 * 
 * Manual de Estándares Aplicado:
 * - Nombres de componentes en PascalCase. Ej: EventScreen
 * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress
 * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
 * - La constante API_BASE_URL se declara al inicio, en mayúsculas.
 */
const API_BASE_URL = "https://agendauabcs.up.railway.app";

/**
 * Verifica si un evento está guardado como favorito por el usuario.
 */
export const checkIfBookmarked = async (accountId, eventId, setIsBookmarked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${accountId}`);
    const data = await response.json();

    if (data.success) {
      const isSaved = data.favorites.some(fav => fav.eventId === eventId);
      setIsBookmarked(isSaved);
    }
  } catch (error) {
    console.error("Error checking favorites:", error);
  }
};

/**
 * Añade un evento a los favoritos del usuario.
 */
export const addToFavorites = async (accountId, eventId, setIsBookmarked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    });

    const result = await response.json();

    if (result.success) {
      setIsBookmarked(true);
    } else {
      // En caso de fallo, podrías mostrar un mensaje al usuario
      console.warn("No se pudo agregar a favoritos.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

/**
 * Elimina un evento de los favoritos del usuario.
 */
export const removeFromFavorites = async (accountId, eventId, setIsBookmarked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${accountId}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log("DELETE result:", result);

    if (response.ok && result.success) {
      setIsBookmarked(false);
    } else {
      // Podrías manejar errores específicos aquí
      console.warn("No se pudo eliminar de favoritos.");
    }
  } catch (error) {
    console.error("Error al eliminar de favoritos:", error.message);
  }
};