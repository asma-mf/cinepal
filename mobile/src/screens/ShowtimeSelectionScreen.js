// Showtime selection screen: date chip row + showtime cards
import React, { useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Chip, Card, ActivityIndicator, useTheme, Divider } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../services/api';

const fetchShowtimes = (movieId) =>
  apiClient.get(`/showtimes?movieId=${movieId}`).then((r) => r.data);

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

const FORMAT_COLORS = {
  '2D': '#3B82F6',
  '3D': '#8B5CF6',
  'IMAX': '#F59E0B',
};

export default function ShowtimeSelectionScreen({ route, navigation }) {
  const { movieId } = route.params;
  const theme = useTheme();
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
      d.getDate() === selectedDay.getDate() &&
      s.status === 'active'
    );
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Description */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Pick a Showtime</Text>
        <Text style={styles.screenSubtitle}>Select your preferred date and time to watch</Text>
      </View>

      {/* Date chip row */}
      <View style={styles.dateSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {days.map((day, index) => {
            const isSelected = day.toDateString() === selectedDay.toDateString();
            const isToday = index === 0;
            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.75}
                style={[
                  styles.dateChip,
                  { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant }
                ]}
              >
                <Text style={[styles.dayName, { color: isSelected ? '#fff' : '#888' }]}>
                  {isToday ? 'Today' : day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayNum, { color: isSelected ? '#fff' : theme.colors.onSurface }]}>
                  {day.getDate()}
                </Text>
                <Text style={[styles.dayMonth, { color: isSelected ? 'rgba(255,255,255,0.7)' : '#666' }]}>
                  {day.toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Divider style={styles.divider} />

      {/* Showtimes list */}
      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
            Failed to load showtimes
          </Text>
        </View>
      )}

      {!isLoading && filtered.length === 0 && (
        <View style={styles.center}>
          <MaterialCommunityIcons name="calendar-remove" size={64} color="#2A2A2A" />
          <Text variant="titleMedium" style={{ color: '#3A3A3A', marginTop: 16 }}>
            No showtimes available
          </Text>
          <Text variant="bodySmall" style={{ color: '#555', marginTop: 4, textAlign: 'center' }}>
            Try selecting a different date.
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const formatColor = FORMAT_COLORS[item.format] || '#666';
          const seatsLeft = (item.seats || []).filter((s) => s.status === 'available').length;

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('SeatSelection', { showtimeId: item._id })}
              activeOpacity={0.8}
            >
              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    {/* Time */}
                    <Text style={styles.time}>{item.startTime}</Text>
                    {/* Theatre */}
                    <View style={styles.venueRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={13} color="#666" />
                      <Text style={styles.venueName} numberOfLines={1}>
                        {item.theatreId?.name || 'Theatre'}
                      </Text>
                    </View>
                    <View style={styles.venueRow}>
                      <MaterialCommunityIcons name="layers-outline" size={13} color="#666" />
                      <Text style={styles.venueHall}>{item.hallId?.name || 'Hall'}</Text>
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    {/* Format badge */}
                    <View style={[styles.formatBadge, { backgroundColor: formatColor + '22', borderColor: formatColor }]}>
                      <Text style={[styles.formatText, { color: formatColor }]}>{item.format}</Text>
                    </View>
                    {/* Price */}
                    <Text style={styles.price}>LKR {item.price.toLocaleString()}</Text>
                    {/* Seats */}
                    <Text style={[styles.seats, { color: seatsLeft < 10 ? '#f59e0b' : '#666' }]}>
                      {seatsLeft} seats left
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  screenHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#F5F5F5' },
  screenSubtitle: { color: '#666', fontSize: 13, marginTop: 2 },

  dateSection: { paddingVertical: 16 },
  dateRow: { paddingHorizontal: 16, gap: 8 },
  dateChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 60,
  },
  dayName: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  dayNum: { fontSize: 22, fontWeight: '800' },
  dayMonth: { fontSize: 10, marginTop: 2 },

  divider: { backgroundColor: '#2A2A2A', marginBottom: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  list: { padding: 16, gap: 10 },

  card: { backgroundColor: '#1C1C1C', borderRadius: 14 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },

  cardLeft: { flex: 1, gap: 4 },
  time: { fontSize: 26, fontWeight: '800', color: '#F5F5F5' },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  venueName: { color: '#AEAEAE', fontSize: 13, flex: 1 },
  venueHall: { color: '#666', fontSize: 12 },

  cardRight: { alignItems: 'flex-end', gap: 6 },
  formatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  formatText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  price: { color: '#F5F5F5', fontSize: 16, fontWeight: '700' },
  seats: { fontSize: 11 },
});
