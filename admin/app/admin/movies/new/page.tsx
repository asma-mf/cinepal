// Create movie page
import MovieForm from '../MovieForm';

export default function NewMoviePage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Movie</h1>
      <MovieForm />
    </div>
  );
}
