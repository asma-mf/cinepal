# Movie Booking Platform — Autonomous Build Instructions

You are an autonomous engineer. Execute each module fully before moving to the next.
At every `[GATE]` marker: run the listed checks, output a pass/fail summary, and only proceed when all checks pass.

---

## Stack

| Layer   | Tech                                                                    |
| ------- | ----------------------------------------------------------------------- |
| Backend | Node/Express, MongoDB/Mongoose, Clerk (auth), Cloudinary (images)       |
| Mobile  | React Native (Expo), React Query, Zustand, React Navigation, Clerk Expo |
| Admin   | Next.js 14 (App Router, TypeScript, Tailwind), shadcn/ui, Clerk Next.js |

---

## Global Rules

### Code Style

- **All packages**: 2-space indent, 100-char line max.
- **Backend**: CommonJS (`require`/`module.exports`). Separate `models/`, `routes/`, `middleware/`, `controllers/`.
- **Mobile**: Functional components only. PascalCase components, camelCase vars. Screens in `src/screens/`, services in `src/services/`.
- **Admin**: TypeScript throughout. `'use client'` on interactive components.

### Comments

- File-header comment: one line stating the file's purpose.
- Non-trivial logic: explain _why_, not _what_.
- JSDoc on exported helper functions.
- No obvious comments. No unresolved `TODO`s at commit time.

### Commits

Format: `<type>(<scope>): <subject>` — e.g. `feat(server): add POST /api/movies with admin guard`
Commit only when the sub-feature is **fully functional end-to-end**. Each module specifies its commit message.

### Technology Notes

- CLERK is not what you're familiar with. Make sure to read Clerk V3 docs BEFORE writing any authentication code

---

## Environment Setup (do once before Module 1)

<setup>

### 1. Repo + folders

```bash
mkdir movie-booking-app && cd movie-booking-app
git init
mkdir server mobile admin
```

### 2. Backend — `server/`

```bash
cd server && npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken @clerk/clerk-sdk-node multer cloudinary
npm install -D nodemon
```

