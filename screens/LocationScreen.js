import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

const eventos = [
  {
    nombre: "Poliforo",
    descripcion: "Conferencia: Avances en IA\n14:00 - 15:00",
    latitud: 24.103180,
    longitud: -110.315872,
    color: "#fff977"
  },
  {
    nombre: "Sistemas",
    descripcion: "Conferencia: Avances en IA\n14:00 - 15:00",
    latitud: 24.102723,
    longitud: -110.316121,
    color: "#2e60bf"
  },
  {
    nombre: "Agronomia",
    descripcion: "Taller de Agricultura\n13:00 - 14:00",
    latitud: 24.10034836471127,
    longitud: -110.31432432711246,
    color: "#f6973e"
  }
];

const LocationScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image source={require("../assets/back-arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa del campus</Text>
      </View>

     <MapView
      style={styles.map}
      initialRegion={{
        latitude: 24.103422,
        longitude: -110.315374,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      zoomControlEnabled={false}
      loadingEnabled={true}
    >
      {eventos.map((evento, index) => (
  <Marker
    key={index}
    coordinate={{ latitude: evento.latitud, longitude: evento.longitud }}
    onPress={() => {}}
  >
    <TouchableOpacity activeOpacity={0.8}>
      <View style={[styles.marker, { backgroundColor: evento.color }]} />
    </TouchableOpacity>

    <Callout tooltip>
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{evento.nombre}</Text>
        <Text style={styles.calloutDescription}>{evento.descripcion}</Text>
      </View>
    </Callout>
  </Marker>
))}
    </MapView>
       
      <View style={styles.legend}>
        {eventos.map((e, i) => (
          <View style={styles.legendItem} key={i}>
            <View style={[styles.legendColor, { backgroundColor: e.color }]} />
            <Text style={styles.legendText}>{e.nombre}</Text>
          </View>
        ))}
      </View>

                <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.bottomNavItem, styles.activeNavItem]} 
          onPress={() => navigation.navigate("LocationScreen")}
        >
          <Image 
            source={require('../assets/location.png')} 
            style={[styles.navIcon, styles.locationIcon]} 
          />
        </TouchableOpacity>
      
        <TouchableOpacity 
          style={[styles.bottomNavItem, styles.activeNavItem]} 
          onPress={() => navigation.navigate("Home")}
        >
          <Image 
            source={require("../assets/home.png")} 
            style={[styles.navIcon, styles.homeIcon]} 
          />
        </TouchableOpacity>
      
        <TouchableOpacity 
          style={styles.bottomNavItem} 
          onPress={() => navigation.navigate("Profile")}
        >
          <Image 
            source={require("../assets/profile.png")} 
            style={[styles.navIcon, styles.profileIcon]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    elevation: 3,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  backIcon: { 
    width: 24, 
    height: 24, 
    left: -80, 
    top: 5 
  },
  headerTitle: { 
    fontSize: 15, 
    marginTop: 3, 
    color: '#000' 
  },
  map: { 
    width: '100%', 
    height: '100%', 
    marginTop: 80 
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200,
    borderColor: '#eee',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
  },
  legend: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  legendText: { 
    fontSize: 14 
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#002855',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  locationIcon: { 
    width: 34, 
    height: 35, 
    tintColor: "white" 
  },
  homeIcon: { 
    width: 28, 
    height: 28, 
    tintColor: "white" 
  },
  profileIcon: { 
    width: 45, 
    height: 45, 
    tintColor: "white" 
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LocationScreen;