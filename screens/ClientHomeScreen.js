import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';
const DISTRICTS = ['All', 'Kyenjojo', 'Kabarole', 'Kyegegwa'];

export default function ClientHomeScreen({ route, navigation }) {
  const { token, user } = route.params;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('All');
  const [search, setSearch] = useState('');

  const fetchPosts = async (selectedDistrict) => {
    setLoading(true);
    try {
      const url = selectedDistrict === 'All'
        ? `${API}/posts`
        : `${API}/posts?district=${selectedDistrict}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(district); }, [district]);

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts(district);
    } catch (err) {
      console.error(err);
    }
  };
const filteredPosts = posts.filter(post => {
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.price?.toString().includes(q)
    );
  });
  const renderPost = ({ item }) => (
    <View style={styles.card}>
      {item.image_urls?.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
          {item.image_urls.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.image} resizeMode="contain" />
          ))}
        </ScrollView>
      )}
      {item.image_urls?.length > 1 && (
        <Text style={styles.imageCount}>📷 {item.image_urls.length} photos — swipe to see more</Text>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.price}>UGX {item.price?.toLocaleString()}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.tailorRow}>
          <Text style={styles.tailorName}>🧵 {item.tailor_name}</Text>
          <Text style={styles.tailorDistrict}>📍 {item.district}</Text>
        </View>
        <Text style={styles.phone}>📞 {item.phone}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(item.id)}>
            <Text style={styles.likeBtnText}>❤️ {item.likes_count}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.msgBtn}
            onPress={() => navigation.navigate('Chat', { token, user, otherUser: { id: item.tailor_id, name: item.tailor_name } })}>
          <Text style={styles.msgBtnText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileBtn}
            onPress={() => navigation.navigate('TailorProfile', { token, user, tailorId: item.tailor_id })}>
          <Text style={styles.msgBtnText}>👤 Profile</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BUSU BUSU</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
  <Text style={styles.welcome}>👋 {user.name}</Text>
 <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => navigation.navigate('Map', { token, user })}>
          <Text style={styles.mapBtnText}>🗺️ Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => navigation.navigate('ClientProfile', { token, user })}>
          <Text style={styles.mapBtnText}>👤 Me</Text>
        </TouchableOpacity>
</View>
      </View>

      {/* District filter */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or price..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={styles.filterRow}>
        {DISTRICTS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.filterBtn, district === d && styles.filterActive]}
            onPress={() => setDistrict(d)}>
            <Text style={[styles.filterText, district === d && styles.filterTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
        : <FlatList
           data={filteredPosts}
            keyExtractor={item => item.id}
            renderItem={renderPost}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <Text style={styles.empty}>No posts yet in this district</Text>
            }
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#2a2a3e' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
  welcome: { color: '#fff', fontSize: 14 },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#2a2a3e' },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  filterActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  filterText: { color: '#aaa', fontSize: 13 },
  filterTextActive: { color: '#1a1a2e', fontWeight: 'bold' },
  card: { backgroundColor: '#2a2a3e', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  image: { width: 358, height: 300, borderRadius: 0 },
  imageCount: { color: '#aaa', fontSize: 12, textAlign: 'center', marginBottom: 6 },
  cardBody: { padding: 14 },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  price: { fontSize: 16, color: '#2e7d32', fontWeight: 'bold', marginBottom: 6 },
  description: { color: '#aaa', fontSize: 14, marginBottom: 10 },
  tailorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  tailorName: { color: '#fff', fontSize: 13 },
  tailorDistrict: { color: '#aaa', fontSize: 13 },
  phone: { color: '#2e7d32', fontSize: 13, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  likeBtn: { flex: 1, backgroundColor: '#1a1a2e', padding: 10, borderRadius: 8, alignItems: 'center' },
  likeBtnText: { color: '#fff' },
  msgBtn: { flex: 1, backgroundColor: '#2e7d32', padding: 10, borderRadius: 8, alignItems: 'center' },
  msgBtnText: { color: '#1a1a2e', fontWeight: 'bold' },
  profileBtn: { flex: 1, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2e7d32', padding: 10, borderRadius: 8, alignItems: 'center' },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 16 },
  mapBtn: { backgroundColor: '#2e7d32', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
mapBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
searchRow: { paddingHorizontal: 16, paddingVertical: 8 },
  searchInput: { backgroundColor: '#2a2a3e', color: '#fff', padding: 12, borderRadius: 10, fontSize: 14 },
});