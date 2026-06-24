import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function VerifyCodeScreen({ route, navigation }) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return Alert.alert('Error', 'Please enter the 6-digit code');
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/verify-code`, { email, code });
      navigation.navigate('ResetPassword', { email, code });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Invalid code');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      Alert.alert('✅ Code Resent!', 'A new code has been sent to your email.');
    } catch (err) {
      Alert.alert('Error', 'Could not resend code');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Enter Reset Code</Text>
      <Text style={styles.sub}>We sent a 6-digit code to{'\n'}<Text style={styles.email}>{email}</Text></Text>

      <TextInput
        style={styles.codeInput}
        placeholder="000000"
        placeholderTextColor="#aaa"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />

      <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Verify Code</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendBtn} onPress={handleResend}>
        <Text style={styles.resendText}>Didn't receive it? Resend code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f0a', padding: 30, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 30 },
  backText: { color: '#2e7d32', fontSize: 16 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  sub: { fontSize: 15, color: '#aaa', marginBottom: 40, lineHeight: 24 },
  email: { color: '#fff', fontWeight: 'bold' },
  codeInput: { backgroundColor: '#1a3a1a', color: '#fff', padding: 20, borderRadius: 10, marginBottom: 24, fontSize: 32, fontWeight: 'bold', letterSpacing: 12, borderWidth: 2, borderColor: '#2e7d32' },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  resendBtn: { alignItems: 'center', padding: 10 },
  resendText: { color: '#2e7d32', fontSize: 14 },
});