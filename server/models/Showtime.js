// Mongoose model for showtimes, embedding a copy of the hall's seat layout with live status
const mongoose = require('mongoose');

const ShowtimeSeatSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    col: { type: Number, required: true },
    type: { type: String, enum: ['regular', 'premium'], default: 'regular' },
    status: { type: String, enum: ['available', 'hold', 'booked'], default: 'available' },
  },
  { _id: false }
);

const ShowtimeSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "HH:MM"
    format: { type: String, enum: ['2D', '3D', 'IMAX'], required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    seats: [ShowtimeSeatSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', ShowtimeSchema);
