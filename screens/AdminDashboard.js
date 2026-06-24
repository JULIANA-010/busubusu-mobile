import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import axios from 'axios';

const API = 'https://busubusu-backend.onrender.com/api';

export default function AdminDashboard({ route, navigation }) {
  const { token, user } = route.params;
  const [pendingTailors, setPendingTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchPending = async () => {
    try {
      const res = await axios.get(`${API}/admin/pending-tailors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingTailors(res.data);
      setStats(prev => ({ ...prev, pending: res.data.length }));
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to load');
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (tailorId, tailorName) => {
    Alert.alert(
      'Approve Tailor',
      `Approve ${tailorName} to start posting work?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve ✅',
          onPress: async () => {
            try {
              await axios.put(`${API}/admin/approve/${tailorId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('✅ Approved!', `${tailorName} can now post their work.`);
              fetchPending();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to approve');
            }
          }
        }
      ]
    );
  };

  const handleReject = async (tailorId, tailorName) => {
    Alert.alert(
      'Reject Tailor',
      `Reject ${tailorName}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject ❌',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.put(`${API}/admin/reject/${tailorId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('❌ Rejected', `${tailorName}'s account has been rejected.`);
              fetchPending();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to reject');
            }
          }
        }
      ]
    );
  };

  const renderTailor = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.tailorName}>{item.name}</Text>
          <Text style={styles.tailorEmail}>{item.email}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>📞 Phone</Text>
          <Text style={styles.detailValue}>{item.phone || 'N/A'}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>📍 District</Text>
          <Text style={styles.detailValue}>{item.district || 'N/A'}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>📅 Applied</Text>
          <Text style={styles.detailValue}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleReject(item.id, item.name)}>
          <Text style={styles.rejectBtnText}>❌ Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => handleApprove(item.id, item.name)}>
          <Text style={styles.approveBtnText}>✅ Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BUSU BUSU</Text>
          <Text style={styles.headerSub}>Admin Dashboard</Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>👑 Admin</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxGreen]}>
          <Text style={[styles.statNum, styles.statNumGreen]}>⏳</Text>
          <Text style={styles.statLabel}>Awaiting Review</Text>
        </View>
      </View>

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pending Tailor Applications</Text>
        <Text style={styles.sectionCount}>{pendingTailors.length} waiting</Text>
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
        : <FlatList
            data={pendingTailors}
            keyExtractor={item => item.id}
            renderItem={renderTailor}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchPending(); }}
                tintColor="#2e7d32"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySub}>No pending tailor applications right now.</Text>
              </View>
            }
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#1a3a1a' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
  headerSub: { color: '#aaa', fontSize: 13, marginTop: 2 },
  adminBadge: { backgroundColor: '#2e7d32', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  adminBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statBox: { flex: 1, backgroundColor: '#1a3a1a', padding: 16, borderRadius: 12, alignItems: 'center' },
  statBoxGreen: { borderWidth: 1, borderColor: '#2e7d32' },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32' },
  statNumGreen: { fontSize: 24 },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionCount: { color: '#2e7d32', fontSize: 13 },
  card: { backgroundColor: '#1a3a1a', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 0.5, borderColor: '#2e7d32' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2e7d32', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  tailorName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tailorEmail: { color: '#aaa', fontSize: 13, marginTop: 2 },
  pendingBadge: { backgroundColor: '#3a2a0e', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#f5a623' },
  pendingBadgeText: { color: '#f5a623', fontSize: 11, fontWeight: 'bold' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0a1f0a', padding: 12, borderRadius: 10, marginBottom: 14 },
  detail: { alignItems: 'center', flex: 1 },
  detailLabel: { color: '#aaa', fontSize: 11, marginBottom: 4 },
  detailValue: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, backgroundColor: '#3a0a0a', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#c62828' },
  rejectBtnText: { color: '#ef5350', fontWeight: 'bold', fontSize: 14 },
  approveBtn: { flex: 1, backgroundColor: '#2e7d32', padding: 12, borderRadius: 10, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { color: '#aaa', fontSize: 14, textAlign: 'center' },
});