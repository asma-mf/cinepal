# API Endpoint Reference

This table provides a summary of the available API endpoints. For detailed request/response schemas, refer to the [OpenAPI Specification](./openapi.yaml).

| Category | Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Movies** | `GET` | `/movies` | List all movies (filterable by status/featured) | Public |
| | `POST` | `/movies` | Create a new movie | Admin |
| | `GET` | `/movies/search` | Search movies by title or theatre location | Public |
| | `GET` | `/movies/:id` | Get detailed movie info | Public |
| | `PUT` | `/movies/:id` | Update movie details | Admin |
| | `DELETE` | `/movies/:id` | Remove a movie from catalogue | Admin |
| **Theatres** | `GET` | `/theatres` | List all theatres | Public |
| | `POST` | `/theatres` | Create a new theatre | Admin |
| | `GET` | `/theatres/:id` | Get theatre info and its halls | Public |
| | `PUT` | `/theatres/:id` | Update theatre details | Admin |
| | `DELETE` | `/theatres/:id` | Delete a theatre | Admin |
| **Halls** | `POST` | `/theatres/:id/halls` | Add a hall to a specific theatre | Admin |
| | `PUT` | `/halls/:id` | Update hall layout or name | Admin |
| | `DELETE` | `/halls/:id` | Remove a hall | Admin |
| **Showtimes** | `GET` | `/showtimes` | List showtimes (filterable by movie/theatre/date) | Public |
| | `POST` | `/showtimes` | Create showtimes (supports single or range) | Admin |
| | `GET` | `/showtimes/:id` | Get showtime details and seat availability | Public |
| | `PUT` | `/showtimes/:id` | Update showtime info | Admin |
| | `DELETE` | `/showtimes/:id` | Cancel a showtime (soft delete) | Admin |
| **Bookings** | `GET` | `/bookings` | List all bookings | Admin |
| | `POST` | `/bookings` | Create an atomic seat hold (pending booking) | Auth User |
| | `GET` | `/bookings/mine` | List bookings for the current user | Auth User |
| | `GET` | `/bookings/:id` | Get specific booking details | Auth User |
| | `PUT` | `/bookings/:id` | Swap seats for a pending booking | Auth User |
| | `DELETE` | `/bookings/:id` | Cancel a pending booking | Auth User |
| | `PUT` | `/bookings/:id/cancel` | Cancel a confirmed booking (with refund logic) | Auth User |
| **Payments** | `GET` | `/payments` | List all transaction records | Admin |
| | `POST` | `/payments` | Confirm a booking via payment completion | Auth User |
| | `GET` | `/payments/:id` | Get payment receipt | Auth User |
| | `DELETE` | `/payments/:id` | Process a refund for a payment | Admin |
| **Utility** | `POST` | `/upload` | Upload images to Cloudinary | Admin |
| | `GET` | `/test` | API Health check | Public |

## Authentication
- **Public**: No token required.
- **Auth User**: Requires a valid Clerk JWT in the `Authorization: Bearer <token>` header.
- **Admin**: Requires a valid Clerk JWT with `admin` role/permissions.
