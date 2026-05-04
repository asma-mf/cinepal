// Ticket screen: booking confirmation with QR code and styled cinema ticket card
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, Divider, Snackbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useApiClient } from '../services/api';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { useRef } from 'react';

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
  </View>
);

const PerforationLine = () => (
  <View style={styles.perforation}>
    <View style={styles.perfCircleLeft} />
    <View style={styles.perforatedLine} />
    <View style={styles.perfCircleRight} />
  </View>
);

export default function TicketScreen({ route, navigation }) {
  const { paymentId, booking, payment, movie, seats } = route.params;
  const { authRequest } = useApiClient();
  const theme = useTheme();
  const [refunding, setRefunding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const viewShotRef = useRef();

  const showtimeDate = booking?.showtimeId?.date ? new Date(booking.showtimeId.date) : null;
  const isFuture = showtimeDate && showtimeDate > new Date();

  const dateStr = showtimeDate
    ? showtimeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const seatList = seats?.map((s) => `${s.row}${s.col}`).join(', ') || '—';

  const handleRefund = async () => {
    setRefunding(true);
    try {
      await authRequest({ method: 'DELETE', url: `/payments/${paymentId}` });
      setSnackbar({ visible: true, message: 'Refund processed. Redirecting...' });
      setTimeout(() => navigation.navigate('Home'), 2000);
    } catch (err) {
      setSnackbar({ visible: true, message: err.response?.data?.error || 'Refund failed. Try again.' });
    } finally {
      setRefunding(false);
    }
  };

  const handleSaveToGallery = async () => {
    try {
      setSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setSnackbar({ visible: true, message: 'Permission to access gallery is required.' });
        return;
      }

      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      setSnackbar({ visible: true, message: 'Ticket saved to gallery! 🎟️' });
    } catch (err) {
      console.error('Save to gallery error:', err);
      setSnackbar({ visible: true, message: 'Failed to save ticket image.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Confirmation header */}
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-bold" size={36} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Enjoy your movie experience</Text>
        </View>

        {/* Cinema Ticket Card */}
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
          <Surface style={styles.ticket} elevation={2}>
            {/* Ticket header */}
            <View style={styles.ticketHeader}>
              <Text style={styles.cinemaLabel}>CINEPAL</Text>
              <Text style={styles.ticketMovieTitle} numberOfLines={2}>{movie?.title || '—'}</Text>
              <View style={styles.formatRow}>
                {booking?.showtimeId?.format && (
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatText}>{booking.showtimeId.format}</Text>
                  </View>
                )}
              </View>
            </View>

            <PerforationLine />

            {/* Ticket info grid */}
            <View style={styles.ticketBody}>
              <View style={styles.infoGrid}>
                <View style={styles.infoColumn}>
                  <Text style={styles.gridLabel}>DATE</Text>
                  <Text style={styles.gridValue}>{dateStr}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.gridLabel}>TIME</Text>
                  <Text style={styles.gridValue}>{booking?.showtimeId?.startTime || '—'}</Text>
                </View>
              </View>
              <Divider style={styles.innerDivider} />
              <View style={styles.infoGrid}>
                <View style={styles.infoColumn}>
                  <Text style={styles.gridLabel}>VENUE</Text>
                  <Text style={styles.gridValue} numberOfLines={2}>
                    {booking?.showtimeId?.theatreId?.name || '—'}
                  </Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.gridLabel}>HALL</Text>
                  <Text style={styles.gridValue}>{booking?.showtimeId?.hallId?.name || '—'}</Text>
                </View>
              </View>
              <Divider style={styles.innerDivider} />
              <View style={styles.infoGrid}>
                <View style={styles.infoColumn}>
                  <Text style={styles.gridLabel}>SEATS</Text>
                  <Text style={styles.gridValue}>{seatList}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.gridLabel}>AMOUNT</Text>
                  <Text style={[styles.gridValue, { color: '#E50914' }]}>
                    LKR {payment?.amount?.toLocaleString() || 0}
                  </Text>
                </View>
              </View>
            </View>

            <PerforationLine />

            {/* QR Code section */}
            <View style={styles.qrSection}>
              <QRCode
                value={String(booking?._id || 'booking')}
                size={140}
                backgroundColor="white"
                color="#0D0D0D"
              />
              <Text style={styles.qrLabel}>Scan at the entrance</Text>
              <Text style={styles.bookingId}>#{booking?._id?.slice(-10).toUpperCase()}</Text>
            </View>
          </Surface>
        </ViewShot>

        {/* Save button */}
        <Button
          mode="contained"
          onPress={handleSaveToGallery}
          loading={saving}
          disabled={saving}
          icon="download"
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.saveContent}
          labelStyle={styles.saveLabel}
        >
          Save to Gallery
        </Button>

        {/* Transaction info */}
        {payment?.transactionId && (
          <View style={styles.transactionRow}>
            <MaterialCommunityIcons name="receipt" size={14} color="#666" />
            <Text style={styles.transactionText}>Transaction: {payment.transactionId}</Text>
          </View>
        )}

        {/* Actions */}
        {isFuture && (
          <Button
            mode="outlined"
            onPress={handleRefund}
            loading={refunding}
            disabled={refunding}
            icon="cash-refund"
            style={styles.refundButton}
            contentStyle={styles.refundContent}
            labelStyle={styles.refundLabel}
            textColor="#E50914"
          >
            Request Refund
          </Button>
        )}

        <Button
          mode="contained-tonal"
          onPress={() => navigation.navigate('Home')}
          icon="home"
          style={styles.homeButton}
          contentStyle={styles.homeContent}
          labelStyle={styles.homeLabel}
        >
          Back to Home
        </Button>

        <View style={{ height: 24 }} />
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3500}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },

  // Success header
  successHeader: { alignItems: 'center', marginBottom: 28 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#F5F5F5', marginBottom: 4 },
  successSubtitle: { color: '#666', fontSize: 14 },

  // Ticket
  ticket: {
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ticketHeader: { padding: 24, paddingBottom: 20 },
  cinemaLabel: {
    color: '#E50914',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  ticketMovieTitle: { color: '#F5F5F5', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  formatRow: { flexDirection: 'row' },
  formatBadge: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderWidth: 1,
    borderColor: '#E50914',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  formatText: { color: '#E50914', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Perforation
  perforation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
  },
  perfCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0D0D0D',
    marginLeft: -10,
  },
  perfCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0D0D0D',
    marginRight: -10,
  },
  perforatedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderStyle: 'dashed',
  },

  // Ticket body
  ticketBody: { padding: 20 },
  infoGrid: { flexDirection: 'row', gap: 16 },
  infoColumn: { flex: 1, paddingVertical: 8 },
  gridLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  gridValue: { color: '#F5F5F5', fontSize: 14, fontWeight: '600' },
  innerDivider: { backgroundColor: '#2A2A2A', marginVertical: 2 },

  // QR section
  qrSection: { alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  qrLabel: { color: '#666', fontSize: 12, marginTop: 12 },
  bookingId: { color: '#999', fontSize: 11, fontFamily: 'monospace', marginTop: 4 },

  // Transaction
  transactionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  transactionText: { color: '#555', fontSize: 12 },

  // Buttons
  saveButton: { borderRadius: 12, marginBottom: 12 },
  saveContent: { paddingVertical: 8 },
  saveLabel: { fontSize: 16, fontWeight: '700' },
  refundButton: { borderRadius: 12, borderColor: '#E50914', marginBottom: 12 },
  refundContent: { paddingVertical: 4 },
  refundLabel: { fontSize: 15, fontWeight: '600' },
  homeButton: { borderRadius: 12 },
  homeContent: { paddingVertical: 4 },
  homeLabel: { fontSize: 15, fontWeight: '600' },
});
