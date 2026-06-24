import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function MapScreen({ route, navigation }) {
  const { token, user } = route.params;
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const DISTRICTS = ['All', 'Kyenjojo', 'Kabarole', 'Kyegegwa'];

  useEffect(() => {
    getUserLocation();
    fetchTailors();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTailors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Get unique tailors with locations
      const tailorMap = {};
      res.data.forEach(post => {
        if (post.latitude && post.longitude && !tailorMap[post.tailor_id]) {
          tailorMap[post.tailor_id] = {
            id: post.tailor_id,
            name: post.tailor_name,
            phone: post.phone,
            district: post.district,
            latitude: post.latitude,
            longitude: post.longitude,
          };
        }
      });
      setTailors(Object.values(tailorMap));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredTailors = selectedDistrict === 'All'
    ? tailors
    : tailors.filter(t => t.district === selectedDistrict);

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.5, longitudeDelta: 0.5 }
    : { latitude: 0.6, longitude: 30.5, latitudeDelta: 2, longitudeDelta: 2 };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tailor Map</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* District filter */}
      <View style={styles.filterRow}>
        {DISTRICTS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.filterBtn, selectedDistrict === d && styles.filterActive]}
            onPress={() => setSelectedDistrict(d)}>
            <Text style={[styles.filterText, selectedDistrict === d && styles.filterTextActive]}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#2e7d32" style={{ flex: 1 }} />
        : <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}>

            {/* User location marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="You are here"
                pinColor="#2e7d32"
              />
            )}

            {/* Tailor markers */}
            {filteredTailors.map(tailor => (
              <Marker
                key={tailor.id}
                coordinate={{
                  latitude: tailor.latitude,
                  longitude: tailor.longitude
                }}
                pinColor="#f5a623">
                <Callout onPress={() => navigation.navigate('Chat', {
                  token, user,
                  otherUser: { id: tailor.id, name: tailor.name }
                })}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>🧵 {tailor.name}</Text>
                    <Text style={styles.calloutDistrict}>📍 {tailor.district}</Text>
                    <Text style={styles.calloutPhone}>📞 {tailor.phone}</Text>
                    <Text style={styles.calloutMsg}>Tap to message →</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
      }

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          🧵 {filteredTailors.length} tailor{filteredTailors.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity onPress={fetchTailors}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#1a3a1a' },
  back: { color: '#2e7d32', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: '#1a3a1a' },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  filterActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  filterText: { color: '#aaa', fontSize: 12 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  map: { flex: 1 },
  callout: { padding: 10, minWidth: 160 },
  calloutName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  calloutDistrict: { fontSize: 13, color: '#555', marginBottom: 2 },
  calloutPhone: { fontSize: 13, color: '#555', marginBottom: 6 },
  calloutMsg: { fontSize: 12, color: '#2e7d32', fontWeight: 'bold' },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#1a3a1a' },
  statsText: { color: '#fff', fontSize: 14 },
  refreshText: { color: '#2e7d32', fontSize: 14, fontWeight: 'bold' },
});