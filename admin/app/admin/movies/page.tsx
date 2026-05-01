// Movies list page: table with edit and delete actions
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DeleteMovieButton from './DeleteMovieButton';

interface Movie {
  _id: string;
  title: string;
  genre: string[];
  language: string;
  duration: number;
  status: string;
  rating?: number;
}

export default async function MoviesPage() {
  let movies: Movie[] = [];
  try {
    movies = await adminFetch('/movies');
  } catch {
    movies = [];
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Movies</h1>
        <Link href="/admin/movies/new" className={cn(buttonVariants())}>+ Add Movie</Link>
      </div>

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Genre</th>
              <th className="text-left p-4">Language</th>
              <th className="text-left p-4">Duration</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Rating</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie._id} className="border-t border-gray-800 hover:bg-gray-900/50">
                <td className="p-4 font-medium">{movie.title}</td>
                <td className="p-4 text-gray-400">{movie.genre?.join(', ')}</td>
                <td className="p-4 text-gray-400">{movie.language}</td>
                <td className="p-4 text-gray-400">{movie.duration} min</td>
                <td className="p-4">
                  <Badge variant={movie.status === 'now_showing' ? 'default' : 'secondary'}>
                    {movie.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-4 text-gray-400">{movie.rating ?? '—'}</td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/admin/movies/${movie._id}/edit`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Edit</Link>
                  <DeleteMovieButton id={movie._id} />
                </td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">No movies yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
