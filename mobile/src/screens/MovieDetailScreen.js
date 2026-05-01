// Movie detail screen: full-bleed poster, genre chips, cast, and Book button
import React from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Chip, ActivityIndicator, Divider, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../services/api';

const fetchMovie = (id) => apiClient.get(`/movies/${id}`).then((r) => r.data);

const MetaBadge = ({ icon, label }) => (
  <View style={styles.metaBadge}>
    <MaterialCommunityIcons name={icon} size={13} color="#AEAEAE" />
    <Text style={styles.metaBadgeText}>{label}</Text>
  </View>
);

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const theme = useTheme();
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovie(movieId),
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !movie) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.primary} />
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
          Failed to load movie
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Full-bleed poster */}
        <View style={styles.posterWrapper}>
          <Image
            source={{ uri: movie.posterUrl || 'https://via.placeholder.com/400x560' }}
            style={styles.poster}
          />
          <View style={styles.posterGradient} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Status badge */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: movie.status === 'now_showing' ? '#E50914' : '#3A3A3A' }]}>
              <Text style={styles.statusText}>
                {movie.status === 'now_showing' ? 'NOW SHOWING' : 'COMING SOON'}
              </Text>
            </View>
          </View>

          <Text variant="headlineMedium" style={styles.title}>{movie.title}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <MetaBadge icon="clock-outline" label={`${movie.duration} min`} />
            <MetaBadge icon="translate" label={movie.language} />
            {movie.rating != null && (
              <View style={[styles.metaBadge, styles.ratingBadge]}>
                <MaterialCommunityIcons name="star" size={13} color="#FFB800" />
                <Text style={[styles.metaBadgeText, { color: '#FFB800' }]}>{movie.rating} / 10</Text>
              </View>
            )}
          </View>

          {/* Genre chips */}
          {movie.genre?.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreRow}>
              {movie.genre.map((g) => (
                <Chip
                  key={g}
                  compact
                  style={styles.genreChip}
                  textStyle={styles.genreChipText}
                >
                  {g}
                </Chip>
              ))}
            </ScrollView>
          )}

          <Divider style={styles.divider} />

          {/* Description */}
          <Text variant="labelLarge" style={styles.sectionLabel}>Synopsis</Text>
          <Text style={styles.description}>{movie.description}</Text>

          {/* Cast */}
          {movie.cast?.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="labelLarge" style={styles.sectionLabel}>Cast</Text>
              <View style={styles.castRow}>
                {movie.cast.map((name, i) => (
                  <View key={i} style={styles.castItem}>
                    <View style={styles.castAvatar}>
                      <Text style={styles.castInitial}>{name[0]}</Text>
                    </View>
                    <Text style={styles.castName} numberOfLines={2}>{name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Release date */}
          {movie.releaseDate && (
            <View style={styles.releaseDateRow}>
              <MaterialCommunityIcons name="calendar" size={14} color="#AEAEAE" />
              <Text style={styles.releaseDate}>
                {' '}Release: {new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          )}

          {/* Book button */}
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ShowtimeSelection', { movieId: movie._id })}
            style={styles.bookButton}
            contentStyle={styles.bookButtonContent}
            labelStyle={styles.bookButtonLabel}
            icon="ticket"
          >
            Book Tickets
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Poster
  posterWrapper: { width: '100%', height: 420, position: 'relative' },
  poster: { width: '100%', height: '100%', resizeMode: 'cover' },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, #0D0D0D)',
  },

  // Content
  content: { padding: 20 },
  statusRow: { marginBottom: 10 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },

  title: { color: '#F5F5F5', fontWeight: '800', marginBottom: 12, lineHeight: 32 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  ratingBadge: { backgroundColor: 'rgba(255,184,0,0.15)', borderWidth: 1, borderColor: '#FFB800' },
  metaBadgeText: { color: '#AEAEAE', fontSize: 12, fontWeight: '500' },

  genreRow: { marginBottom: 16 },
  genreChip: { marginRight: 8, backgroundColor: '#2A2A2A' },
  genreChipText: { fontSize: 12, color: '#AEAEAE' },

  divider: { backgroundColor: '#2A2A2A', marginVertical: 16 },
  sectionLabel: { color: '#F5F5F5', marginBottom: 10, fontWeight: '700', letterSpacing: 0.5 },
  description: { color: '#AEAEAE', fontSize: 14, lineHeight: 22 },

  // Cast
  castRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  castItem: { alignItems: 'center', width: 64 },
  castAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  castInitial: { color: '#E50914', fontSize: 18, fontWeight: '700' },
  castName: { color: '#AEAEAE', fontSize: 11, textAlign: 'center' },

  releaseDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  releaseDate: { color: '#AEAEAE', fontSize: 13 },

  // Book button
  bookButton: { marginTop: 24, borderRadius: 12 },
  bookButtonContent: { paddingVertical: 6 },
  bookButtonLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
