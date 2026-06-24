import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function TailorProfileScreen({ route, navigation }) {
  const { token, user, tailorId } = route.params;
  const [tailor, setTailor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [tailorRes, postsRes] = await Promise.all([
        axios.get(`${API}/users/${tailorId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/posts?tailorId=${tailorId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTailor(tailorRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 80 }} />;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tailor Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {tailor?.avatar_url
          ? <Image source={{ uri: tailor.avatar_url }} style={styles.avatar} />
          : <View style={styles.avatarPlaceholder}><Text style={styles.avatarLetter}>{tailor?.name?.[0]}</Text></View>
        }
        <Text style={styles.name}>{tailor?.name}</Text>
        <Text style={styles.district}>📍 {tailor?.district}</Text>
        <Text style={styles.phone}>📞 {tailor?.phone}</Text>

        <TouchableOpacity
          style={styles.msgBtn}
          onPress={() => navigation.navigate('Chat', { token, user, otherUser: { id: tailorId, name: tailor?.name } })}>
          <Text style={styles.msgBtnText}>💬 Message {tailor?.name}</Text>
        </TouchableOpacity>
      </View>

      {/* Posts */}
      <Text style={styles.sectionTitle}>Posts by {tailor?.name}</Text>
      {posts.length === 0
        ? <Text style={styles.empty}>No posts yet.</Text>
        : posts.map(post => (
          <View key={post.id} style={styles.postCard}>
           {post.image_urls?.length > 0 && (
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {post.image_urls.map((url, i) => (
                  <Image key={i} source={{ uri: url }} style={styles.postImage} resizeMode="contain" />
                ))}
              </ScrollView>
            )}
            {post.image_urls?.length > 1 && (
              <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center', marginBottom: 6 }}>
                📷 {post.image_urls.length} photos — swipe to see more
              </Text>
            )}
            <View style={styles.postBody}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postPrice}>UGX {post.price?.toLocaleString()}</Text>
              <Text style={styles.postDesc} numberOfLines={2}>{post.description}</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  back: { color: '#2e7d32', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  profileCard: { backgroundColor: '#2a2a3e', margin: 16, borderRadius: 16, padding: 24, alignItems: 'center' },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2e7d32', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLetter: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  district: { color: '#aaa', fontSize: 14, marginBottom: 4 },
  phone: { color: '#2e7d32', fontSize: 14, marginBottom: 16 },
  msgBtn: { backgroundColor: '#2e7d32', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  msgBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginTop: 8, marginBottom: 12 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 20 },
  postCard: { backgroundColor: '#2a2a3e', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  postImage: { width: 358, height: 320, borderRadius: 0 },
  postBody: { padding: 12 },
  postTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  postPrice: { color: '#2e7d32', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  postDesc: { color: '#aaa', fontSize: 13 },
});