// Root: Clerk auth provider, React Query client, and navigation tree
import 'react-native-gesture-handler';
import React from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';

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

// Token Cache implementation
const tokenCache = {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
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
  headerStyle: { backgroundColor: '#0a0a0a' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

const tabScreenOptions = {
  tabBarStyle: { backgroundColor: '#111', borderTopColor: '#222' },
  tabBarActiveTintColor: '#e50914',
  tabBarInactiveTintColor: '#555',
  headerShown: false,
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CinePal', headerShown: false }} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ title: 'Movie' }} />
      <Stack.Screen name="ShowtimeSelection" component={ShowtimeSelectionScreen} options={{ title: 'Showtimes' }} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: 'Select Seats' }} />
      <Stack.Screen name="PendingBooking" component={PendingBookingScreen} options={{ title: 'Complete Booking', headerLeft: null }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: 'Ticket', headerLeft: null }} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings', headerShown: false}} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎬</Text>,
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStack}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎫</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
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
  console.log('RootNavigator: isLoaded =', isLoaded, 'isSignedIn =', isSignedIn);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator color="#e50914" size="large" />
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
  console.log('App: Initializing with Key:', CLERK_PUBLISHABLE_KEY ? CLERK_PUBLISHABLE_KEY.substring(0, 15) + '...' : 'MISSING');
  
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn('WARNING: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined. Clerk will not work correctly.');
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder'}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
