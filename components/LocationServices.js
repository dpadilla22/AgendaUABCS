/**
 * LocationServices.js
 * Autor: Danna Cahelca Padilla Nuñez,Jesus Javier Rojo Martinez
 * Fecha: 09/06/2025
 * Descripción:Pantalla para obtener permisos de ubicación
 * 
 * Manual de Estándares Aplicado:
 * - Nombres de componentes en PascalCase. Ej: EventScreen
 * - Nombres de funciones y variables en camelCase. Ej: handleButtonPress
 * - Comentarios explicativos sobre la funcionalidad de secciones clave del código.
 */
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

// Clase de servicio de ubicación
class LocationService {

  // Método para solicitar permisos de ubicación
  static async requestLocationPermission() {
    try {
      // Obtener estado actual de permisos
      let { status } = await Location.getForegroundPermissionsAsync();

  
      if (status !== 'granted') {
        let { status: newStatus } = await Location.requestForegroundPermissionsAsync();

        // Si aún no se conceden, se muestra alerta con opción para ir a configuración
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permisos de ubicación',
            'Esta app necesita acceso a tu ubicación para mostrarte tu posición en el mapa. Por favor, habilita los permisos en la configuración.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configuración', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        }
      }

      // Permisos concedidos
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      return false;
    }
  }

  // Método para obtener la ubicación actual del dispositivo
  static async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();

      // Si no hay permisos, retornar null
      if (!hasPermission) {
        return null;
      }

      // Obtener coordenadas con precisión balanceada
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000, // Tiempo de espera de 15 segundos
      });

      // Retornar objeto con latitud y longitud
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      return null;
    }
  }

  // Método para verificar si los permisos de ubicación están concedidos
  static async checkPermissionStatus() {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  // Método para calcular la distancia entre dos coordenadas en kilómetros
  static calculateDistance(lat1, lon1, lat2, lon2) {

    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    // Fórmula del haversine para calcular distancia
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
  }

  // Método auxiliar para convertir grados a radianes
  static deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}


export default LocationService;
