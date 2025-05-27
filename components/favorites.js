import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'


export const loadAccountId = async () => {
  try {
    const id = await AsyncStorage.getItem("accountId")
    return id
  } catch (error) {
    console.error("Error cargando account ID:", error)
    return null
  }
}

export const fetchFavorites = async (accountId) => {
  try {
    const response = await fetch(`https://4799-2806-265-5402-ca4-496d-78c0-9c18-a823.ngrok-free.app/favorites/${accountId}`);
    

    const data = await response.json()
    if (response.ok && data.success) {
      return data.favorites
    } else {
      return []
    }
  } catch (error) {
    console.error("Error al obtener favoritos:", error)
    return []
  }
}

export const addFavorite = async (accountId, eventId) => {
  try {
   const response = await fetch(`https://4799-2806-265-5402-ca4-496d-78c0-9c18-a823.ngrok-free.app/events/${eventId}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    })
    const data = await response.json()
    if (response.ok && data.success) {
      return { success: true }
    } else {
      return { success: false, message: data.message || "Error al agregar favorito" }
    }
  } catch (error) {
    console.error("Error al agregar favorito:", error)
    return { success: false, message: "Error de conexión" }
  }
}

export const removeFavorite = async (accountId, eventId) => {

  Alert.alert("Info", "Función de remover favorito pendiente de implementar")
  return { success: false }
}
