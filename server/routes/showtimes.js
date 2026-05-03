// Showtime routes: admin scheduling, public reads with filters
const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Hall = require('../models/Hall');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { randomBytes } = require('crypto');
const { requireAdmin } = require('../middleware/auth');
const { sendToUsers } = require('../utils/notifications');

router.get('/', async (req, res) => {
  try {
    const { movieId, theatreId, date, timeframe, status, page, limit } = req.query;
    const filter = {};

    if (movieId) filter.movieId = movieId;
    if (theatreId) filter.theatreId = theatreId;
    
    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Timeframe / Date filter
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (timeframe === 'today') {
      filter.date = { $gte: startOfToday, $lte: endOfToday };
    } else if (timeframe === 'upcoming') {
      filter.date = { $gt: endOfToday };
    } else if (timeframe === 'previous') {
      filter.date = { $lt: startOfToday };
    } else if (date) {
      const day = new Date(date);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: day, $lt: next };
    }

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 1000; // Default to large limit if not specified
    const skip = (p - 1) * l;

    const showtimes = await Showtime.find(filter)
      .populate('movieId', 'title posterUrl duration')
      .populate('theatreId', 'name location')
      .populate('hallId', 'name rows cols rowBreaks colBreaks')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(l);

    if (page || limit) {
      const total = await Showtime.countDocuments(filter);
      return res.json({
        data: showtimes,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      });
    }

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
      .populate('hallId', 'name rows cols rowBreaks colBreaks');
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { movieId, theatreId, hallId, date, startDate, endDate, startTime, format, price, schedulingType } = req.body;
    const hall = await Hall.findById(hallId);
    if (!hall) return res.status(404).json({ error: 'Hall not found' });

    const seats = hall.seatLayout.map((s) => ({
      row: s.row,
      col: s.col,
      type: s.type,
      status: 'available',
    }));

    if (schedulingType === 'range' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const createdShowtimes = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const showtime = await Showtime.create({
          movieId,
          theatreId,
          hallId,
          date: new Date(d),
          startTime,
          format,
          price,
          seats,
        });
        createdShowtimes.push(showtime);
      }
      return res.status(201).json({ message: `${createdShowtimes.length} showtimes scheduled`, count: createdShowtimes.length });
    } else {
      const showtime = await Showtime.create({ movieId, theatreId, hallId, date, startTime, format, price, seats });
      return res.status(201).json(showtime);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/cancel-future/:movieId', requireAdmin, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { fromDate, processRefunds } = req.body;
    const dateLimit = fromDate ? new Date(fromDate) : new Date();

    // Find the showtimes to be cancelled before updating
    const showtimesToCancel = await Showtime.find({
      movieId,
      date: { $gte: dateLimit },
      status: 'active',
    }).select('_id');
    const showtimeIds = showtimesToCancel.map((s) => s._id);

    const result = await Showtime.updateMany(
      { movieId, date: { $gte: dateLimit }, status: 'active' },
      { status: 'cancelled' }
    );

    // Notify and optionally refund bookers of all affected showtimes
    if (showtimeIds.length > 0) {
      const affectedBookings = await Booking.find({
        showtimeId: { $in: showtimeIds },
        status: 'confirmed',
      });
      const userIds = [...new Set(affectedBookings.map((b) => b.userId))];

      if (processRefunds && affectedBookings.length > 0) {
        // Auto-refund: cancel bookings and create refund Payment records
        for (const booking of affectedBookings) {
          const payment = await Payment.findOne({ bookingId: booking._id, status: 'success' });
          if (payment) {
            payment.status = 'refunded';
            await payment.save();
          }
          // Free the seats
          await Showtime.findByIdAndUpdate(booking.showtimeId, {
            $set: Object.fromEntries(
              booking.seats.map((s, i) => [`seats.$[f${i}].status`, 'available'])
            ),
          }, {
            arrayFilters: booking.seats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })),
          });
          booking.status = 'cancelled';
          await booking.save();
        }
        if (userIds.length > 0) {
          sendToUsers(
            userIds,
            '⚠️ Showtimes Cancelled — Refund Issued',
            'Some of your booked showtimes have been cancelled and refunds have been processed.',
            { screen: 'Bookings' }
          ).catch((err) => console.error('[Notifications] sendToUsers failed:', err.message));
        }
      } else if (userIds.length > 0) {
        sendToUsers(
          userIds,
          '⚠️ Showtimes Cancelled',
          'Some of your booked showtimes have been cancelled. Contact support for a refund.',
          { screen: 'Bookings' }
        ).catch((err) => console.error('[Notifications] sendToUsers failed:', err.message));
      }
    }

    res.json({ message: `${result.modifiedCount} future showtimes cancelled`, count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Safety check for reinstating cancelled shows
    if (status === 'active') {
      const existing = await Showtime.findById(req.params.id);
      if (existing && existing.status === 'cancelled') {
        const showtimeDate = new Date(existing.date);
        const [hours, minutes] = (existing.startTime || "00:00").split(':');
        showtimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const now = new Date();
        const diffInHours = (showtimeDate - now) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
          return res.status(400).json({ 
            error: 'Cannot reinstate a cancelled showtime that is less than 24 hours away.' 
          });
        }
      }
    }

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

// Soft delete: mark cancelled, notify affected bookers, optionally process refunds
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { processRefunds } = req.body || {};

    // Find affected confirmed bookings before cancelling
    const affectedBookings = await Booking.find({
      showtimeId: req.params.id,
      status: 'confirmed',
    });
    const userIds = [...new Set(affectedBookings.map((b) => b.userId))];

    const showtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });

    if (processRefunds && affectedBookings.length > 0) {
      // Auto-refund: cancel bookings and mark payments as refunded
      for (const booking of affectedBookings) {
        const payment = await Payment.findOne({ bookingId: booking._id, status: 'success' });
        if (payment) {
          payment.status = 'refunded';
          await payment.save();
        }
        booking.status = 'cancelled';
        await booking.save();
      }
      if (userIds.length > 0) {
        sendToUsers(
          userIds,
          '⚠️ Showtime Cancelled — Refund Issued',
          'Your booked showtime has been cancelled and a refund has been processed.',
          { screen: 'Bookings' }
        ).catch((err) => console.error('[Notifications] sendToUsers failed:', err.message));
      }
    } else if (userIds.length > 0) {
      sendToUsers(
        userIds,
        '⚠️ Showtime Cancelled',
        'A showtime you booked has been cancelled. Contact support for a refund.',
        { screen: 'Bookings' }
      ).catch((err) => console.error('[Notifications] sendToUsers failed:', err.message));
    }

    res.json(showtime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
