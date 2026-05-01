// Showtime selection screen: date picker + list of showtimes for a movie
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../services/api';

const fetchShowtimes = (movieId) =>
  apiClient.get(`/showtimes?movieId=${movieId}`).then((r) => r.data);

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getNext7Days = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
};

export default function ShowtimeSelectionScreen({ route, navigation }) {
  const { movieId } = route.params;
  const days = getNext7Days();
  const [selectedDay, setSelectedDay] = useState(days[0]);

  const { data: allShowtimes, isLoading, isError } = useQuery({
    queryKey: ['showtimes', movieId],
    queryFn: () => fetchShowtimes(movieId),
  });

  const filtered = (allShowtimes || []).filter((s) => {
    const d = new Date(s.date);
    return (
      d.getFullYear() === selectedDay.getFullYear() &&
      d.getMonth() === selectedDay.getMonth() &&
      d.getDate() === selectedDay.getDate()
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Select Showtime</Text>

      {/* Date picker row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
        {days.map((day) => {
          const active = day.toDateString() === selectedDay.toDateString();
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.dayChip, active && styles.dayChipActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dayNum, active && styles.dayTextActive]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading && <ActivityIndicator color="#e50914" style={{ marginTop: 40 }} />}
      {isError && <Text style={styles.errorText}>Failed to load showtimes</Text>}

      {!isLoading && filtered.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No showtimes for this date</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.showtimeCard}
            onPress={() => navigation.navigate('SeatSelection', { showtimeId: item._id })}
          >
            <View style={styles.showtimeInfo}>
              <Text style={styles.theatreName}>
                {item.theatreId?.name || 'Theatre'} — {item.hallId?.name || 'Hall'}
              </Text>
              <Text style={styles.showtimeMeta}>
                {item.startTime} • {item.format}
              </Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>LKR {item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', padding: 16 },
  dayRow: { paddingHorizontal: 12, marginBottom: 16 },
  dayChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  dayChipActive: { backgroundColor: '#e50914' },
  dayText: { color: '#aaa', fontSize: 11 },
  dayNum: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dayTextActive: { color: '#fff' },
  list: { padding: 16 },
  showtimeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  showtimeInfo: { flex: 1 },
  theatreName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  showtimeMeta: { color: '#aaa', fontSize: 13, marginTop: 4 },
  priceBox: { backgroundColor: '#e50914', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  price: { color: '#fff', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#555', fontSize: 16 },
  errorText: { color: '#e50914', padding: 16 },
});
