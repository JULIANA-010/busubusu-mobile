import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      Alert.alert('✅ Code Sent!', 'Check your email for the 6-digit reset code.');
      navigation.navigate('VerifyCode', { email });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.sub}>Enter your registered email and we'll send you a reset code.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.btn} onPress={handleSendCode} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Send Reset Code</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f0a', padding: 30, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 30 },
  backText: { color: '#2e7d32', fontSize: 16 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  sub: { fontSize: 15, color: '#aaa', marginBottom: 40, lineHeight: 22 },
  input: { backgroundColor: '#1a3a1a', color: '#fff', padding: 16, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});