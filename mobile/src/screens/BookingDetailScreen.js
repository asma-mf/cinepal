// Booking detail screen: full info, cancel button for confirmed future bookings
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, Divider, ActivityIndicator, Chip, useTheme, Snackbar } from 'react-native-paper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiClient } from '../services/api';

const STATUS_CONFIG = {
  confirmed: { icon: 'check-circle', color: '#22c55e', label: 'Confirmed' },
  pending: { icon: 'clock-outline', color: '#f59e0b', label: 'Pending' },
  cancelled: { icon: 'close-circle', color: '#ef4444', label: 'Cancelled' },
};

const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <MaterialCommunityIcons name={icon} size={16} color="#666" />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

export default function BookingDetailScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const { authRequest } = useApiClient();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [cancelling, setCancelling] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => authRequest({ method: 'GET', url: `/bookings/${bookingId}` }).then((r) => r.data),
  });

  const showtime = booking?.showtimeId;
  const movie = showtime?.movieId;
  const isFutureConfirmed =
    booking?.status === 'confirmed' &&
    showtime?.date &&
    new Date(showtime.date) > new Date();

  const statusConfig = STATUS_CONFIG[booking?.status] || STATUS_CONFIG.pending;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await authRequest({ method: 'PUT', url: `/bookings/${bookingId}/cancel` });
      queryClient.invalidateQueries(['my-bookings']);
      queryClient.invalidateQueries(['booking', bookingId]);
      navigation.goBack();
    } catch (err) {
      setSnackbar({ visible: true, message: err.response?.data?.error || 'Could not cancel booking.' });
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.primary} />
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
          Failed to load booking
        </Text>
      </View>
    );
  }

  const dateStr = showtime?.date
    ? new Date(showtime.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const seatList = booking.seats?.map((s) => `${s.row}${s.col}`).join(', ') || '—';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Movie title header */}
        <Text variant="headlineSmall" style={styles.movieTitle} numberOfLines={2}>
          {movie?.title || '—'}
        </Text>

        {/* Status chip */}
        <Chip
          icon={statusConfig.icon}
          style={[styles.statusChip, { backgroundColor: statusConfig.color + '22' }]}
          textStyle={[styles.statusChipText, { color: statusConfig.color }]}
        >
          {statusConfig.label}
        </Chip>

        {/* Showtime info */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardSection}>Showtime Details</Text>
          <Divider style={styles.cardDivider} />
          <InfoRow icon="calendar" label="Date" value={dateStr} />
          <Divider style={styles.rowDivider} />
          <InfoRow icon="clock-outline" label="Time" value={showtime?.startTime || '—'} />
          <Divider style={styles.rowDivider} />
          <InfoRow icon="map-marker-outline" label="Theatre" value={showtime?.theatreId?.name || '—'} />
          <Divider style={styles.rowDivider} />
          <InfoRow icon="layers-outline" label="Hall" value={showtime?.hallId?.name || '—'} />
          <Divider style={styles.rowDivider} />
          <InfoRow icon="movie-filter-outline" label="Format" value={showtime?.format || '—'} />
        </Surface>

        {/* Seat info */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardSection}>Your Seats</Text>
          <Divider style={styles.cardDivider} />
          <InfoRow icon="seat" label="Seats" value={seatList} />
          <Divider style={styles.rowDivider} />
          <InfoRow
            icon="cash"
            label="Amount Paid"
            value={`LKR ${(showtime?.price || 0) * (booking.seats?.length || 0)}`}
            valueColor={theme.colors.primary}
          />
        </Surface>

        {/* Booking meta */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.cardSection}>Booking Info</Text>
          <Divider style={styles.cardDivider} />
          <InfoRow icon="identifier" label="Booking ID" value={booking._id?.slice(-8).toUpperCase()} />
          <Divider style={styles.rowDivider} />
          <InfoRow
            icon="calendar-check"
            label="Booked On"
            value={booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '—'}
          />
        </Surface>

        {/* Cancel button */}
        {isFutureConfirmed && (
          <Button
            mode="outlined"
            onPress={handleCancel}
            loading={cancelling}
            disabled={cancelling}
            icon="close-circle-outline"
            style={styles.cancelButton}
            contentStyle={styles.cancelContent}
            labelStyle={styles.cancelLabel}
            textColor="#E50914"
          >
            Cancel Booking & Refund
          </Button>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3500}
        action={{ label: 'OK', onPress: () => setSnackbar({ ...snackbar, visible: false }) }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },

  movieTitle: { color: '#F5F5F5', fontWeight: '800', marginBottom: 12 },
  statusChip: { alignSelf: 'flex-start', marginBottom: 20 },
  statusChipText: { fontWeight: '700', fontSize: 12 },

  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardSection: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    padding: 16,
    paddingBottom: 12,
  },
  cardDivider: { backgroundColor: '#2A2A2A' },
  rowDivider: { backgroundColor: '#2A2A2A', marginLeft: 48 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { color: '#AEAEAE', fontSize: 14 },
  infoValue: { color: '#F5F5F5', fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },

  cancelButton: { borderRadius: 12, borderColor: '#E50914', marginTop: 4 },
  cancelContent: { paddingVertical: 4 },
  cancelLabel: { fontSize: 15, fontWeight: '600' },
});
