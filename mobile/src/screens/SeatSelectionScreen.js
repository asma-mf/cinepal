// Seat selection screen: scrollable grid with colour-coded seat states
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '../services/api';
import apiClient from '../services/api';

const fetchShowtime = (id) => apiClient.get(`/showtimes/${id}`).then((r) => r.data);

const SEAT_COLORS = {
  available: '#2d2d2d',
  hold: '#f59e0b',
  booked: '#ef4444',
  selected: '#7c3aed',
};

export default function SeatSelectionScreen({ route, navigation }) {
  const { showtimeId } = route.params;
  const { authRequest } = useApiClient();
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: showtime, isLoading, isError } = useQuery({
    queryKey: ['showtime', showtimeId],
    queryFn: () => fetchShowtime(showtimeId),
  });

  const isSelected = useCallback(
    (seat) => selected.some((s) => s.row === seat.row && s.col === seat.col),
    [selected]
  );

  const toggleSeat = (seat) => {
    if (seat.status === 'booked' || seat.status === 'hold') return;
    setSelected((prev) =>
      prev.some((s) => s.row === seat.row && s.col === seat.col)
        ? prev.filter((s) => !(s.row === seat.row && s.col === seat.col))
        : [...prev, { row: seat.row, col: seat.col }]
    );
  };

  const getSeatColor = (seat) => {
    if (isSelected(seat)) return SEAT_COLORS.selected;
    return SEAT_COLORS[seat.status] || SEAT_COLORS.available;
  };

  const handleReserve = async () => {
    if (selected.length === 0) {
      Alert.alert('Select seats', 'Please select at least one seat');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authRequest({
        method: 'POST',
        url: '/bookings',
        data: { showtimeId, seats: selected },
      });
      navigation.navigate('PendingBooking', {
        bookingId: res.data.bookingId,
        expiresAt: res.data.expiresAt,
        seats: res.data.seats,
        price: showtime.price,
        movie: showtime.movieId,
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not reserve seats';
      Alert.alert('Booking Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator color="#e50914" size="large" /></View>;
  if (isError) return <View style={styles.center}><Text style={styles.errorText}>Failed to load seats</Text></View>;

  // Group seats by row for rendering
  const rows = {};
  (showtime?.seats || []).forEach((seat) => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });
  const sortedRows = Object.keys(rows).sort();

  const total = selected.length * (showtime?.price || 0);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Select Seats</Text>
      <Text style={styles.subtitle}>{showtime?.movieId?.title} • {showtime?.startTime} • {showtime?.format}</Text>

      {/* Screen label */}
      <View style={styles.screen}><Text style={styles.screenText}>SCREEN</Text></View>

      <ScrollView contentContainerStyle={styles.grid}>
        {sortedRows.map((rowKey) => (
          <View key={rowKey} style={styles.seatRow}>
            <Text style={styles.rowLabel}>{rowKey}</Text>
            {rows[rowKey].sort((a, b) => a.col - b.col).map((seat) => (
              <TouchableOpacity
                key={`${seat.row}${seat.col}`}
                style={[styles.seat, { backgroundColor: getSeatColor(seat) }]}
                onPress={() => toggleSeat(seat)}
                disabled={seat.status === 'booked' || seat.status === 'hold'}
              >
                <Text style={styles.seatText}>{seat.col}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(SEAT_COLORS).map(([state, color]) => (
          <View key={state} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{state}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalText}>
          {selected.length} seat{selected.length !== 1 ? 's' : ''} • LKR {total}
        </Text>
        <TouchableOpacity
          style={[styles.reserveButton, submitting && styles.reserveButtonDisabled]}
          onPress={handleReserve}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.reserveButtonText}>Reserve Seats</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', paddingHorizontal: 16, paddingTop: 8 },
  subtitle: { color: '#aaa', fontSize: 13, paddingHorizontal: 16, marginBottom: 12 },
  screen: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 4,
    alignItems: 'center',
  },
  screenText: { color: '#aaa', fontSize: 11, letterSpacing: 4 },
  grid: { paddingHorizontal: 12, paddingBottom: 16 },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rowLabel: { color: '#555', width: 20, fontSize: 12, textAlign: 'center' },
  seat: {
    width: 28,
    height: 28,
    borderRadius: 4,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatText: { color: '#fff', fontSize: 9 },
  legend: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 2 },
  legendLabel: { color: '#aaa', fontSize: 11, textTransform: 'capitalize' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  totalText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  reserveButton: { backgroundColor: '#e50914', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  reserveButtonDisabled: { opacity: 0.6 },
  reserveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  errorText: { color: '#e50914', fontSize: 16 },
});
