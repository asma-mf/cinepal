// Theatre detail page: edit theatre info and manage halls
import { adminFetch } from '@/lib/api';
import TheatreEditForm from './TheatreEditForm';
import HallsManager from './HallsManager';

interface Hall {
  _id: string;
  name: string;
  rows: number;
  cols: number;
}

interface TheatreWithHalls {
  _id: string;
  name: string;
  location: string;
  address: string;
  halls: Hall[];
}

export default async function TheatreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let theatre: TheatreWithHalls | null = null;
  try {
    theatre = await adminFetch(`/theatres/${id}`);
  } catch {
    return <div className="p-6 text-red-400">Theatre not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{theatre!.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Theatre</h2>
          <TheatreEditForm theatre={theatre!} />
        </div>

        <div>
          <HallsManager theatreId={id} halls={theatre!.halls || []} />
        </div>
      </div>
    </div>
  );
}
