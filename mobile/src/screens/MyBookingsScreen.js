// My bookings screen: upcoming and past bookings with Paper Cards
import React from 'react';
import { View, FlatList, Image, StyleSheet, RefreshControl } from 'react-native';
import { Text, Chip, ActivityIndicator, Surface, useTheme, Divider } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiClient } from '../services/api';
import { TouchableOpacity } from 'react-native';

const STATUS_CONFIG = {
  confirmed: { icon: 'check-circle', color: '#22c55e', label: 'Confirmed' },
  pending: { icon: 'clock-outline', color: '#f59e0b', label: 'Pending' },
  cancelled: { icon: 'close-circle', color: '#ef4444', label: 'Cancelled' },
};

const BookingCard = ({ booking, onPress, theme }) => {
  const showtime = booking.showtimeId;
  const movie = showtime?.movieId;
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const dateStr = showtime?.date
    ? new Date(showtime.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '—';

  return (
    <TouchableOpacity onPress={() => onPress(booking)} activeOpacity={0.8}>
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Image
          source={{ uri: movie?.posterUrl || 'https://via.placeholder.com/60x90' }}
          style={styles.poster}
        />
        <View style={styles.info}>
          <Text style={styles.movieTitle} numberOfLines={1}>{movie?.title || 'Unknown Movie'}</Text>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar" size={12} color="#666" />
            <Text style={styles.metaText}>{dateStr}</Text>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#666" style={{ marginLeft: 8 }} />
            <Text style={styles.metaText}>{showtime?.startTime || '—'}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={12} color="#666" />
            <Text style={styles.metaText} numberOfLines={1}>{showtime?.theatreId?.name || '—'}</Text>
          </View>
          <View style={styles.statusRow}>
            <Chip
              compact
              icon={statusConfig.icon}
              style={[styles.statusChip, { backgroundColor: statusConfig.color + '22' }]}
              textStyle={[styles.statusChipText, { color: statusConfig.color }]}
            >
              {statusConfig.label}
            </Chip>
            <Text style={styles.seats}>{booking.seats?.length || 0} seat{booking.seats?.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#3A3A3A" />
      </Surface>
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title, count }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionCount}>{count}</Text>
  </View>
);

export default function MyBookingsScreen({ navigation }) {
  const { authRequest } = useApiClient();
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => authRequest({ method: 'GET', url: '/bookings/mine' }).then((r) => r.data),
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const upcoming = (data || []).filter(
    (b) => b.status === 'confirmed' && b.showtimeId?.date && new Date(b.showtimeId.date) > new Date()
  );
  const past = (data || []).filter(
    (b) => b.status !== 'confirmed' || !b.showtimeId?.date || new Date(b.showtimeId.date) <= new Date()
  );

  const sections = [
    ...(upcoming.length > 0 ? [{ type: 'header', title: 'Upcoming', count: upcoming.length, id: 'h1' }, ...upcoming] : []),
    ...(past.length > 0 ? [{ type: 'header', title: 'Past', count: past.length, id: 'h2' }, ...past] : []),
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <SectionHeader title={item.title} count={item.count} />;
    }
    return (
      <BookingCard
        booking={item}
        theme={theme}
        onPress={(b) => navigation.navigate('BookingDetail', { bookingId: b._id })}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Bookings</Text>
        <Text variant="bodySmall" style={styles.pageSubtitle}>View and manage your movie tickets</Text>
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>Failed to load bookings</Text>
        </View>
      )}

      {!isLoading && data?.length === 0 && (
        <View style={styles.center}>
          <MaterialCommunityIcons name="ticket-outline" size={64} color="#2A2A2A" />
          <Text variant="titleMedium" style={{ color: '#3A3A3A', marginTop: 16 }}>No bookings yet</Text>
          <Text variant="bodySmall" style={{ color: '#555', marginTop: 4 }}>
            Your booked tickets will appear here.
          </Text>
        </View>
      )}

      {data && data.length > 0 && (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#E50914']} 
              tintColor="#E50914"
              progressBackgroundColor="#1C1C1C"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#F5F5F5' },
  pageSubtitle: { color: '#666', fontSize: 14, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },

  list: { padding: 16 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 6 },
  sectionTitle: { color: '#666', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  sectionCount: {
    backgroundColor: '#2A2A2A',
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  poster: { width: 64, height: 96, borderRadius: 10 },
  info: { flex: 1, gap: 6 },
  movieTitle: { color: '#F5F5F5', fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#666', fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  statusChip: { height: 28, borderRadius: 8 },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  seats: { color: '#666', fontSize: 12, fontWeight: '500' },
});
