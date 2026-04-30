markdown

# 🎬 CineBook - Movie Booking App

A full-stack movie ticket booking application built with the MERN stack, featuring a **React Native Android client**, a **Next.js admin dashboard**, and a shared **Express + MongoDB backend**. Authentication is handled by Clerk. The project is designed for a team of six members, each owning a distinct CRUD module.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)

---

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Core Modules & Team Allocation](#core-modules--team-allocation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
  - [Backend](#backend)
  - [React Native Mobile App](#react-native-mobile-app)
  - [Next.js Admin Dashboard](#nextjs-admin-dashboard)
- [API Overview](#api-overview)
- [Folder Structure](#folder-structure)
- [Deployment](#deployment)
- [License](#license)

---

## Features

- **User App (Android)**
  - Browse movies (Now Showing / Coming Soon)
  - View showtimes by date, theatre, and format
  - Interactive seat selection with real-time availability
  - Booking management: reserve, cancel, or proceed to payment
  - Dummy payment simulation with e-ticket generation
  - Booking history and cancellation

- **Admin Dashboard (Web)**
  - Full CRUD for movies, theatres, halls, and showtimes
  - Upload movie posters via Cloudinary
  - Role-based access control (admin only)

- **Shared Backend**
  - RESTful API with Clerk JWT verification
  - Atomic seat reservation to prevent double bookings
  - Booking expiry (optional holds)

---

## Tech Stack

| Layer                | Technology                                                    |
| -------------------- | ------------------------------------------------------------- |
| **Backend**          | Node.js, Express, Mongoose, Clerk Node SDK                    |
| **Database**         | MongoDB Atlas                                                 |
| **Mobile App**       | React Native (Expo or bare workflow), React Navigation        |
| **Mobile UI**        | React Native Paper                                            |
| **State Management** | TanStack Query (React Query) + Zustand                        |
| **Admin Dashboard**  | Next.js 14 (App Router), Tailwind CSS, shadcn/ui              |
| **Authentication**   | Clerk (user & admin roles, multi-platform SDKs)               |
| **Image Storage**    | Cloudinary                                                    |
| **Deployment**       | Backend: Render / Railway; Admin: Vercel; Mobile: Android APK |

---

## Architecture

```

┌──────────────────┐       ┌─────────────┐       ┌──────────────────┐
│ React Native     │       │ Express     │       │ Next.js Admin    │
│ (User App)       │──────▶│ Backend     │◀──────│   Dashboard      │
└──────────────────┘ REST  └─────────────┘ REST  └──────────────────┘
                                │
                                ▼
                        ┌─────────────┐
                        │ MongoDB     │
                        └─────────────┘

```

All clients authenticate via **Clerk**. The backend validates session tokens and enforces role-based access.

---

## Core Modules & Team Allocation

Each module demonstrates full **CRUD** and is owned by one member.

| Module                                | Description                                              | CRUD Operations                                 |
| ------------------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| **1. Movie Catalogue**                | Admin manages movies; users browse/list movies           | Create, Read, Update, Delete                    |
| **2. Theatre & Hall Management**      | Admin manages theatres and their halls with seat layouts | Create, Read, Update, Delete                    |
| **3. Showtime Scheduling**            | Admin schedules showtimes; users view them               | Create, Read, Update, Delete                    |
| **4. Seat Booking**                   | User selects seats and creates a booking                 | Create, Read, Update (pending), Delete (cancel) |
| **5. Payment Simulation**             | User pays for booking, receives e-ticket                 | Create (pay), Read (receipt), Delete (refund)   |
| **6. Booking History & Cancellation** | User views own bookings, cancels upcoming ones           | Read, Update (cancel)                           |

**Note:** User management is handled by Clerk and is **not** a core function of the team.

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB instance (local or Atlas)
- Expo CLI (for React Native)
- Clerk account ([clerk.com](https://clerk.com))

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/your-org/cinebook.git
   cd cinebook
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install mobile app dependencies:
   ```bash
   cd ../mobile
   npm install
   ```
4. Install admin dashboard dependencies:
   ```bash
   cd ../admin
   npm install
   ```

### Environment Variables

#### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=your_mongo_connection_string
CLERK_SECRET_KEY=your_clerk_backend_secret
```

#### Mobile App (`mobile/.env`)

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pk
EXPO_PUBLIC_API_URL=http://<your-backend-ip>:5000/api   # use local IP for dev
```

#### Admin (`admin/.env.local`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pk
CLERK_SECRET_KEY=your_clerk_backend_secret
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Running the App

### Backend

```bash
cd server
npm run dev        # starts with nodemon on port 5000
```

### React Native Mobile App

```bash
cd mobile
npx expo start     # scan QR with Expo Go, or press 'a' for Android emulator
```

Make sure your device/emulator can reach the backend (use local IP if on same network).

### Next.js Admin Dashboard

```bash
cd admin
npm run dev        # opens on http://localhost:3000
```

> **Role Setup in Clerk:** Assign the role `admin` to the desired user in the Clerk dashboard to access admin routes.

---

## API Overview

Base URL: `http://localhost:5000/api`

All endpoints are prefixed with `/api` and protected where required. Below are the key resource groups:

| Resource         | Endpoints (example)                                            | Access             |
| ---------------- | -------------------------------------------------------------- | ------------------ |
| Movies           | `GET /movies`, `POST /movies` (admin)                          | Public/Admin       |
| Theatres & Halls | `GET /theatres`, `POST /theatres` (admin)                      | Public/Admin       |
| Showtimes        | `GET /showtimes?movieId=...`, `POST /showtimes` (admin)        | Public/Admin       |
| Bookings         | `POST /bookings`, `GET /bookings/mine`, `DELETE /bookings/:id` | Authenticated user |
| Payments         | `POST /payments`, `GET /payments/:id`                          | Authenticated user |

A full API contract can be found in the `docs/` folder (or generated later).

---

## Folder Structure

```
cinebook/
├── server/               # Express backend
│   ├── models/           # Mongoose schemas (Movie, Theatre, Hall, Showtime, Booking, Payment)
│   ├── routes/           # Route handlers per module
│   ├── middleware/        # Clerk auth middleware
│   └── index.js
├── mobile/               # React Native app (Expo)
│   ├── src/
│   │   ├── screens/      # Home, MovieDetail, SeatSelection, Payment, MyBookings...
│   │   ├── components/   # MovieCard, SeatGrid, PaymentForm...
│   │   ├── navigation/   # Stack & tab navigators
│   │   └── services/     # Axios instance, API functions, Clerk setup
│   └── App.js
├── admin/                # Next.js 14 dashboard
│   ├── app/
│   │   ├── admin/
│   │   │   ├── movies/   # pages: list, new, [id]/edit
│   │   │   ├── theatres/ # pages: list, new, [id]
│   │   │   └── showtimes/# pages: list, new, edit
│   │   └── layout.jsx
│   └── components/       # re-usable UI with shadcn/ui
└── README.md
```

---

## Deployment

- **Backend:** Deploy to Render or Railway, set environment variables, use start script.
- **Mobile:** Build an Android APK with `expo build:android` or EAS Build.
- **Admin:** Deploy to Vercel, connect the Git repository, add environment variables.

Remember to update `EXPO_PUBLIC_API_URL` and `NEXT_PUBLIC_API_URL` to the production backend URL.

---

## License

This project is created for educational purposes as part of a team assignment. No real money transactions are processed.

---

```

```
