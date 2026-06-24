import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function InboxScreen({ route, navigation }) {
  const { token, user } = route.params;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}
      onPress={() => navigation.navigate('Chat', {
        token, user,
        otherUser: { id: item.other_user, name: 'User' }
      })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.userName}>Conversation</Text>
        <Text style={styles.lastMsg} numberOfLines={1}>{item.content}</Text>
      </View>
      <Text style={styles.time}>
        {new Date(item.sent_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
        : <FlatList
            data={conversations}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <Text style={styles.empty}>No messages yet</Text>
            }
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#2a2a3e' },
  back: { color: '#2e7d32', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a3e', padding: 14, borderRadius: 12, marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 22 },
  itemBody: { flex: 1 },
  userName: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  lastMsg: { color: '#aaa', fontSize: 13 },
  time: { color: '#aaa', fontSize: 11 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 15 },
});