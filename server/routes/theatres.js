// Theatre and Hall CRUD routes
const express = require('express');
const router = express.Router();
const Theatre = require('../models/Theatre');
const Hall = require('../models/Hall');
const { requireAdmin } = require('../middleware/auth');

// Generate A-Z row labels
const rowLabel = (i) => String.fromCharCode(65 + i);

router.get('/', async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const skip = (p - 1) * l;

    const theatres = await Theatre.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l);

    const total = await Theatre.countDocuments(filter);

    if (page || limit) {
      return res.json({
        data: theatres,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      });
    }

    res.json(theatres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json(theatre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ error: 'Theatre not found' });
    const halls = await Hall.find({ theatreId: req.params.id });
    res.json({ ...theatre.toObject(), halls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) return res.status(404).json({ error: 'Theatre not found' });
    res.json(theatre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) return res.status(404).json({ error: 'Theatre not found' });
    await Hall.deleteMany({ theatreId: req.params.id });
    res.json({ message: 'Theatre deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/halls', requireAdmin, async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ error: 'Theatre not found' });

    const { name, rows, cols, rowBreaks, colBreaks } = req.body;
    const seatLayout = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= cols; c++) {
        seatLayout.push({ row: rowLabel(r), col: c, type: 'regular' });
      }
    }

    const hall = await Hall.create({ 
      theatreId: req.params.id, 
      name, 
      rows, 
      cols, 
      seatLayout,
      rowBreaks: rowBreaks || [],
      colBreaks: colBreaks || []
    });
    res.status(201).json(hall);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/movies', async (req, res) => {
  try {
    const Showtime = require('../models/Showtime');
    const showtimes = await Showtime.find({ 
      theatreId: req.params.id,
      status: 'active'
    }).populate('movieId');

    const moviesMap = new Map();
    showtimes.forEach(s => {
      if (s.movieId && s.movieId.status !== 'archived') {
        moviesMap.set(s.movieId._id.toString(), s.movieId);
      }
    });

    res.json(Array.from(moviesMap.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