`server/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/movie-booking
CLERK_SECRET_KEY=<your_clerk_secret>
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`server/server.js`: Express app with JSON middleware, CORS, and `GET /api/test → { ok: true }`.
`package.json` scripts: `"dev": "nodemon server.js"`.

### 3. Mobile — `mobile/`

```bash
npx create-expo-app mobile --template blank
cd mobile
npx expo install axios react-query zustand @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-paper react-native-safe-area-context @clerk/clerk-expo
```

Wrap `App` in `<ClerkProvider publishableKey={...}>`.

### 4. Admin — `admin/`

```bash
npx create-next-app@latest admin --typescript --tailwind --app
cd admin
npm install axios @clerk/nextjs cloudinary
npx shadcn-ui@latest init
```

`admin/middleware.ts`: protect all `/admin/*` routes; require `admin` role via Clerk public metadata.

</setup>

**[GATE 0 — Setup]**

- [ ] `GET http://localhost:5000/api/test` returns `{ ok: true }`
- [ ] Expo Go opens without errors
- [ ] `http://localhost:3000/admin` redirects to Clerk sign-in
- Commit: `chore: monorepo init — backend, mobile, admin`

---

## Modules

> **Dependency rule:** Each module must fully pass its gate before the next begins.

---

### Module 1 — Movie Catalogue

<backend>

**`server/middleware/auth.js`**

- Verify Clerk JWT via `@clerk/clerk-sdk-node`.
- Attach `req.userId` and `req.isAdmin` (from JWT custom claim `publicMetadata.role === 'admin'`).
- Export: `requireAuth`, `requireAdmin` (chains `requireAuth` then checks `isAdmin`).

**`server/routes/movies.js`**
| Method | Path | Guard | Notes |
|--------|------|-------|-------|
| GET | `/api/movies` | public | filter by `?status=now_showing\|coming_soon` |
| GET | `/api/movies/:id` | public | |
| POST | `/api/movies` | admin | |
| PUT | `/api/movies/:id` | admin | |
| DELETE | `/api/movies/:id` | admin | |

**`server/models/Movie.js`** fields: `title`, `description`, `genre[]`, `language`, `duration` (min), `releaseDate`, `status` (`now_showing`\|`coming_soon`), `posterUrl`, `cast[]`, `rating`.

**`server/routes/upload.js`** — `POST /api/upload` (admin): receive file via multer (memory storage), upload to Cloudinary, return `{ url }`.

</backend>

<mobile>

**`src/services/api.js`**: axios instance pointing at `http://localhost:5000/api`. Interceptor: attach Clerk session token as `Authorization: Bearer <token>`.

**`HomeScreen`**: React Query `useQuery` for movies. Two horizontal `FlatList`s — "Now Showing" and "Coming Soon". Each card shows poster + title.

**`MovieDetailScreen`**: fetch single movie by id. Show poster, meta (genre, duration, rating), and a "Book Tickets" button (stub navigation for now).

Add a Stack navigator and a bottom tab bar with placeholder tabs for Bookings and Profile.

</mobile>

<admin>

- `/admin/movies` — shadcn `Table` listing all movies with Edit and Delete action buttons.
- `/admin/movies/new` — form with all movie fields + Cloudinary Upload Widget for poster. On submit, `POST /api/movies` then redirect to list.
- `/admin/movies/[id]/edit` — pre-filled form. On submit, `PUT /api/movies/:id`.

</admin>

**[GATE 1]**

- [ ] Admin creates a movie with a poster; `posterUrl` stored in DB.
- [ ] Mobile `HomeScreen` displays the movie in the correct list.
- [ ] Mobile `MovieDetailScreen` shows full details.
- [ ] `POST /api/movies` without admin token → 403.
- Commit: `feat(movies): full CRUD — admin UI + mobile browsing`

---

### Module 2 — Theatres & Halls

<backend>

**`server/models/Theatre.js`** fields: `name`, `location`, `address`.
**`server/models/Hall.js`** fields: `theatreId`, `name`, `rows` (number), `cols` (number), `seatLayout[]` (`{ row: 'A', col: 1, type: 'regular'|'premium' }`).

On `POST /api/theatres/:id/halls`: auto-generate `seatLayout` from `rows` × `cols`. Row labels = letters A–Z, col labels = 1–N.

Routes:

- `GET|POST /api/theatres` (POST admin)
- `GET|PUT|DELETE /api/theatres/:id` (PUT/DELETE admin)
- `POST /api/theatres/:id/halls` (admin)
- `PUT|DELETE /api/halls/:id` (admin)

</backend>

<admin>

- `/admin/theatres` — list all theatres; "Add Theatre" button.
- `/admin/theatres/[id]` — edit theatre details; list of halls with inline Edit/Delete; "Add Hall" opens a form (name, rows, cols).

</admin>

**[GATE 2]**

- [ ] Admin creates a theatre then adds a hall with rows/cols.
- [ ] `GET /api/theatres/:id` includes the hall's `seatLayout`.
- [ ] Deleting a non-existent theatre returns 404.
- Commit: `feat(theatres): admin CRUD for theatres and halls`

---

### Module 3 — Showtime Scheduling

<backend>

**`server/models/Showtime.js`** fields: `movieId`, `theatreId`, `hallId`, `date`, `startTime`, `format` (`2D`\|`3D`\|`IMAX`), `price`, `status` (`active`\|`cancelled`), `seats[]` (subdocuments cloned from `hall.seatLayout` + `status: 'available'`).

Routes:

- `GET /api/showtimes` — filter by `?movieId=&date=&theatreId=` (public)
- `GET /api/showtimes/:id` — includes full `seats[]` (public)
- `POST /api/showtimes` (admin): look up hall → generate `seats` array → create showtime.
- `PUT /api/showtimes/:id` (admin)
- `DELETE /api/showtimes/:id` (admin): set `status = 'cancelled'`, do **not** hard-delete.

</backend>

<admin>

- `/admin/showtimes` — list with movie/date filters.
- `/admin/showtimes/new` — dropdowns: movie, theatre, then halls filtered by selected theatre. Date picker, time, format, price. Submit → `POST /api/showtimes`.

</admin>

<mobile>

**`ShowtimeSelectionScreen`** (reached from `MovieDetailScreen`):

- Fetch `GET /api/showtimes?movieId=<id>` (future dates only).
- Date picker → filter shown list.
- Each row: theatre name, hall, time, format, price. Tap → navigate to `SeatSelectionScreen` (stub).

</mobile>

**[GATE 3]**

- [ ] Admin creates a showtime; response `seats` count equals `hall.rows × hall.cols`, all `'available'`.
- [ ] `GET /api/showtimes?movieId=...` returns the showtime.
- [ ] Mobile `ShowtimeSelectionScreen` lists showtimes correctly.
- Commit: `feat(showtimes): admin scheduling + mobile showtime list`

---

### Module 4 — Seat Selection & Booking

<backend>

**`server/models/Booking.js`** fields: `userId`, `showtimeId`, `seats[]` (`{ row, col }`), `status` (`pending`\|`confirmed`\|`cancelled`), `expiresAt`.

Add TTL index: `BookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`.

**`POST /api/bookings`** — atomic seat hold:

```js
// Use arrayFilters to set only the exact requested seats,
// but only if ALL of them are currently 'available'.
// If any seat is non-available, findOneAndUpdate returns null → 409 Conflict.
const updated = await Showtime.findOneAndUpdate(
  {
    _id: showtimeId,
    status: "active",
    seats: {
      $not: {
        $elemMatch: {
          $or: seats.map((s) => ({
            row: s.row,
            col: s.col,
            status: { $ne: "available" },
          })),
        },
      },
    },
  },
  {
    $set: Object.fromEntries(
      seats.map((s, i) => [`seats.$[f${i}].status`, "hold"]),
    ),
  },
  {
    arrayFilters: seats.map((s, i) => ({
      [`f${i}.row`]: s.row,
      [`f${i}.col`]: s.col,
    })),
    new: true,
  },
);
if (!updated)
  return res.status(409).json({ error: "One or more seats unavailable" });
```

Create `Booking` with `status: 'pending'`, `expiresAt: Date.now() + 10 * 60 * 1000`. Return `{ bookingId, seats, expiresAt }`.

Additional routes:

- `GET /api/bookings/:id` — owner only
- `PUT /api/bookings/:id` — swap seats while `pending`: release old → atomically hold new.
- `DELETE /api/bookings/:id` — cancel pending: release seats, set `status: 'cancelled'`.

</backend>

<mobile>

**`SeatSelectionScreen`**:

- Fetch showtime (full seat map) via React Query.
- Render a scrollable grid. Colour seats: `available` = neutral, `hold` = amber, `booked` = red, `selected` (local state) = purple.
- Show running total (selected count × price).
- "Reserve Seats" → `POST /api/bookings` → navigate to `PendingBookingScreen`.

**`PendingBookingScreen`**:

- Countdown from `expiresAt`.
- "Proceed to Payment" → `PaymentScreen` (stub).
- "Cancel" → `DELETE /api/bookings/:id` → back to showtime list.

</mobile>

**[GATE 4]**

- [ ] Concurrent `Promise.all` of two `POST /api/bookings` for the same seat: exactly one succeeds, one gets 409.
- [ ] A `pending` booking with `expiresAt` in the past is not returned by `GET /api/bookings/:id` (deleted by TTL or handled in controller).
- [ ] Mobile seat grid renders colours correctly after hold.
- Commit: `feat(booking): atomic seat reservation + pending booking flow`

---

### Module 5 — Payment & Ticket Issuance

<backend>

**`server/models/Payment.js`** fields: `bookingId`, `userId`, `amount`, `method`, `status` (`success`\|`refunded`), `transactionId`, `createdAt`.

**`POST /api/payments`**:

1. Find booking (`pending`, not expired, belongs to `req.userId`).
2. Run as a Mongoose session transaction:
   - Set showtime seats from `hold` → `booked` (arrayFilters, same pattern as Module 4).
   - Set booking `status: 'confirmed'`, clear `expiresAt`.
   - Create Payment with `status: 'success'`, random `transactionId`.
3. Return payment + booking.

**`GET /api/payments/:id`** — owner only; populate booking → showtime → movie.

**`DELETE /api/payments/:id`** (refund):

- Showtime date must be in the future.
- Set seats `booked` → `available`, booking `status: 'cancelled'`, payment `status: 'refunded'`.

</backend>

<mobile>

**`PaymentScreen`**: React Native Paper `TextInput` fields (card number, expiry, CVV — display only, no real validation). Submit → `POST /api/payments` → navigate to `TicketScreen` on success.

**`TicketScreen`**:

- Display: movie title, date/time, hall, seat numbers, total amount.
- QR code via `react-native-qrcode-svg` encoding `bookingId`.
- "Request Refund" button (visible only if showtime date > now) → `DELETE /api/payments/:id`.

</mobile>

**[GATE 5]**

- [ ] Successful payment: showtime seats become `'booked'`.
- [ ] `POST /api/payments` on an already-confirmed booking → 400.
- [ ] `POST /api/payments` on an expired booking → 400.
- [ ] Refund releases seats and sets booking `'cancelled'`.
- [ ] `TicketScreen` shows correct movie/seat info and QR.
- Commit: `feat(payment): dummy payment + ticket + refund`

---

### Module 6 — Booking History & Cancellation

<backend>

Add to `server/routes/bookings.js`:

**`GET /api/bookings/mine`** — return `req.userId`'s bookings, populate `showtimeId → { movieId, theatreId, hallId }`. Sort descending by `createdAt`.

**`PUT /api/bookings/:id/cancel`** (owner, confirmed bookings, future showtimes only):

1. Verify `booking.userId === req.userId`, `status === 'confirmed'`, `showtime.date > now`.
2. Release seats: `booked` → `available`.
3. Set `booking.status = 'cancelled'`.
4. If a payment exists for this booking, invoke the internal refund function from Module 5.
5. Return updated booking.

</backend>

<mobile>

**`MyBookingsScreen`** (bottom tab):

- `GET /api/bookings/mine`; split into "Upcoming" (confirmed + future) and "Past".
- Each row: poster thumbnail, movie title, date/time, status badge.
- Tap → `BookingDetailScreen`.

**`BookingDetailScreen`**:

- Seat numbers, total paid, payment `transactionId`.
- "Cancel Booking" button: visible only when `status === 'confirmed'` and showtime is future. On tap → `PUT /api/bookings/:id/cancel` → invalidate React Query cache → pop to list.

</mobile>

**[GATE 6]**

- [ ] `GET /api/bookings/mine` returns only the authenticated user's bookings.
- [ ] Cancelling a confirmed future booking: seats freed, booking cancelled, payment refunded.
- [ ] Cancel button hidden for past/cancelled bookings.
- Commit: `feat(history): booking history + cancellation + refund integration`

---

## Final Integration

- Connect all screens through React Navigation: tabs (Home, My Bookings, Profile placeholder) + stacks within each.
- Add loading skeletons and error Snackbars (React Native Paper) on every screen.
- Admin: confirm all `/admin/*` routes are gated; non-admin role → redirect.
- Validate all required `.env` keys at startup; throw a descriptive error if any are missing.
- Write a `README.md` in each of `server/`, `mobile/`, `admin/` documenting: prerequisites, environment variables, and how to run.

**[FINAL GATE]**

- [ ] Full user journey works end-to-end: sign up → browse → showtime → seats → pay → ticket → history → cancel.
- [ ] Full admin journey works: add movie with poster → add theatre/hall → schedule showtime → edit/delete.
- [ ] Concurrent seat booking conflict tested and handled.
- [ ] All 6 module commits present in `git log`.
- [ ] No unresolved `TODO`s in any file.
