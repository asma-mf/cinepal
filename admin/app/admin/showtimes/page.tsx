// Showtimes list page with movie filter
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DeleteShowtimeButton from './DeleteShowtimeButton';

interface Showtime {
  _id: string;
  movieId?: { title: string };
  theatreId?: { name: string };
  hallId?: { name: string };
  date: string;
  startTime: string;
  format: string;
  price: number;
  status: string;
}

export default async function ShowtimesPage() {
  let showtimes: Showtime[] = [];
  try {
    showtimes = await adminFetch('/showtimes');
  } catch {
    showtimes = [];
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Showtimes</h1>
        <Link href="/admin/showtimes/new" className={cn(buttonVariants())}>+ Schedule Showtime</Link>
      </div>

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="text-left p-4">Movie</th>
              <th className="text-left p-4">Theatre / Hall</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Time</th>
              <th className="text-left p-4">Format</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((s) => (
              <tr key={s._id} className="border-t border-gray-800 hover:bg-gray-900/50">
                <td className="p-4 font-medium">{s.movieId?.title || '—'}</td>
                <td className="p-4 text-gray-400">{s.theatreId?.name} / {s.hallId?.name}</td>
                <td className="p-4 text-gray-400">{new Date(s.date).toLocaleDateString()}</td>
                <td className="p-4 text-gray-400">{s.startTime}</td>
                <td className="p-4"><Badge variant="outline">{s.format}</Badge></td>
                <td className="p-4 text-gray-400">LKR {s.price}</td>
                <td className="p-4">
                  <Badge variant={s.status === 'active' ? 'default' : 'destructive'}>
                    {s.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <DeleteShowtimeButton id={s._id} />
                </td>
              </tr>
            ))}
            {showtimes.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">No showtimes yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
