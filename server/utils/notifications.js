// Notification service: wraps expo-server-sdk to send push notifications
// Handles chunking (max 100 per Expo request) and token cleanup for invalid tokens
const { Expo } = require('expo-server-sdk');
const NotificationToken = require('../models/NotificationToken');

const expo = new Expo();

/**
 * Internal helper: send push messages in batches and remove invalid tokens.
 * @param {Array<{to, title, body, data}>} messages
 */
async function _sendMessages(messages) {
  if (!messages || messages.length === 0) return;

  // Filter out any malformed tokens before sending
  const validMessages = messages.filter((m) => Expo.isExpoPushToken(m.to));

  const chunks = expo.chunkPushNotifications(validMessages);
  const invalidTokens = [];

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, i) => {
        if (ticket.status === 'error') {
          if (ticket.details?.error === 'DeviceNotRegistered') {
            invalidTokens.push(chunk[i].to);
          } else {
            console.error('[Notifications] Push error:', ticket.message);
          }
        }
      });
    } catch (err) {
      console.error('[Notifications] Chunk send failed:', err.message);
    }
  }

  // Clean up stale / unregistered tokens
  if (invalidTokens.length > 0) {
    await NotificationToken.deleteMany({ token: { $in: invalidTokens } });
    console.log(`[Notifications] Removed ${invalidTokens.length} invalid token(s).`);
  }
}

/**
 * Send a notification to all devices belonging to a single user.
 */
async function sendToUser(userId, title, body, data = {}) {
  const tokens = await NotificationToken.find({ userId });
  const messages = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    title,
    body,
    data,
  }));
  await _sendMessages(messages);
}

/**
 * Send a notification to multiple users (e.g. all bookers for a cancelled showtime).
 */
async function sendToUsers(userIds, title, body, data = {}) {
  if (!userIds || userIds.length === 0) return;
  const tokens = await NotificationToken.find({ userId: { $in: userIds } });
  const messages = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    title,
    body,
    data,
  }));
  await _sendMessages(messages);
}

/**
 * Send a broadcast to all opted-in users (notifyNewMovies: true).
 */
async function sendBroadcast(title, body, data = {}) {
  const tokens = await NotificationToken.find({ notifyNewMovies: true });
  const messages = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    title,
    body,
    data,
  }));
  await _sendMessages(messages);
}

module.exports = { sendToUser, sendToUsers, sendBroadcast };
