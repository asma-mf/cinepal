# Database Schema

CinePal uses MongoDB with Mongoose for data modeling. The relationships are primarily defined through ObjectIDs and population logic.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    THEATRE ||--o{ HALL : contains
    HALL ||--o{ SHOWTIME : hosts
    MOVIE ||--o{ SHOWTIME : "appears in"
    SHOWTIME ||--o{ BOOKING : "has"
    BOOKING ||--|| PAYMENT : "generates"
    USER ||--o{ BOOKING : "places"

    THEATRE {
        ObjectId _id PK
        string name
        string location
        string address
        string imageUrl
    }

    HALL {
        ObjectId _id PK
        ObjectId theatreId FK
        string name
        int rows
        int cols
        array seatLayout
        array rowBreaks
        array colBreaks
    }

    MOVIE {
        ObjectId _id PK
        string title
        string description
        array genre
        string language
        int duration
        date releaseDate
        string status
        string posterUrl
        array cast
        number rating
        boolean featured
    }

    SHOWTIME {
        ObjectId _id PK
        ObjectId movieId FK
        ObjectId theatreId FK
        ObjectId hallId FK
        date date
        string startTime
        string format
        number price
        string status
        array seats
    }

    BOOKING {
        ObjectId _id PK
        string userId FK "Clerk User ID"
        ObjectId showtimeId FK
        array seats
        string status
        date expiresAt "TTL Index"
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId bookingId FK
        string userId FK
        number amount
        string method
        string status
        string transactionId
    }
```

## Schema Details

### Theatre & Hall
- A **Theatre** can have multiple **Halls**.
- **Halls** define the physical grid (rows/cols) and the **seatLayout** (Regular vs. Premium).

### Movie & Showtime
- A **Movie** is a static entity in the catalogue.
- A **Showtime** links a **Movie**, **Theatre**, and **Hall** at a specific time.
- The **Showtime** document stores a snapshot of seat availability (status: available, hold, booked) specifically for that instance.

### Booking & Payment
- A **Booking** starts as `pending` with an `expiresAt` timestamp (usually 10 minutes from creation).
- MongoDB's TTL index automatically deletes `pending` bookings if they expire.
- A successful **Payment** transitions the **Booking** to `confirmed` and marks the corresponding seats in the **Showtime** as `booked`.
- **Payment** records are kept for financial auditing and refund processing.
