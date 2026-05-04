// Payment screen: card input form with Paper TextInput, submits to confirm booking
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, Divider, useTheme, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApiClient } from '../services/api';

const formatCardNumber = (val) =>
  val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

const formatExpiry = (val) => {
  let clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 2) {
    const month = parseInt(clean.slice(0, 2));
    if (month > 12) clean = '12' + clean.slice(2);
    if (month === 0 && clean.length === 2) clean = '01';
  }
  return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
};

export default function PaymentScreen({ route, navigation }) {
  const { bookingId, seats, price, movie, total } = route.params;
  const { authRequest } = useApiClient();
  const theme = useTheme();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If we are navigating to Ticket (success), don't release seats
      if (e.data.action.type === 'REPLACE' && e.data.action.payload?.name === 'Ticket') {
        return;
      }
      
      // If we are backing away (pop, back button)
      const action = e.data.action;
      if (action.type === 'GO_BACK' || action.type === 'POP') {
        authRequest({ method: 'DELETE', url: `/bookings/${bookingId}` }).catch(() => {});
      }
    });
    return unsubscribe;
  }, [navigation, bookingId]);

  const handlePay = async () => {
    if (!cardNumber || !expiry || !cvv || !cardHolder) {
      setSnackbar({ visible: true, message: 'Please fill in all card details.' });
      return;
    }

    // Card number length
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setSnackbar({ visible: true, message: 'Please enter a valid 16-digit card number.' });
      return;
    }

    // Expiry validation
    const [month, year] = expiry.split('/').map(n => parseInt(n));
    if (!month || month < 1 || month > 12) {
      setSnackbar({ visible: true, message: 'Please enter a valid month (01-12).' });
      return;
    }

    if (!year || year < 24) { // Basic check for current year (2024+)
       setSnackbar({ visible: true, message: 'Please enter a valid expiry year.' });
       return;
    }

    // Check if date is in the past
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = parseInt(now.getFullYear().toString().slice(-2));

    if (year === currentYear && month < currentMonth) {
      setSnackbar({ visible: true, message: 'Card has expired.' });
      return;
    }

    // CVV validation
    if (cvv.length < 3) {
      setSnackbar({ visible: true, message: 'Please enter a valid 3 or 4-digit CVV.' });
      return;
    }

    setLoading(true);
    try {
      const res = await authRequest({
        method: 'POST',
        url: '/payments',
        data: { bookingId },
      });
      navigation.replace('Ticket', {
        paymentId: res.data.payment._id,
        booking: res.data.booking,
        payment: res.data.payment,
        movie,
        seats,
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Payment failed. Please try again.';
      setSnackbar({ visible: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header Description */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Payment</Text>
          <Text style={styles.screenSubtitle}>Secure your booking with a card</Text>
        </View>

        {/* Order summary */}
        <Surface style={styles.summary} elevation={1}>
          <Text style={styles.summaryLabel}>ORDER SUMMARY</Text>
          <Divider style={styles.divider} />
          <Text style={styles.movieTitle} numberOfLines={2}>{movie?.title}</Text>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="seat" size={14} color="#666" />
            <Text style={styles.summaryMeta}>{seats.map((s) => `${s.row}${s.col}`).join(', ')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="ticket-percent" size={14} color="#666" />
            <Text style={styles.summaryMeta}>{seats.length} × LKR {price.toLocaleString()}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
              LKR {total.toLocaleString()}
            </Text>
          </View>
        </Surface>

        {/* Card mock visual */}
        <View style={styles.cardVisual}>
          <View style={styles.cardChip}>
            <MaterialCommunityIcons name="chip" size={28} color="#FFB800" />
          </View>
          <Text style={styles.cardNumberDisplay}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardFooterLabel}>CARD HOLDER</Text>
              <Text style={styles.cardFooterValue}>{cardHolder || 'YOUR NAME'}</Text>
            </View>
            <View>
              <Text style={styles.cardFooterLabel}>EXPIRES</Text>
              <Text style={styles.cardFooterValue}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Card Holder Name"
            value={cardHolder}
            onChangeText={setCardHolder}
            mode="outlined"
            left={<TextInput.Icon icon="account-outline" />}
            style={styles.input}
            autoCapitalize="words"
          />
          <TextInput
            label="Card Number"
            value={cardNumber}
            onChangeText={(v) => setCardNumber(formatCardNumber(v))}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="credit-card-outline" />}
            maxLength={19}
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput
              label="Expiry (MM/YY)"
              value={expiry}
              onChangeText={(v) => setExpiry(formatExpiry(v))}
              mode="outlined"
              keyboardType="numeric"
              maxLength={5}
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="CVV"
              value={cvv}
              onChangeText={setCvv}
              mode="outlined"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={[styles.input, styles.halfInput]}
            />
          </View>
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={14} color="#555" />
          <Text style={styles.securityText}> 256-bit encrypted · Demo mode, no real charges</Text>
        </View>

        {/* Pay button */}
        <Button
          mode="contained"
          onPress={handlePay}
          loading={loading}
          disabled={loading}
          icon="lock"
          style={styles.payButton}
          contentStyle={styles.payContent}
          labelStyle={styles.payLabel}
        >
          Pay LKR {total.toLocaleString()}
        </Button>

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
  scroll: { padding: 20 },

  screenHeader: { paddingTop: 0, paddingBottom: 24 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#F5F5F5' },
  screenSubtitle: { color: '#666', fontSize: 14, marginTop: 2 },

  summary: { backgroundColor: '#1C1C1C', borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  summaryLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, padding: 14, paddingBottom: 10 },
  divider: { backgroundColor: '#2A2A2A' },
  movieTitle: { color: '#F5F5F5', fontSize: 16, fontWeight: '700', padding: 14, paddingBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 3 },
  summaryMeta: { color: '#666', fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  totalLabel: { color: '#AEAEAE', fontSize: 15, fontWeight: '600' },
  totalAmount: { fontSize: 20, fontWeight: '800' },

  // Card visual
  cardVisual: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    minHeight: 160,
  },
  cardChip: { marginBottom: 16 },
  cardNumberDisplay: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardFooterLabel: { color: '#555', fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginBottom: 2 },
  cardFooterValue: { color: '#AEAEAE', fontSize: 13, fontWeight: '600' },

  // Form
  form: { gap: 0 },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  securityText: { color: '#555', fontSize: 12 },

  payButton: { borderRadius: 12 },
  payContent: { paddingVertical: 6 },
  payLabel: { fontSize: 16, fontWeight: '700' },
});
