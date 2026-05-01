'use client';
// Manages halls for a theatre: list, add, and delete
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Hall {
  _id: string;
  name: string;
  rows: number;
  cols: number;
}

export default function HallsManager({ theatreId, halls }: { theatreId: string; halls: Hall[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [rows, setRows] = useState('');
  const [cols, setCols] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/proxy/theatres/${theatreId}/halls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rows: Number(rows), cols: Number(cols) }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to add hall');
      }
      setName(''); setRows(''); setCols('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hallId: string) => {
    if (!confirm('Delete this hall?')) return;
    setDeleting(hallId);
    try {
      await fetch(`/api/proxy/halls/${hallId}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Halls</h2>
        {halls.length === 0 && <p className="text-gray-500 text-sm">No halls yet</p>}
        <div className="space-y-2">
          {halls.map((hall) => (
            <div key={hall._id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div>
                <span className="font-medium">{hall.name}</span>
                <span className="text-gray-400 text-sm ml-3">
                  {hall.rows} rows × {hall.cols} cols = {hall.rows * hall.cols} seats
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(hall._id)}
                disabled={deleting === hall._id}
              >
                {deleting === hall._id ? '...' : 'Delete'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Add Hall</h2>
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Hall Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Screen 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Rows</Label>
              <Input type="number" value={rows} onChange={(e) => setRows(e.target.value)} required min={1} max={26} />
            </div>
            <div className="space-y-1.5">
              <Label>Cols</Label>
              <Input type="number" value={cols} onChange={(e) => setCols(e.target.value)} required min={1} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Hall'}</Button>
        </form>
      </div>
    </div>
  );
}
