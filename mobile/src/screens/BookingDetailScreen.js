// Booking detail screen: full info, cancel button for confirmed future bookings
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '../services/api';

export default function BookingDetailScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const { authRequest } = useApiClient();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => authRequest({ method: 'GET', url: `/bookings/${bookingId}` }).then((r) => r.data),
  });

  const showtime = booking?.showtimeId;
  const isFutureConfirmed =
    booking?.status === 'confirmed' &&
    showtime?.date &&
    new Date(showtime.date) > new Date();

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'This will refund your payment. Continue?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await authRequest({ method: 'PUT', url: `/bookings/${bookingId}/cancel` });
            queryClient.invalidateQueries(['my-bookings']);
            queryClient.invalidateQueries(['booking', bookingId]);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not cancel');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator color="#e50914" size="large" /></View>;
  if (isError || !booking) return <View style={styles.center}><Text style={styles.errorText}>Failed to load booking</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Booking Details</Text>

        <View style={styles.card}>
          <Text style={styles.movieTitle}>{showtime?.movieId?.title || '—'}</Text>
          <InfoRow label="Date" value={showtime?.date ? new Date(showtime.date).toLocaleDateString() : '—'} />
          <InfoRow label="Time" value={showtime?.startTime || '—'} />
          <InfoRow label="Theatre" value={showtime?.theatreId?.name || '—'} />
          <InfoRow label="Hall" value={showtime?.hallId?.name || '—'} />
          <InfoRow label="Seats" value={booking.seats.map((s) => `${s.row}${s.col}`).join(', ')} />
          <InfoRow label="Status" value={booking.status} highlight />
        </View>

        {isFutureConfirmed && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Booking &amp; Refund</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value, highlight }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  scroll: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 20, marginBottom: 20 },
  movieTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  rowLabel: { color: '#666', fontSize: 14 },
  rowValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  rowValueHighlight: { color: '#22c55e', textTransform: 'capitalize' },
  cancelButton: { backgroundColor: '#e50914', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelButtonDisabled: { opacity: 0.6 },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#e50914', fontSize: 16 },
});
