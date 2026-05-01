# CinePal Admin

Next.js 14 (App Router) admin panel for managing movies, theatres, halls, and showtimes.

## Prerequisites

- Node.js 18+
- Running CinePal backend (see `../server`)
- Clerk account with your user set to `role: 'admin'` in publicMetadata

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

To set admin role via Clerk Dashboard: Users → select user → Metadata → Public:
```json
{ "role": "admin" }
```

## Running

```bash
npm install
npm run dev     # http://localhost:3000
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/admin/movies` |
| `/admin/movies` | Movie list (create, edit, delete) |
| `/admin/movies/new` | Create movie with poster upload |
| `/admin/movies/[id]/edit` | Edit existing movie |
| `/admin/theatres` | Theatre list + add form |
| `/admin/theatres/[id]` | Edit theatre + manage halls |
| `/admin/showtimes` | Showtime list |
| `/admin/showtimes/new` | Schedule a showtime |
| `/unauthorized` | Shown when non-admin accesses /admin |

All `/admin/*` routes are protected by Clerk middleware and require `role: 'admin'`.
