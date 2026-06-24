import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, code } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword)
      return Alert.alert('Error', 'Please fill in all fields');
    if (newPassword.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');
    if (newPassword !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match');

    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/reset-password`, { email, code, newPassword });
      Alert.alert(
        '✅ Password Reset!',
        'Your password has been updated successfully.',
        [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
      );
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

      <Text style={styles.title}>New Password</Text>
      <Text style={styles.sub}>Choose a strong password for your BUSU BUSU account.</Text>

      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor="#aaa"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Reset Password</Text>}
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
  input: { backgroundColor: '#1a3a1a', color: '#fff', padding: 16, borderRadius: 10, marginBottom: 16, fontSize: 16 },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});