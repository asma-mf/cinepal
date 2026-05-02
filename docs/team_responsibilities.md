# Team Responsibilities

The CinePal project is divided into core modules, each owned by a specific team member to ensure accountability and focused development.

| Module | Primary Owner | Responsibilities |
| :--- | :--- | :--- |
| **1. Movie Catalogue** | Member 1 | - Backend CRUD for Movies.<br>- Frontend Admin UI for movie management.<br>- Public movie listing and advanced search logic. |
| **2. Theatre & Halls** | Member 2 | - Theatre and Hall data models.<br>- Dynamic seat layout generation algorithm.<br>- Admin UI for physical infrastructure setup. |
| **3. Showtimes** | Member 3 | - Complex scheduling logic (recurring shows).<br>- Price management for different formats (2D/3D/IMAX).<br>- Populated lookups for frontend consumption. |
| **4. Seat Booking** | Member 4 | - Implementation of atomic seat holds.<br>- TTL-based expiration logic in MongoDB.<br>- Real-time seat status transitions (available/hold/booked). |
| **5. Payments & Tickets** | Member 5 | - Integration with payment gateway (simulated/real).<br>- Digital ticket generation (QR codes/E-tickets).<br>- Transaction logging and confirmation emails. |
| **6. History & Refunds** | Member 6 | - User booking history and profile management.<br>- 24-hour cancellation policy enforcement.<br>- Automated refund processing and status tracking. |

## Collaboration Workflow
- **API First**: Changes to the API are discussed and documented in the OpenAPI spec before implementation.
- **Peer Review**: All code changes are reviewed by at least one other member.
- **Daily Standups**: Brief updates on progress and blockers.
