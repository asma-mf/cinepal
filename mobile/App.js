// Root: Clerk auth provider, React Query client, Paper theming, and navigation tree
import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
import { PaperProvider, MD3DarkTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import ShowtimeSelectionScreen from './src/screens/ShowtimeSelectionScreen';
import SeatSelectionScreen from './src/screens/SeatSelectionScreen';
import PendingBookingScreen from './src/screens/PendingBookingScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import TicketScreen from './src/screens/TicketScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// Custom dark Cinema theme
const CinePalTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#E50914',
    primaryContainer: '#4A0005',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#FFB3B3',
    secondary: '#FFB800',
    secondaryContainer: '#4A3600',
    background: '#0D0D0D',
    surface: '#1C1C1C',
    surfaceVariant: '#2A2A2A',
    onBackground: '#F5F5F5',
    onSurface: '#E0E0E0',
    onSurfaceVariant: '#AEAEAE',
    outline: '#3A3A3A',
    outlineVariant: '#2C2C2C',
    elevation: {
      level0: '#0D0D0D',
      level1: '#1C1C1C',
      level2: '#242424',
      level3: '#2A2A2A',
      level4: '#2C2C2C',
      level5: '#2E2E2E',
    },
  },
};

// Token Cache implementation
const tokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore save item error: ', err);
    }
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const screenOptions = {
  headerStyle: { backgroundColor: '#0D0D0D', elevation: 0, shadowOpacity: 0 },
  headerTintColor: '#F5F5F5',
  headerTitleStyle: { fontWeight: 'bold' },
  cardStyle: { backgroundColor: '#0D0D0D' },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ShowtimeSelection" component={ShowtimeSelectionScreen} options={{ title: 'Showtimes' }} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: 'Select Seats' }} />
      <Stack.Screen name="PendingBooking" component={PendingBookingScreen} options={{ title: 'Complete Booking', headerLeft: null }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: 'Your Ticket', headerLeft: null }} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Details' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1C1C',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="movie-open" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStack}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ticket-confirmation" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isSignedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder'}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={CinePalTheme}>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
