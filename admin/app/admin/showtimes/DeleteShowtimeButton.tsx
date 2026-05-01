'use client';
// Soft-deletes a showtime (sets status to cancelled)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DeleteShowtimeButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!confirm('Cancel this showtime?')) return;
    setLoading(true);
    try {
      await fetch(`/api/proxy/showtimes/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handle} disabled={loading}>
      {loading ? '...' : 'Cancel'}
    </Button>
  );
}
