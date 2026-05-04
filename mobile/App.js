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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications, deregisterPushNotifications } from './src/services/notificationService';

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

// Global notification handler: controls how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
import EditProfileScreen from './src/screens/EditProfileScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import TermsScreen from './src/screens/TermsScreen';
import MovieCarouselScreen from './src/screens/MovieCarouselScreen';
import CinemasListScreen from './src/screens/CinemasListScreen';
import CinemaDetailScreen from './src/screens/CinemaDetailScreen';
import LoadingOverlay from './src/components/LoadingOverlay';

// Custom dark Cinema theme
const CinePalTheme = {
  ...MD3DarkTheme,
  fonts: {
    ...MD3DarkTheme.fonts,
    default: { ...MD3DarkTheme.fonts.default, fontFamily: 'Geist-Regular' },
    displayLarge: { ...MD3DarkTheme.fonts.displayLarge, fontFamily: 'Geist-Black' },
    displayMedium: { ...MD3DarkTheme.fonts.displayMedium, fontFamily: 'Geist-Bold' },
    displaySmall: { ...MD3DarkTheme.fonts.displaySmall, fontFamily: 'Geist-Bold' },
    headlineLarge: { ...MD3DarkTheme.fonts.headlineLarge, fontFamily: 'Geist-Bold' },
    headlineMedium: { ...MD3DarkTheme.fonts.headlineMedium, fontFamily: 'Geist-Bold' },
    headlineSmall: { ...MD3DarkTheme.fonts.headlineSmall, fontFamily: 'Geist-Bold' },
    titleLarge: { ...MD3DarkTheme.fonts.titleLarge, fontFamily: 'Geist-Bold' },
    titleMedium: { ...MD3DarkTheme.fonts.titleMedium, fontFamily: 'Geist-Medium' },
    titleSmall: { ...MD3DarkTheme.fonts.titleSmall, fontFamily: 'Geist-Medium' },
    labelLarge: { ...MD3DarkTheme.fonts.labelLarge, fontFamily: 'Geist-Medium' },
    labelMedium: { ...MD3DarkTheme.fonts.labelMedium, fontFamily: 'Geist-Medium' },
    labelSmall: { ...MD3DarkTheme.fonts.labelSmall, fontFamily: 'Geist-Medium' },
    bodyLarge: { ...MD3DarkTheme.fonts.bodyLarge, fontFamily: 'Geist-Regular' },
    bodyMedium: { ...MD3DarkTheme.fonts.bodyMedium, fontFamily: 'Geist-Regular' },
    bodySmall: { ...MD3DarkTheme.fonts.bodySmall, fontFamily: 'Geist-Regular' },
  },
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
  headerTitleStyle: { fontFamily: 'Geist-Bold' },
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
      <Stack.Screen name="MovieCarousel" component={MovieCarouselScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CinemasList" component={CinemasListScreen} options={{ title: 'Our Cinemas' }} />
      <Stack.Screen name="CinemaDetail" component={CinemaDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Details' }} />
      <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: 'Your Ticket', headerLeft: null }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1C1C',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '600',
          marginBottom: insets.bottom > 0 ? 0 : 4 
        },
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
        component={ProfileStack}
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

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: true, title: 'Terms & Conditions' }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const notificationResponseRef = React.useRef(null);
  const navigationRef = React.useRef(null);

  // Register/deregister push token when auth state changes
  React.useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // Get Clerk session token and register push token with backend
      getToken().then((authToken) => {
        if (authToken) registerForPushNotifications(authToken);
      });
    } else {
      // Deregister on sign-out (best-effort, token may not exist)
      getToken().then((authToken) => {
        if (authToken) deregisterPushNotifications(authToken);
      }).catch(() => {});
    }
  }, [isLoaded, isSignedIn]);

  // Listen for notification taps and navigate to the relevant screen
  React.useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        // Navigate to BookingsTab for booking/refund notifications
        if (screen === 'Bookings') {
          navigationRef.current.navigate('BookingsTab');
        }
        // Navigate to HomeTab for new movie notifications
        if (screen === 'Movies') {
          navigationRef.current.navigate('HomeTab');
        }
      }
    });
    return () => sub.remove();
  }, []);

  if (!isLoaded) {
    return <LoadingOverlay />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isSignedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = Font.useFonts({
    'Geist-Regular': require('./assets/fonts/Geist-Regular.otf'),
    'Geist-Medium': require('./assets/fonts/Geist-Medium.otf'),
    'Geist-Bold': require('./assets/fonts/Geist-Bold.otf'),
    'Geist-Black': require('./assets/fonts/Geist-Black.otf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

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
