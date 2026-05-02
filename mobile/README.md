# CinePal Mobile

React Native (Expo) mobile app for browsing movies, booking seats, and managing bookings.

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device OR Android/iOS simulator
- Running CinePal backend (see `../server`)

## Environment Variables

Create `.env` in `mobile/`:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

## Running

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator, `i` for iOS simulator.

## App Structure

```
App.js                        # Root: ClerkProvider + QueryClient + Navigation
src/
  screens/
    SignInScreen.js            # Clerk email/password sign-in
    SignUpScreen.js            # Clerk sign-up with email verification
    HomeScreen.js              # Now Showing / Coming Soon lists
    MovieDetailScreen.js       # Movie info + Book Tickets button
    ShowtimeSelectionScreen.js # Date picker + showtime list
    SeatSelectionScreen.js     # Interactive seat grid
    PendingBookingScreen.js    # 10-min countdown + pay/cancel
    PaymentScreen.js           # Dummy card form
    TicketScreen.js            # Confirmed ticket + QR code
    MyBookingsScreen.js        # Upcoming and past bookings
    BookingDetailScreen.js     # Detail + cancel button
    ProfileScreen.js           # User info + sign out
    CinemasListScreen.js       # List of all cinemas
    CinemaDetailScreen.js      # Cinema details + specific movies
  services/
    api.js                     # Axios instance + useApiClient hook
```
