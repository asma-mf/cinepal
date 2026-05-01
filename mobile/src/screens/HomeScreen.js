// Home screen: featured hero + Now Showing / Coming Soon movie carousels
import React from 'react';
import { View, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, useTheme, Divider, Searchbar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../services/api';

const fetchMovies = (status) => apiClient.get(`/movies?status=${status}`).then((r) => r.data);

const MovieCard = ({ movie, onPress }) => (
  <TouchableOpacity onPress={() => onPress(movie)} style={styles.cardWrapper} activeOpacity={0.85}>
    <View style={styles.posterContainer}>
      <Image
        source={{ uri: movie.posterUrl || 'https://via.placeholder.com/140x210' }}
        style={styles.poster}
      />
      {movie.rating && (
        <View style={styles.ratingBadge}>
          <MaterialCommunityIcons name="star" size={10} color="#FFB800" />
          <Text style={styles.ratingText}>{movie.rating}</Text>
        </View>
      )}
    </View>
    <Text style={styles.cardTitle} numberOfLines={2}>{movie.title}</Text>
    <Text style={styles.cardGenre} numberOfLines={1}>
      {(movie.genre || []).slice(0, 2).join(' · ')}
    </Text>
  </TouchableOpacity>
);

const FeaturedBanner = ({ movie, onPress }) => {
  if (!movie) return null;
  return (
    <TouchableOpacity onPress={() => onPress(movie)} activeOpacity={0.9}>
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: movie.posterUrl || 'https://via.placeholder.com/400x220' }}
          style={styles.heroPoster}
          blurRadius={0}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.heroMeta}>
            <View style={styles.nowShowingBadge}>
              <Text style={styles.nowShowingText}>NOW SHOWING</Text>
            </View>
            {movie.format && (
              <Chip compact textStyle={{ fontSize: 10, color: '#FFB800' }} style={styles.formatChip}>
                {movie.format}
              </Chip>
            )}
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>{movie.title}</Text>
          <View style={styles.heroMetaRow}>
            {movie.rating != null && (
              <View style={styles.heroRating}>
                <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
                <Text style={styles.heroRatingText}>{movie.rating}/10</Text>
              </View>
            )}
            <Text style={styles.heroDuration}>{movie.duration} min</Text>
            <Text style={styles.heroLang}>{movie.language}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SectionRow = ({ title, status, onMoviePress, featured }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['movies', status],
    queryFn: () => fetchMovies(status),
  });

  const movies = data || [];

  return (
    <View style={styles.section}>
      {status === 'now_showing' && !isLoading && movies.length > 0 && (
        <FeaturedBanner movie={movies[0]} onPress={onMoviePress} />
      )}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>
      {isLoading && <ActivityIndicator style={{ marginVertical: 20 }} />}
      {isError && (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#E50914" />
          <Text style={styles.errorText}> Failed to load</Text>
        </View>
      )}
      {movies.length > 0 && (
        <FlatList
          data={movies}
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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [debouncedQuery, setDebouncedQuery] = React.useState('');

  const handleMoviePress = (movie) => navigation.navigate('MovieDetail', { movieId: movie._id });

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['movies-search', debouncedQuery],
    queryFn: () => apiClient.get(`/movies/search?q=${debouncedQuery}`).then(r => r.data),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appHeader}>
        {isSearchActive ? (
          <View style={styles.searchHeaderContainer}>
            <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#AEAEAE" style={{ marginRight: 12 }} />
            </TouchableOpacity>
            <Searchbar
              placeholder="Search movies or locations..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchBarInput}
              placeholderTextColor="#666"
              iconColor="#AEAEAE"
              elevation={0}
              autoFocus
            />
          </View>
        ) : (
          <>
            <Image
              source={require('../../assets/cinepal.png')}
              style={styles.appLogo}
            />
            <TouchableOpacity style={styles.headerRight} onPress={() => setIsSearchActive(true)}>
              <MaterialCommunityIcons name="magnify" size={24} color="#AEAEAE" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isSearchActive && debouncedQuery.length > 0 ? (
          <View style={styles.searchResultsContainer}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {isSearchLoading ? 'Searching...' : `Results for "${debouncedQuery}"`}
              </Text>
            </View>
            {isSearchLoading ? (
              <ActivityIndicator style={{ marginVertical: 40 }} />
            ) : searchResults?.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <MovieCard movie={item} onPress={handleMoviePress} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
              />
            ) : (
              <View style={styles.emptySearch}>
                <MaterialCommunityIcons name="movie-search-outline" size={48} color="#2A2A2A" />
                <Text style={styles.emptySearchText}>No movies found</Text>
              </View>
            )}
            <Divider style={{ marginVertical: 20, backgroundColor: '#1C1C1C' }} />
          </View>
        ) : null}

        {!isSearchActive && (
          <>
            <SectionRow title="Now Showing" status="now_showing" onMoviePress={handleMoviePress} featured />
            <SectionRow title="Coming Soon" status="coming_soon" onMoviePress={handleMoviePress} />
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  appLogo: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
  },
  headerRight: { padding: 4 },

  // Hero/Featured Banner
  heroContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
  },
  heroPoster: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  heroMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  nowShowingBadge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  nowShowingText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  formatChip: { backgroundColor: 'transparent', borderColor: '#FFB800', borderWidth: 1, height: 22 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heroRatingText: { color: '#FFB800', fontSize: 12, fontWeight: '600' },
  heroDuration: { color: '#AEAEAE', fontSize: 12 },
  heroLang: { color: '#AEAEAE', fontSize: 12 },

  // Section
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: { color: '#F5F5F5', fontWeight: '700', fontSize: 17 },
  seeAll: { color: '#E50914', fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16 },

  // Movie Card
  cardWrapper: { width: 130, marginRight: 14 },
  posterContainer: { position: 'relative' },
  poster: { width: 130, height: 195, borderRadius: 10, backgroundColor: '#1C1C1C' },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: { color: '#FFB800', fontSize: 10, fontWeight: '700' },
  cardTitle: { color: '#E0E0E0', fontSize: 12, fontWeight: '600', marginTop: 8 },
  cardGenre: { color: '#666', fontSize: 10, marginTop: 2 },

  // Error
  errorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 8 },
  errorText: { color: '#E50914', fontSize: 13 },
  
  // Search
  searchHeaderContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  searchBar: { flex: 1, height: 40, backgroundColor: '#1C1C1C', borderRadius: 8 },
  searchBarInput: { minHeight: 0, color: '#F5F5F5', fontSize: 14 },
  searchResultsContainer: { minHeight: 200 },
  emptySearch: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptySearchText: { color: '#555', fontSize: 14, fontWeight: '600' },
});
