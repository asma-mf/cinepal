'use client';
// Showtime creation form: movie, theatre, hall (filtered by theatre), date, time, format, price
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Movie { _id: string; title: string }
interface Theatre { _id: string; name: string }
interface Hall { _id: string; name: string; rows: number; cols: number }

export default function ShowtimeForm({
  movies,
  theatres,
}: {
  movies: Movie[];
  theatres: Theatre[];
}) {
  const router = useRouter();
  const [movieId, setMovieId] = useState('');
  const [theatreId, setTheatreId] = useState('');
  const [hallId, setHallId] = useState('');
  const [halls, setHalls] = useState<Hall[]>([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [format, setFormat] = useState('2D');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!theatreId) { setHalls([]); setHallId(''); return; }
    fetch(`/api/proxy/theatres/${theatreId}`)
      .then((r) => r.json())
      .then((data) => { setHalls(data.halls || []); setHallId(''); })
      .catch(() => setHalls([]));
  }, [theatreId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/proxy/showtimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, theatreId, hallId, date, startTime, format, price: Number(price) }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create showtime');
      }
      router.push('/admin/showtimes');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded p-3">{error}</div>}

      <div className="space-y-1.5">
        <Label>Movie *</Label>
        <Select value={movieId} onValueChange={(v) => { if (v) setMovieId(v); }} required>
          <SelectTrigger><SelectValue placeholder="Select movie" /></SelectTrigger>
          <SelectContent>
            {movies.map((m) => <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Theatre *</Label>
        <Select value={theatreId} onValueChange={(v) => { if (v) setTheatreId(v); }} required>
          <SelectTrigger><SelectValue placeholder="Select theatre" /></SelectTrigger>
          <SelectContent>
            {theatres.map((t) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Hall *</Label>
        <Select value={hallId} onValueChange={(v) => { if (v) setHallId(v); }} disabled={halls.length === 0} required>
          <SelectTrigger><SelectValue placeholder={halls.length === 0 ? 'Select theatre first' : 'Select hall'} /></SelectTrigger>
          <SelectContent>
            {halls.map((h) => (
              <SelectItem key={h._id} value={h._id}>
                {h.name} ({h.rows * h.cols} seats)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Date *</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Start Time *</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Format *</Label>
          <Select value={format} onValueChange={(v) => { if (v) setFormat(v); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2D">2D</SelectItem>
              <SelectItem value="3D">3D</SelectItem>
              <SelectItem value="IMAX">IMAX</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Ticket Price (LKR) *</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Scheduling...' : 'Schedule Showtime'}
      </Button>
    </form>
  );
}
