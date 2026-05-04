// Pending booking screen: countdown timer, proceed to payment, or cancel hold
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, Divider, useTheme, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiClient } from '../services/api';

const pad = (n) => String(n).padStart(2, '0');

export default function PendingBookingScreen({ route, navigation }) {
  const { bookingId, expiresAt, seats, price, movie } = route.params;
  const { authRequest } = useApiClient();
  const theme = useTheme();

  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
  );
  const [cancelling, setCancelling] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If we are navigating to Payment, we don't need to release seats
      if (e.data.action.type === 'NAVIGATE' && e.data.action.payload?.name === 'Payment') {
        return;
      }
      
      // If we are backing away (pop, back button), release seats
      const action = e.data.action;
      if (action.type === 'GO_BACK' || action.type === 'POP') {
        authRequest({ method: 'DELETE', url: `/bookings/${bookingId}` }).catch(() => {});
      }
    });
    return unsubscribe;
  }, [navigation, bookingId]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpired = secondsLeft === 0;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 60;
  const total = seats.length * price;

  const timerColor = isExpired ? '#EF4444' : isUrgent ? '#F59E0B' : '#22c55e';

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await authRequest({ method: 'DELETE', url: `/bookings/${bookingId}` });
      navigation.navigate('Home');
    } catch {
      setSnackbar({ visible: true, message: 'Could not release seats. Please try again.' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="clock-outline" size={32} color={timerColor} />
          <Text style={styles.headerTitle}>Complete Your Booking</Text>
          <Text style={styles.headerSubtitle}>
            Your seats are reserved. Complete payment before the timer runs out.
          </Text>
        </View>

        {/* Ticket summary card */}
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.movieTitle} numberOfLines={2}>{movie?.title || 'Movie'}</Text>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="seat" size={16} color="#666" />
            <Text style={styles.infoLabel}>Seats</Text>
            <Text style={styles.infoValue}>{seats.map((s) => `${s.row}${s.col}`).join(', ')}</Text>
          </View>
          <Divider style={[styles.divider, { marginLeft: 36 }]} />
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="cash" size={16} color="#666" />
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={[styles.infoValue, { color: theme.colors.primary, fontWeight: '800', fontSize: 18 }]}>
              LKR {total.toLocaleString()}
            </Text>
          </View>
        </Surface>

        {/* Countdown timer */}
        <View style={[styles.timerCard, { borderColor: timerColor + '44', backgroundColor: timerColor + '11' }]}>
          <Text style={styles.timerLabel}>Time remaining</Text>
          <Text style={[styles.timer, { color: timerColor }]}>
            {pad(minutes)}:{pad(seconds)}
          </Text>
          {isExpired && (
            <View style={styles.expiredRow}>
              <MaterialCommunityIcons name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.expiredText}> Session expired. Please try again.</Text>
            </View>
          )}
          {isUrgent && !isExpired && (
            <View style={styles.expiredRow}>
              <MaterialCommunityIcons name="alert" size={14} color="#F59E0B" />
              <Text style={[styles.expiredText, { color: '#F59E0B' }]}> Less than a minute left!</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate('Payment', {
              bookingId,
              seats,
              price,
              movie,
              total,
            })
          }
          disabled={isExpired}
          icon="credit-card"
          style={styles.payButton}
          contentStyle={styles.payContent}
          labelStyle={styles.payLabel}
        >
          Proceed to Payment
        </Button>

        <Button
          mode="text"
          onPress={handleCancel}
          loading={cancelling}
          disabled={cancelling}
          icon="close-circle-outline"
          labelStyle={{ color: '#666' }}
          style={styles.cancelButton}
        >
          Cancel & Release Seats
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
  inner: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },

  header: { alignItems: 'center', gap: 8, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#F5F5F5', textAlign: 'center' },
  headerSubtitle: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20 },

  card: { backgroundColor: '#1C1C1C', borderRadius: 14, overflow: 'hidden' },
  movieTitle: { color: '#F5F5F5', fontSize: 18, fontWeight: '700', padding: 16, paddingBottom: 12 },
  divider: { backgroundColor: '#2A2A2A' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  infoLabel: { color: '#AEAEAE', fontSize: 14, flex: 1 },
  infoValue: { color: '#F5F5F5', fontSize: 14, fontWeight: '600' },

  timerCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  timerLabel: { color: '#666', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  timer: { fontSize: 52, fontWeight: '900', fontVariant: ['tabular-nums'], lineHeight: 60 },
  expiredRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  expiredText: { color: '#EF4444', fontSize: 13 },

  payButton: { borderRadius: 12 },
  payContent: { paddingVertical: 6 },
  payLabel: { fontSize: 16, fontWeight: '700' },
  cancelButton: { marginTop: -4 },
});
