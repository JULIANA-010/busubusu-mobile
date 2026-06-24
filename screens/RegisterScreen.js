import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

const DISTRICTS = ['Kyenjojo', 'Kabarole', 'Kyegegwa'];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [district, setDistrict] = useState('Kampala');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone)
      return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, {
        name, email, password, phone, role, district
      });

      if (role === 'tailor') {
        Alert.alert(
          '✅ Account Created!',
          'Your tailor account is pending admin approval. You will be notified once approved.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        const { token, user } = res.data;
        navigation.replace('ClientHome', { token, user });
      }
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.sub}>Join BUSU BUSU today</Text>

      {/* Role selector */}
      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'client' && styles.roleActive]}
          onPress={() => setRole('client')}>
          <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>👗 Client</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'tailor' && styles.roleActive]}
          onPress={() => setRole('tailor')}>
          <Text style={[styles.roleText, role === 'tailor' && styles.roleTextActive]}>🧵 Tailor</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#aaa"
        value={name} onChangeText={setName} />

      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa"
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#aaa"
        value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa"
        value={password} onChangeText={setPassword} secureTextEntry />

      {/* District selector */}
      <Text style={styles.label}>District:</Text>
      <View style={styles.districtRow}>
        {DISTRICTS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.districtBtn, district === d && styles.districtActive]}
            onPress={() => setDistrict(d)}>
            <Text style={[styles.districtText, district === d && styles.districtTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#1a1a2e" />
          : <Text style={styles.btnText}>Create Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 30, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32', marginBottom: 8 },
  sub: { fontSize: 16, color: '#aaa', marginBottom: 30 },
  label: { color: '#fff', fontSize: 16, marginBottom: 10, marginTop: 10 },
  input: { backgroundColor: '#2a2a3e', color: '#fff', padding: 16, borderRadius: 10, marginBottom: 16, fontSize: 16 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 2, borderColor: '#444', alignItems: 'center' },
  roleActive: { borderColor: '#2e7d32', backgroundColor: '#2a2a3e' },
  roleText: { color: '#aaa', fontSize: 16 },
  roleTextActive: { color: '#2e7d32', fontWeight: 'bold' },
  districtRow: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  districtBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 2, borderColor: '#444' },
  districtActive: { borderColor: '#2e7d32', backgroundColor: '#2a2a3e' },
  districtText: { color: '#aaa' },
  districtTextActive: { color: '#2e7d32', fontWeight: 'bold' },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 20, marginTop: 10 },
  btnText: { color: '#1a1a2e', fontSize: 18, fontWeight: 'bold' },
  link: { color: '#2e7d32', textAlign: 'center', fontSize: 15 },
});