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
    cast: [
      {
        name: { type: String, required: true },
        profileUrl: { type: String },
      }
    ],
    rating: { type: Number, min: 0, max: 10 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
MovieSchema.index({ title: 'text', description: 'text' });
MovieSchema.index({ status: 1 });
MovieSchema.index({ featured: 1 });

module.exports = mongoose.model('Movie', MovieSchema);
