import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = 'https://busubusu-backend.onrender.com/api';
const SOCKET_URL = 'https://busubusu-backend.onrender.com';

export default function ChatScreen({ route, navigation }) {
  const { token, user, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      extraHeaders: { 'ngrok-skip-browser-warning': 'true' }
    });
    socketRef.current.emit('join_room', {
      userId: user.id,
      otherUserId: otherUser.id
    });
    socketRef.current.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socketRef.current.disconnect();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages/${otherUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    socketRef.current.emit('send_message', {
      senderId: user.id,
      receiverId: otherUser.id,
      content: text.trim()
    });
    setText('');
  };

  const pickAndSendImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (result.canceled) return;

      setUploading(true);
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('image', { uri, name: filename, type });

      const uploadRes = await axios.post(`${API}/messages/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadRes.data.url;
      socketRef.current.emit('send_message', {
        senderId: user.id,
        receiverId: otherUser.id,
        content: `[IMAGE]${imageUrl}`,
      });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || JSON.stringify(err);
      Alert.alert('Upload Failed', msg);
    } finally {
      setUploading(false);
    }
  };

  const deleteMessage = async (messageId, isMine) => {
    if (!isMine) return;
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await axios.delete(`${API}/messages/${messageId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => prev.filter(m => m.id !== messageId));
          } catch (err) {
            Alert.alert('Error', 'Could not delete message');
          }
        }
      }
    ]);
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === user.id;
    const isImage = item.content?.startsWith('[IMAGE]');
    const imageUrl = isImage ? item.content.replace('[IMAGE]', '') : null;

    return (
      <TouchableOpacity
        onLongPress={() => deleteMessage(item.id, isMine)}
        activeOpacity={0.8}
      >
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          {isImage ? (
            <Image source={{ uri: imageUrl }} style={styles.chatImage} resizeMode="cover" />
          ) : (
            <Text style={[styles.bubbleText, isMine ? styles.myText : styles.theirText]}>
              {item.content}
            </Text>
          )}
          <Text style={styles.time}>
            {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerName}>{otherUser.name}</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <Text style={styles.empty}>No messages yet. Say hello! 👋</Text>
        }
      />

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={pickAndSendImage} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#e91e8c" size="small" />
          ) : (
            <Text style={styles.photoIcon}>📷</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#2a2a3e' },
  back: { color: '#2e7d32', fontSize: 16 },
  headerName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messageList: { padding: 16, flexGrow: 1 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 10 },
  myBubble: { backgroundColor: '#2e7d32', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#2a2a3e', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15 },
  myText: { color: '#1a1a2e' },
  theirText: { color: '#fff' },
  time: { fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 4, alignSelf: 'flex-end' },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 60 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#2a2a3e', alignItems: 'center' },
  photoBtn: { width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
  photoIcon: { fontSize: 24 },
  input: { flex: 1, backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 20, fontSize: 15, maxHeight: 100 },
  sendBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 18, borderRadius: 20, justifyContent: 'center', height: 42 },
  sendText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 15 },
  chatImage: { width: 200, height: 200, borderRadius: 12 },
});