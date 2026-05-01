import React from 'react';
import { View, FlatList, Image, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, useTheme, Divider, Searchbar } from 'react-native-paper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.75;
const ITEM_SPACING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

const fetchMovies = (params) => apiClient.get('/movies', { params }).then((r) => r.data);

const MovieCard = ({ movie, onPress, size = 'normal' }) => {
  const width = size === 'large' ? 160 : 130;
  const height = size === 'large' ? 240 : 195;
  
  return (
    <TouchableOpacity onPress={() => onPress(movie)} style={[styles.cardWrapper, { width }]} activeOpacity={0.85}>
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: movie.posterUrl || 'https://via.placeholder.com/140x210' }}
          style={[styles.poster, { width, height }]}
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
};

const FeaturedCarousel = ({ movies, onPress }) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatListRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!movies || movies.length === 0) return;

    const intervalId = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= movies.length) {
        nextIndex = 0;
      }
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(intervalId);
  }, [currentIndex, movies]);

  if (!movies || movies.length === 0) return null;

  return (
    <View style={styles.featuredContainer}>
      <Animated.FlatList
        ref={flatListRef}
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
          });

          return (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => onPress(item)}
              style={{ width: SCREEN_WIDTH, alignItems: 'center' }}
            >
              <Animated.View style={[styles.heroContainer, { transform: [{ scale }], opacity }]}>
                <Image
                  source={{ uri: item.posterUrl || 'https://via.placeholder.com/400x220' }}
                  style={styles.heroPoster}
                />
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                  <View style={styles.heroMeta}>
                    <View style={styles.featuredBadge}>
                      <MaterialCommunityIcons name="star-circle" size={12} color="#fff" />
                      <Text style={styles.featuredBadgeText}>FEATURED</Text>
                    </View>
                  </View>
                  <Text style={styles.heroTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.heroMetaRow}>
                    <Text style={styles.heroGenre}>{(item.genre || []).slice(0, 2).join(', ')}</Text>
                    <Text style={styles.heroDot}>•</Text>
                    <Text style={styles.heroDuration}>{item.duration} min</Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const SectionRow = ({ title, status, onMoviePress, navigation, featured }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['movies', status],
    queryFn: () => fetchMovies({ status }),
  });

  const movies = data || [];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MovieCarousel', { status, title })}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      {isLoading && <ActivityIndicator style={{ marginVertical: 20 }} />}
      {isError && (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#E50914" />
          <Text style={styles.errorText}> Failed to load</Text>
        </View>
      )}
      {
        !isLoading && !isError && movies.length === 0 && (
          <View style={styles.errorRow}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#dbdbdbff" />
            <Text className='w-full text-white text-center'> No movies found</Text>
          </View>
        )
      }
      {movies.length > 0 && (
        <FlatList
          data={movies}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <MovieCard movie={item} onPress={onMoviePress} size="large" />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const CinemasSection = ({ navigation }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['theatres'],
    queryFn: () => apiClient.get('/theatres').then(r => r.data),
  });

  const theatres = data || [];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Our Cinemas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CinemasList')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      {isLoading && <ActivityIndicator style={{ marginVertical: 20 }} />}
      {isError && (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#E50914" />
          <Text style={styles.errorText}> Failed to load</Text>
        </View>
      )}
      {theatres.length > 0 && (
        <FlatList
          data={theatres}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.cardWrapper, { width: 220 }]} 
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CinemasList')}
            >
              <View style={[styles.posterContainer, { height: 130 }]}>
                <Image
                  source={{ uri: item.imageUrl || 'https://via.placeholder.com/220x130?text=Cinema' }}
                  style={[styles.poster, { width: 220, height: 130 }]}
                />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardGenre} numberOfLines={1}>{item.location}</Text>
            </TouchableOpacity>
          )}
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
  const [refreshing, setRefreshing] = React.useState(false);
  const queryClient = useQueryClient();

  const handleMoviePress = (movie) => navigation.navigate('MovieDetail', { movieId: movie._id });

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['movies'] });
    await queryClient.invalidateQueries({ queryKey: ['theatres'] });
    setRefreshing(false);
  }, [queryClient]);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['movies-search', debouncedQuery],
    queryFn: () => apiClient.get(`/movies/search?q=${debouncedQuery}`).then(r => r.data),
    enabled: debouncedQuery.length > 0,
  });

  const { data: featuredMovies } = useQuery({
    queryKey: ['movies-featured'],
    queryFn: () => fetchMovies({ featured: true }),
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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E50914" />}
      >
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
            <FeaturedCarousel movies={featuredMovies} onPress={handleMoviePress} />
            <SectionRow title="Now Showing" status="now_showing" onMoviePress={handleMoviePress} navigation={navigation} />
            <SectionRow title="Coming Soon" status="coming_soon" onMoviePress={handleMoviePress} navigation={navigation} />
            <CinemasSection navigation={navigation} />
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

  // Featured Carousel
  featuredContainer: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  heroContainer: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    backgroundColor: '#1C1C1C',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  heroPoster: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  featuredBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroGenre: { color: '#E0E0E0', fontSize: 12, fontWeight: '500' },
  heroDot: { color: '#AEAEAE', fontSize: 12 },
  heroDuration: { color: '#AEAEAE', fontSize: 12 },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: { color: '#F5F5F5', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
  seeAll: { color: '#E50914', fontSize: 14, fontWeight: '700' },
  list: { paddingHorizontal: 16 },

  // Movie Card
  cardWrapper: { marginRight: 16 },
  posterContainer: { 
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C1C',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  poster: { resizeMode: 'cover' },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: { color: '#FFB800', fontSize: 11, fontWeight: '800' },
  cardTitle: { color: '#F5F5F5', fontSize: 14, fontWeight: '700', marginTop: 10, lineHeight: 18 },
  cardGenre: { color: '#777', fontSize: 12, marginTop: 4, fontWeight: '500' },

  // Error
  errorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 8 },
  errorText: { color: '#E50914', fontSize: 13 },
  
  // Search
  searchHeaderContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  searchBar: { flex: 1, height: 44, backgroundColor: '#1C1C1C', borderRadius: 12 },
  searchBarInput: { minHeight: 0, color: '#F5F5F5', fontSize: 15 },
  searchResultsContainer: { minHeight: 200 },
  emptySearch: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptySearchText: { color: '#555', fontSize: 16, fontWeight: '600' },
});
