// Full-screen carousel: blurred background + elevated poster card with movie details
import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.62;
const CARD_HEIGHT = CARD_WIDTH * 1.5;
const SIDE_SPACING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const fetchMovies = (status) =>
  apiClient.get(`/movies?status=${status}`).then((r) => r.data);

export default function MovieCarouselScreen({ route, navigation }) {
  const { status, title } = route.params;
  const theme = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies', status],
    queryFn: () => fetchMovies(status),
  });

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movieId: movie._id });
  };

  const activeMovie = movies[activeIndex];

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.itemWrapper}
        onPress={() => handleMoviePress(item)}
      >
        <Animated.View style={[styles.cardShadow, { transform: [{ scale }], opacity }]}>
          <Image
            source={{ uri: item.posterUrl || 'https://via.placeholder.com/400x600' }}
            style={styles.posterCard}
            resizeMode="cover"
          />
          {/* Genre chips overlay on card */}
          <View style={styles.cardGenreRow}>
            {(item.genre || []).slice(0, 2).map((g, i) => (
              <View key={i} style={styles.genreChip}>
                <Text style={styles.genreChipText}>{g}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Blurred background — full screen, switches with active movie */}
      {activeMovie && (
        <Image
          key={activeMovie._id}
          source={{ uri: activeMovie.posterUrl || 'https://via.placeholder.com/400x600' }}
          style={StyleSheet.absoluteFill}
          blurRadius={22}
          resizeMode="cover"
        />
      )}
      {/* Dark tint over blurred background */}
      <View style={styles.tint} />

      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 44 }} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E50914" />
          </View>
        ) : (
          <>
            {/* Carousel */}
            <Animated.FlatList
              data={movies}
              keyExtractor={(item) => item._id}
              horizontal
              pagingEnabled
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIDE_SPACING - (SCREEN_WIDTH - CARD_WIDTH) / 2 }}
              renderItem={renderItem}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                {
                  useNativeDriver: true,
                  listener: (e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    if (idx !== activeIndex && idx >= 0 && idx < movies.length) {
                      setActiveIndex(idx);
                    }
                  },
                }
              )}
              scrollEventThrottle={16}
              style={styles.flatList}
            />

            {/* Movie Details Panel */}
            {activeMovie && (
              <View style={styles.detailsPanel}>
                <Text style={styles.movieTitle} numberOfLines={2}>
                  {activeMovie.title}
                </Text>

                <View style={styles.metaRow}>
                  {activeMovie.rating != null && (
                    <View style={styles.ratingRow}>
                      <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
                      <Text style={styles.metaText}>{activeMovie.rating}/10</Text>
                    </View>
                  )}
                  {activeMovie.duration && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="clock-outline" size={13} color="#AEAEAE" />
                      <Text style={styles.metaText}>{activeMovie.duration} min</Text>
                    </View>
                  )}
                  {activeMovie.language && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="translate" size={13} color="#AEAEAE" />
                      <Text style={styles.metaText}>{activeMovie.language}</Text>
                    </View>
                  )}
                </View>

                {activeMovie.description ? (
                  <Text style={styles.description} numberOfLines={3}>
                    {activeMovie.description}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleMoviePress(activeMovie)}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="ticket-outline" size={18} color="#fff" />
                  <Text style={styles.bookButtonText}>Book Tickets</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Dot indicators */}
            <View style={styles.dotsRow}>
              {movies.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  flatList: { flexGrow: 0, marginTop: 8 },
  itemWrapper: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  cardShadow: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 20,
  },
  posterCard: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardGenreRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  genreChip: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  genreChipText: { color: '#E0E0E0', fontSize: 10, fontWeight: '600' },

  detailsPanel: {
    paddingHorizontal: 28,
    paddingTop: 16,
    alignItems: 'center',
  },
  movieTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#AEAEAE', fontSize: 12, fontWeight: '500' },

  description: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E50914',
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 30,
    marginTop: 4,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
    backgroundColor: '#E50914',
  },
});
