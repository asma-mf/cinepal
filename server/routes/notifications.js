// Notification routes: register/deregister push tokens and update user preferences
const express = require('express');
const router = express.Router();
const NotificationToken = require('../models/NotificationToken');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/notifications/token
 * Upsert a push token for the authenticated user.
 * Body: { token: string, platform: "android" | "ios" }
 */
router.post('/token', requireAuth, async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'token is required' });

    // Upsert: update existing token doc or create a new one
    const doc = await NotificationToken.findOneAndUpdate(
      { token },
      { userId: req.userId, token, platform: platform || 'android' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ ok: true, id: doc._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/notifications/token
 * Remove all push tokens for the authenticated user (on logout).
 */
router.delete('/token', requireAuth, async (req, res) => {
  try {
    await NotificationToken.deleteMany({ userId: req.userId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/notifications/prefs
 * Update notification preferences for the authenticated user.
 * Body: { notifyNewMovies: boolean }
 */
router.patch('/prefs', requireAuth, async (req, res) => {
  try {
    const { notifyNewMovies } = req.body;
    if (typeof notifyNewMovies !== 'boolean') {
      return res.status(400).json({ error: 'notifyNewMovies must be a boolean' });
    }

    const result = await NotificationToken.updateMany(
      { userId: req.userId },
      { notifyNewMovies }
    );

    res.json({ ok: true, updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
