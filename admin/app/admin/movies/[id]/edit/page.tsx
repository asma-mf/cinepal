// Edit movie page: pre-fills form with existing movie data
import { adminFetch } from '@/lib/api';
import MovieForm from '../../MovieForm';

export default async function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let movie = null;
  try {
    movie = await adminFetch(`/movies/${id}`);
  } catch {
    return <div className="p-6 text-red-400">Movie not found</div>;
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Movie</h1>
      <MovieForm initialData={movie} movieId={id} />
    </div>
  );
}
