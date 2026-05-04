// Mongoose model for seat reservations with TTL-based auto-expiry for pending bookings
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk user ID
    showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: [
      {
        row: { type: String, required: true },
        col: { type: Number, required: true },
        _id: false,
      },
    ],
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'expired'], default: 'pending' },
    expiresAt: { type: Date },
    cancellationReason: { type: String },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
