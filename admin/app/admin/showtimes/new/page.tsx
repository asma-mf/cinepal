// Create showtime page: fetches movies/theatres for dropdowns
import { adminFetch } from '@/lib/api';
import ShowtimeForm from './ShowtimeForm';

export default async function NewShowtimePage() {
  let movies: { _id: string; title: string }[] = [];
  let theatres: { _id: string; name: string }[] = [];

  try {
    [movies, theatres] = await Promise.all([
      adminFetch('/movies'),
      adminFetch('/theatres'),
    ]);
  } catch {
    // Empty arrays: form will show appropriate messages
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Schedule Showtime</h1>
      <ShowtimeForm movies={movies} theatres={theatres} />
    </div>
  );
}
