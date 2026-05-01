// Entry point: Express app with Clerk auth, MongoDB connection, and all API routes
require('dotenv').config();

const required = ['PORT', 'MONGODB_URI', 'CLERK_SECRET_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { clerkMiddleware } = require('@clerk/express');

const movieRoutes = require('./routes/movies');
const uploadRoutes = require('./routes/upload');
const theatreRoutes = require('./routes/theatres');
const hallRoutes = require('./routes/halls');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/api/test', (req, res) => res.json({ ok: true }));

app.use('/api/movies', movieRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
