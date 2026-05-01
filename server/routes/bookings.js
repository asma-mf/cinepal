// Booking routes: atomic seat holds, seat swaps, cancellations, and booking history
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { requireAuth } = require('../middleware/auth');

// Return all bookings for the current user
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title posterUrl' },
          { path: 'theatreId', select: 'name location' },
          { path: 'hallId', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'showtimeId',
      populate: [
        { path: 'movieId', select: 'title posterUrl' },
        { path: 'theatreId', select: 'name' },
        { path: 'hallId', select: 'name' },
      ],
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atomically hold seats; fails with 409 if any seat is unavailable
router.post('/', requireAuth, async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;
    if (!seats || seats.length === 0) {
      return res.status(400).json({ error: 'No seats selected' });
    }

    const updated = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        status: 'active',
        seats: {
          $not: {
            $elemMatch: {
              $or: seats.map((s) => ({
                row: s.row,
                col: s.col,
                status: { $ne: 'available' },
              })),
            },
          },
        },
      },
      {
        $set: Object.fromEntries(seats.map((s, i) => [`seats.$[f${i}].status`, 'hold'])),
      },
      {
        arrayFilters: seats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })),
        new: true,
      }
    );

    if (!updated) return res.status(409).json({ error: 'One or more seats unavailable' });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const booking = await Booking.create({
      userId: req.userId,
      showtimeId,
      seats,
      status: 'pending',
      expiresAt,
    });

    res.status(201).json({ bookingId: booking._id, seats: booking.seats, expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Swap seats while booking is still pending: release old, atomically hold new
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be modified' });
    }

    const { seats: newSeats } = req.body;
    const oldSeats = booking.seats;

    // Release old seats
    await Showtime.findByIdAndUpdate(
      booking.showtimeId,
      {
        $set: Object.fromEntries(oldSeats.map((s, i) => [`seats.$[r${i}].status`, 'available'])),
      },
      { arrayFilters: oldSeats.map((s, i) => ({ [`r${i}.row`]: s.row, [`r${i}.col`]: s.col })) }
    );

    // Hold new seats atomically
    const updated = await Showtime.findOneAndUpdate(
      {
        _id: booking.showtimeId,
        status: 'active',
        seats: {
          $not: {
            $elemMatch: {
              $or: newSeats.map((s) => ({ row: s.row, col: s.col, status: { $ne: 'available' } })),
            },
          },
        },
      },
      {
        $set: Object.fromEntries(newSeats.map((s, i) => [`seats.$[f${i}].status`, 'hold'])),
      },
      {
        arrayFilters: newSeats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })),
        new: true,
      }
    );

    if (!updated) {
      // Re-hold old seats since swap failed
      await Showtime.findByIdAndUpdate(
        booking.showtimeId,
        {
          $set: Object.fromEntries(oldSeats.map((s, i) => [`seats.$[r${i}].status`, 'hold'])),
        },
        { arrayFilters: oldSeats.map((s, i) => ({ [`r${i}.row`]: s.row, [`r${i}.col`]: s.col })) }
      );
      return res.status(409).json({ error: 'One or more new seats unavailable' });
    }

    booking.seats = newSeats;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel pending booking and release seats
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be deleted here' });
    }

    const seats = booking.seats;
    await Showtime.findByIdAndUpdate(
      booking.showtimeId,
      {
        $set: Object.fromEntries(seats.map((s, i) => [`seats.$[f${i}].status`, 'available'])),
      },
      { arrayFilters: seats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })) }
    );

    booking.status = 'cancelled';
    booking.expiresAt = undefined;
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel a confirmed future booking (triggers refund internally)
router.put('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showtimeId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be cancelled' });
    }
    if (new Date(booking.showtimeId.date) <= new Date()) {
      return res.status(400).json({ error: 'Cannot cancel past showtimes' });
    }

    const seats = booking.seats;
    await Showtime.findByIdAndUpdate(
      booking.showtimeId._id,
      {
        $set: Object.fromEntries(seats.map((s, i) => [`seats.$[f${i}].status`, 'available'])),
      },
      { arrayFilters: seats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })) }
    );

    booking.status = 'cancelled';
    await booking.save();

    // Refund the associated payment if it exists
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment) {
      payment.status = 'refunded';
      await payment.save();
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
