// Mongoose model for halls within a theatre, including auto-generated seat layout
const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    col: { type: Number, required: true },
    type: { type: String, enum: ['regular', 'premium'], default: 'regular' },
  },
  { _id: false }
);

const HallSchema = new mongoose.Schema(
  {
    theatreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    name: { type: String, required: true, trim: true },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    seatLayout: [SeatSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hall', HallSchema);
