// Movie CRUD routes: public reads, admin writes
const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/movies/search?q=query
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');

    // 1. Search by movie title
    const moviesByTitle = await Movie.find({ title: regex });

    // 2. Search by location (theatres in that location)
    const Theatre = require('../models/Theatre');
    const Showtime = require('../models/Showtime');
    
    const matchingTheatres = await Theatre.find({
      $or: [{ location: regex }, { name: regex }]
    });

    let moviesByLocation = [];
    if (matchingTheatres.length > 0) {
      const theatreIds = matchingTheatres.map(t => t._id);
      const showtimes = await Showtime.find({ theatreId: { $in: theatreIds } }).populate('movieId');
      moviesByLocation = showtimes
        .map(s => s.movieId)
        .filter(m => m != null);
    }

    // Combine and deduplicate
    const combined = [...moviesByTitle, ...moviesByLocation];
    const uniqueMap = new Map();
    combined.forEach(m => {
      uniqueMap.set(m._id.toString(), m);
    });

    res.json(Array.from(uniqueMap.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
