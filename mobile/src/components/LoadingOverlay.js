import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function LoadingOverlay() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Image 
          source={require('../../assets/cinepal.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>Welcome to CinePal</Text>
        <ActivityIndicator size="small" color="#E50914" style={styles.loader} />
        <Text style={styles.subText}>Setting up your cinema experience...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D', // Netflix black
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 10,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 10,
  },
  subText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 10,
  },
});
