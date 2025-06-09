import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

class LocationService {
  static async requestLocationPermission() {
    try {
      
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
       
        let { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        
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
      
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      return false;
    }
  }

  static async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();
      
      if (!hasPermission) {
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      return null;
    }
  }

  static async checkPermissionStatus() {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const R = 6371; 
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; 
    return d;
  }

  static deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

export default LocationService;