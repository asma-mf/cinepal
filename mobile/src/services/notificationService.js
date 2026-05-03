// Notification service: handles push token registration with the backend
// Requires a physical device — will silently skip on emulators
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Requests notification permissions, retrieves the Expo push token,
 * and registers it with the CinePal backend.
 *
 * @param {string} authToken - Bearer token for the API request (from Clerk)
 * @returns {Promise<string|null>} The Expo push token, or null if unavailable
 */
export async function registerForPushNotifications(authToken) {
  if (!Device.isDevice) {
    console.log('[Notifications] Push notifications require a physical device.');
    return null;
  }

  // Android: create a notification channel (required for Android 8+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E50914',
    });
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission not granted.');
    return null;
  }

  // Get the Expo push token using the EAS project ID from app.json
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    console.error('[Notifications] EAS Project ID not found in app config.');
    return null;
  }

  let pushToken;
  try {
    pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (err) {
    console.error('[Notifications] Failed to get push token:', err);
    return null;
  }

  // Register the token with our backend
  try {
    await fetch(`${API_BASE_URL}/notifications/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token: pushToken,
        platform: Platform.OS,
      }),
    });
  } catch (err) {
    console.error('[Notifications] Failed to register token with backend:', err);
  }

  return pushToken;
}

/**
 * Removes all push tokens for the current user from the backend.
 * Call this on sign-out.
 *
 * @param {string} authToken - Bearer token for the API request (from Clerk)
 */
export async function deregisterPushNotifications(authToken) {
  try {
    await fetch(`${API_BASE_URL}/notifications/token`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (err) {
    console.error('[Notifications] Failed to deregister token:', err);
  }
}

/**
 * Updates the user's notification preference for new movie broadcasts.
 *
 * @param {string} authToken
 * @param {boolean} notifyNewMovies
 */
export async function updateNotificationPrefs(authToken, notifyNewMovies) {
  try {
    await fetch(`${API_BASE_URL}/notifications/prefs`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ notifyNewMovies }),
    });
  } catch (err) {
    console.error('[Notifications] Failed to update prefs:', err);
  }
}
