'use client';
// Client component: delete a movie with confirmation
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DeleteMovieButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this movie?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/movies/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
      else alert('Failed to delete movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? '...' : 'Delete'}
    </Button>
  );
}
