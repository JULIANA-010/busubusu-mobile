import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Modal, Image } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function TailorDashboard({ route, navigation }) {
  const { token, user } = route.params;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [editImages, setEditImages] = useState([]);
  const [editExistingUrls, setEditExistingUrls] = useState([]);
  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const myPosts = res.data.filter(p => p.tailor_id === user.id);
      setPosts(myPosts);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMyPosts(); }, []);

  const shareMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow location access to share your location');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      await axios.put(`${API}/users/update-location`, {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('✅ Location shared!', 'Clients can now find you on the map.');
    } catch (err) {
      Alert.alert('Error', 'Could not share location');
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload images');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleCreatePost = async () => {
    if (!title || !price) return Alert.alert('Error', 'Title and price are required');
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      images.forEach((img, index) => {
        formData.append('images', {
          uri: img.uri,
          type: 'image/jpeg',
          name: `photo_${index}.jpg`,
        });
      });
      await axios.post(`${API}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      Alert.alert('✅ Success', 'Your post has been published!');
      setModalVisible(false);
      setTitle(''); setDescription(''); setPrice(''); setImages([]);
      fetchMyPosts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Could not create post');
    }
    setPosting(false);
  };
  const handleDelete = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await axios.delete(`${API}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
          fetchMyPosts();
        } catch (err) {
          Alert.alert('Error', 'Could not delete post');
        }
      }},
    ]);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description || '');
    setEditPrice(post.price?.toString());
    setEditExistingUrls(post.image_urls || []);
    setEditImages([]);
    setEditModalVisible(true);
  };
  const pickEditImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'Please allow photo access');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) setEditImages(result.assets);
  };

  const handleSaveEdit = async () => {
    if (!editTitle || !editPrice) return Alert.alert('Error', 'Title and price are required');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('price', editPrice);
      formData.append('existingUrls', JSON.stringify(editExistingUrls));
      editImages.forEach((img, index) => {
        formData.append('images', {
          uri: img.uri,
          type: 'image/jpeg',
          name: `edit_photo_${index}.jpg`,
        });
      });
      await axios.put(`${API}/posts/${editingPost.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setEditModalVisible(false);
      fetchMyPosts();
    } catch (err) {
      Alert.alert('Error', 'Could not update post');
    }
    setSaving(false);
  };

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      {item.image_urls?.length > 0 && (
       <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
          {item.image_urls.map((url, i) => (
           <Image key={i} source={{ uri: url }} style={styles.postImage} resizeMode="contain" />
          ))}
        </ScrollView>
      )}
      {item.image_urls?.length > 1 && (
        <Text style={styles.imageCount}>📷 {item.image_urls.length} photos — swipe to see more</Text>
      )}
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.price}>UGX {item.price?.toLocaleString()}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.likes}>❤️ {item.likes_count} likes</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BUSU BUSU</Text>
          <Text style={styles.welcome}>🧵 {user.name}</Text>
        </View>
        <TouchableOpacity style={styles.msgBtn}
          onPress={() => navigation.navigate('Inbox', { token, user })}>
          <Text style={styles.msgBtnText}>💬 Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.msgBtn}
          onPress={() => navigation.navigate('TailorSettings', { token, user })}>
          <Text style={styles.msgBtnText}>👤 Me</Text>
        </TouchableOpacity>
      </View>

      {!user.is_approved && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>⏳ Your account is pending admin approval. You cannot post yet.</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{posts.reduce((a, p) => a + (p.likes_count || 0), 0)}</Text>
          <Text style={styles.statLabel}>Total Likes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{user.district}</Text>
          <Text style={styles.statLabel}>District</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.locationBtn} onPress={shareMyLocation}>
        <Text style={styles.locationBtnText}>📍 Share My Location</Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
        : <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderPost}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <Text style={styles.empty}>You have no posts yet. Create your first one!</Text>
            }
          />
      }

      {user.is_approved && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={styles.fabText}>+ New Post</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create New Post</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Title e.g. Ladies Gomez" placeholderTextColor="#aaa"
                value={title} onChangeText={setTitle} />
              <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#aaa"
                value={description} onChangeText={setDescription} multiline numberOfLines={3} />
              <TextInput style={styles.input} placeholder="Price (UGX)" placeholderTextColor="#aaa"
                value={price} onChangeText={setPrice} keyboardType="numeric" />

              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
                <Text style={styles.imagePickerText}>
                  📷 {images.length > 0 ? `${images.length} image(s) selected` : 'Select Images (up to 5)'}
                </Text>
              </TouchableOpacity>

              {images.length > 0 && (
                <ScrollView horizontal style={{ marginBottom: 14 }}>
                  {images.map((img, index) => (
                    <Image key={index} source={{ uri: img.uri }}
                      style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }} />
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity style={styles.btn} onPress={handleCreatePost} disabled={posting}>
                {posting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Publish Post</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <ScrollView>
              <TextInput style={styles.input} value={editTitle} onChangeText={setEditTitle}
                placeholder="Title" placeholderTextColor="#aaa" />
              <TextInput style={styles.input} value={editDescription} onChangeText={setEditDescription}
                placeholder="Description" placeholderTextColor="#aaa" multiline numberOfLines={3} />
              <TextInput style={styles.input} value={editPrice} onChangeText={setEditPrice}
                placeholder="Price (UGX)" placeholderTextColor="#aaa" keyboardType="numeric" />

              <Text style={styles.imagePickerText}>Current Photos:</Text>
              {editExistingUrls.length > 0 && (
                <ScrollView horizontal style={{ marginBottom: 10 }}>
                  {editExistingUrls.map((url, i) => (
                    <View key={i} style={{ position: 'relative', marginRight: 8 }}>
                      <Image source={{ uri: url }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                      <TouchableOpacity
                        onPress={() => setEditExistingUrls(editExistingUrls.filter((_, idx) => idx !== i))}
                        style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#ff4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickEditImages}>
                <Text style={styles.imagePickerText}>
                  📷 {editImages.length > 0 ? `${editImages.length} new photo(s) selected` : 'Add New Photos'}
                </Text>
              </TouchableOpacity>

              {editImages.length > 0 && (
                <ScrollView horizontal style={{ marginBottom: 10 }}>
                  {editImages.map((img, i) => (
                    <Image key={i} source={{ uri: img.uri }} style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }} />
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity style={styles.btn} onPress={handleSaveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#2a2a3e' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
  welcome: { color: '#fff', fontSize: 13, marginTop: 2 },
  msgBtn: { backgroundColor: '#2e7d32', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  msgBtnText: { color: '#fff', fontWeight: 'bold' },
  pendingBanner: { backgroundColor: '#2a2a3e', padding: 14, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: '#2e7d32' },
  pendingText: { color: '#2e7d32', textAlign: 'center', fontSize: 13 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statBox: { flex: 1, backgroundColor: '#2a2a3e', padding: 14, borderRadius: 10, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32' },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  locationBtn: { backgroundColor: '#2a2a3e', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2e7d32' },
  locationBtnText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 15 },
  card: { backgroundColor: '#2a2a3e', borderRadius: 12, padding: 14, marginBottom: 12 },
 postImage: { width: 358, height: 300, borderRadius: 8, marginBottom: 10 },
  postTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  price: { fontSize: 15, color: '#2e7d32', marginBottom: 6 },
  description: { color: '#aaa', fontSize: 13, marginBottom: 8 },
  likes: { color: '#fff', fontSize: 13 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#2e7d32', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#2a2a3e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 20 },
  input: { backgroundColor: '#1a1a2e', color: '#fff', padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 15 },
  imagePickerBtn: { backgroundColor: '#1a1a2e', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#2e7d32' },
  imagePickerText: { color: '#2e7d32', fontSize: 14 },
  btn: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#aaa', fontSize: 15 },
  imageCount: { color: '#aaa', fontSize: 12, textAlign: 'center', marginBottom: 6 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  editBtn: { flex: 1, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2e7d32', padding: 10, borderRadius: 8, alignItems: 'center' },
  editBtnText: { color: '#2e7d32', fontWeight: 'bold' },
  deleteBtn: { flex: 1, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#ff4444', padding: 10, borderRadius: 8, alignItems: 'center' },
  deleteBtnText: { color: '#ff4444', fontWeight: 'bold' },
});