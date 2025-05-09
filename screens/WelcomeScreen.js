import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.redSection} />
      
      <View style={styles.whiteSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/agendaLogo.png')}
          style={styles.mascotImage}
        />
      </View>
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D6FA4',
  },
  redSection: {
    height: '50%',
    backgroundColor: '#FFF7A3',
  },
  whiteSection: {
    height: '65%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingTop: 160, 
    paddingBottom: 40,
  },
  logoContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    zIndex: 10,
  },
  mascotImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    width: '80%',

  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WelcomeScreen;