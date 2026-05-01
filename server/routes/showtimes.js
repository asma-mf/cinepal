// Showtime routes: admin scheduling, public reads with filters
const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Hall = require('../models/Hall');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movieId = req.query.movieId;
    if (req.query.theatreId) filter.theatreId = req.query.theatreId;
    if (req.query.date) {
      const day = new Date(req.query.date);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: day, $lt: next };
    }
    const showtimes = await Showtime.find(filter)
      .populate('movieId', 'title posterUrl duration')
      .populate('theatreId', 'name location')
      .populate('hallId', 'name rows cols')
      .sort({ date: 1, startTime: 1 });
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId', 'title posterUrl duration rating')
      .populate('theatreId', 'name location address')
      .populate('hallId', 'name rows cols');
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { movieId, theatreId, hallId, date, startTime, format, price } = req.body;
    const hall = await Hall.findById(hallId);
    if (!hall) return res.status(404).json({ error: 'Hall not found' });

    const seats = hall.seatLayout.map((s) => ({
      row: s.row,
      col: s.col,
      type: s.type,
      status: 'available',
    }));

    const showtime = await Showtime.create({ movieId, theatreId, hallId, date, startTime, format, price, seats });
    res.status(201).json(showtime);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Soft delete: mark cancelled rather than removing, to preserve booking history
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
