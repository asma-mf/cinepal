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

module.exports = {
  promClient,
  clerkAuthLatency,
  bookingsTotal,
  revenueTotal
};
