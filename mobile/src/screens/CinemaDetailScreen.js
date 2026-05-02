import React from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Text, ActivityIndicator, Divider, useTheme, Surface } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MOVIE_CARD_WIDTH = SCREEN_WIDTH * 0.42;

const fetchTheatre = (id) => apiClient.get(`/theatres/${id}`).then((r) => r.data);
const fetchTheatreMovies = (id) => apiClient.get(`/theatres/${id}/movies`).then((r) => r.data);

const getAmenityIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('snack') || n.includes('popcorn') || n.includes('food')) return 'popcorn';
  if (n.includes('park')) return 'car';
  if (n.includes('seat') || n.includes('recliner')) return 'seat-recline-extra';
  if (n.includes('wifi')) return 'wifi';
  if (n.includes('ac') || n.includes('air')) return 'air-conditioner';
  if (n.includes('sound') || n.includes('dolby')) return 'surround-sound';
  return 'star-circle';
};

export default function CinemaDetailScreen({ route, navigation }) {
  const { theatreId } = route.params;
  const theme = useTheme();

  const { data: theatre, isLoading: isTheatreLoading } = useQuery({
    queryKey: ['theatre', theatreId],
    queryFn: () => fetchTheatre(theatreId),
  });

  const { data: movies, isLoading: isMoviesLoading } = useQuery({
    queryKey: ['theatre-movies', theatreId],
    queryFn: () => fetchTheatreMovies(theatreId),
  });

  if (isTheatreLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!theatre) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>Theatre not found</Text>
      </View>
    );
  }

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('MovieDetail', { movieId: item._id })}
      style={styles.movieCard}
    >
      <Surface style={styles.movieSurface} elevation={4}>
        <Image
          source={{ uri: item.posterUrl || 'https://via.placeholder.com/200x300?text=No+Poster' }}
          style={styles.moviePoster}
          resizeMode="cover"
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.movieRating}>
            <MaterialCommunityIcons name="star" size={12} color="#FFB800" />
            <Text style={styles.movieRatingText}>{item.rating || 'N/A'}</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Back Button Overlay */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Full-bleed Header */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: theatre.imageUrl || 'https://via.placeholder.com/800x400?text=Cinema' }}
            style={styles.coverImage}
          />
          <View style={styles.overlay} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{theatre.name}</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.primary} />
              <Text style={styles.locationText}>{theatre.location}</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Cinema</Text>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="home-city-outline" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.addressText}>{theatre.address}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          {theatre.amenities?.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.amenitiesContainer}
            >
              {theatre.amenities.map((amenity, index) => (
                <View key={index} style={styles.facility}>
                  <MaterialCommunityIcons name={getAmenityIcon(amenity)} size={22} color={theme.colors.primary} />
                  <Text style={styles.facilityText}>{amenity}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.facilitiesRow}>
              <View style={styles.facility}>
                <MaterialCommunityIcons name="popcorn" size={20} color={theme.colors.primary} />
                <Text style={styles.facilityText}>Snacks</Text>
              </View>
              <View style={styles.facility}>
                <MaterialCommunityIcons name="car" size={20} color={theme.colors.primary} />
                <Text style={styles.facilityText}>Parking</Text>
              </View>
              <View style={styles.facility}>
                <MaterialCommunityIcons name="seat-recline-extra" size={20} color={theme.colors.primary} />
                <Text style={styles.facilityText}>Premium Seats</Text>
              </View>
            </View>
          )}
        </View>

        {/* Movies Carousel Section */}
        <View style={styles.moviesSection}>
          <View style={styles.moviesHeader}>
            <Text style={styles.sectionTitle}>Now Showing</Text>
            {movies?.length > 0 && (
              <Text style={styles.movieCount}>{movies.length} Movies</Text>
            )}
          </View>

          {isMoviesLoading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
          ) : movies?.length > 0 ? (
            <FlatList
              data={movies}
              renderItem={renderMovieItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moviesList}
              snapToInterval={MOVIE_CARD_WIDTH + 16}
              decelerationRate="fast"
            />
          ) : (
            <View style={styles.emptyMovies}>
              <MaterialCommunityIcons name="movie-off-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>No movies currently showing here</Text>
            </View>
          )}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1 },
  
  headerContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  addressText: {
    flex: 1,
    color: '#AEAEAE',
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#2A2A2A',
  },
  facilitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  amenitiesContainer: {
    gap: 24,
    paddingRight: 20,
  },
  facility: {
    alignItems: 'center',
    minWidth: 60,
  },
  facilityText: {
    color: '#AEAEAE',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  
  moviesSection: {
    marginTop: 8,
  },
  moviesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  movieCount: {
    color: '#E50914',
    fontWeight: 'bold',
    fontSize: 14,
  },
  moviesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  movieCard: {
    width: MOVIE_CARD_WIDTH,
    marginHorizontal: 8,
  },
  movieSurface: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C1C1C',
  },
  moviePoster: {
    width: '100%',
    height: MOVIE_CARD_WIDTH * 1.5,
  },
  movieInfo: {
    padding: 10,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  movieRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movieRatingText: {
    color: '#AEAEAE',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyMovies: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#444',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  
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
