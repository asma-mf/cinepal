// Mongoose model for movies in the catalogue
const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String }],
    language: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
    releaseDate: { type: Date, required: true },
    status: { type: String, enum: ['now_showing', 'coming_soon'], required: true },
    posterUrl: { type: String },
    cast: [{ type: String }],
    rating: { type: Number, min: 0, max: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', MovieSchema);
