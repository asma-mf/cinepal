// Payment screen: dummy card input form, submits to confirm booking
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { bookingId, seats, price, movie, total } = route.params;
  const { authRequest } = useApiClient();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!cardNumber || !expiry || !cvv) {
      Alert.alert('Incomplete', 'Please fill in all card details');
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
      const msg = err.response?.data?.error || 'Payment failed';
      Alert.alert('Payment Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Payment</Text>

      <View style={styles.summary}>
        <Text style={styles.movieTitle}>{movie?.title}</Text>
        <Text style={styles.seats}>{seats.map((s) => `${s.row}${s.col}`).join(', ')}</Text>
        <Text style={styles.total}>LKR {total}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor="#555"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={19}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor="#555"
              value={expiry}
              onChangeText={setExpiry}
              maxLength={5}
            />
          </View>
          <View style={[styles.halfField, { marginLeft: 12 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor="#555"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.payButton, loading && styles.payButtonDisabled]} onPress={handlePay} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>Pay LKR {total}</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  summary: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 24 },
  movieTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  seats: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  total: { color: '#e50914', fontSize: 22, fontWeight: 'bold' },
  form: { marginBottom: 32 },
  label: { color: '#666', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: { flexDirection: 'row' },
  halfField: { flex: 1 },
  payButton: { backgroundColor: '#e50914', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
