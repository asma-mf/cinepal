'use client';
// Form to edit an existing theatre's details
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Theatre {
  _id: string;
  name: string;
  location: string;
  address: string;
}

export default function TheatreEditForm({ theatre }: { theatre: Theatre }) {
  const router = useRouter();
  const [name, setName] = useState(theatre.name);
  const [location, setLocation] = useState(theatre.location);
  const [address, setAddress] = useState(theatre.address);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/proxy/theatres/${theatre._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, address }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Update failed');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Location</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Theatre'}</Button>
    </form>
  );
}
