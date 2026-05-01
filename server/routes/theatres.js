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
    const theatres = await Theatre.find().sort({ name: 1 });
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

    const { name, rows, cols } = req.body;
    const seatLayout = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= cols; c++) {
        seatLayout.push({ row: rowLabel(r), col: c, type: 'regular' });
      }
    }

    const hall = await Hall.create({ theatreId: req.params.id, name, rows, cols, seatLayout });
    res.status(201).json(hall);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
