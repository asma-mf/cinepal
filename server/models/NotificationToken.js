// Mongoose model for storing Expo push tokens keyed by Clerk userId
const mongoose = require('mongoose');

const NotificationTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Clerk user ID
    token: { type: String, required: true, unique: true }, // Expo push token
    platform: { type: String, enum: ['android', 'ios', 'web'], default: 'android' },
    notifyNewMovies: { type: Boolean, default: true }, // User opt-in for broadcast notifications
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationToken', NotificationTokenSchema);
