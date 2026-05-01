// Home screen: horizontally-scrolling "Now Showing" and "Coming Soon" movie lists
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../services/api';

const fetchMovies = (status) => apiClient.get(`/movies?status=${status}`).then((r) => r.data);

const MovieCard = ({ movie, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(movie)}>
    <Image
      source={{ uri: movie.posterUrl || 'https://via.placeholder.com/120x180' }}
      style={styles.poster}
    />
    <Text style={styles.cardTitle} numberOfLines={2}>
      {movie.title}
    </Text>
  </TouchableOpacity>
);

const SectionList = ({ title, status, onMoviePress }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['movies', status],
    queryFn: () => fetchMovies(status),
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {isLoading && <ActivityIndicator color="#e50914" style={{ marginVertical: 20 }} />}
      {isError && <Text style={styles.errorText}>Failed to load movies</Text>}
      {data && (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <MovieCard movie={item} onPress={onMoviePress} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const handleMoviePress = (movie) => navigation.navigate('MovieDetail', { movieId: movie._id });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>CinePal</Text>
        <SectionList title="Now Showing" status="now_showing" onMoviePress={handleMoviePress} />
        <SectionList title="Coming Soon" status="coming_soon" onMoviePress={handleMoviePress} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#e50914', padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16 },
  card: { width: 120, marginRight: 12 },
  poster: { width: 120, height: 180, borderRadius: 8, backgroundColor: '#222' },
  cardTitle: { color: '#fff', fontSize: 12, marginTop: 6, textAlign: 'center' },
  errorText: { color: '#e50914', paddingHorizontal: 16 },
});
