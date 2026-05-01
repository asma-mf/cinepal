// My bookings screen: upcoming and past bookings list
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '../services/api';

const STATUS_COLORS = {
  confirmed: '#22c55e',
  pending: '#f59e0b',
  cancelled: '#ef4444',
};

const BookingRow = ({ booking, onPress }) => {
  const showtime = booking.showtimeId;
  const movie = showtime?.movieId;
  const isFuture = showtime?.date && new Date(showtime.date) > new Date();
  const category = booking.status === 'confirmed' && isFuture ? 'upcoming' : 'past';

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(booking)}>
      <Image
        source={{ uri: movie?.posterUrl || 'https://via.placeholder.com/60x90' }}
        style={styles.poster}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{movie?.title || 'Unknown Movie'}</Text>
        <Text style={styles.meta}>
          {showtime?.date ? new Date(showtime.date).toLocaleDateString() : '—'} •{' '}
          {showtime?.startTime || '—'}
        </Text>
        <Text style={styles.meta}>{showtime?.theatreId?.name || '—'}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: STATUS_COLORS[booking.status] + '22' }]}>
        <Text style={[styles.badgeText, { color: STATUS_COLORS[booking.status] }]}>
          {booking.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function MyBookingsScreen({ navigation }) {
  const { authRequest } = useApiClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => authRequest({ method: 'GET', url: '/bookings/mine' }).then((r) => r.data),
  });

  const upcoming = (data || []).filter(
    (b) =>
      b.status === 'confirmed' &&
      b.showtimeId?.date &&
      new Date(b.showtimeId.date) > new Date()
  );
  const past = (data || []).filter(
    (b) =>
      b.status !== 'confirmed' ||
      !b.showtimeId?.date ||
      new Date(b.showtimeId.date) <= new Date()
  );

  const sections = [
    ...(upcoming.length > 0 ? [{ type: 'header', title: 'Upcoming', id: 'h1' }, ...upcoming] : []),
    ...(past.length > 0 ? [{ type: 'header', title: 'Past', id: 'h2' }, ...past] : []),
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }
    return (
      <BookingRow
        booking={item}
        onPress={(b) => navigation.navigate('BookingDetail', { bookingId: b._id })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>My Bookings</Text>
      {isLoading && <ActivityIndicator color="#e50914" style={{ marginTop: 40 }} />}
      {isError && <Text style={styles.errorText}>Failed to load bookings</Text>}
      {!isLoading && data?.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No bookings yet</Text>
        </View>
      )}
      <FlatList
        data={sections}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', padding: 16 },
  list: { padding: 16 },
  sectionHeader: { color: '#aaa', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 6 },
  row: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  poster: { width: 50, height: 75, borderRadius: 6, marginRight: 12 },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  meta: { color: '#aaa', fontSize: 12, marginBottom: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#555', fontSize: 16 },
  errorText: { color: '#e50914', padding: 16 },
});
