import React from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';

const fetchCinemas = () => apiClient.get('/theatres').then((r) => r.data);

const CinemaCard = ({ cinema, theme }) => {
  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <Image
        source={{ uri: cinema.imageUrl || 'https://via.placeholder.com/300x150?text=Cinema' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{cinema.name}</Text>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={theme.colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{cinema.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="home-city-outline" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.addressText} numberOfLines={2}>{cinema.address}</Text>
        </View>
      </View>
    </Surface>
  );
};

export default function CinemasListScreen({ navigation }) {
  const theme = useTheme();
  
  const { data: cinemas, isLoading, isError } = useQuery({
    queryKey: ['cinemas'],
    queryFn: fetchCinemas,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom', 'left', 'right']}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Failed to load cinemas.</Text>
        </View>
      ) : (
        <FlatList
          data={cinemas}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <CinemaCard cinema={item} theme={theme} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="domain-off" size={64} color="#2A2A2A" />
              <Text style={styles.emptyText}>No cinemas found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#2A2A2A',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#E50914',
  },
  addressText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#AEAEAE',
    flex: 1,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#AEAEAE',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E0E0',
  },
});
