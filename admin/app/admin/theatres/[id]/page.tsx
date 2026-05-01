// Theatre detail page: edit theatre info and manage halls
import { adminFetch } from '@/lib/api';
import TheatreEditForm from './TheatreEditForm';
import HallsManager from './HallsManager';
import type { Hall } from './HallsManager';

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{theatre!.name} - Halls</h1>
          <p className="text-sm text-muted-foreground">{theatre!.location} • {theatre!.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <HallsManager theatreId={id} halls={theatre!.halls || []} />
      </div>
    </div>
  );
}
