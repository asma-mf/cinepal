'use client';
// Reusable movie form for create and edit
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MovieFormProps {
  initialData?: Record<string, unknown>;
  movieId?: string;
}

export default function MovieForm({ initialData, movieId }: MovieFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>((initialData?.posterUrl as string) || '');
  const [error, setError] = useState('');

  const [fields, setFields] = useState({
    title: (initialData?.title as string) || '',
    description: (initialData?.description as string) || '',
    genre: ((initialData?.genre as string[]) || []).join(', '),
    language: (initialData?.language as string) || '',
    duration: String(initialData?.duration || ''),
    releaseDate: initialData?.releaseDate
      ? new Date(initialData.releaseDate as string).toISOString().split('T')[0]
      : '',
    status: (initialData?.status as string) || 'coming_soon',
    cast: ((initialData?.cast as string[]) || []).join(', '),
    rating: String(initialData?.rating || ''),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const uploadPoster = async (): Promise<string> => {
    if (!posterFile) return posterUrl;
    const fd = new FormData();
    fd.append('file', posterFile);
    const res = await fetch('/api/proxy/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = await uploadPoster();
      const body = {
        title: fields.title,
        description: fields.description,
        genre: fields.genre.split(',').map((s) => s.trim()).filter(Boolean),
        language: fields.language,
        duration: Number(fields.duration),
        releaseDate: fields.releaseDate,
        status: fields.status,
        posterUrl: url,
        cast: fields.cast.split(',').map((s) => s.trim()).filter(Boolean),
        rating: fields.rating ? Number(fields.rating) : undefined,
      };

      const res = await fetch(
        movieId ? `/api/proxy/movies/${movieId}` : '/api/proxy/movies',
        {
          method: movieId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Save failed');
      }

      router.push('/admin/movies');
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input value={fields.title} onChange={set('title')} required />
        </div>
        <div className="space-y-1.5">
          <Label>Language *</Label>
          <Input value={fields.language} onChange={set('language')} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description *</Label>
        <Textarea value={fields.description} onChange={set('description')} required rows={3} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Genre (comma-separated)</Label>
          <Input value={fields.genre} onChange={set('genre')} placeholder="Action, Drama" />
        </div>
        <div className="space-y-1.5">
          <Label>Duration (min) *</Label>
          <Input type="number" value={fields.duration} onChange={set('duration')} required min={1} />
        </div>
        <div className="space-y-1.5">
          <Label>Rating (0-10)</Label>
          <Input type="number" value={fields.rating} onChange={set('rating')} min={0} max={10} step={0.1} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Release Date *</Label>
          <Input type="date" value={fields.releaseDate} onChange={set('releaseDate')} required />
        </div>
        <div className="space-y-1.5">
          <Label>Status *</Label>
          <Select value={fields.status} onValueChange={(v) => { if (v) setFields((f) => ({ ...f, status: v })); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="now_showing">Now Showing</SelectItem>
              <SelectItem value="coming_soon">Coming Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cast (comma-separated)</Label>
        <Input value={fields.cast} onChange={set('cast')} placeholder="Actor 1, Actor 2" />
      </div>

      <div className="space-y-1.5">
        <Label>Poster Image</Label>
        {posterUrl && (
          <img src={posterUrl} alt="Current poster" className="w-24 h-36 object-cover rounded mb-2" />
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
          className="cursor-pointer"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : movieId ? 'Update Movie' : 'Create Movie'}
      </Button>
    </form>
  );
}
