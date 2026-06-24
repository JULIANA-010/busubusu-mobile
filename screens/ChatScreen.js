import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { io } from 'socket.io-client';

const API = 'https://busubusu-backend.onrender.com/api';
const SOCKET_URL = 'https://busubusu-backend.onrender.com';

export default function ChatScreen({ route, navigation }) {
  const { token, user, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
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

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === user.id;
    return (
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.bubbleText, isMine ? styles.myText : styles.theirText]}>
          {item.content}
        </Text>
        <Text style={styles.time}>
          {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
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

      {/* Input */}
      <View style={styles.inputRow}>
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
  time: { fontSize: 10, color: '#rgba(0,0,0,0.4)', marginTop: 4, alignSelf: 'flex-end' },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 60 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#2a2a3e' },
  input: { flex: 1, backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 20, fontSize: 15, maxHeight: 100 },
  sendBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 18, borderRadius: 20, justifyContent: 'center' },
  sendText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 15 },
});