# Problem Statement

## Context
In the modern entertainment industry, users expect a seamless and high-performance experience when booking movie tickets. Traditional systems often suffer from:
- Lack of real-time seat synchronization.
- Fragmented experiences between mobile and web platforms.
- Manual and error-prone administrative processes for catalogue and schedule management.
- Unfair booking practices where seats can be held indefinitely without payment.

## The Problem
CinePal aims to solve these issues by providing a unified, full-stack solution that caters to both the cinema-goers and the theatre administrators.

### Key Challenges
1. **Real-time Availability**: Ensuring that seat selection is updated instantly across all clients to prevent double bookings.
2. **Fair Booking Policy**: Implementing a mechanism to hold seats during the checkout process while ensuring they are released if the transaction is not completed within a reasonable timeframe (10 minutes).
3. **Cross-Platform Consistency**: Providing a robust API that serves both a high-performance React Native mobile app and a feature-rich Next.js administrative dashboard.
4. **Complex Scheduling**: Managing intricate showtime schedules across multiple theatres and halls, including recurring shows and recurring price variations.
5. **Secure Transactions**: Integrating a reliable authentication system (Clerk) and maintaining accurate financial records for payments and potential refunds.

## The Solution
CinePal provides a robust MERN-based ecosystem:
- **Mobile Client**: A React Native application for users to discover movies, select seats, and book tickets.
- **Admin Dashboard**: A Next.js web application for administrators to manage movies, theatres, halls, and showtimes.
- **Backend API**: A centralized Express server handling business logic, authentication validation, and database operations.
- **Data Integrity**: Using MongoDB with atomic operations and TTL (Time-To-Live) indexes to manage seat holds and booking expiries.
