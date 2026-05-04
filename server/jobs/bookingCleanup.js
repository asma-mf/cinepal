const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

/**
 * Periodically cleans up expired pending bookings.
 * Releases the seats back to the showtime and marks the booking as expired.
 */
const cleanupExpiredBookings = async () => {
  try {
    const now = new Date();
    
    // Find all pending bookings that have expired
    const expiredBookings = await Booking.find({
      status: 'pending',
      expiresAt: { $lt: now }
    });

    if (expiredBookings.length === 0) return;

    console.log(`[BookingCleanup] Found ${expiredBookings.length} expired pending bookings. Processing...`);

    for (const booking of expiredBookings) {
      // Atomically update the booking status to expired to prevent double processing
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: booking._id, status: 'pending' },
        { $set: { status: 'expired' } },
        { returnDocument: 'after' }
      );

      // If the booking was already processed or confirmed concurrently, skip
      if (!updatedBooking || updatedBooking.status !== 'expired') continue;

      const seats = booking.seats;
      if (seats && seats.length > 0) {
        // Release seats on the showtime
        try {
          await Showtime.findByIdAndUpdate(
            booking.showtimeId,
            {
              $set: Object.fromEntries(seats.map((s, i) => [`seats.$[f${i}].status`, 'available'])),
            },
            { arrayFilters: seats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })) }
          );
        } catch (err) {
          console.error(`[BookingCleanup] Failed to release seats for booking ${booking._id}:`, err);
        }
      }
    }
  } catch (error) {
    console.error('[BookingCleanup] Error running cleanup job:', error);
  }
};

const initBookingCleanupJob = () => {
  // Run every minute (60000 ms)
  setInterval(cleanupExpiredBookings, 60 * 1000);
  
  // Also run immediately on startup
  cleanupExpiredBookings();
  
  console.log('[BookingCleanup] Background job initialized');
};

module.exports = { initBookingCleanupJob, cleanupExpiredBookings };
