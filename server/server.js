// Entry point: Express app with Clerk auth, MongoDB connection, and all API routes
require('dotenv').config();

const required = ['PORT', 'MONGODB_URI', 'CLERK_SECRET_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const { clerkMiddleware } = require('@clerk/express');

const movieRoutes = require('./routes/movies');
const uploadRoutes = require('./routes/upload');
const theatreRoutes = require('./routes/theatres');
const hallRoutes = require('./routes/halls');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');

const { getStatusPage } = require('./utils/statusTemplate');
const promBundle = require('express-prom-bundle');
const { clerkAuthLatency, initBusinessMetrics } = require('./utils/metrics');
const { initBookingCleanupJob } = require('./jobs/bookingCleanup');

const app = express();

// Basic Auth for the /metrics endpoint
app.use('/metrics', (req, res, next) => {
  if (!process.env.METRICS_USER || !process.env.METRICS_PASSWORD) {
    return next(); // Skip auth if not configured in environment
  }
  
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login === process.env.METRICS_USER && password === process.env.METRICS_PASSWORD) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="401"');
  res.status(401).send('Authentication required.');
});

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  promClient: { collectDefaultMetrics: false }
});
app.use(metricsMiddleware);

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173'], // Default dev origins
  credentials: true,
};

// Root route for status page (Public)
app.get('/', (req, res) => {
  res.send(getStatusPage());
});

app.use(cors(corsOptions));
app.use(express.json());

// Track Clerk middleware latency
app.use((req, res, next) => {
  const end = clerkAuthLatency.startTimer();
  clerkMiddleware()(req, res, (err) => {
    end();
    next(err);
  });
});

app.get('/api/test', (req, res) => res.json({ ok: true }));

app.use('/api/movies', movieRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Start Server
const port = process.env.PORT || 5000;
connectDB().then(() => {
  initBusinessMetrics();
  initBookingCleanupJob();
  app.listen(port, () => console.log(`Server running on port ${port}`));
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
