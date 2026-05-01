// Mongoose model for payment records linked to confirmed bookings
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: 'card' },
    status: { type: String, enum: ['success', 'refunded'], default: 'success' },
    transactionId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
