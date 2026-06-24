import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';
const DISTRICTS = ['Kyenjojo', 'Kabarole', 'Kyegegwa'];

export default function ClientProfileScreen({ route, navigation }) {
  const { token, user } = route.params;
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [district, setDistrict] = useState(user.district || 'Kyenjojo');
  const [loading, setLoading] = useState(false);
  useEffect(() => { console.log('USER:', JSON.stringify(user)); }, []);

  const handleSave = async () => {
    if (!name || !phone) return Alert.alert('Error', 'Name and phone are required');
    setLoading(true);
    try {
      const res = await axios.put(`${API}/users/update-profile`, 
        { name, phone, district, avatar_url: user.avatar_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('✅ Success', 'Profile updated!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => navigation.replace('Login') }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Avatar placeholder */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.roleTag}>👤 Client</Text>
      </View>

      {/* Form */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor="#aaa"
        placeholder="Your name"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor="#aaa"
        placeholder="Your phone"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputDisabled}>
        <Text style={styles.inputDisabledText}>{user.email}</Text>
      </View>

      <Text style={styles.label}>District</Text>
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

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#1a1a2e" />
          : <Text style={styles.saveBtnText}>Save Changes</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  back: { color: '#2e7d32', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  avatarWrapper: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2e7d32', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarLetter: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  roleTag: { color: '#aaa', fontSize: 14 },
  label: { color: '#fff', fontSize: 15, marginBottom: 6, marginTop: 14, paddingHorizontal: 20 },
  input: { backgroundColor: '#2a2a3e', color: '#fff', padding: 14, borderRadius: 10, marginHorizontal: 20, fontSize: 15 },
  inputDisabled: { backgroundColor: '#1e1e30', padding: 14, borderRadius: 10, marginHorizontal: 20 },
  inputDisabledText: { color: '#666', fontSize: 15 },
  districtRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginHorizontal: 20, flexWrap: 'wrap' },
  districtBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 2, borderColor: '#444' },
  districtActive: { borderColor: '#2e7d32', backgroundColor: '#2a2a3e' },
  districtText: { color: '#aaa' },
  districtTextActive: { color: '#2e7d32', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center', marginHorizontal: 20, marginTop: 30 },
  saveBtnText: { color: '#1a1a2e', fontSize: 17, fontWeight: 'bold' },
  logoutBtn: { padding: 16, borderRadius: 10, alignItems: 'center', marginHorizontal: 20, marginTop: 12, borderWidth: 1, borderColor: '#ff4444' },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
});