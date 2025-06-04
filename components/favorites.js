import { Alert } from "react-native";

const API_BASE_URL = "https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app";

export const checkIfBookmarked = async (accountId, eventId, setIsBookmarked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${accountId}`);
    const data = await response.json();

    if (data.success) {
      const isSaved = data.favorites.some(fav => fav.eventId == eventId);
      setIsBookmarked(isSaved);
    }
  } catch (error) {
    console.error("Error checking favorites:", error);
  }
};

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
      Alert.alert("Éxito", "Evento guardado en favoritos");
    } else {
      Alert.alert("Error", result.message || "No se pudo guardar el evento");
    }
  } catch (error) {
    console.error("Error:", error);
    Alert.alert("Error", "Ocurrió un error al guardar");
  }
};

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
      Alert.alert("Éxito", "Evento eliminado de favoritos");
    } else {
      Alert.alert("Error", result.message || "No se pudo eliminar el evento");
    }
  } catch (error) {
    console.error("Error al eliminar de favoritos:", error.message);
    Alert.alert("Error", "Ocurrió un error al eliminar");
  }
};