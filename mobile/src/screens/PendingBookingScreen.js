// Pending booking screen: countdown timer, proceed to payment, or cancel hold
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '../services/api';

const pad = (n) => String(n).padStart(2, '0');

export default function PendingBookingScreen({ route, navigation }) {
  const { bookingId, expiresAt, seats, price, movie } = route.params;
  const { authRequest } = useApiClient();
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
  );
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          Alert.alert('Booking Expired', 'Your seat hold has expired.', [
            { text: 'OK', onPress: () => navigation.navigate('Home') },
          ]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleCancel = async () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to release your seats?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await authRequest({ method: 'DELETE', url: `/bookings/${bookingId}` });
            navigation.navigate('Home');
          } catch {
            Alert.alert('Error', 'Could not cancel booking');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const isExpired = secondsLeft === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.movieTitle}>{movie?.title || 'Movie'}</Text>

        <Text style={styles.label}>Selected Seats</Text>
        <Text style={styles.seats}>{seats.map((s) => `${s.row}${s.col}`).join(', ')}</Text>

        <Text style={styles.label}>Total</Text>
        <Text style={styles.amount}>LKR {seats.length * price}</Text>

        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Time remaining to complete payment</Text>
          <Text style={[styles.timer, isExpired && styles.timerExpired]}>
            {pad(minutes)}:{pad(seconds)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, isExpired && styles.payButtonDisabled]}
          disabled={isExpired}
          onPress={() =>
            navigation.navigate('Payment', {
              bookingId,
              seats,
              price,
              movie,
              total: seats.length * price,
            })
          }
        >
          <Text style={styles.payButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={cancelling}>
          {cancelling ? (
            <ActivityIndicator color="#e50914" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancel &amp; Release Seats</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24 },
  movieTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  label: { color: '#666', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  seats: { color: '#fff', fontSize: 16, marginBottom: 16 },
  amount: { color: '#e50914', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  timerBox: { alignItems: 'center', marginBottom: 24 },
  timerLabel: { color: '#aaa', fontSize: 13, marginBottom: 8 },
  timer: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  timerExpired: { color: '#e50914' },
  payButton: { backgroundColor: '#e50914', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  payButtonDisabled: { opacity: 0.4 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { paddingVertical: 12, alignItems: 'center' },
  cancelButtonText: { color: '#e50914', fontSize: 15 },
});
