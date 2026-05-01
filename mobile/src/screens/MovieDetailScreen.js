// Movie detail screen: full info, genre/duration/rating, and Book Tickets button
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../services/api';

const fetchMovie = (id) => apiClient.get(`/movies/${id}`).then((r) => r.data);

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovie(movieId),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e50914" size="large" />
      </View>
    );
  }

  if (isError || !movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load movie details</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: movie.posterUrl || 'https://via.placeholder.com/400x600' }}
          style={styles.poster}
        />
        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>{movie.duration} min</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItem}>{movie.language}</Text>
            {movie.rating != null && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaItem}>⭐ {movie.rating}/10</Text>
              </>
            )}
          </View>
          <View style={styles.genreRow}>
            {(movie.genre || []).map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.description}>{movie.description}</Text>
          {movie.cast?.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Cast</Text>
              <Text style={styles.castText}>{movie.cast.join(', ')}</Text>
            </>
          )}
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('ShowtimeSelection', { movieId: movie._id })}
          >
            <Text style={styles.bookButtonText}>Book Tickets</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  poster: { width: '100%', height: 400, resizeMode: 'cover' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaItem: { color: '#ccc', fontSize: 14 },
  metaDot: { color: '#555', marginHorizontal: 6 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  genreTag: { backgroundColor: '#222', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 8 },
  genreText: { color: '#ccc', fontSize: 12 },
  description: { color: '#aaa', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 6 },
  castText: { color: '#aaa', fontSize: 14, marginBottom: 24 },
  bookButton: { backgroundColor: '#e50914', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#e50914', fontSize: 16 },
});
