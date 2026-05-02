// Movie CRUD routes: public reads, admin writes
const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/actor-search', requireAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.status(400).json({ error: 'TMDB API Key not configured in .env' });
    }

    const isBearer = TMDB_API_KEY.length > 50; // Bearer tokens are usually much longer than 32-char API keys
    const url = `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(q)}${isBearer ? '' : `&api_key=${TMDB_API_KEY}`}`;
    
    const response = await fetch(url, {
      headers: isBearer ? {
        'Authorization': `Bearer ${TMDB_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      } : {}
    });
    const data = await response.json();
    
    if (data.status_message) {
      console.error('TMDb API Error:', data.status_message);
      return res.status(401).json({ error: data.status_message });
    }

    const results = (data.results || []).map((p) => ({
      name: p.name,
      profileUrl: p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : null,
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, featured, includeArchived } = req.query;
    const filter = {};

    // Base exclusion for archived movies
    if (includeArchived !== 'true') {
      filter.status = { $ne: 'archived' };
    }

    // Specific status filter (overrides the base exclusion if provided)
    if (status) {
      filter.status = status;
    }

    // Featured filter
    if (featured === 'true') {
      filter.featured = true;
    }

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

    // 1. Search by movie title (exclude archived)
    const moviesByTitle = await Movie.find({ title: regex, status: { $ne: 'archived' } });

    // 2. Search by location (theatres in that location)
    const Theatre = require('../models/Theatre');
    const Showtime = require('../models/Showtime');
    
    const matchingTheatres = await Theatre.find({
      $or: [{ location: regex }, { name: regex }]
    });

    let moviesByLocation = [];
    if (matchingTheatres.length > 0) {
      const theatreIds = matchingTheatres.map(t => t._id);
      const showtimes = await Showtime.find({ theatreId: { $in: theatreIds } }).populate({
        path: 'movieId',
        match: { status: { $ne: 'archived' } }
      });
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
