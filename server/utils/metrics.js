const promClient = require('prom-client');

// Initialize the default metrics (CPU, Memory, etc.)
promClient.collectDefaultMetrics();

// Custom metrics for Clerk Auth Latency
const clerkAuthLatency = new promClient.Histogram({
  name: 'cinepal_clerk_auth_duration_seconds',
  help: 'Duration of Clerk authentication in seconds',
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Custom metric for Total Bookings
const bookingsTotal = new promClient.Counter({
  name: 'cinepal_bookings_total',
  help: 'Total number of bookings made'
});

// Custom metric for Total Revenue
const revenueTotal = new promClient.Counter({
  name: 'cinepal_revenue_total',
  help: 'Total revenue generated in LKR'
});

async function initBusinessMetrics() {
  try {
    const Booking = require('../models/Booking');
    const Payment = require('../models/Payment');

    // Get total confirmed bookings
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
    bookingsTotal.inc(totalBookings);

    // Get total revenue
    const revenueAggregation = await Payment.aggregate([
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
    const totalRev = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    revenueTotal.inc(totalRev);
    
    console.log(`[Metrics] Initialized Business Metrics: ${totalBookings} Bookings, ${totalRev} Revenue`);
  } catch (error) {
    console.error(`[Metrics] Failed to initialize business metrics:`, error);
  }
}

module.exports = {
  promClient,
  clerkAuthLatency,
  bookingsTotal,
  revenueTotal,
  initBusinessMetrics
};
