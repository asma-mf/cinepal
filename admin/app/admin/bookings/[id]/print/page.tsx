import { adminFetch } from '@/lib/api';
import PrintTicketClient from './PrintTicketClient';

export default async function PrintTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let booking = null;
  let error = '';

  try {
    booking = await adminFetch(`/bookings/${id}`);
  } catch (err: any) {
    error = err.message || 'Failed to load booking';
  }

  if (error || !booking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-destructive font-medium">{error || 'Booking not found'}</p>
      </div>
    );
  }

  return <PrintTicketClient booking={booking} />;
}
