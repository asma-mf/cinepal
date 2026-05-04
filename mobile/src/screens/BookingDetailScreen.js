// Booking detail screen: full info, cancel button for confirmed future bookings
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Button, Surface, Divider, ActivityIndicator, Chip, useTheme, Snackbar } from 'react-native-paper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiClient } from '../services/api';
import QRCode from 'react-native-qrcode-svg';

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
  let showDate = null;
  if (showtime?.date && showtime?.startTime) {
    showDate = new Date(showtime.date);
    const [hours, minutes] = showtime.startTime.split(':');
    showDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  }

  const isFutureConfirmed =
    booking?.status === 'confirmed' &&
    showDate &&
    showDate > new Date();

  const statusConfig = STATUS_CONFIG[booking?.status] || STATUS_CONFIG.pending;

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? If the showtime is more than 24 hours away, you will receive a 50% refund. Otherwise, no refund will be issued.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const res = await authRequest({ method: 'PUT', url: `/bookings/${bookingId}/cancel` });
              queryClient.invalidateQueries(['my-bookings']);
              queryClient.invalidateQueries(['booking', bookingId]);
              Alert.alert('Cancellation Successful', res.data?.message || 'Booking cancelled.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (err) {
              setSnackbar({ visible: true, message: err.response?.data?.error || 'Could not cancel booking.' });
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: movie?.backdropUrl || movie?.posterUrl || 'https://via.placeholder.com/600x300' }}
            style={styles.backdropImage}
          />
          <View style={styles.overlay} />
          <View style={styles.backdropContent}>
            <Text variant="headlineMedium" style={styles.movieTitle} numberOfLines={2}>
              {movie?.title || '—'}
            </Text>
            <Chip
              icon={statusConfig.icon}
              style={[styles.statusChip, { backgroundColor: statusConfig.color + '22' }]}
              textStyle={[styles.statusChipText, { color: statusConfig.color }]}
            >
              {statusConfig.label}
            </Chip>
          </View>
        </View>

        <View style={styles.contentContainer}>

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

        {/* QR Code */}
        {booking.status === 'confirmed' && (
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.cardSection}>Ticket Code</Text>
            <Divider style={styles.cardDivider} />
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={booking._id}
                  size={160}
                  color="#1C1C1C"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text variant="bodySmall" style={styles.qrHint}>
                Show this code at the theatre entrance
              </Text>
            </View>
          </Surface>
        )}

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

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {booking.status === 'confirmed' && (
            <Button
              mode="contained"
              onPress={() => {
                const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:3000';
                const url = `${webUrl}/print/${booking._id}`;
                import('react-native').then(({ Linking }) => Linking.openURL(url));
              }}
              icon="download"
              style={styles.downloadButton}
              buttonColor={theme.colors.primary}
            >
              Download Ticket
            </Button>
          )}

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
        </View>

        </View>
        
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  contentContainer: { paddingHorizontal: 20 },

  backdropContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    marginBottom: 20,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdropContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  movieTitle: { color: '#F5F5F5', fontWeight: '900', marginBottom: 12, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  statusChip: { alignSelf: 'flex-start' },
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

  qrContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#1C1C1C',
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  qrHint: {
    color: '#AEAEAE',
    marginTop: 8,
  },

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

  actionButtons: { gap: 12, marginTop: 4 },
  downloadButton: { borderRadius: 12 },
  cancelButton: { borderRadius: 12, borderColor: '#E50914' },
  cancelContent: { paddingVertical: 4 },
  cancelLabel: { fontSize: 15, fontWeight: '600' },
});
