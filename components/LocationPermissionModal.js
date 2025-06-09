import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  primaryBlue: "#1B3A5C",
  secondaryBlue: "#4A7BA7",
  gold: "#D4AF37",
  lightGold: "#F5E6A3",
  warmWhite: "#FFFFFF",
  lightGray: "#E5E5E5",
  mediumGray: "#999999",
  darkGray: "#333333",
  success: "#28A745",
  error: "#DC3545",
  cream: "#F5F5DC",
};

const LocationPermissionModal = ({ visible, onPermissionGranted, onPermissionDenied }) => {
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("requesting");

  const requestLocationPermission = async () => {
    setLoading(true);

    try {
      
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setPermissionStatus("error");
        setLoading(false);
        return;
      }

   
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
       
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

       
        await AsyncStorage.setItem("userLocation", JSON.stringify(userLocation));
        await AsyncStorage.setItem("locationPermissionGranted", "true");

        setPermissionStatus("granted");
        setTimeout(() => {
          onPermissionGranted(userLocation);
        }, 1500);
      } else {
        setPermissionStatus("denied");
        await AsyncStorage.setItem("locationPermissionGranted", "false");
      }
    } catch (error) {
      console.error("Error requesting location:", error);
      setPermissionStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    await AsyncStorage.setItem("locationPermissionGranted", "false");
    setPermissionStatus("denied");
    setTimeout(() => {
      onPermissionDenied();
    }, 1000);
  };

  const renderContent = () => {
    switch (permissionStatus) {
      case "requesting":
        return (
          <>
            <View style={styles.iconContainer}>
              <Image source={require("../assets/location.png")} style={styles.locationIcon} />
            </View>

            <Text style={styles.title}>Permisos de Ubicación</Text>
            <Text style={styles.subtitle}>Para mostrarte eventos cercanos y direcciones precisas</Text>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>Eventos cercanos a ti</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={requestLocationPermission}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryButtonText}>Permitir Ubicación</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleDeny} disabled={loading}>
                <Text style={styles.secondaryButtonText}>Ahora no</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "granted":
        return (
          <>
            <View style={[styles.iconContainer, styles.successIcon]}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
            <Text style={styles.title}>¡Ubicación Activada!</Text>
            <Text style={styles.subtitle}>Ahora podrás ver eventos y obtener direcciones</Text>
          </>
        );

      case "denied":
        return (
          <>
            <View style={[styles.iconContainer, styles.errorIcon]}>
              <Text style={styles.errorX}>✕</Text>
            </View>
            <Text style={styles.title}>Permisos Denegados</Text>
            <Text style={styles.subtitle}>Puedes activar la ubicación más tarde</Text>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onPermissionDenied}>
              <Text style={styles.secondaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        );

      case "error":
        return (
          <>
            <View style={[styles.iconContainer, styles.warningIcon]}>
              <Text style={styles.warningText}>!</Text>
            </View>
            <Text style={styles.title}>Error de Ubicación</Text>
            <Text style={styles.subtitle}>Verifica que el GPS esté activado en tu dispositivo</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  setPermissionStatus("requesting");
                  requestLocationPermission();
                }}
              >
                <Text style={styles.primaryButtonText}>Reintentar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleDeny}>
                <Text style={styles.secondaryButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onPermissionDenied}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>{renderContent()}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 350,
    width: "100%",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGold,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  locationIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.primaryBlue,
  },
  successIcon: {
    backgroundColor: "#E8F5E8",
  },
  successCheckmark: {
    fontSize: 40,
    color: COLORS.success,
    fontWeight: "bold",
  },
  errorIcon: {
    backgroundColor: "#FFE8E8",
  },
  errorX: {
    fontSize: 40,
    color: COLORS.error,
    fontWeight: "bold",
  },
  warningIcon: {
    backgroundColor: "#FFF3CD",
  },
  warningText: {
    fontSize: 40,
    color: "#856404",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryBlue,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  benefitsContainer: {
    alignSelf: "stretch",
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.success,
    fontWeight: "bold",
    marginRight: 12,
    width: 20,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
  },
  buttonContainer: {
    alignSelf: "stretch",
    gap: 12,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  secondaryButtonText: {
    color: COLORS.mediumGray,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LocationPermissionModal;