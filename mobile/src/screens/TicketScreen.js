// Ticket screen: booking confirmation with QR code and refund option
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useApiClient } from '../services/api';

export default function TicketScreen({ route, navigation }) {
  const { paymentId, booking, payment, movie, seats } = route.params;
  const { authRequest } = useApiClient();
  const [refunding, setRefunding] = useState(false);

  const showtimeDate = booking?.showtimeId?.date
    ? new Date(booking.showtimeId.date)
    : null;
  const isFuture = showtimeDate && showtimeDate > new Date();

  const handleRefund = async () => {
    Alert.alert('Request Refund', 'Are you sure you want to cancel and refund?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setRefunding(true);
          try {
            await authRequest({ method: 'DELETE', url: `/payments/${paymentId}` });
            Alert.alert('Refund Processed', 'Your booking has been cancelled and refunded.', [
              { text: 'OK', onPress: () => navigation.navigate('Home') },
            ]);
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Refund failed');
          } finally {
            setRefunding(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.ticket}>
          <View style={styles.ticketHeader}>
            <Text style={styles.confirmed}>✓ Booking Confirmed</Text>
            <Text style={styles.movieTitle}>{movie?.title}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <InfoRow label="Date" value={showtimeDate ? showtimeDate.toLocaleDateString() : '—'} />
            <InfoRow label="Time" value={booking?.showtimeId?.startTime || '—'} />
            <InfoRow label="Theatre" value={booking?.showtimeId?.theatreId?.name || '—'} />
            <InfoRow label="Hall" value={booking?.showtimeId?.hallId?.name || '—'} />
            <InfoRow label="Seats" value={seats?.map((s) => `${s.row}${s.col}`).join(', ') || '—'} />
            <InfoRow label="Amount Paid" value={`LKR ${payment?.amount || 0}`} />
            <InfoRow label="Transaction" value={payment?.transactionId || '—'} />
          </View>

          <View style={styles.divider} />

          <View style={styles.qrContainer}>
            <QRCode value={String(booking?._id || 'booking')} size={160} backgroundColor="white" />
          </View>
        </View>

        {isFuture && (
          <TouchableOpacity
            style={[styles.refundButton, refunding && styles.refundButtonDisabled]}
            onPress={handleRefund}
            disabled={refunding}
          >
            {refunding ? (
              <ActivityIndicator color="#e50914" />
            ) : (
              <Text style={styles.refundButtonText}>Request Refund</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { padding: 20 },
  ticket: { backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  ticketHeader: { padding: 24, alignItems: 'center' },
  confirmed: { color: '#22c55e', fontSize: 16, marginBottom: 8 },
  movieTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 0,
    // Simulate perforated edge
    borderStyle: 'dashed',
  },
  infoGrid: { padding: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: '#666', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
  qrContainer: { alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  refundButton: { borderWidth: 1, borderColor: '#e50914', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  refundButtonDisabled: { opacity: 0.5 },
  refundButtonText: { color: '#e50914', fontSize: 16, fontWeight: '600' },
  homeButton: { backgroundColor: '#1a1a1a', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  homeButtonText: { color: '#fff', fontSize: 16 },
});
