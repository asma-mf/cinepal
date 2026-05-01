# CinePal Server

Express + MongoDB backend for the CinePal movie booking platform.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Clerk account (for auth)
- Cloudinary account (for poster uploads)

## Environment Variables

Copy `.env` and fill in your values:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_SECRET_KEY` | Clerk secret key from dashboard |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Running

```bash
npm install
npm run dev      # development with nodemon
npm start        # production
```

## API Overview

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/test` | public |
| GET/POST | `/api/movies` | public/admin |
| GET/PUT/DELETE | `/api/movies/:id` | public/admin |
| POST | `/api/upload` | admin |
| GET/POST | `/api/theatres` | public/admin |
| GET/PUT/DELETE | `/api/theatres/:id` | public/admin |
| POST | `/api/theatres/:id/halls` | admin |
| PUT/DELETE | `/api/halls/:id` | admin |
| GET | `/api/showtimes` | public |
| GET | `/api/showtimes/:id` | public |
| POST/PUT/DELETE | `/api/showtimes` | admin |
| GET/POST/PUT/DELETE | `/api/bookings` | authenticated |
| GET/PUT/DELETE | `/api/payments` | authenticated |
