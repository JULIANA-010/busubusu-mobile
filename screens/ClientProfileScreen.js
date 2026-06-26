import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';
const DISTRICTS = ['Kyenjojo', 'Kabarole', 'Kyegegwa'];

export default function ClientProfileScreen({ route, navigation }) {
  const { token, user } = route.params;
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [district, setDistrict] = useState(user.district || 'Kyenjojo');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => { console.log('USER:', JSON.stringify(user)); }, []);

  const pickAndUploadAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow access to your photo library');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (result.canceled) return;

      setAvatarLoading(true);
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('avatar', { uri, name: filename, type });

      const res = await axios.post(`${API}/users/upload-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatarUrl(res.data.avatar_url);
      Alert.alert('✅ Success', 'Profile photo updated!');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || err?.message || 'Upload failed');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !phone) return Alert.alert('Error', 'Name and phone are required');
    setLoading(true);
    try {
      await axios.put(`${API}/users/update-profile`,
        { name, phone, district, avatar_url: avatarUrl },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <TouchableOpacity onPress={pickAndUploadAvatar} disabled={avatarLoading}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{name?.[0]?.toUpperCase()}</Text>
            </View>
          )}
          {avatarLoading ? (
            <ActivityIndicator color="#e91e8c" style={styles.avatarOverlay} />
          ) : (
            <View style={styles.cameraIcon}>
              <Text style={{ fontSize: 16 }}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.changePhoto}>Tap to change photo</Text>
        <Text style={styles.roleTag}>👤 Client</Text>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName}
        placeholderTextColor="#aaa" placeholder="Your name" />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone}
        placeholderTextColor="#aaa" placeholder="Your phone" keyboardType="phone-pad" />

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputDisabled}>
        <Text style={styles.inputDisabledText}>{user.email}</Text>
      </View>

      <Text style={styles.label}>District</Text>
      <View style={styles.districtRow}>
        {DISTRICTS.map(d => (
          <TouchableOpacity key={d}
            style={[styles.districtBtn, district === d && styles.districtActive]}
            onPress={() => setDistrict(d)}>
            <Text style={[styles.districtText, district === d && styles.districtTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#1a1a2e" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
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
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2e7d32', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarLetter: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  avatarOverlay: { position: 'absolute', top: 30, left: 30 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#e91e8c', borderRadius: 12, padding: 4 },
  changePhoto: { color: '#e91e8c', fontSize: 13, marginTop: 8 },
  roleTag: { color: '#aaa', fontSize: 14, marginTop: 4 },
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