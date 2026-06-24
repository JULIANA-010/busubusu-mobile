import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { registerForPushNotificationsAsync } from '../notifications';

const API = 'https://busubusu-backend.onrender.com/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      const push_token = await registerForPushNotificationsAsync();
      const res = await axios.post(`${API}/auth/login`, { email, password, push_token });
      const { token, user } = res.data;
      if (user.role === 'tailor') navigation.replace('TailorDashboard', { token, user });
else if (user.role === 'client') navigation.replace('ClientHome', { token, user });
else if (user.role === 'admin') navigation.replace('AdminDashboard', { token, user });
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logosRow}>
        <Image source={require('../assets/jese.png')} style={styles.logo} resizeMode="contain" />
        <Image source={require('../assets/skillup.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.sub}>Login to BUSU BUSU</Text>

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa"
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <View style={styles.passwordRow}>
          <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor="#aaa"
            value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#1a1a2e" /> : <Text style={styles.btnText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}
  style={{ marginBottom: 16 }}>
  <Text style={styles.link}>Forgot password?</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 30, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32', marginBottom: 8 },
  sub: { fontSize: 16, color: '#aaa', marginBottom: 40 },
  input: { backgroundColor: '#2a2a3e', color: '#fff', padding: 16, borderRadius: 10, marginBottom: 16, fontSize: 16 },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#1a1a2e', fontSize: 18, fontWeight: 'bold' },
  link: { color: '#2e7d32', textAlign: 'center', fontSize: 15 },
  logosRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16, marginTop: 20 },
  logo: { width: 75, height: 50 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a3e', borderRadius: 10, marginBottom: 20 },
  passwordInput: { flex: 1, color: '#fff', padding: 16, fontSize: 15 },
  eyeBtn: { padding: 16 },
  eyeText: { fontSize: 18 },
});