// Seat selection screen: curved grid and walking-path gaps
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Text, Button, ActivityIndicator, Divider, useTheme, Snackbar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiClient } from '../services/api';
import apiClient from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const fetchShowtime = (id) => apiClient.get(`/showtimes/${id}`).then((r) => r.data);

const SEAT_COLORS = {
  available: '#2A2A2A',
  hold: '#F59E0B',
  booked: '#3A1A1A',
  selected: '#E50914', // Brand Red
};

const SEAT_BORDER_COLORS = {
  available: '#3A3A3A',
  hold: '#F59E0B',
  booked: '#EF4444',
  selected: '#FF4D4D', // Lighter Red
};

const SEAT_SIZE = 30;
const SEAT_MARGIN = 3;
const CURVE_INTENSITY = 0.12; 

export default function SeatSelectionScreen({ route, navigation }) {
  const { showtimeId } = route.params;
  const { authRequest } = useApiClient();
  const theme = useTheme();
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

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

  const getSeatState = (seat) => (isSelected(seat) ? 'selected' : seat.status || 'available');

  const handleReserve = async () => {
    if (selected.length === 0) {
      setSnackbar({ visible: true, message: 'Please select at least one seat.' });
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
      const msg = err.response?.data?.error || 'Could not reserve seats. Please try again.';
      setSnackbar({ visible: true, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const hall = showtime?.hallId;
  const rowBreaks = hall?.rowBreaks || [];
  const colBreaks = hall?.colBreaks || [];

  const rows = useMemo(() => {
    const r = {};
    (showtime?.seats || []).forEach((seat) => {
      if (!r[seat.row]) r[seat.row] = [];
      r[seat.row].push(seat);
    });
    return r;
  }, [showtime]);

  const sortedRowKeys = useMemo(() => Object.keys(rows).sort(), [rows]);
  const total = selected.length * (showtime?.price || 0);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>Failed to load seats</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Description */}
      <View style={styles.screenHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.screenTitle}>Select Seats</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.movieName} numberOfLines={1}>{showtime?.movieId?.title}</Text>
              <Text style={styles.showtimeMeta}>{showtime?.startTime} · {showtime?.format}</Text>
            </View>
          </View>
          {showtime?.movieId?.posterUrl && (
            <Image 
              source={{ uri: showtime.movieId.posterUrl }} 
              style={styles.headerPoster}
              resizeMode="cover"
              width={55}
              height={70}
            />
          )}
        </View>
      </View>

      {/* Screen indicator (Curved) */}
      <View style={styles.screenIndicatorContainer}>
        <View style={styles.curvedScreenContainer}>
          <View style={styles.curvedScreen} />
        </View>

        <Text style={styles.screenLabel}>SCREEN</Text>
      </View>
      {/* Seat Grid */}
      <ScrollView 
        contentContainerStyle={styles.verticalGrid}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGrid}>
          <View style={styles.gridWrapper}>
            {sortedRowKeys.map((rowKey, rowIndex) => (
              <View key={rowKey} style={{ marginBottom: rowBreaks.includes(rowIndex + 1) ? 20 : 0 }}>
                <View style={styles.seatRow}>
                  <Text style={styles.rowLabel}>{rowKey}</Text>
                  {rows[rowKey]
                    .sort((a, b) => a.col - b.col)
                    .map((seat, colIndex) => {
                      const state = getSeatState(seat);
                      const isUnavailable = seat.status === 'booked' || seat.status === 'hold';
                      
                      // Curve Calculation
                      const midCol = (hall?.cols || 10) / 2;
                      const distFromCenter = colIndex + 0.5 - midCol;
                      const curveOffset = Math.pow(distFromCenter, 2) * CURVE_INTENSITY;

                      return (
                        <React.Fragment key={`${seat.row}${seat.col}`}>
                          <TouchableOpacity
                            style={[
                              styles.seat,
                              {
                                backgroundColor: SEAT_COLORS[state],
                                borderColor: SEAT_BORDER_COLORS[state],
                                opacity: seat.status === 'booked' ? 0.4 : 1,
                                transform: [{ translateY: -curveOffset }],
                              },
                            ]}
                            onPress={() => toggleSeat(seat)}
                            disabled={isUnavailable}
                            activeOpacity={isUnavailable ? 1 : 0.7}
                          >
                            <Text style={styles.seatText}>{seat.col}</Text>
                          </TouchableOpacity>
                          
                          {/* Column Break Gap */}
                          {colBreaks.includes(colIndex + 1) && <View style={{ width: 15 }} />}
                        </React.Fragment>
                      );
                    })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { label: 'Available', color: SEAT_COLORS.available, border: SEAT_BORDER_COLORS.available },
          { label: 'Selected', color: SEAT_COLORS.selected, border: SEAT_BORDER_COLORS.selected },
          { label: 'Hold', color: SEAT_COLORS.hold, border: SEAT_BORDER_COLORS.hold },
          { label: 'Booked', color: SEAT_COLORS.booked, border: SEAT_BORDER_COLORS.booked },
        ].map(({ label, color, border }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendSeat, { backgroundColor: color, borderColor: border }]} />
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Divider style={styles.footerDivider} />

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.selectedCount}>
            {selected.length} seat{selected.length !== 1 ? 's' : ''} selected
          </Text>
          <Text style={styles.totalAmount}>LKR {total.toLocaleString()}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleReserve}
          loading={submitting}
          disabled={submitting || selected.length === 0}
          icon="ticket"
          style={styles.reserveButton}
          contentStyle={styles.reserveContent}
          labelStyle={styles.reserveLabel}
        >
          Reserve
        </Button>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  screenHeader: { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 8 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1, paddingRight: 16 },
  headerPoster: { width: 45, height: 65, borderRadius: 8, backgroundColor: '#2A2A2A' },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#F5F5F5' },

  subtitleRow: { paddingHorizontal: 0, paddingTop: 4, paddingBottom: 0 },
  movieName: { color: '#F5F5F5', fontSize: 15, fontWeight: '700' },
  showtimeMeta: { color: '#666', fontSize: 13, marginTop: 2 },

  screenIndicatorContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  curvedScreenContainer: {
    width: SCREEN_WIDTH * 0.82,
    height: 36,
    overflow: 'hidden',
    alignItems: 'center',
  },
  curvedScreen: {
    width: SCREEN_WIDTH * 1.8,
    height: SCREEN_WIDTH * 1.8,
    borderRadius: SCREEN_WIDTH * 0.9,
    borderWidth: 3,
    borderColor: '#ffffff99',
    backgroundColor: 'transparent',
  },


  screenLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 10,
  },
  verticalGrid: { paddingBottom: 20 },
  horizontalGrid: { paddingHorizontal: 20 },
  gridWrapper: { paddingVertical: 20 },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  rowLabel: { color: '#555', width: 20, fontSize: 11, fontWeight: '800', marginRight: 5, textAlign: 'center' },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 6,
    margin: SEAT_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  seatText: { color: '#AEAEAE', fontSize: 9, fontWeight: '700' },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSeat: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5 },
  legendLabel: { color: '#666', fontSize: 10 },

  footerDivider: { backgroundColor: '#2A2A2A' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 20,
  },
  selectedCount: { color: '#AEAEAE', fontSize: 13 },
  totalAmount: { color: '#F5F5F5', fontSize: 20, fontWeight: '900', marginTop: 2 },
  reserveButton: { borderRadius: 10, backgroundColor: '#E50914' },
  reserveContent: { paddingHorizontal: 10, paddingVertical: 4 },
  reserveLabel: { fontSize: 15, fontWeight: '800' },
});
