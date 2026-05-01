// Mongoose model for cinemas/theatres
const mongoose = require('mongoose');

const TheatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theatre', TheatreSchema);
