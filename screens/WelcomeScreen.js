import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logosRow}>
          <Image source={require('../assets/jese.png')} style={styles.logo} resizeMode="contain" />
          <Image source={require('../assets/skillup.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.appName}>BUSU BUSU</Text>
       <Text style={styles.fullForm}>Buy Skill Up · Build Skill Up</Text>
        <Text style={styles.tagline}>Discover talented tailors near you</Text>
        <Text style={styles.sub}>Browse, connect and get dressed in style 🧵</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Register')}>
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
 logosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  logo: {
    width: 90,
    height: 60,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2e7d32',
    letterSpacing: 4,
    marginBottom: 16,
  },
  fullForm: {
    fontSize: 12,
    color: '#aaaaaa',
    textAlign: 'center',
    letterSpacing: 1.5,
    fontStyle: 'italic',
    marginTop: -10,
    marginBottom: 18,
  },
  tagline: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
  },
  bottomSection: {
    gap: 14,
  },
  btnPrimary: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#2e7d32',
    fontSize: 16,
  },
});