// Payment routes: confirm booking via dummy payment, fetch receipt, process refund
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Showtime = require('../models/Showtime');
const { requireAuth } = require('../middleware/auth');
const { randomBytes } = require('crypto');
const { bookingsTotal, revenueTotal } = require('../utils/metrics');
const { sendToUser } = require('../utils/notifications');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { transactionId: { $regex: q, $options: 'i' } },
        { userId: { $regex: q, $options: 'i' } }
      ];
    }

    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const skip = (p - 1) * l;

    const payments = await Payment.find(filter).populate({
      path: 'bookingId',
      populate: {
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title' },
        ],
      },
    }).sort({ createdAt: -1 })
      .skip(skip)
      .limit(l);

    const total = await Payment.countDocuments(filter);

    // Calculate total revenue across ALL matching payments
    const revenueAggregation = await Payment.aggregate([
      { $match: filter },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { 
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'success'] }, then: '$amount' },
                  { case: { $eq: ['$status', 'partial_refund'] }, then: { $divide: ['$amount', 2] } }
                ],
                default: 0
              }
            } 
          } 
        } 
      }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    if (page || limit) {
      return res.json({
        data: payments,
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
        totalRevenue
      });
    }

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.userId !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (booking.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Booking is not pending' });
    }
    if (booking.expiresAt && booking.expiresAt < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Booking has expired' });
    }

    const showtime = await Showtime.findById(booking.showtimeId).session(session);
    if (!showtime) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Showtime not found' });
    }

    const seats = booking.seats;
    // Mark seats as booked
    const updatedShowtime = await Showtime.findOneAndUpdate(
      { _id: booking.showtimeId },
      {
        $set: Object.fromEntries(seats.map((s, i) => [`seats.$[f${i}].status`, 'booked'])),
      },
      {
        arrayFilters: seats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })),
        new: true,
        session,
      }
    );

    booking.status = 'confirmed';
    booking.expiresAt = undefined;
    await booking.save({ session });

    const amount = seats.length * showtime.price;
    const payment = await Payment.create(
      [
        {
          bookingId: booking._id,
          userId: req.userId,
          amount,
          method: 'card',
          status: 'success',
          transactionId: randomBytes(8).toString('hex').toUpperCase(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Increment business metrics
    bookingsTotal.inc(1);
    revenueTotal.inc(amount);

    res.status(201).json({ payment: payment[0], booking });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: 'bookingId',
      populate: {
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title posterUrl' },
          { path: 'theatreId', select: 'name' },
          { path: 'hallId', select: 'name' },
        ],
      },
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refund: only if showtime is in the future
router.delete('/:id', requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payment = await Payment.findById(req.params.id).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Payment not found' });
    }
    if (payment.userId !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (payment.status === 'refunded') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Already refunded' });
    }

    const booking = await Booking.findById(payment.bookingId).session(session);
    const showtime = await Showtime.findById(booking.showtimeId).session(session);

    if (new Date(showtime.date) <= new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Cannot refund past showtimes' });
    }

    const seats = booking.seats;
    await Showtime.findOneAndUpdate(
      { _id: booking.showtimeId },
      {
        $set: Object.fromEntries(seats.map((s, i) => [`seats.$[f${i}].status`, 'available'])),
      },
      {
        arrayFilters: seats.map((s, i) => ({ [`f${i}.row`]: s.row, [`f${i}.col`]: s.col })),
        session,
      }
    );

    booking.status = 'cancelled';
    await booking.save({ session });

    payment.status = 'refunded';
    await payment.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Refund successful', payment, booking });

    // Notify the user their refund was processed (fire-and-forget)
    sendToUser(
      req.userId,
      '✅ Refund Confirmed',
      `Your refund of $${payment.amount.toFixed(2)} has been processed.`,
      { screen: 'Bookings', paymentId: payment._id.toString() }
    ).catch((err) => console.error('[Notifications] sendToUser failed:', err.message));
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
