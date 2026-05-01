// Theatres list page
import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AddTheatreForm from './AddTheatreForm';

interface Theatre {
  _id: string;
  name: string;
  location: string;
  address: string;
}

export default async function TheatresPage() {
  let theatres: Theatre[] = [];
  try {
    theatres = await adminFetch('/theatres');
  } catch {
    theatres = [];
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Theatres</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Location</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {theatres.map((t) => (
                  <tr key={t._id} className="border-t border-gray-800 hover:bg-gray-900/50">
                    <td className="p-4 font-medium">{t.name}</td>
                    <td className="p-4 text-gray-400">{t.location}</td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/theatres/${t._id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Manage</Link>
                    </td>
                  </tr>
                ))}
                {theatres.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">No theatres yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Add Theatre</h2>
            <AddTheatreForm />
          </div>
        </div>
      </div>
    </div>
  );
}
